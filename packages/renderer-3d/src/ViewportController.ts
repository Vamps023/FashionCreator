import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  GarmentInstance,
  GarmentPartId,
  StudioEnvironmentConfig,
  AvatarConfiguration,
  ViewportDisplayMode
} from '@fashion-studio/garment-schema';
import {
  buildHoodieScene,
  GarmentSceneGraph,
  buildMannequin,
  assembleGarmentFromPatterns,
  AssembledGarmentMesh,
  AVATAR_ARRANGEMENT_POINTS
} from '@fashion-studio/garment-engine';
import { ArtworkCompositor } from '@fashion-studio/artwork-engine';
import { createPhysicalFabricMaterial, updatePhysicalFabricMaterial } from '@fashion-studio/material-engine';
import { GarmentClothSolver } from '@fashion-studio/simulation-adapter';

export interface PerformanceStats {
  fps: number;
  drawCalls: number;
  triangles: number;
}

export class ViewportController {
  private container: HTMLDivElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls | null = null;
  private animationFrameId: number | null = null;

  // Garment objects (Procedural & Pattern-Simulated)
  private garmentGraph: GarmentSceneGraph | null = null;
  private simulatedGroup: THREE.Group | null = null;
  private simulatedMesh: THREE.Mesh | null = null;
  private assembledData: AssembledGarmentMesh | null = null;
  public clothSolver: GarmentClothSolver | null = null;
  public isSimulationRunning: boolean = false;
  public displayMode: ViewportDisplayMode = 'pbr';

  // Live 3D Cloth Tug Tool state
  private isGrabbingCloth: boolean = false;
  private grabVertexIndex: number = -1;
  private grabPlane = new THREE.Plane();

  // Visual Groups
  private arrangementGroup: THREE.Group | null = null;
  private pinGroup: THREE.Group | null = null;
  private showArrangementPointsFlag: boolean = false;

  private mannequinGroup: THREE.Group | null = null;

  // Compositors for print zones
  private frontCompositor: ArtworkCompositor;
  private backCompositor: ArtworkCompositor;

  // Lighting & Environment
  private keyLight: THREE.DirectionalLight | null = null;
  private fillLight: THREE.DirectionalLight | null = null;
  private rimLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;
  private floorGrid: THREE.GridHelper | null = null;
  private shadowPlane: THREE.Mesh | null = null;

  // Raycasting & Selection
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private hoveredPartId: GarmentPartId | null = null;
  private selectedPartId: GarmentPartId | null = null;

  // Callbacks
  public onPartSelected?: (partId: GarmentPartId | null) => void;
  public onPartHovered?: (partId: GarmentPartId | null) => void;
  public onPerformanceStats?: (stats: PerformanceStats) => void;
  public onSimulationStateChange?: (isRunning: boolean) => void;
  public onArrangementPointClicked?: (pointId: string) => void;

  // Performance tracking
  private frameCount = 0;
  private lastTime = performance.now();
  private currentFps = 60;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    this.camera.position.set(0.9, 0.4, 1.4);

    this.frontCompositor = new ArtworkCompositor('front-print', 1024, 1024);
    this.backCompositor = new ArtworkCompositor('back-print', 1024, 1024);
  }

  public init(container: HTMLDivElement): void {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0.08, 0);
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 3.5;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.setupLighting();
    this.setupFloor();
    this.setupEventHandlers();
    this.startRenderLoop();
  }

  private setupLighting(): void {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x222225, 0.7);
    this.scene.add(this.hemiLight);

    // Key Light
    this.keyLight = new THREE.DirectionalLight(0xfffaf0, 1.4);
    this.keyLight.position.set(1.8, 2.4, 2.0);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0001;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 8;
    this.keyLight.shadow.camera.left = -1.2;
    this.keyLight.shadow.camera.right = 1.2;
    this.keyLight.shadow.camera.top = 1.2;
    this.keyLight.shadow.camera.bottom = -1.2;
    this.scene.add(this.keyLight);

    // Fill Light
    this.fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.75);
    this.fillLight.position.set(-2.0, 1.2, 1.2);
    this.scene.add(this.fillLight);

    // Rim Light
    this.rimLight = new THREE.DirectionalLight(0xffffff, 1.15);
    this.rimLight.position.set(0, 2.0, -2.5);
    this.scene.add(this.rimLight);
  }

  private setupFloor(): void {
    this.floorGrid = new THREE.GridHelper(6, 40, 0x3f3f46, 0x27272a);
    this.floorGrid.position.y = -0.85;
    this.scene.add(this.floorGrid);

    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -0.849;
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);
  }

  private setupEventHandlers(): void {
    if (!this.container) return;
    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('resize', this.onWindowResize);
  }

  private onPointerMove = (e: MouseEvent) => {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Handle active 3D cloth grabbing (Live Tug Tool)
    if (this.isGrabbingCloth && this.clothSolver && this.grabVertexIndex !== -1) {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const targetPos = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.grabPlane, targetPos)) {
        this.clothSolver.grabTarget = {
          vertexIndex: this.grabVertexIndex,
          targetPosition: targetPos,
          radius: 0.09,
          strength: 0.96
        };
      }
      return;
    }

    this.checkHoverIntersection();
  };

  private onPointerDown = (e: MouseEvent) => {
    if (e.button !== 0 || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    // 1. Check if an Arrangement Point was clicked
    if (this.showArrangementPointsFlag && this.arrangementGroup) {
      const arrIntersects = this.raycaster.intersectObjects(this.arrangementGroup.children, true);
      if (arrIntersects.length > 0) {
        const pointId = arrIntersects[0].object.userData.arrangementPointId;
        if (pointId) {
          this.onArrangementPointClicked?.(pointId);
          return;
        }
      }
    }

    // 2. Interactive Cloth Manipulation (Tug / Grab & Pinning)
    if (this.simulatedMesh) {
      const clothHits = this.raycaster.intersectObject(this.simulatedMesh, false);
      if (clothHits.length > 0) {
        const hit = clothHits[0];
        const hitPoint = hit.point;

        // Find nearest vertex
        const posAttr = this.simulatedMesh.geometry.attributes.position;
        let nearestVertex = -1;
        let minDist = Infinity;
        const tempV = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
          tempV.fromBufferAttribute(posAttr, i);
          const d = tempV.distanceTo(hitPoint);
          if (d < minDist) {
            minDist = d;
            nearestVertex = i;
          }
        }

        // Shift + Click: Toggle Cloth Vertex Pinning
        if (e.shiftKey && this.clothSolver && nearestVertex !== -1) {
          this.clothSolver.togglePinVertex(nearestVertex);
          this.updatePinMarkers();
          return;
        }

        // Live 3D Cloth Tug Tool (while simulating)
        if (this.clothSolver && nearestVertex !== -1) {
          this.isGrabbingCloth = true;
          this.grabVertexIndex = nearestVertex;
          if (this.controls) this.controls.enabled = false;

          // Camera-facing plane through hit point
          const camDir = new THREE.Vector3();
          this.camera.getWorldDirection(camDir);
          this.grabPlane.setFromNormalAndCoplanarPoint(camDir.negate(), hitPoint);
          return;
        }
      }
    }

    // 3. Normal Part Selection
    const targetMeshes: THREE.Object3D[] = [];
    if (this.simulatedMesh) targetMeshes.push(this.simulatedMesh);
    if (this.garmentGraph) targetMeshes.push(...Array.from(this.garmentGraph.parts.values()));

    const intersects = this.raycaster.intersectObjects(targetMeshes, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const partId = (hit.userData.partId || 'body_front') as GarmentPartId;
      this.selectedPartId = partId;
      this.onPartSelected?.(partId);
      this.applyHighlight();
    }
  };

  private onPointerUp = () => {
    if (this.isGrabbingCloth) {
      this.isGrabbingCloth = false;
      this.grabVertexIndex = -1;
      if (this.clothSolver) {
        this.clothSolver.grabTarget = null;
      }
      if (this.controls) {
        this.controls.enabled = true;
      }
    }
  };

  private checkHoverIntersection(): void {
    const targetMeshes: THREE.Object3D[] = [];
    if (this.simulatedMesh) targetMeshes.push(this.simulatedMesh);
    if (this.garmentGraph) targetMeshes.push(...Array.from(this.garmentGraph.parts.values()));

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(targetMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const partId = (hit.userData.partId || 'body_front') as GarmentPartId;
      if (this.hoveredPartId !== partId) {
        this.hoveredPartId = partId;
        this.onPartHovered?.(partId);
        this.applyHighlight();
        if (this.container) this.container.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredPartId !== null) {
        this.hoveredPartId = null;
        this.onPartHovered?.(null);
        this.applyHighlight();
        if (this.container) this.container.style.cursor = 'default';
      }
    }
  }

  private applyHighlight(): void {
    if (this.garmentGraph) {
      this.garmentGraph.parts.forEach((mesh, partId) => {
        const mat = mesh.material as THREE.MeshPhysicalMaterial;
        if (!mat) return;
        const isSelected = partId === this.selectedPartId;
        const isHovered = partId === this.hoveredPartId;

        if (isSelected) {
          mat.emissive.set('#a78bfa');
          mat.emissiveIntensity = 0.25;
        } else if (isHovered) {
          mat.emissive.set('#c4b5fd');
          mat.emissiveIntensity = 0.12;
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0.0;
        }
      });
    }

    if (this.simulatedMesh) {
      const mat = this.simulatedMesh.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        if (this.selectedPartId) {
          mat.emissive.set('#a78bfa');
          mat.emissiveIntensity = 0.15;
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0.0;
        }
      }
    }
  }

  public setSelectedPart(partId: GarmentPartId | null): void {
    this.selectedPartId = partId;
    this.applyHighlight();
  }

  /**
   * Sets up or updates the 3D Garment. If the garment has patternPieces,
   * it builds the 3D deformable simulation mesh from 2D patterns and connects seams!
   */
  public async setGarment(garment: GarmentInstance, wireframe: boolean = false): Promise<void> {
    await this.frontCompositor.render(garment.artworkLayers, garment.materials.body_front.color);
    await this.backCompositor.render(garment.artworkLayers, garment.materials.body_back.color);

    const artTextures = {
      'front-print': this.frontCompositor.getTexture(),
      'back-print': this.backCompositor.getTexture()
    };

    // 1. If Pattern Pieces exist, use the Pattern-To-Simulation Mesh Pipeline
    if (garment.patternPieces && garment.patternPieces.length > 0) {
      // Remove any procedural graph if switching to pattern model
      if (this.garmentGraph) {
        this.scene.remove(this.garmentGraph.rootGroup);
        this.garmentGraph.dispose();
        this.garmentGraph = null;
      }

      // Assemble 3D mesh from patterns
      this.assembledData = assembleGarmentFromPatterns(garment.patternPieces, garment.seams || []);

      if (this.simulatedGroup) {
        this.scene.remove(this.simulatedGroup);
        if (this.simulatedMesh) {
          this.simulatedMesh.geometry.dispose();
          (this.simulatedMesh.material as THREE.Material).dispose();
        }
      }

      this.simulatedGroup = new THREE.Group();
      this.simulatedGroup.name = 'SimulatedGarmentGroup';

      const mat = createPhysicalFabricMaterial(
        garment.materials.body_front,
        artTextures['front-print'],
        wireframe
      );

      this.simulatedMesh = new THREE.Mesh(this.assembledData.geometry, mat);
      this.simulatedMesh.castShadow = true;
      this.simulatedMesh.receiveShadow = true;
      this.simulatedMesh.userData = { isGarmentPart: true, partId: 'body_front' };
      this.simulatedGroup.add(this.simulatedMesh);
      this.scene.add(this.simulatedGroup);

      // Initialize XPBD Cloth Solver
      this.clothSolver = new GarmentClothSolver(this.assembledData.geometry);

      // Connect sewing constraints
      this.clothSolver.sewingConstraints = this.assembledData.sewingConstraints.map((sc) => ({
        vA: sc.vertexA,
        vB: sc.vertexB,
        restLength: sc.targetLength,
        stiffness: garment.simulationSettings.sewingForce || 0.85
      }));

      // Apply physical fabric properties
      const physicalFabric = garment.physicalFabrics.default;
      if (physicalFabric) {
        this.clothSolver.fabric.warpStiffness = physicalFabric.warpStiffness;
        this.clothSolver.fabric.weftStiffness = physicalFabric.weftStiffness;
        this.clothSolver.fabric.bendingStiffness = physicalFabric.bendingStiffness;
        this.clothSolver.fabric.arealDensityGsm = physicalFabric.arealDensityGsm;
        this.clothSolver.fabric.damping = physicalFabric.damping;
      }

      this.clothSolver.gravity = garment.simulationSettings.gravity || 9.81;
      this.clothSolver.substeps = garment.simulationSettings.substeps || 12;

      this.isSimulationRunning = garment.simulationSettings.isRunning || false;
    } else {
      // Fallback: Procedural Hoodie Graph
      if (this.simulatedGroup) {
        this.scene.remove(this.simulatedGroup);
        this.simulatedGroup = null;
        this.simulatedMesh = null;
        this.clothSolver = null;
      }

      if (!this.garmentGraph) {
        this.garmentGraph = buildHoodieScene(garment, artTextures, wireframe);
        this.scene.add(this.garmentGraph.rootGroup);
      } else {
        this.garmentGraph.update(garment, artTextures, wireframe);
      }
    }

    this.applyHighlight();
  }

  public setAvatar(avatarConfig: AvatarConfiguration): void {
    if (this.mannequinGroup) {
      this.scene.remove(this.mannequinGroup);
    }
    this.mannequinGroup = buildMannequin(avatarConfig);
    this.scene.add(this.mannequinGroup);
  }

  public setEnvironment(config: StudioEnvironmentConfig): void {
    if (this.scene) {
      this.scene.background = new THREE.Color(config.backgroundColor);
    }
    if (this.floorGrid) {
      this.floorGrid.visible = config.showFloorGrid;
    }
    if (this.shadowPlane) {
      this.shadowPlane.visible = config.showShadows;
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = config.exposure;
    }
  }

  public setCameraPreset(preset: 'front' | 'back' | 'left' | 'right' | 'perspective'): void {
    if (!this.controls) return;
    const target = new THREE.Vector3(0, 0.08, 0);
    this.controls.target.copy(target);

    switch (preset) {
      case 'front':
        this.camera.position.set(0, 0.08, 1.45);
        break;
      case 'back':
        this.camera.position.set(0, 0.08, -1.45);
        break;
      case 'left':
        this.camera.position.set(-1.45, 0.08, 0);
        break;
      case 'right':
        this.camera.position.set(1.45, 0.08, 0);
        break;
      case 'perspective':
      default:
        this.camera.position.set(0.9, 0.4, 1.4);
        break;
    }
    this.controls.update();
  }

  // Simulation Controls
  public isSimulating(): boolean {
    return this.isSimulationRunning;
  }

  public startSimulation(): void {
    this.isSimulationRunning = true;
    this.onSimulationStateChange?.(true);
  }

  public pauseSimulation(): void {
    this.isSimulationRunning = false;
    this.onSimulationStateChange?.(false);
  }

  public resetSimulation(): void {
    this.clothSolver?.reset();
    this.isSimulationRunning = false;
    this.onSimulationStateChange?.(false);
    this.updatePinMarkers();
  }

  public setDisplayMode(mode: ViewportDisplayMode): void {
    this.displayMode = mode;
    if (!this.simulatedMesh) return;

    const mat = this.simulatedMesh.material as THREE.MeshPhysicalMaterial;
    if (mode === 'wireframe') {
      mat.wireframe = true;
      mat.vertexColors = false;
      mat.needsUpdate = true;
    } else if (mode === 'strain' || mode === 'fit') {
      mat.wireframe = false;
      mat.vertexColors = true;
      mat.needsUpdate = true;
    } else {
      mat.wireframe = false;
      mat.vertexColors = false;
      mat.needsUpdate = true;
    }
  }

  public setShowArrangementPoints(show: boolean): void {
    this.showArrangementPointsFlag = show;
    if (!show) {
      if (this.arrangementGroup) {
        this.scene.remove(this.arrangementGroup);
        this.arrangementGroup = null;
      }
      return;
    }

    if (this.arrangementGroup) return;

    this.arrangementGroup = new THREE.Group();
    this.arrangementGroup.name = 'ArrangementPoints';

    const sphereGeo = new THREE.SphereGeometry(0.024, 16, 16);
    const pointMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });

    Object.values(AVATAR_ARRANGEMENT_POINTS).forEach((pt) => {
      const mesh = new THREE.Mesh(sphereGeo, pointMat.clone());
      mesh.position.set(pt.position[0], pt.position[1], pt.position[2]);
      mesh.userData = { arrangementPointId: pt.id, pointName: pt.name };
      this.arrangementGroup?.add(mesh);
    });

    this.scene.add(this.arrangementGroup);
  }

  private updatePinMarkers(): void {
    if (!this.clothSolver || !this.simulatedMesh) return;
    if (this.pinGroup) {
      this.scene.remove(this.pinGroup);
      this.pinGroup = null;
    }
    if (this.clothSolver.pinnedIndices.size === 0) return;

    this.pinGroup = new THREE.Group();
    this.pinGroup.name = 'PinMarkers';
    const pinGeo = new THREE.SphereGeometry(0.012, 12, 12);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    const posAttr = this.simulatedMesh.geometry.attributes.position;
    for (const vIdx of this.clothSolver.pinnedIndices) {
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(
        posAttr.getX(vIdx),
        posAttr.getY(vIdx),
        posAttr.getZ(vIdx)
      );
      this.pinGroup.add(pinMesh);
    }
    this.scene.add(this.pinGroup);
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private startRenderLoop = () => {
    const loop = (now: number) => {
      this.animationFrameId = requestAnimationFrame(loop);
      this.controls?.update();

      // Step cloth physics solver if simulation is active
      if (this.isSimulationRunning && this.clothSolver) {
        this.clothSolver.step(0.016);
      }

      // Update Live Heatmap colors if strain or fit display mode is active
      if (this.simulatedMesh && this.clothSolver && (this.displayMode === 'strain' || this.displayMode === 'fit')) {
        const colors = this.displayMode === 'strain'
          ? this.clothSolver.computeStrainColors()
          : this.clothSolver.computeFitColors();
        
        let colorAttr = this.simulatedMesh.geometry.getAttribute('color') as THREE.BufferAttribute;
        if (!colorAttr || colorAttr.count !== colors.length / 3) {
          this.simulatedMesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        } else {
          (colorAttr.array as Float32Array).set(colors);
          colorAttr.needsUpdate = true;
        }
      }

      if (this.renderer) {
        this.renderer.render(this.scene, this.camera);

        this.frameCount++;
        if (now - this.lastTime >= 1000) {
          this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
          this.frameCount = 0;
          this.lastTime = now;

          const info = this.renderer.info;
          this.onPerformanceStats?.({
            fps: this.currentFps,
            drawCalls: info.render.calls,
            triangles: info.render.triangles
          });
        }
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  };

  public takeSnapshot(options: { transparent: boolean }): string {
    if (!this.renderer) return '';

    const origBg = this.scene.background;
    const origGrid = this.floorGrid?.visible;

    if (options.transparent) {
      this.scene.background = null;
      if (this.floorGrid) this.floorGrid.visible = false;
      this.renderer.setClearAlpha(0);
    }

    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    this.scene.background = origBg;
    if (this.floorGrid && origGrid !== undefined) this.floorGrid.visible = origGrid;
    this.renderer.setClearAlpha(1);

    return dataUrl;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getGarmentGroup(): THREE.Group | null {
    if (this.simulatedGroup) return this.simulatedGroup;
    return this.garmentGraph ? this.garmentGraph.rootGroup : null;
  }

  public dispose(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.container) {
      this.container.removeEventListener('pointermove', this.onPointerMove);
      this.container.removeEventListener('pointerdown', this.onPointerDown);
    }
    window.removeEventListener('resize', this.onWindowResize);

    this.garmentGraph?.dispose();
    if (this.simulatedMesh) {
      this.simulatedMesh.geometry.dispose();
      (this.simulatedMesh.material as THREE.Material).dispose();
    }
    this.frontCompositor.dispose();
    this.backCompositor.dispose();
    this.controls?.dispose();
    this.renderer?.dispose();
    if (this.container && this.renderer) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
