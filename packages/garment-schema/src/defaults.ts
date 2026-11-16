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
    transform3D: { position: [0, 0.14, 0.18], rotation: [0, 0, 0] }, // In front of avatar with clear clearance over shoulders
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
    transform3D: { position: [0, 0.14, -0.18], rotation: [0, Math.PI, 0] }, // Behind avatar with clear clearance over shoulders
    meshDensityMm: 20
  };

  // Seam Connections:
  // 1. Left Shoulder Seam (Front edge 6: [6]->[7] to Back edge 3: [3]->[4], reversed connects neck->neck, outer->outer)
  // 2. Right Shoulder Seam (Front edge 3: [3]->[4] to Back edge 6: [6]->[7], reversed connects outer->outer, neck->neck)
  // 3. Left Side Seam (Front edge 8: [8]->[0] to Back edge 1: [1]->[2], reversed connects top->top, bottom->bottom)
  // 4. Right Side Seam (Front edge 1: [1]->[2] to Back edge 8: [8]->[0], reversed connects bottom->bottom, top->top)
  const seams: SewingConnection[] = [
    {
      id: 'seam-shoulder-left',
      name: 'Left Shoulder',
      sourcePieceId: 'piece-tunic-front',
      sourceEdgeIndex: 6,
      targetPieceId: 'piece-tunic-back',
      targetEdgeIndex: 3,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-shoulder-right',
      name: 'Right Shoulder',
      sourcePieceId: 'piece-tunic-front',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-tunic-back',
      targetEdgeIndex: 6,
      orientation: 'reversed',
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
      orientation: 'reversed',
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
      orientation: 'reversed',
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
// REFERENCE GARMENT 2: OVERSIZED HOODIE (FULL 7-PIECE PATTERN MODEL)
// -------------------------------------------------------------
export function createDefaultHoodieInstance(): GarmentInstance {
  const baseFabric = FABRIC_PRESETS['heavy-cotton-black'];
  const ribFabric = FABRIC_PRESETS['ribbed-knit-dark'];
  const physicalFleece = PHYSICAL_FABRIC_PRESETS['heavy-cotton-fleece'];

  const width = 620;
  const length = 720;
  const sleeveLen = 650;
  const shoulderWidth = 145;
  const armholeDepth = 230;
  const cuffW = 240;
  const bicepW = 420;
  const capH = 60;

  // Front Bodice (9 points)
  const frontPts: [number, number][] = [
    [0, 0],
    [width, 0],
    [width, length - armholeDepth],
    [width - 30, length],
    [width - 30 - shoulderWidth, length],
    [width / 2, length - 85],
    [30 + shoulderWidth, length],
    [30, length],
    [0, length - armholeDepth]
  ];

  // Back Bodice (9 points)
  const backPts: [number, number][] = [
    [0, 0],
    [width, 0],
    [width, length - armholeDepth],
    [width - 30, length],
    [width - 30 - shoulderWidth, length],
    [width / 2, length - 30],
    [30 + shoulderWidth, length],
    [30, length],
    [0, length - armholeDepth]
  ];

  // Left & Right Sleeves (5 points each)
  const leftSleevePts: [number, number][] = [
    [0, 0],
    [cuffW, 0],
    [bicepW, sleeveLen],
    [bicepW / 2, sleeveLen + capH],
    [0, sleeveLen]
  ];
  const rightSleevePts: [number, number][] = [
    [0, 0],
    [cuffW, 0],
    [bicepW, sleeveLen],
    [bicepW / 2, sleeveLen + capH],
    [0, sleeveLen]
  ];

  // Hood Cowls (6 points each)
  const hoodLeftPts: [number, number][] = [
    [0, 0],
    [220, 15],
    [290, 160],
    [260, 360],
    [120, 380],
    [0, 240]
  ];
  const hoodRightPts: [number, number][] = [
    [0, 0],
    [220, 15],
    [290, 160],
    [260, 360],
    [120, 380],
    [0, 240]
  ];

  // Kangaroo Pocket (6 points)
  const pocketW = 320;
  const pocketTopW = 220;
  const pocketH = 190;
  const pocketPts: [number, number][] = [
    [0, 0],
    [pocketW, 0],
    [pocketW, 80],
    [pocketW - (pocketW - pocketTopW) / 2, pocketH],
    [(pocketW - pocketTopW) / 2, pocketH],
    [0, 80]
  ];

  const pieces: PatternPiece[] = [
    {
      id: 'piece-hoodie-front',
      name: 'Front Bodice',
      category: 'front',
      outlinePoints: frontPts,
      segments: createSegmentsFromPoints(frontPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-fleece-front',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 50, rotation: 0 },
      transform3D: { position: [0, 0.14, 0.18], rotation: [0, 0, 0] },
      meshDensityMm: 24
    },
    {
      id: 'piece-hoodie-back',
      name: 'Back Bodice',
      category: 'back',
      outlinePoints: backPts,
      segments: createSegmentsFromPoints(backPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-fleece-back',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 720, y: 50, rotation: 0 },
      transform3D: { position: [0, 0.14, -0.18], rotation: [0, Math.PI, 0] },
      meshDensityMm: 24
    },
    {
      id: 'piece-hoodie-sleeve-left',
      name: 'Left Sleeve',
      category: 'sleeve',
      outlinePoints: leftSleevePts,
      segments: createSegmentsFromPoints(leftSleevePts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-fleece-sleeves',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 820, rotation: 0 },
      transform3D: {
        position: [-0.30, 0.30, 0],
        rotation: [0, -Math.PI / 2, 0],
        curvatureRadius: 0.08,
        arrangementPoint: 'arm_left_upper'
      },
      meshDensityMm: 24
    },
    {
      id: 'piece-hoodie-sleeve-right',
      name: 'Right Sleeve',
      category: 'sleeve',
      outlinePoints: rightSleevePts,
      segments: createSegmentsFromPoints(rightSleevePts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-fleece-sleeves',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 500, y: 820, rotation: 0 },
      transform3D: {
        position: [0.30, 0.30, 0],
        rotation: [0, Math.PI / 2, 0],
        curvatureRadius: 0.08,
        arrangementPoint: 'arm_right_upper'
      },
      meshDensityMm: 24
    },
    {
      id: 'piece-hoodie-hood-left',
      name: 'Left Hood Cowl',
      category: 'hood',
      outlinePoints: hoodLeftPts,
      segments: createSegmentsFromPoints(hoodLeftPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-fleece-hood',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 950, y: 820, rotation: 0 },
      transform3D: {
        position: [-0.11, 0.52, -0.03],
        rotation: [0, -Math.PI / 2, 0],
        curvatureRadius: 0.14,
        arrangementPoint: 'hood_left'
      },
      meshDensityMm: 24
    },
    {
      id: 'piece-hoodie-hood-right',
      name: 'Right Hood Cowl',
      category: 'hood',
      outlinePoints: hoodRightPts,
      segments: createSegmentsFromPoints(hoodRightPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-fleece-hood',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 1300, y: 820, rotation: 0 },
      transform3D: {
        position: [0.11, 0.52, -0.03],
        rotation: [0, Math.PI / 2, 0],
        curvatureRadius: 0.14,
        arrangementPoint: 'hood_right'
      },
      meshDensityMm: 24
    },
    {
      id: 'piece-hoodie-pocket',
      name: 'Kangaroo Pocket',
      category: 'pocket',
      outlinePoints: pocketPts,
      segments: createSegmentsFromPoints(pocketPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-fleece-pocket',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 1400, y: 50, rotation: 0 },
      transform3D: {
        position: [0, -0.07, 0.20],
        rotation: [0, 0, 0]
      },
      meshDensityMm: 24
    }
  ];

  const seams: SewingConnection[] = [
    // 1. Bodice Shoulders
    {
      id: 'seam-hoodie-shoulder-left',
      name: 'Left Shoulder',
      sourcePieceId: 'piece-hoodie-front',
      sourceEdgeIndex: 6,
      targetPieceId: 'piece-hoodie-back',
      targetEdgeIndex: 3,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hoodie-shoulder-right',
      name: 'Right Shoulder',
      sourcePieceId: 'piece-hoodie-front',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-hoodie-back',
      targetEdgeIndex: 6,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    // 2. Bodice Side Seams
    {
      id: 'seam-hoodie-side-left',
      name: 'Left Side Seam',
      sourcePieceId: 'piece-hoodie-front',
      sourceEdgeIndex: 8,
      targetPieceId: 'piece-hoodie-back',
      targetEdgeIndex: 1,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hoodie-side-right',
      name: 'Right Side Seam',
      sourcePieceId: 'piece-hoodie-front',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-hoodie-back',
      targetEdgeIndex: 8,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    // 3. Sleeve Inseams
    {
      id: 'seam-hoodie-sleeve-left-in',
      name: 'Left Sleeve Inseam',
      sourcePieceId: 'piece-hoodie-sleeve-left',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-hoodie-sleeve-left',
      targetEdgeIndex: 4,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hoodie-sleeve-right-in',
      name: 'Right Sleeve Inseam',
      sourcePieceId: 'piece-hoodie-sleeve-right',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-hoodie-sleeve-right',
      targetEdgeIndex: 4,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    // 4. Sleeve Armholes
    {
      id: 'seam-hoodie-armhole-left-front',
      name: 'Left Armhole Front',
      sourcePieceId: 'piece-hoodie-sleeve-left',
      sourceEdgeIndex: 2,
      targetPieceId: 'piece-hoodie-front',
      targetEdgeIndex: 7,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hoodie-armhole-left-back',
      name: 'Left Armhole Back',
      sourcePieceId: 'piece-hoodie-sleeve-left',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-hoodie-back',
      targetEdgeIndex: 2,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hoodie-armhole-right-front',
      name: 'Right Armhole Front',
      sourcePieceId: 'piece-hoodie-sleeve-right',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-hoodie-front',
      targetEdgeIndex: 2,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hoodie-armhole-right-back',
      name: 'Right Armhole Back',
      sourcePieceId: 'piece-hoodie-sleeve-right',
      sourceEdgeIndex: 2,
      targetPieceId: 'piece-hoodie-back',
      targetEdgeIndex: 7,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 5. Hood Crown & Back Seams
    {
      id: 'seam-hood-back',
      name: 'Hood Center Back Seam',
      sourcePieceId: 'piece-hoodie-hood-left',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-hoodie-hood-right',
      targetEdgeIndex: 1,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hood-crown-back',
      name: 'Hood Crown Back Seam',
      sourcePieceId: 'piece-hoodie-hood-left',
      sourceEdgeIndex: 2,
      targetPieceId: 'piece-hoodie-hood-right',
      targetEdgeIndex: 2,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hood-crown-top',
      name: 'Hood Crown Top Seam',
      sourcePieceId: 'piece-hoodie-hood-left',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-hoodie-hood-right',
      targetEdgeIndex: 3,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    // 6. Hood to Neckline Seams
    {
      id: 'seam-hood-neck-left',
      name: 'Hood Left Neckline',
      sourcePieceId: 'piece-hoodie-hood-left',
      sourceEdgeIndex: 0,
      targetPieceId: 'piece-hoodie-front',
      targetEdgeIndex: 5,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-hood-neck-right',
      name: 'Hood Right Neckline',
      sourcePieceId: 'piece-hoodie-hood-right',
      sourceEdgeIndex: 0,
      targetPieceId: 'piece-hoodie-front',
      targetEdgeIndex: 4,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 7. Kangaroo Pocket Hem
    {
      id: 'seam-hoodie-pocket-bottom',
      name: 'Pocket Bottom',
      sourcePieceId: 'piece-hoodie-pocket',
      sourceEdgeIndex: 0,
      targetPieceId: 'piece-hoodie-front',
      targetEdgeIndex: 0,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    }
  ];

  return {
    id: 'hoodie-001',
    templateId: 'hoodie-oversized-v1',
    name: 'Oversized Streetwear Hoodie',
    type: 'hoodie',
    parameters: {
      bodyLength: length,
      chestWidth: width,
      sleeveLength: sleeveLen,
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
    patternPieces: pieces,
    seams,
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
// REFERENCE GARMENT 3: BOXY T-SHIRT (4-PANEL MODEL)
// -------------------------------------------------------------
export function createDefaultTShirtInstance(): GarmentInstance {
  const baseFabric = FABRIC_PRESETS['heavy-cotton-cream'];
  const physicalTee = PHYSICAL_FABRIC_PRESETS['lightweight-cotton'];

  const width = 500;
  const length = 680;
  const sleeveLen = 200;
  const shoulderWidth = 120;
  const armholeDepth = 190;
  const sleeveWidth = 340;

  const frontPts: [number, number][] = [
    [0, 0], // 0: Bottom Left
    [width, 0], // 1: Bottom Right
    [width, length - armholeDepth], // 2: Right Underarm
    [width - 20, length - 15], // 3: Right Shoulder Outer (sloped)
    [width - 20 - shoulderWidth, length], // 4: Right Neck
    [width / 2, length - 65], // 5: Front Neck Scoop Center
    [20 + shoulderWidth, length], // 6: Left Neck
    [20, length - 15], // 7: Left Shoulder Outer (sloped)
    [0, length - armholeDepth] // 8: Left Underarm
  ];

  const backPts: [number, number][] = [
    [0, 0], // 0: Bottom Left
    [width, 0], // 1: Bottom Right
    [width, length - armholeDepth], // 2: Right Underarm
    [width - 20, length - 15], // 3: Right Shoulder Outer
    [width - 20 - shoulderWidth, length], // 4: Right Neck
    [width / 2, length - 22], // 5: Back Neck Center
    [20 + shoulderWidth, length], // 6: Left Neck
    [20, length - 15], // 7: Left Shoulder Outer
    [0, length - armholeDepth] // 8: Left Underarm
  ];

  const leftSleevePts: [number, number][] = [
    [0, 0],
    [sleeveWidth - 40, 0],
    [sleeveWidth, sleeveLen],
    [sleeveWidth / 2, sleeveLen + 55],
    [0, sleeveLen]
  ];

  const rightSleevePts: [number, number][] = [
    [0, 0],
    [sleeveWidth - 40, 0],
    [sleeveWidth, sleeveLen],
    [sleeveWidth / 2, sleeveLen + 55],
    [0, sleeveLen]
  ];

  const pieces: PatternPiece[] = [
    {
      id: 'piece-tee-sleeve-left',
      name: 'Left Sleeve',
      category: 'sleeve',
      outlinePoints: leftSleevePts,
      segments: createSegmentsFromPoints(leftSleevePts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-cotton-front',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 160, rotation: 0 },
      transform3D: {
        position: [-0.22, 0.18, -0.01],
        rotation: [0, -Math.PI / 2, 0],
        curvatureRadius: 0.055,
        arrangementPoint: 'arm_left_upper'
      },
      meshDensityMm: 20
    },
    {
      id: 'piece-tee-front',
      name: 'Front Bodice',
      category: 'front',
      outlinePoints: frontPts,
      segments: createSegmentsFromPoints(frontPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-cotton-front',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 440, y: 60, rotation: 0 },
      transform3D: { position: [0, 0.10, 0.13], rotation: [0, 0, 0] },
      meshDensityMm: 20
    },
    {
      id: 'piece-tee-back',
      name: 'Back Bodice',
      category: 'back',
      outlinePoints: backPts,
      segments: createSegmentsFromPoints(backPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-cotton-back',
      quantity: 1,
      mirrored: true,
      transform2D: { x: 990, y: 60, rotation: 0 },
      transform3D: { position: [0, 0.10, -0.11], rotation: [0, Math.PI, 0] },
      meshDensityMm: 20
    },
    {
      id: 'piece-tee-sleeve-right',
      name: 'Right Sleeve',
      category: 'sleeve',
      outlinePoints: rightSleevePts,
      segments: createSegmentsFromPoints(rightSleevePts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-cotton-front',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 1540, y: 160, rotation: 0 },
      transform3D: {
        position: [0.22, 0.18, -0.01],
        rotation: [0, Math.PI / 2, 0],
        curvatureRadius: 0.055,
        arrangementPoint: 'arm_right_upper'
      },
      meshDensityMm: 20
    }
  ];

  const seams: SewingConnection[] = [
    // 1. Shoulders (Clean parallel Left-to-Left, Right-to-Right!)
    {
      id: 'seam-tee-shoulder-left',
      name: 'Left Shoulder',
      sourcePieceId: 'piece-tee-front',
      sourceEdgeIndex: 6,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 6,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-tee-shoulder-right',
      name: 'Right Shoulder',
      sourcePieceId: 'piece-tee-front',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 3,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 2. Side Seams (Clean parallel Left-to-Left, Right-to-Right!)
    {
      id: 'seam-tee-side-left',
      name: 'Left Side Seam',
      sourcePieceId: 'piece-tee-front',
      sourceEdgeIndex: 8,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 8,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-tee-side-right',
      name: 'Right Side Seam',
      sourcePieceId: 'piece-tee-front',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 1,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 3. Sleeve Inseams
    {
      id: 'seam-tee-sleeve-left-in',
      name: 'Left Sleeve Inseam',
      sourcePieceId: 'piece-tee-sleeve-left',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-tee-sleeve-left',
      targetEdgeIndex: 4,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-tee-sleeve-right-in',
      name: 'Right Sleeve Inseam',
      sourcePieceId: 'piece-tee-sleeve-right',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-tee-sleeve-right',
      targetEdgeIndex: 4,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    // 4. Sleeve to Armhole Seams (Front cap to Front armhole, Back cap to Back armhole)
    {
      id: 'seam-tee-armhole-left-front',
      name: 'Left Armhole Front',
      sourcePieceId: 'piece-tee-sleeve-left',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-tee-front',
      targetEdgeIndex: 7,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-tee-armhole-left-back',
      name: 'Left Armhole Back',
      sourcePieceId: 'piece-tee-sleeve-left',
      sourceEdgeIndex: 2,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 7,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-tee-armhole-right-front',
      name: 'Right Armhole Front',
      sourcePieceId: 'piece-tee-sleeve-right',
      sourceEdgeIndex: 2,
      targetPieceId: 'piece-tee-front',
      targetEdgeIndex: 2,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-tee-armhole-right-back',
      name: 'Right Armhole Back',
      sourcePieceId: 'piece-tee-sleeve-right',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 2,
      orientation: 'reversed',
      sewingMode: '1-to-1',
      active: true
    }
  ];

  return {
    id: 'tshirt-001',
    templateId: 'tshirt-box-fit-v1',
    name: 'Boxy Heavyweight Tee',
    type: 'tshirt',
    parameters: {
      bodyLength: length,
      chestWidth: width,
      sleeveLength: sleeveLen,
      shoulderWidth: 520,
      fit: 'oversized'
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
      default: { ...physicalTee }
    },
    patternPieces: pieces,
    seams,
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

export function createInitialProject(): GarmentProject {
  const defaultGarment = createDefaultTShirtInstance();
  const defaultHoodie = createDefaultHoodieInstance();

  return {
    schemaVersion: 1,
    projectId: 'project-studio-' + Date.now().toString(36),
    name: 'Untitled Garment Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    units: 'mm',
    activeGarmentId: defaultGarment.id,
    garments: [defaultGarment, defaultHoodie],
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
