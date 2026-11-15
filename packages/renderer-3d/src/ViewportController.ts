import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  GarmentInstance,
  GarmentPartId,
  StudioEnvironmentConfig,
  AvatarConfiguration
} from '@fashion-studio/garment-schema';
import { buildHoodieScene, GarmentSceneGraph, buildMannequin } from '@fashion-studio/garment-engine';
import { ArtworkCompositor } from '@fashion-studio/artwork-engine';

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

  // Garment & Avatar objects
  private garmentGraph: GarmentSceneGraph | null = null;
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
  private hoveredMesh: THREE.Mesh | null = null;

  // Callbacks
  public onPartSelected?: (partId: GarmentPartId | null) => void;
  public onPartHovered?: (partId: GarmentPartId | null) => void;
  public onPerformanceStats?: (stats: PerformanceStats) => void;

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
    this.controls.minDistance = 0.6;
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
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x222225, 0.65);
    this.scene.add(this.hemiLight);

    // Key Light (warm soft directional from top right front)
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

    // Fill Light (cooler soft fill from left)
    this.fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.7);
    this.fillLight.position.set(-2.0, 1.2, 1.2);
    this.scene.add(this.fillLight);

    // Rim Light (sharp backlight for silhouette edge pop)
    this.rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
    this.rimLight.position.set(0, 2.0, -2.5);
    this.scene.add(this.rimLight);
  }

  private setupFloor(): void {
    // Floor grid
    this.floorGrid = new THREE.GridHelper(6, 40, 0x3f3f46, 0x27272a);
    this.floorGrid.position.y = -0.85;
    this.scene.add(this.floorGrid);

    // Soft contact shadow catcher plane
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
    window.addEventListener('resize', this.onWindowResize);
  }

  private onPointerMove = (e: MouseEvent) => {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.checkHoverIntersection();
  };

  private onPointerDown = (e: MouseEvent) => {
    // Only left click triggers selection
    if (e.button !== 0 || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    if (!this.garmentGraph) return;

    const meshes = Array.from(this.garmentGraph.parts.values());
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const partId = hit.userData.partId as GarmentPartId;
      this.selectedPartId = partId;
      this.onPartSelected?.(partId);
      this.applyHighlight();
    } else {
      // Clicked in empty space - do not deselect if user is just orbiting
    }
  };

  private checkHoverIntersection(): void {
    if (!this.garmentGraph) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = Array.from(this.garmentGraph.parts.values());
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const partId = hit.userData.partId as GarmentPartId;
      if (this.hoveredPartId !== partId) {
        this.hoveredPartId = partId;
        this.hoveredMesh = hit;
        this.onPartHovered?.(partId);
        this.applyHighlight();
        if (this.container) this.container.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredPartId !== null) {
        this.hoveredPartId = null;
        this.hoveredMesh = null;
        this.onPartHovered?.(null);
        this.applyHighlight();
        if (this.container) this.container.style.cursor = 'default';
      }
    }
  }

  private applyHighlight(): void {
    if (!this.garmentGraph) return;

    this.garmentGraph.parts.forEach((mesh, partId) => {
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      if (!mat) return;

      const isSelected = partId === this.selectedPartId;
      const isHovered = partId === this.hoveredPartId;

      if (isSelected) {
        mat.emissive.set('#3b82f6');
        mat.emissiveIntensity = 0.25;
      } else if (isHovered) {
        mat.emissive.set('#60a5fa');
        mat.emissiveIntensity = 0.12;
      } else {
        mat.emissive.set('#000000');
        mat.emissiveIntensity = 0.0;
      }
    });
  }

  public setSelectedPart(partId: GarmentPartId | null): void {
    this.selectedPartId = partId;
    this.applyHighlight();
  }

  public async setGarment(garment: GarmentInstance, wireframe: boolean = false): Promise<void> {
    // Render artwork onto front and back canvas textures
    await this.frontCompositor.render(garment.artworkLayers, garment.materials.body_front.color);
    await this.backCompositor.render(garment.artworkLayers, garment.materials.body_back.color);

    const artTextures = {
      'front-print': this.frontCompositor.getTexture(),
      'back-print': this.backCompositor.getTexture()
    };

    if (!this.garmentGraph) {
      this.garmentGraph = buildHoodieScene(garment, artTextures, wireframe);
      this.scene.add(this.garmentGraph.rootGroup);
    } else {
      this.garmentGraph.update(garment, artTextures, wireframe);
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

      if (this.renderer) {
        this.renderer.render(this.scene, this.camera);

        // Performance tracking
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

    // Restore
    this.scene.background = origBg;
    if (this.floorGrid && origGrid !== undefined) this.floorGrid.visible = origGrid;
    this.renderer.setClearAlpha(1);

    return dataUrl;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getGarmentGroup(): THREE.Group | null {
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
    this.frontCompositor.dispose();
    this.backCompositor.dispose();
    this.controls?.dispose();
    this.renderer?.dispose();
    if (this.container && this.renderer) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
