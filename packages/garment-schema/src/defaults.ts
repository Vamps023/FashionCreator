import {
  GarmentProject,
  GarmentInstance,
  FabricMaterial,
  PhysicalFabricProperties,
  SimulationSettings,
  PatternPiece,
  SewingConnection
} from './types';

// -------------------------------------------------------------
// PHYSICAL FABRIC PRESETS (Measured in GSM, stiffness, bending)
// -------------------------------------------------------------
export const PHYSICAL_FABRIC_PRESETS: Record<string, PhysicalFabricProperties> = {
  'heavy-cotton-fleece': {
    id: 'heavy-cotton-fleece',
    name: 'Heavy French Terry Fleece (380 GSM)',
    arealDensityGsm: 380,
    warpStiffness: 0.85,
    weftStiffness: 0.75,
    shearStiffness: 0.65,
    bendingStiffness: 0.7,
    damping: 0.985,
    friction: 0.45,
    thicknessMm: 2.2
  },
  'lightweight-cotton': {
    id: 'lightweight-cotton',
    name: 'Cotton Jersey Tee (160 GSM)',
    arealDensityGsm: 160,
    warpStiffness: 0.7,
    weftStiffness: 0.55,
    shearStiffness: 0.45,
    bendingStiffness: 0.35,
    damping: 0.98,
    friction: 0.4,
    thicknessMm: 1.1
  },
  'raw-rigid-denim': {
    id: 'raw-rigid-denim',
    name: 'Raw Selvedge Denim (420 GSM)',
    arealDensityGsm: 420,
    warpStiffness: 0.95,
    weftStiffness: 0.9,
    shearStiffness: 0.85,
    bendingStiffness: 0.92,
    damping: 0.99,
    friction: 0.55,
    thicknessMm: 2.6
  },
  'fluid-silk-satin': {
    id: 'fluid-silk-satin',
    name: 'Fluid Silk Satin (95 GSM)',
    arealDensityGsm: 95,
    warpStiffness: 0.6,
    weftStiffness: 0.6,
    shearStiffness: 0.3,
    bendingStiffness: 0.15,
    damping: 0.97,
    friction: 0.25,
    thicknessMm: 0.5
  },
  'ribbed-knit-trim': {
    id: 'ribbed-knit-trim',
    name: 'Ribbed Knit Trim (260 GSM)',
    arealDensityGsm: 260,
    warpStiffness: 0.8,
    weftStiffness: 0.35, // High lateral stretch
    shearStiffness: 0.5,
    bendingStiffness: 0.4,
    damping: 0.985,
    friction: 0.5,
    thicknessMm: 1.8
  }
};

export const DEFAULT_SIMULATION_SETTINGS: SimulationSettings = {
  gravity: 9.81,
  substeps: 12,
  damping: 0.985,
  sewingForce: 0.85,
  collisionThicknessMm: 12,
  groundCollision: true,
  avatarCollision: true,
  isRunning: false
};

// -------------------------------------------------------------
// VISUAL PBR PRESETS
// -------------------------------------------------------------
export const FABRIC_PRESETS: Record<string, FabricMaterial> = {
  'heavy-cotton-black': {
    id: 'heavy-cotton-black',
    name: 'Heavy Cotton Fleece (Black)',
    category: 'fleece',
    color: '#1a1a1a',
    roughness: 0.85,
    metalness: 0.05,
    sheen: 0.4,
    sheenRoughness: 0.6,
    normalScale: 0.8,
    weaveRepeat: 32,
    texturePattern: 'knit'
  },
  'heavy-cotton-cream': {
    id: 'heavy-cotton-cream',
    name: 'Organic Cotton (Off-White)',
    category: 'cotton',
    color: '#f5f2eb',
    roughness: 0.9,
    metalness: 0.0,
    sheen: 0.35,
    sheenRoughness: 0.7,
    normalScale: 0.7,
    weaveRepeat: 28,
    texturePattern: 'plain'
  },
  'washed-sage': {
    id: 'washed-sage',
    name: 'Washed Sage Cotton',
    category: 'cotton',
    color: '#738678',
    roughness: 0.82,
    metalness: 0.0,
    sheen: 0.45,
    sheenRoughness: 0.5,
    normalScale: 0.75,
    weaveRepeat: 30,
    texturePattern: 'plain'
  },
  'vintage-heather-grey': {
    id: 'vintage-heather-grey',
    name: 'Heather Grey Terry',
    category: 'cotton',
    color: '#9e9e9e',
    roughness: 0.88,
    metalness: 0.0,
    sheen: 0.3,
    sheenRoughness: 0.65,
    normalScale: 0.9,
    weaveRepeat: 36,
    texturePattern: 'terry'
  },
  'raw-indigo-denim': {
    id: 'raw-indigo-denim',
    name: 'Raw Indigo Denim',
    category: 'denim',
    color: '#1e293b',
    roughness: 0.75,
    metalness: 0.05,
    sheen: 0.2,
    sheenRoughness: 0.8,
    normalScale: 1.2,
    weaveRepeat: 24,
    texturePattern: 'twill'
  },
  'ribbed-knit-dark': {
    id: 'ribbed-knit-dark',
    name: 'Ribbed Knit Trim',
    category: 'ribbed',
    color: '#262626',
    roughness: 0.92,
    metalness: 0.0,
    sheen: 0.3,
    sheenRoughness: 0.8,
    normalScale: 1.5,
    weaveRepeat: 40,
    texturePattern: 'ribbed'
  }
};

// -------------------------------------------------------------
// REFERENCE GARMENT 1: TWO-PANEL SEWN TUNIC (THE STEP 14 VERIFICATION WORKHORSE)
// -------------------------------------------------------------
export function createTwoPanelTunicInstance(): GarmentInstance {
  const baseFabric = FABRIC_PRESETS['heavy-cotton-cream'];
  const physicalFabric = PHYSICAL_FABRIC_PRESETS['lightweight-cotton'];

  // Dimensions in millimeters
  const widthMm = 520;
  const heightMm = 680;
  const shoulderWidthMm = 120;
  const neckDropFrontMm = 70;
  const neckDropBackMm = 25;

  // Front Panel Points
  const frontPoints: [number, number][] = [
    [0, 0], // Bottom Left (0)
    [widthMm, 0], // Bottom Right (1)
    [widthMm, heightMm - 180], // Right Underarm (2)
    [widthMm - 20, heightMm], // Right Shoulder Outer (3)
    [widthMm - 20 - shoulderWidthMm, heightMm], // Right Neck (4)
    [widthMm / 2, heightMm - neckDropFrontMm], // Front Neck Center (5)
    [20 + shoulderWidthMm, heightMm], // Left Neck (6)
    [20, heightMm], // Left Shoulder Outer (7)
    [0, heightMm - 180] // Left Underarm (8)
  ];

  // Back Panel Points
  const backPoints: [number, number][] = [
    [0, 0], // Bottom Left (0)
    [widthMm, 0], // Bottom Right (1)
    [widthMm, heightMm - 180], // Right Underarm (2)
    [widthMm - 20, heightMm], // Right Shoulder Outer (3)
    [widthMm - 20 - shoulderWidthMm, heightMm], // Right Neck (4)
    [widthMm / 2, heightMm - neckDropBackMm], // Back Neck Center (5)
    [20 + shoulderWidthMm, heightMm], // Left Neck (6)
    [20, heightMm], // Left Shoulder Outer (7)
    [0, heightMm - 180] // Left Underarm (8)
  ];

  const frontPiece: PatternPiece = {
    id: 'piece-tunic-front',
    name: 'Front Panel',
    category: 'front',
    outlinePoints: frontPoints,
    segments: createSegmentsFromPoints(frontPoints),
    internalLines: [],
    grainlineAngle: 90,
    seamAllowanceMm: 10,
    materialId: 'mat-cotton-front',
    quantity: 1,
    mirrored: false,
    transform2D: { x: 50, y: 50, rotation: 0 },
    transform3D: { position: [0, 0.05, 0.16], rotation: [0, 0, 0] }, // In front of avatar
    meshDensityMm: 20
  };

  const backPiece: PatternPiece = {
    id: 'piece-tunic-back',
    name: 'Back Panel',
    category: 'back',
    outlinePoints: backPoints,
    segments: createSegmentsFromPoints(backPoints),
    internalLines: [],
    grainlineAngle: 90,
    seamAllowanceMm: 10,
    materialId: 'mat-cotton-back',
    quantity: 1,
    mirrored: false,
    transform2D: { x: 620, y: 50, rotation: 0 },
    transform3D: { position: [0, 0.05, -0.16], rotation: [0, Math.PI, 0] }, // Behind avatar, facing front
    meshDensityMm: 20
  };

  // Seam Connections:
  // 1. Left Shoulder Seam (Front edge 7: [7]->[6] to Back edge 3: [3]->[4])
  // 2. Right Shoulder Seam (Front edge 3: [3]->[4] to Back edge 7: [7]->[6])
  // 3. Left Side Seam (Front edge 8: [8]->[0] to Back edge 1: [1]->[2])
  // 4. Right Side Seam (Front edge 1: [1]->[2] to Back edge 8: [8]->[0])
  const seams: SewingConnection[] = [
    {
      id: 'seam-shoulder-left',
      name: 'Left Shoulder',
      sourcePieceId: 'piece-tunic-front',
      sourceEdgeIndex: 7,
      targetPieceId: 'piece-tunic-back',
      targetEdgeIndex: 3,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-shoulder-right',
      name: 'Right Shoulder',
      sourcePieceId: 'piece-tunic-front',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-tunic-back',
      targetEdgeIndex: 7,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-side-left',
      name: 'Left Side Seam',
      sourcePieceId: 'piece-tunic-front',
      sourceEdgeIndex: 8,
      targetPieceId: 'piece-tunic-back',
      targetEdgeIndex: 1,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-side-right',
      name: 'Right Side Seam',
      sourcePieceId: 'piece-tunic-front',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-tunic-back',
      targetEdgeIndex: 8,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    }
  ];

  return {
    id: 'tunic-001',
    templateId: 'tunic-two-panel-v1',
    name: 'Two-Panel Sewn Tunic',
    type: 'tunic',
    parameters: {
      bodyLength: heightMm,
      chestWidth: widthMm,
      sleeveLength: 0,
      shoulderWidth: 440,
      fit: 'relaxed'
    },
    components: {
      hood: 'none',
      pockets: 'none',
      cuffs: 'hemmed',
      waistband: 'hemmed',
      drawstrings: 'none'
    },
    materials: {
      body_front: { ...baseFabric },
      body_back: { ...baseFabric },
      sleeves: { ...baseFabric },
      hood: { ...baseFabric },
      pocket: { ...baseFabric },
      cuffs: { ...baseFabric },
      waistband: { ...baseFabric },
      drawstrings: { ...baseFabric },
      collar: { ...baseFabric }
    },
    physicalFabrics: {
      default: { ...physicalFabric }
    },
    patternPieces: [frontPiece, backPiece],
    seams: seams,
    artworkLayers: [],
    simulationSettings: { ...DEFAULT_SIMULATION_SETTINGS }
  };
}

// Helper to generate segments from polygon points
export function createSegmentsFromPoints(points: [number, number][]) {
  return points.map((pt, i) => {
    const nextIdx = (i + 1) % points.length;
    const nextPt = points[nextIdx];
    const dx = nextPt[0] - pt[0];
    const dy = nextPt[1] - pt[1];
    return {
      stableId: `seg-${i}-${nextIdx}`,
      startIndex: i,
      endIndex: nextIdx,
      geometryType: 'line' as const,
      lengthMm: Math.round(Math.sqrt(dx * dx + dy * dy))
    };
  });
}

// -------------------------------------------------------------
// REFERENCE GARMENT 2: OVERSIZED HOODIE (FULL PATTERN MODEL)
// -------------------------------------------------------------
export function createDefaultHoodieInstance(): GarmentInstance {
  const baseFabric = FABRIC_PRESETS['heavy-cotton-black'];
  const ribFabric = FABRIC_PRESETS['ribbed-knit-dark'];
  const physicalFleece = PHYSICAL_FABRIC_PRESETS['heavy-cotton-fleece'];

  // Start with the tunic bodice foundation, then attach sleeves, hood, pocket
  const tunic = createTwoPanelTunicInstance();

  return {
    ...tunic,
    id: 'hoodie-001',
    templateId: 'hoodie-oversized-v1',
    name: 'Oversized Streetwear Hoodie',
    type: 'hoodie',
    parameters: {
      bodyLength: 720,
      chestWidth: 620,
      sleeveLength: 650,
      shoulderWidth: 540,
      fit: 'relaxed'
    },
    components: {
      hood: 'double-layer',
      pockets: 'kangaroo',
      cuffs: 'ribbed',
      waistband: 'ribbed',
      drawstrings: 'round-cord'
    },
    materials: {
      body_front: { ...baseFabric },
      body_back: { ...baseFabric },
      sleeves: { ...baseFabric },
      hood: { ...baseFabric },
      pocket: { ...baseFabric },
      cuffs: { ...ribFabric },
      waistband: { ...ribFabric },
      drawstrings: { ...baseFabric, color: '#e5e5e5' },
      collar: { ...ribFabric }
    },
    physicalFabrics: {
      default: { ...physicalFleece }
    },
    artworkLayers: [
      {
        id: 'art-front-logo-1',
        name: 'Studio Monogram',
        type: 'text',
        surfaceId: 'front-print',
        visible: true,
        locked: false,
        opacity: 0.95,
        position: [0.5, 0.35],
        scale: [0.35, 0.35],
        rotation: 0,
        text: 'A N T I G R A V I T Y',
        fontSize: 24,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#f8fafc',
        letterSpacing: 6
      }
    ],
    simulationSettings: { ...DEFAULT_SIMULATION_SETTINGS }
  };
}

// -------------------------------------------------------------
// REFERENCE GARMENT 3: BOXY T-SHIRT
// -------------------------------------------------------------
export function createDefaultTShirtInstance(): GarmentInstance {
  const tunic = createTwoPanelTunicInstance();
  const baseFabric = FABRIC_PRESETS['heavy-cotton-cream'];
  const physicalTee = PHYSICAL_FABRIC_PRESETS['lightweight-cotton'];

  return {
    ...tunic,
    id: 'tshirt-001',
    templateId: 'tshirt-box-fit-v1',
    name: 'Boxy Heavyweight Tee',
    type: 'tshirt',
    parameters: {
      bodyLength: 700,
      chestWidth: 580,
      sleeveLength: 260,
      shoulderWidth: 520,
      fit: 'oversized'
    },
    physicalFabrics: {
      default: { ...physicalTee }
    },
    materials: {
      ...tunic.materials,
      body_front: { ...baseFabric },
      body_back: { ...baseFabric }
    }
  };
}

export function createInitialProject(): GarmentProject {
  const defaultGarment = createDefaultHoodieInstance();

  return {
    schemaVersion: 1,
    projectId: 'project-studio-' + Date.now().toString(36),
    name: 'Untitled Garment Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    units: 'mm',
    activeGarmentId: defaultGarment.id,
    garments: [defaultGarment],
    avatar: {
      visible: true,
      presetId: 'mannequin-stylized',
      skinTone: '#4a4036',
      pose: 'relaxed',
      measurements: {
        heightMm: 1820,
        chestCircumferenceMm: 980,
        waistCircumferenceMm: 800,
        hipCircumferenceMm: 940,
        shoulderWidthMm: 480
      }
    },
    environment: {
      lightingPreset: 'clean-neutral',
      backgroundColor: '#121316',
      showFloorGrid: true,
      showShadows: true,
      exposure: 1.05
    }
  };
}
