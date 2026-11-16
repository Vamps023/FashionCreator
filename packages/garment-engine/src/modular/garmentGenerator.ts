import {
  GarmentInstance,
  GarmentType,
  PatternPiece,
  PatternSegment,
  SewingConnection,
  FABRIC_PRESETS,
  PHYSICAL_FABRIC_PRESETS,
  DEFAULT_SIMULATION_SETTINGS
} from '@fashion-studio/garment-schema';
import { AVATAR_ARRANGEMENT_POINTS } from '../arrangement/arrangementPoints';

function createSegments(points: [number, number][]): PatternSegment[] {
  return points.map((p1, i) => {
    const p2 = points[(i + 1) % points.length];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return {
      stableId: `seg-${i}`,
      startIndex: i,
      endIndex: (i + 1) % points.length,
      geometryType: 'line',
      lengthMm: Math.round(Math.sqrt(dx * dx + dy * dy))
    };
  });
}

export interface GarmentCustomizationOptions {
  name?: string;
  bodyLengthMm?: number;
  chestWidthMm?: number;
  sleeveLengthMm?: number;
  waistWidthMm?: number;
  fit?: 'slim' | 'regular' | 'relaxed' | 'oversized';
  fabricPreset?: string;
  color?: string;
}

/**
 * 1. REAL CREWNECK T-SHIRT (Bodices + Left/Right Sleeves)
 */
export function generateTShirtGarment(opts: GarmentCustomizationOptions = {}): GarmentInstance {
  const width = opts.chestWidthMm || 560;
  const length = opts.bodyLengthMm || 700;
  const sleeveLen = opts.sleeveLengthMm || 220;
  const shoulderWidth = 135;
  const armholeDepth = 210;
  const sleeveWidth = 360;

  const baseFabric = FABRIC_PRESETS['heavy-cotton-cream'];
  const physicalFabric = PHYSICAL_FABRIC_PRESETS['lightweight-cotton'];

  // Front Bodice
  const frontPts: [number, number][] = [
    [0, 0], // 0: Bottom Left
    [width, 0], // 1: Bottom Right
    [width, length - armholeDepth], // 2: Right Underarm
    [width - 25, length], // 3: Right Shoulder Outer
    [width - 25 - shoulderWidth, length], // 4: Right Neck
    [width / 2, length - 80], // 5: Front Neck Scoop Center
    [25 + shoulderWidth, length], // 6: Left Neck
    [25, length], // 7: Left Shoulder Outer
    [0, length - armholeDepth] // 8: Left Underarm
  ];

  // Back Bodice
  const backPts: [number, number][] = [
    [0, 0], // 0: Bottom Left
    [width, 0], // 1: Bottom Right
    [width, length - armholeDepth], // 2: Right Underarm
    [width - 25, length], // 3: Right Shoulder Outer
    [width - 25 - shoulderWidth, length], // 4: Right Neck
    [width / 2, length - 28], // 5: Back Neck Center
    [25 + shoulderWidth, length], // 6: Left Neck
    [25, length], // 7: Left Shoulder Outer
    [0, length - armholeDepth] // 8: Left Underarm
  ];

  // Left Sleeve (Curved sleeve cap)
  const leftSleevePts: [number, number][] = [
    [0, 0], // Cuff bottom left
    [sleeveWidth - 40, 0], // Cuff bottom right
    [sleeveWidth, sleeveLen], // Bicep outer
    [sleeveWidth / 2, sleeveLen + 50], // Cap crown
    [0, sleeveLen] // Bicep inner
  ];

  // Right Sleeve
  const rightSleevePts: [number, number][] = [
    [0, 0],
    [sleeveWidth - 40, 0],
    [sleeveWidth, sleeveLen],
    [sleeveWidth / 2, sleeveLen + 50],
    [0, sleeveLen]
  ];

  const pieces: PatternPiece[] = [
    {
      id: 'piece-tee-front',
      name: 'Front Bodice',
      category: 'front',
      outlinePoints: frontPts,
      segments: createSegments(frontPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-tee-body',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 50, rotation: 0 },
      transform3D: { position: [0, 0.05, 0.165], rotation: [0, 0, 0] },
      meshDensityMm: 22
    },
    {
      id: 'piece-tee-back',
      name: 'Back Bodice',
      category: 'back',
      outlinePoints: backPts,
      segments: createSegments(backPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-tee-body',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 660, y: 50, rotation: 0 },
      transform3D: { position: [0, 0.05, -0.165], rotation: [0, Math.PI, 0] },
      meshDensityMm: 22
    },
    {
      id: 'piece-tee-sleeve-left',
      name: 'Left Sleeve',
      category: 'sleeve',
      outlinePoints: leftSleevePts,
      segments: createSegments(leftSleevePts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-tee-body',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 800, rotation: 0 },
      transform3D: {
        position: [-0.31, 0.22, 0],
        rotation: [0, -Math.PI / 2, 0],
        curvatureRadius: 0.075,
        arrangementPoint: 'arm_left_upper'
      },
      meshDensityMm: 22
    },
    {
      id: 'piece-tee-sleeve-right',
      name: 'Right Sleeve',
      category: 'sleeve',
      outlinePoints: rightSleevePts,
      segments: createSegments(rightSleevePts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-tee-body',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 450, y: 800, rotation: 0 },
      transform3D: {
        position: [0.31, 0.22, 0],
        rotation: [0, Math.PI / 2, 0],
        curvatureRadius: 0.075,
        arrangementPoint: 'arm_right_upper'
      },
      meshDensityMm: 22
    }
  ];

  const seams: SewingConnection[] = [
    // 1. Left Shoulder
    {
      id: 'seam-tee-shoulder-left',
      name: 'Left Shoulder',
      sourcePieceId: 'piece-tee-front',
      sourceEdgeIndex: 7,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 3,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 2. Right Shoulder
    {
      id: 'seam-tee-shoulder-right',
      name: 'Right Shoulder',
      sourcePieceId: 'piece-tee-front',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 7,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 3. Left Side Seam
    {
      id: 'seam-tee-side-left',
      name: 'Left Side Seam',
      sourcePieceId: 'piece-tee-front',
      sourceEdgeIndex: 8,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 1,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 4. Right Side Seam
    {
      id: 'seam-tee-side-right',
      name: 'Right Side Seam',
      sourcePieceId: 'piece-tee-front',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-tee-back',
      targetEdgeIndex: 8,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 5. Left Sleeve Underarm Seam (Edge 0 to Edge 2 on left sleeve)
    {
      id: 'seam-tee-sleeve-left-underarm',
      name: 'Left Sleeve Inseam',
      sourcePieceId: 'piece-tee-sleeve-left',
      sourceEdgeIndex: 0,
      targetPieceId: 'piece-tee-sleeve-left',
      targetEdgeIndex: 2,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // 6. Right Sleeve Underarm Seam
    {
      id: 'seam-tee-sleeve-right-underarm',
      name: 'Right Sleeve Inseam',
      sourcePieceId: 'piece-tee-sleeve-right',
      sourceEdgeIndex: 0,
      targetPieceId: 'piece-tee-sleeve-right',
      targetEdgeIndex: 2,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    }
  ];

  return {
    id: `garment-tshirt-${Date.now().toString(36)}`,
    templateId: 'tshirt-crewneck-v2',
    name: opts.name || 'Crewneck Classic T-Shirt',
    type: 'tshirt',
    parameters: {
      bodyLength: length,
      chestWidth: width,
      sleeveLength: sleeveLen,
      shoulderWidth,
      fit: opts.fit || 'regular'
    },
    components: {
      hood: 'none',
      pockets: 'none',
      cuffs: 'hemmed',
      waistband: 'hemmed',
      drawstrings: 'none'
    },
    materials: {
      body_front: { ...baseFabric, color: opts.color || baseFabric.color },
      body_back: { ...baseFabric, color: opts.color || baseFabric.color },
      sleeves: { ...baseFabric, color: opts.color || baseFabric.color },
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
    patternPieces: pieces,
    seams,
    artworkLayers: [],
    simulationSettings: { ...DEFAULT_SIMULATION_SETTINGS }
  };
}

/**
 * 2. SUMMER A-LINE / SLIP DRESS
 */
export function generateDressGarment(opts: GarmentCustomizationOptions = {}): GarmentInstance {
  const chestWidth = opts.chestWidthMm || 480;
  const waistWidth = opts.waistWidthMm || 420;
  const hemWidth = 720;
  const bodiceLen = 380;
  const skirtLen = opts.bodyLengthMm ? opts.bodyLengthMm - bodiceLen : 620;
  const totalLength = bodiceLen + skirtLen;

  const silkFabric = FABRIC_PRESETS['silk-charmeuse'] || FABRIC_PRESETS['heavy-cotton-cream'];
  const physicalSilk = PHYSICAL_FABRIC_PRESETS['fluid-silk-satin'];

  // Front Bodice
  const frontBodicePts: [number, number][] = [
    [0, 0], // Waist left
    [waistWidth, 0], // Waist right
    [chestWidth, bodiceLen - 120], // Right underarm
    [chestWidth - 40, bodiceLen], // Right strap outer
    [chestWidth - 90, bodiceLen], // Right strap inner
    [waistWidth / 2, bodiceLen - 90], // Front scoop
    [90, bodiceLen], // Left strap inner
    [40, bodiceLen], // Left strap outer
    [0, bodiceLen - 120] // Left underarm
  ];

  // Back Bodice
  const backBodicePts: [number, number][] = [
    [0, 0],
    [waistWidth, 0],
    [chestWidth, bodiceLen - 120],
    [chestWidth - 40, bodiceLen],
    [chestWidth - 90, bodiceLen],
    [waistWidth / 2, bodiceLen - 40],
    [90, bodiceLen],
    [40, bodiceLen],
    [0, bodiceLen - 120]
  ];

  // Front Skirt Flare (Trapezoid A-line)
  const frontSkirtPts: [number, number][] = [
    [0, 0], // Hem left
    [hemWidth, 0], // Hem right
    [(hemWidth + waistWidth) / 2, skirtLen], // Waist right
    [(hemWidth - waistWidth) / 2, skirtLen] // Waist left
  ];

  // Back Skirt Flare
  const backSkirtPts: [number, number][] = [
    [0, 0],
    [hemWidth, 0],
    [(hemWidth + waistWidth) / 2, skirtLen],
    [(hemWidth - waistWidth) / 2, skirtLen]
  ];

  const pieces: PatternPiece[] = [
    {
      id: 'piece-dress-bodice-front',
      name: 'Bodice (Front)',
      category: 'front',
      outlinePoints: frontBodicePts,
      segments: createSegments(frontBodicePts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-dress',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 50, rotation: 0 },
      transform3D: { position: [0, 0.18, 0.16], rotation: [0, 0, 0] },
      meshDensityMm: 22
    },
    {
      id: 'piece-dress-bodice-back',
      name: 'Bodice (Back)',
      category: 'back',
      outlinePoints: backBodicePts,
      segments: createSegments(backBodicePts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-dress',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 550, y: 50, rotation: 0 },
      transform3D: { position: [0, 0.18, -0.16], rotation: [0, Math.PI, 0] },
      meshDensityMm: 22
    },
    {
      id: 'piece-dress-skirt-front',
      name: 'Skirt Flare (Front)',
      category: 'custom',
      outlinePoints: frontSkirtPts,
      segments: createSegments(frontSkirtPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-dress',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 480, rotation: 0 },
      transform3D: {
        position: [0, -0.28, 0.175],
        rotation: [0, 0, 0],
        curvatureRadius: 0.26,
        arrangementPoint: 'skirt_front'
      },
      meshDensityMm: 24
    },
    {
      id: 'piece-dress-skirt-back',
      name: 'Skirt Flare (Back)',
      category: 'custom',
      outlinePoints: backSkirtPts,
      segments: createSegments(backSkirtPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-dress',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 800, y: 480, rotation: 0 },
      transform3D: {
        position: [0, -0.28, -0.175],
        rotation: [0, Math.PI, 0],
        curvatureRadius: 0.26,
        arrangementPoint: 'skirt_back'
      },
      meshDensityMm: 24
    }
  ];

  const seams: SewingConnection[] = [
    // Bodice Shoulders
    {
      id: 'seam-dress-shoulder-left',
      name: 'Left Strap',
      sourcePieceId: 'piece-dress-bodice-front',
      sourceEdgeIndex: 7,
      targetPieceId: 'piece-dress-bodice-back',
      targetEdgeIndex: 3,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-dress-shoulder-right',
      name: 'Right Strap',
      sourcePieceId: 'piece-dress-bodice-front',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-dress-bodice-back',
      targetEdgeIndex: 7,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // Bodice Sides
    {
      id: 'seam-dress-bodice-side-left',
      name: 'Bodice Left Side',
      sourcePieceId: 'piece-dress-bodice-front',
      sourceEdgeIndex: 8,
      targetPieceId: 'piece-dress-bodice-back',
      targetEdgeIndex: 1,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-dress-bodice-side-right',
      name: 'Bodice Right Side',
      sourcePieceId: 'piece-dress-bodice-front',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-dress-bodice-back',
      targetEdgeIndex: 8,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // Skirt to Bodice Waist Seams (Edge 2 of front skirt to Edge 0 of front bodice)
    {
      id: 'seam-dress-waist-front',
      name: 'Front Waist Seam',
      sourcePieceId: 'piece-dress-skirt-front',
      sourceEdgeIndex: 2,
      targetPieceId: 'piece-dress-bodice-front',
      targetEdgeIndex: 0,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-dress-waist-back',
      name: 'Back Waist Seam',
      sourcePieceId: 'piece-dress-skirt-back',
      sourceEdgeIndex: 2,
      targetPieceId: 'piece-dress-bodice-back',
      targetEdgeIndex: 0,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // Skirt Side Seams
    {
      id: 'seam-dress-skirt-side-left',
      name: 'Skirt Left Side',
      sourcePieceId: 'piece-dress-skirt-front',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-dress-skirt-back',
      targetEdgeIndex: 1,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-dress-skirt-side-right',
      name: 'Skirt Right Side',
      sourcePieceId: 'piece-dress-skirt-front',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-dress-skirt-back',
      targetEdgeIndex: 3,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    }
  ];

  return {
    id: `garment-dress-${Date.now().toString(36)}`,
    templateId: 'dress-aline-v1',
    name: opts.name || 'Summer A-Line Flared Dress',
    type: 'dress',
    parameters: {
      bodyLength: totalLength,
      chestWidth,
      sleeveLength: 0,
      shoulderWidth: 100,
      fit: opts.fit || 'regular'
    },
    components: {
      hood: 'none',
      pockets: 'none',
      cuffs: 'hemmed',
      waistband: 'hemmed',
      drawstrings: 'none'
    },
    materials: {
      body_front: { ...silkFabric, color: opts.color || '#e06b75' },
      body_back: { ...silkFabric, color: opts.color || '#e06b75' },
      sleeves: { ...silkFabric },
      hood: { ...silkFabric },
      pocket: { ...silkFabric },
      cuffs: { ...silkFabric },
      waistband: { ...silkFabric },
      drawstrings: { ...silkFabric },
      collar: { ...silkFabric }
    },
    physicalFabrics: {
      default: { ...physicalSilk }
    },
    patternPieces: pieces,
    seams,
    artworkLayers: [],
    simulationSettings: { ...DEFAULT_SIMULATION_SETTINGS }
  };
}

/**
 * 3. CASUAL WIDE-LEG PANTS
 */
export function generatePantsGarment(opts: GarmentCustomizationOptions = {}): GarmentInstance {
  const waistHalf = (opts.waistWidthMm || 420) / 2;
  const legLen = opts.bodyLengthMm || 960;
  const hemWidth = 280;
  const crotchHeight = 310;

  const denimFabric = FABRIC_PRESETS['raw-denim'] || FABRIC_PRESETS['heavy-cotton-black'];
  const physicalDenim = PHYSICAL_FABRIC_PRESETS['raw-rigid-denim'];

  // Front Left Leg
  const frontLeftLegPts: [number, number][] = [
    [0, 0], // Hem inner
    [hemWidth, 0], // Hem outer
    [hemWidth + 30, legLen], // Waist outer
    [30, legLen], // Waist inner
    [0, legLen - crotchHeight] // Crotch curve
  ];

  // Front Right Leg
  const frontRightLegPts: [number, number][] = [
    [0, 0],
    [hemWidth, 0],
    [hemWidth - 30, legLen],
    [-30, legLen],
    [0, legLen - crotchHeight]
  ];

  // Back Left Leg (Deeper seat curve)
  const backLeftLegPts: [number, number][] = [
    [0, 0],
    [hemWidth + 20, 0],
    [hemWidth + 50, legLen + 25],
    [30, legLen + 25],
    [-35, legLen - crotchHeight]
  ];

  // Back Right Leg
  const backRightLegPts: [number, number][] = [
    [0, 0],
    [hemWidth + 20, 0],
    [hemWidth + 50, legLen + 25],
    [30, legLen + 25],
    [-35, legLen - crotchHeight]
  ];

  const pieces: PatternPiece[] = [
    {
      id: 'piece-pants-front-left',
      name: 'Front Left Leg',
      category: 'custom',
      outlinePoints: frontLeftLegPts,
      segments: createSegments(frontLeftLegPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-pants',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 50, rotation: 0 },
      transform3D: {
        position: [-0.11, -0.42, 0.12],
        rotation: [0, 0, 0],
        curvatureRadius: 0.12,
        arrangementPoint: 'leg_left_upper'
      },
      meshDensityMm: 24
    },
    {
      id: 'piece-pants-front-right',
      name: 'Front Right Leg',
      category: 'custom',
      outlinePoints: frontRightLegPts,
      segments: createSegments(frontRightLegPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-pants',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 420, y: 50, rotation: 0 },
      transform3D: {
        position: [0.11, -0.42, 0.12],
        rotation: [0, 0, 0],
        curvatureRadius: 0.12,
        arrangementPoint: 'leg_right_upper'
      },
      meshDensityMm: 24
    },
    {
      id: 'piece-pants-back-left',
      name: 'Back Left Leg',
      category: 'custom',
      outlinePoints: backLeftLegPts,
      segments: createSegments(backLeftLegPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-pants',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 1100, rotation: 0 },
      transform3D: {
        position: [-0.11, -0.42, -0.12],
        rotation: [0, Math.PI, 0],
        curvatureRadius: 0.12,
        arrangementPoint: 'leg_left_upper'
      },
      meshDensityMm: 24
    },
    {
      id: 'piece-pants-back-right',
      name: 'Back Right Leg',
      category: 'custom',
      outlinePoints: backRightLegPts,
      segments: createSegments(backRightLegPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-pants',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 420, y: 1100, rotation: 0 },
      transform3D: {
        position: [0.11, -0.42, -0.12],
        rotation: [0, Math.PI, 0],
        curvatureRadius: 0.12,
        arrangementPoint: 'leg_right_upper'
      },
      meshDensityMm: 24
    }
  ];

  const seams: SewingConnection[] = [
    // Front Crotch Center Seam
    {
      id: 'seam-pants-crotch-front',
      name: 'Front Rise Seam',
      sourcePieceId: 'piece-pants-front-left',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-pants-front-right',
      targetEdgeIndex: 3,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // Back Crotch Center Seam
    {
      id: 'seam-pants-crotch-back',
      name: 'Back Rise Seam',
      sourcePieceId: 'piece-pants-back-left',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-pants-back-right',
      targetEdgeIndex: 3,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // Outseam Left (Outer leg)
    {
      id: 'seam-pants-outseam-left',
      name: 'Left Outseam',
      sourcePieceId: 'piece-pants-front-left',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-pants-back-left',
      targetEdgeIndex: 1,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // Outseam Right
    {
      id: 'seam-pants-outseam-right',
      name: 'Right Outseam',
      sourcePieceId: 'piece-pants-front-right',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-pants-back-right',
      targetEdgeIndex: 1,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // Inseam Left (Inner leg)
    {
      id: 'seam-pants-inseam-left',
      name: 'Left Inseam',
      sourcePieceId: 'piece-pants-front-left',
      sourceEdgeIndex: 4,
      targetPieceId: 'piece-pants-back-left',
      targetEdgeIndex: 4,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    // Inseam Right
    {
      id: 'seam-pants-inseam-right',
      name: 'Right Inseam',
      sourcePieceId: 'piece-pants-front-right',
      sourceEdgeIndex: 4,
      targetPieceId: 'piece-pants-back-right',
      targetEdgeIndex: 4,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    }
  ];

  return {
    id: `garment-pants-${Date.now().toString(36)}`,
    templateId: 'pants-wide-leg-v1',
    name: opts.name || 'Casual Wide-Leg Trousers',
    type: 'trousers',
    parameters: {
      bodyLength: legLen,
      chestWidth: waistHalf * 2,
      sleeveLength: 0,
      shoulderWidth: 0,
      fit: opts.fit || 'relaxed'
    },
    components: {
      hood: 'none',
      pockets: 'none',
      cuffs: 'hemmed',
      waistband: 'hemmed',
      drawstrings: 'none'
    },
    materials: {
      body_front: { ...denimFabric, color: opts.color || '#2b3956' },
      body_back: { ...denimFabric, color: opts.color || '#2b3956' },
      sleeves: { ...denimFabric },
      hood: { ...denimFabric },
      pocket: { ...denimFabric },
      cuffs: { ...denimFabric },
      waistband: { ...denimFabric },
      drawstrings: { ...denimFabric },
      collar: { ...denimFabric }
    },
    physicalFabrics: {
      default: { ...physicalDenim }
    },
    patternPieces: pieces,
    seams,
    artworkLayers: [],
    simulationSettings: { ...DEFAULT_SIMULATION_SETTINGS }
  };
}

/**
 * 4. STREETWEAR CROPPED TOP
 */
export function generateCropTopGarment(opts: GarmentCustomizationOptions = {}): GarmentInstance {
  const width = opts.chestWidthMm || 540;
  const length = opts.bodyLengthMm || 440;
  const shoulderWidth = 140;
  const armholeDepth = 190;

  const baseFabric = FABRIC_PRESETS['heavy-cotton-black'];
  const physicalFabric = PHYSICAL_FABRIC_PRESETS['lightweight-cotton'];

  const frontPts: [number, number][] = [
    [0, 0],
    [width, 0],
    [width, length - armholeDepth],
    [width - 20, length],
    [width - 20 - shoulderWidth, length],
    [width / 2, length - 65],
    [20 + shoulderWidth, length],
    [20, length],
    [0, length - armholeDepth]
  ];

  const backPts: [number, number][] = [
    [0, 0],
    [width, 0],
    [width, length - armholeDepth],
    [width - 20, length],
    [width - 20 - shoulderWidth, length],
    [width / 2, length - 25],
    [20 + shoulderWidth, length],
    [20, length],
    [0, length - armholeDepth]
  ];

  const pieces: PatternPiece[] = [
    {
      id: 'piece-crop-front',
      name: 'Crop Front',
      category: 'front',
      outlinePoints: frontPts,
      segments: createSegments(frontPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-crop',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 50, y: 50, rotation: 0 },
      transform3D: { position: [0, 0.16, 0.165], rotation: [0, 0, 0] },
      meshDensityMm: 22
    },
    {
      id: 'piece-crop-back',
      name: 'Crop Back',
      category: 'back',
      outlinePoints: backPts,
      segments: createSegments(backPts),
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'mat-crop',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 650, y: 50, rotation: 0 },
      transform3D: { position: [0, 0.16, -0.165], rotation: [0, Math.PI, 0] },
      meshDensityMm: 22
    }
  ];

  const seams: SewingConnection[] = [
    {
      id: 'seam-crop-shoulder-left',
      name: 'Left Shoulder',
      sourcePieceId: 'piece-crop-front',
      sourceEdgeIndex: 7,
      targetPieceId: 'piece-crop-back',
      targetEdgeIndex: 3,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-crop-shoulder-right',
      name: 'Right Shoulder',
      sourcePieceId: 'piece-crop-front',
      sourceEdgeIndex: 3,
      targetPieceId: 'piece-crop-back',
      targetEdgeIndex: 7,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-crop-side-left',
      name: 'Left Side',
      sourcePieceId: 'piece-crop-front',
      sourceEdgeIndex: 8,
      targetPieceId: 'piece-crop-back',
      targetEdgeIndex: 1,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    },
    {
      id: 'seam-crop-side-right',
      name: 'Right Side',
      sourcePieceId: 'piece-crop-front',
      sourceEdgeIndex: 1,
      targetPieceId: 'piece-crop-back',
      targetEdgeIndex: 8,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    }
  ];

  return {
    id: `garment-croptop-${Date.now().toString(36)}`,
    templateId: 'croptop-boxy-v1',
    name: opts.name || 'Cropped Boxy Streetwear Tee',
    type: 'croptop',
    parameters: {
      bodyLength: length,
      chestWidth: width,
      sleeveLength: 0,
      shoulderWidth,
      fit: opts.fit || 'relaxed'
    },
    components: {
      hood: 'none',
      pockets: 'none',
      cuffs: 'hemmed',
      waistband: 'hemmed',
      drawstrings: 'none'
    },
    materials: {
      body_front: { ...baseFabric, color: opts.color || '#1e1e24' },
      body_back: { ...baseFabric, color: opts.color || '#1e1e24' },
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
    patternPieces: pieces,
    seams,
    artworkLayers: [],
    simulationSettings: { ...DEFAULT_SIMULATION_SETTINGS }
  };
}

/**
 * High-Level Factory Dispatcher
 */
export function generateGarmentByType(
  type: GarmentType,
  options: GarmentCustomizationOptions = {}
): GarmentInstance {
  switch (type) {
    case 'dress':
      return generateDressGarment(options);
    case 'trousers':
      return generatePantsGarment(options);
    case 'croptop':
      return generateCropTopGarment(options);
    case 'tshirt':
    default:
      return generateTShirtGarment(options);
  }
}
