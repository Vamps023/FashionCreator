import * as THREE from 'three';
import {
  GarmentInstance,
  GarmentPartId,
  FabricMaterial
} from '@fashion-studio/garment-schema';
import { createPhysicalFabricMaterial, updatePhysicalFabricMaterial } from '@fashion-studio/material-engine';

export interface GarmentSceneGraph {
  rootGroup: THREE.Group;
  parts: Map<GarmentPartId, THREE.Mesh>;
  materials: Map<GarmentPartId, THREE.MeshPhysicalMaterial>;
  update: (garment: GarmentInstance, artworkTextures?: Record<string, THREE.Texture>, wireframe?: boolean) => void;
  dispose: () => void;
}

/**
 * Builds a parametric, modular 3D hoodie with distinct sub-meshes for body, sleeves, hood,
 * kangaroo pocket, cuffs, waistband, and drawstrings.
 */
export function buildHoodieScene(
  garment: GarmentInstance,
  artworkTextures?: Record<string, THREE.Texture>,
  wireframe: boolean = false
): GarmentSceneGraph {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'GarmentRoot_Hoodie';

  const parts = new Map<GarmentPartId, THREE.Mesh>();
  const materials = new Map<GarmentPartId, THREE.MeshPhysicalMaterial>();

  // Helper to create and register a sub-mesh part
  function registerPart(
    partId: GarmentPartId,
    geometry: THREE.BufferGeometry,
    fabric: FabricMaterial,
    artworkKey?: string
  ): THREE.Mesh {
    const artTex = artworkKey && artworkTextures ? artworkTextures[artworkKey] : null;
    const mat = createPhysicalFabricMaterial(fabric, artTex, wireframe);
    materials.set(partId, mat);

    const mesh = new THREE.Mesh(geometry, mat);
    mesh.name = `GarmentPart_${partId}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      isGarmentPart: true,
      partId: partId,
      originalMaterial: mat
    };

    parts.set(partId, mesh);
    rootGroup.add(mesh);
    return mesh;
  }

  // Generate initial geometries based on garment parameters
  rebuildGeometries();

  function rebuildGeometries() {
    const params = garment.parameters;
    const comp = garment.components;

    // Proportions normalized around baseline
    const scaleY = params.bodyLength / 720;
    const scaleX = params.chestWidth / 620;
    const scaleSleeve = params.sleeveLength / 650;
    const fitFactor = params.fit === 'oversized' ? 1.15 : params.fit === 'relaxed' ? 1.05 : 0.95;

    const chestR = 0.28 * scaleX * fitFactor;
    const waistR = 0.25 * scaleX * fitFactor;
    const bodyHeight = 0.68 * scaleY;
    const shoulderY = bodyHeight / 2;

    // --- 1. BODY FRONT ---
    const bodyFrontGeo = createCurvedPanelGeometry({
      topRadius: chestR * 0.95,
      bottomRadius: waistR,
      height: bodyHeight,
      arcAngle: Math.PI * 0.88,
      zOffset: 0.01,
      isFront: true
    });
    registerPart('body_front', bodyFrontGeo, garment.materials.body_front, 'front-print');

    // --- 2. BODY BACK ---
    const bodyBackGeo = createCurvedPanelGeometry({
      topRadius: chestR * 0.95,
      bottomRadius: waistR,
      height: bodyHeight,
      arcAngle: Math.PI * 0.88,
      zOffset: -0.01,
      isFront: false
    });
    registerPart('body_back', bodyBackGeo, garment.materials.body_back, 'back-print');

    // --- 3. SLEEVES ---
    const sleeveGeo = createSleevesGeometry({
      armLength: 0.62 * scaleSleeve,
      shoulderWidth: (0.34 * scaleX * fitFactor),
      shoulderY: shoulderY - 0.05,
      armRadiusTop: 0.12 * fitFactor,
      armRadiusWrist: 0.075 * fitFactor
    });
    registerPart('sleeves', sleeveGeo, garment.materials.sleeves);

    // --- 4. HOOD ---
    if (comp.hood !== 'none') {
      const hoodGeo = createHoodGeometry({
        collarY: shoulderY + 0.02,
        collarRadius: 0.13,
        doubleLayer: comp.hood === 'double-layer'
      });
      registerPart('hood', hoodGeo, garment.materials.hood);
    }

    // --- 5. KANGAROO POCKET ---
    if (comp.pockets === 'kangaroo') {
      const pocketGeo = createKangarooPocketGeometry({
        width: 0.26 * scaleX,
        height: 0.22 * scaleY,
        centerY: -bodyHeight * 0.15,
        chestR: chestR + 0.012
      });
      registerPart('pocket', pocketGeo, garment.materials.pocket);
    }

    // --- 6. CUFFS ---
    if (comp.cuffs !== 'hemmed') {
      const cuffsGeo = createCuffsGeometry({
        armLength: 0.62 * scaleSleeve,
        shoulderWidth: (0.34 * scaleX * fitFactor),
        shoulderY: shoulderY - 0.05,
        cuffRadius: 0.072 * fitFactor,
        cuffHeight: 0.065
      });
      registerPart('cuffs', cuffsGeo, garment.materials.cuffs);
    }

    // --- 7. WAISTBAND ---
    if (comp.waistband !== 'hemmed') {
      const waistGeo = new THREE.CylinderGeometry(waistR * 0.98, waistR * 0.96, 0.065, 36, 4, true);
      waistGeo.translate(0, -bodyHeight / 2 - 0.032, 0);
      registerPart('waistband', waistGeo, garment.materials.waistband);
    }

    // --- 8. DRAWSTRINGS ---
    if (comp.drawstrings !== 'none' && comp.hood !== 'none') {
      const cordsGeo = createDrawstringsGeometry(shoulderY + 0.02);
      registerPart('drawstrings', cordsGeo, garment.materials.drawstrings);
    }
  }

  return {
    rootGroup,
    parts,
    materials,
    update: (updatedGarment, updatedArtworkTextures, newWireframe = false) => {
      // Check if components or parameters changed that require geometry rebuild
      const geomChanged = 
        JSON.stringify(updatedGarment.parameters) !== JSON.stringify(garment.parameters) ||
        JSON.stringify(updatedGarment.components) !== JSON.stringify(garment.components);

      if (geomChanged) {
        // Clear children and rebuild
        while (rootGroup.children.length > 0) {
          const child = rootGroup.children[0] as THREE.Mesh;
          rootGroup.remove(child);
          child.geometry?.dispose();
        }
        parts.clear();
        materials.clear();
        garment = updatedGarment;
        rebuildGeometries();
      } else {
        // Geometry identical, update materials and artwork in-place
        parts.forEach((mesh, partId) => {
          const fabric = updatedGarment.materials[partId];
          const mat = materials.get(partId);
          if (fabric && mat) {
            const artKey = partId === 'body_front' ? 'front-print' : partId === 'body_back' ? 'back-print' : undefined;
            const artTex = artKey && updatedArtworkTextures ? updatedArtworkTextures[artKey] : null;
            updatePhysicalFabricMaterial(mat, fabric, artTex, newWireframe);
          }
        });
      }
    },
    dispose: () => {
      parts.forEach((mesh) => {
        mesh.geometry.dispose();
      });
      materials.forEach((mat) => {
        mat.dispose();
      });
      parts.clear();
      materials.clear();
    }
  };
}

/**
 * Creates curved front or back body panel with smooth drape curves and clean UVs.
 */
function createCurvedPanelGeometry(opts: {
  topRadius: number;
  bottomRadius: number;
  height: number;
  arcAngle: number;
  zOffset: number;
  isFront: boolean;
}): THREE.BufferGeometry {
  const segmentsX = 32;
  const segmentsY = 32;
  const geom = new THREE.PlaneGeometry(1, 1, segmentsX, segmentsY);
  const pos = geom.attributes.position;
  const uvs = geom.attributes.uv;

  const halfH = opts.height / 2;
  const sign = opts.isFront ? 1 : -1;

  for (let i = 0; i < pos.count; i++) {
    const rawX = pos.getX(i); // [-0.5 .. 0.5]
    const rawY = pos.getY(i); // [-0.5 .. 0.5]

    const y = rawY * opts.height;
    const tY = (rawY + 0.5); // 0 at bottom, 1 at top
    const radius = THREE.MathUtils.lerp(opts.bottomRadius, opts.topRadius, tY);

    // Curve around cylinder
    const angle = rawX * opts.arcAngle;
    const x = Math.sin(angle) * radius;
    let z = (Math.cos(angle) * radius * sign) + opts.zOffset;

    // Add organic fabric curvature and chest protrusion
    if (opts.isFront) {
      const chestBulge = Math.exp(-Math.pow((tY - 0.7) * 4, 2)) * 0.035;
      z += chestBulge;
    } else {
      const backCurve = Math.exp(-Math.pow((tY - 0.6) * 3, 2)) * 0.02;
      z -= backCurve;
    }

    pos.setXYZ(i, x, y, z);

    // Map UVs cleanly: center of panel is (0.5, 0.5)
    uvs.setXY(i, rawX + 0.5, rawY + 0.5);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates paired left and right sleeves positioned in relaxed A-pose.
 */
function createSleevesGeometry(opts: {
  armLength: number;
  shoulderWidth: number;
  shoulderY: number;
  armRadiusTop: number;
  armRadiusWrist: number;
}): THREE.BufferGeometry {
  const sleeveR = createSingleSleeve(opts, 1);
  const sleeveL = createSingleSleeve(opts, -1);
  return mergeBufferGeometries([sleeveR, sleeveL]);
}

function createSingleSleeve(opts: {
  armLength: number;
  shoulderWidth: number;
  shoulderY: number;
  armRadiusTop: number;
  armRadiusWrist: number;
}, side: number): THREE.BufferGeometry {
  const radialSegments = 24;
  const heightSegments = 20;
  const geom = new THREE.CylinderGeometry(
    opts.armRadiusWrist,
    opts.armRadiusTop,
    opts.armLength,
    radialSegments,
    heightSegments,
    true
  );

  // Rotate cylinder to relaxed A-pose angle (~38 degrees)
  const angle = THREE.MathUtils.degToRad(38 * side);
  geom.rotateZ(angle);

  // Position at shoulder socket
  const offsetX = (opts.shoulderWidth + (opts.armLength * 0.5 * Math.sin(Math.abs(angle)))) * side;
  const offsetY = opts.shoulderY - (opts.armLength * 0.5 * Math.cos(angle));
  geom.translate(offsetX, offsetY, 0);

  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates 3D cowl hood wrapping around collar and over head.
 */
function createHoodGeometry(opts: {
  collarY: number;
  collarRadius: number;
  doubleLayer: boolean;
}): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(0.24, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.68);
  // Flatten front opening
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i) * 1.25;
    let z = pos.getZ(i);

    // Pull back of hood slightly backward
    if (z < 0) {
      z *= 1.35;
    } else {
      // Cut out front face opening
      y = Math.max(y, -0.05);
    }
    pos.setXYZ(i, x, y + opts.collarY + 0.18, z - 0.05);
  }
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates front Kangaroo Pocket with angled hand opening trims.
 */
function createKangarooPocketGeometry(opts: {
  width: number;
  height: number;
  centerY: number;
  chestR: number;
}): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(opts.width, opts.height, 16, 16);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const rawX = pos.getX(i) / opts.width; // [-0.5 .. 0.5]
    const rawY = pos.getY(i) / opts.height; // [-0.5 .. 0.5]

    // Taper top width
    const taper = rawY > 0 ? (1 - rawY * 0.35) : 1.0;
    const x = pos.getX(i) * taper;
    const y = pos.getY(i) + opts.centerY;
    // Follow torso curvature + offset outward
    const z = (Math.cos(rawX * Math.PI * 0.6) * opts.chestR) + 0.02;

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates ribbed wrist cuffs.
 */
function createCuffsGeometry(opts: {
  armLength: number;
  shoulderWidth: number;
  shoulderY: number;
  cuffRadius: number;
  cuffHeight: number;
}): THREE.BufferGeometry {
  const cuffR = createSingleCuff(opts, 1);
  const cuffL = createSingleCuff(opts, -1);
  return mergeBufferGeometries([cuffR, cuffL]);
}

function createSingleCuff(opts: {
  armLength: number;
  shoulderWidth: number;
  shoulderY: number;
  cuffRadius: number;
  cuffHeight: number;
}, side: number): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(opts.cuffRadius * 0.92, opts.cuffRadius, opts.cuffHeight, 20, 2, true);
  const angle = THREE.MathUtils.degToRad(38 * side);
  geom.rotateZ(angle);

  const endArmX = (opts.shoulderWidth + (opts.armLength * Math.sin(Math.abs(angle)))) * side;
  const endArmY = opts.shoulderY - (opts.armLength * Math.cos(angle));

  geom.translate(endArmX, endArmY, 0);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates hanging drawstrings with metallic aglets.
 */
function createDrawstringsGeometry(collarY: number): THREE.BufferGeometry {
  const cordLength = 0.28;
  const cordL = new THREE.CylinderGeometry(0.005, 0.005, cordLength, 8);
  cordL.translate(-0.06, collarY - cordLength / 2, 0.16);

  const cordR = new THREE.CylinderGeometry(0.005, 0.005, cordLength, 8);
  cordR.translate(0.06, collarY - cordLength / 2, 0.16);

  return mergeBufferGeometries([cordL, cordR]);
}

/**
 * Lightweight in-memory BufferGeometry merger to avoid extra heavy dependencies.
 */
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalPositions = 0;
  let totalUvs = 0;
  let totalNormals = 0;
  let totalIndices = 0;

  geometries.forEach((g) => {
    totalPositions += g.attributes.position.array.length;
    if (g.attributes.uv) totalUvs += g.attributes.uv.array.length;
    if (g.attributes.normal) totalNormals += g.attributes.normal.array.length;
    if (g.index) totalIndices += g.index.array.length;
  });

  const mergedPos = new Float32Array(totalPositions);
  const mergedNorm = new Float32Array(totalNormals);
  const mergedUv = new Float32Array(totalUvs);
  const mergedIndices: number[] = [];

  let posOffset = 0;
  let normOffset = 0;
  let uvOffset = 0;
  let vertexOffset = 0;

  geometries.forEach((g) => {
    mergedPos.set(g.attributes.position.array, posOffset);
    posOffset += g.attributes.position.array.length;

    if (g.attributes.normal) {
      mergedNorm.set(g.attributes.normal.array, normOffset);
      normOffset += g.attributes.normal.array.length;
    }

    if (g.attributes.uv) {
      mergedUv.set(g.attributes.uv.array, uvOffset);
      uvOffset += g.attributes.uv.array.length;
    }

    if (g.index) {
      for (let i = 0; i < g.index.count; i++) {
        mergedIndices.push(g.index.getX(i) + vertexOffset);
      }
    } else {
      for (let i = 0; i < g.attributes.position.count; i++) {
        mergedIndices.push(i + vertexOffset);
      }
    }

    vertexOffset += g.attributes.position.count;
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
  if (totalNormals > 0) merged.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3));
  if (totalUvs > 0) merged.setAttribute('uv', new THREE.BufferAttribute(mergedUv, 2));
  merged.setIndex(mergedIndices);
  merged.computeVertexNormals();
  return merged;
}
