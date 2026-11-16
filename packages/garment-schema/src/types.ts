/**
 * 3D Fashion Studio - Document Schema
 * Formal schema definition for garments, 2D sewing patterns, seams, physics, materials, artwork, and avatars.
 */

export type EditorMode =
  | 'design'
  | 'pattern'
  | 'sewing'
  | 'simulation'
  | 'fabric'
  | 'fitting'
  | 'artwork'
  | 'render';

export type GarmentType =
  | 'hoodie'
  | 'tshirt'
  | 'sweatshirt'
  | 'shirt'
  | 'jacket'
  | 'trousers'
  | 'dress'
  | 'skirt'
  | 'tunic'
  | 'croptop'
  | 'shorts';

export type ViewportDisplayMode = 'pbr' | 'wireframe' | 'strain' | 'fit';

export type FitProfile = 'slim' | 'regular' | 'relaxed' | 'oversized';

export type SurfacePrintZone =
  | 'front-chest'
  | 'back-center'
  | 'front-print'
  | 'back-print'
  | 'left-sleeve'
  | 'right-sleeve'
  | 'hood-print';

// -------------------------------------------------------------
// 1. PATTERN & SEWING SPECIFICATIONS (CLO 3D / Marvelous Model)
// -------------------------------------------------------------

export interface PatternSegment {
  stableId: string;
  startIndex: number;
  endIndex: number;
  geometryType: 'line' | 'cubic-bezier' | 'arc';
  curveControlPoints?: [number, number][]; // in millimeters
  lengthMm: number;
  name?: string;
}

export interface PatternPiece {
  id: string;
  name: string;
  category: 'front' | 'back' | 'sleeve' | 'hood' | 'pocket' | 'collar' | 'cuff' | 'waistband' | 'custom';
  outlinePoints: [number, number][]; // 2D contour in millimeters
  segments: PatternSegment[];
  internalLines: { id: string; points: [number, number][] }[];
  grainlineAngle: number; // degrees relative to X axis
  seamAllowanceMm: number; // default 10mm
  materialId: string;
  quantity: number;
  mirrored: boolean;
  // 2D placement on pattern drafting table (mm)
  transform2D: {
    x: number;
    y: number;
    rotation: number; // degrees
  };
  // 3D initial arrangement around avatar (meters & radians)
  transform3D: {
    position: [number, number, number]; // [x, y, z] in meters
    rotation: [number, number, number]; // Euler [rx, ry, rz]
    curvatureRadius?: number; // Pre-bent cylindrical radius for sleeves / collars / skirts in meters
    facingDirection?: 'front' | 'back' | 'left' | 'right';
    arrangementPoint?: string; // ID of target avatar arrangement volume
  };
  meshDensityMm: number; // Particle distance for triangulation (e.g. 15-20mm)
}

export interface SewingConnection {
  id: string;
  name?: string;
  sourcePieceId: string;
  sourceEdgeIndex: number; // Segment index on source piece
  targetPieceId: string;
  targetEdgeIndex: number; // Segment index on target piece
  orientation: 'normal' | 'reversed'; // Seam direction alignment
  sewingMode: '1-to-1' | 'pleat' | 'gather';
  active: boolean;
}

// -------------------------------------------------------------
// 2. PHYSICAL FABRIC SYSTEM (Separated from Visual PBR)
// -------------------------------------------------------------

export interface PhysicalFabricProperties {
  id: string;
  name: string;
  arealDensityGsm: number; // Weight in g/m^2 (e.g. 120-450)
  warpStiffness: number; // 0..1 (stretch resistance along warp grain)
  weftStiffness: number; // 0..1 (stretch resistance along weft cross-grain)
  shearStiffness: number; // 0..1 (diagonal distortion resistance)
  bendingStiffness: number; // 0..1 (crease/fold resistance)
  damping: number; // 0..1 internal velocity loss
  friction: number; // 0..1 surface contact friction
  thicknessMm: number; // cloth thickness in mm
}

export interface SimulationSettings {
  gravity: number; // e.g. 9.81 m/s^2
  substeps: number; // 5 - 30 sub-iterations
  damping: number; // air drag & damping (0.95 - 0.99)
  sewingForce: number; // spring stiffness pulling seams together
  collisionThicknessMm: number; // clearance from avatar (e.g. 8 mm)
  groundCollision: boolean;
  avatarCollision: boolean;
  isRunning: boolean;
}

// -------------------------------------------------------------
// 3. VISUAL PBR MATERIALS & FABRICS
// -------------------------------------------------------------

export type GarmentPartId =
  | 'body_front'
  | 'body_back'
  | 'sleeves'
  | 'hood'
  | 'cuffs'
  | 'pocket'
  | 'waistband'
  | 'drawstrings'
  | 'collar'
  | string;

export interface FabricMaterial {
  id: string;
  name: string;
  category: 'cotton' | 'fleece' | 'ribbed' | 'denim' | 'silk' | 'leather' | 'wool' | 'polyester';
  color: string; // Hex code, e.g. #3b82f6
  roughness: number; // 0.0 - 1.0
  metalness: number; // 0.0 - 1.0
  sheen: number; // 0.0 - 1.0 for cloth sheen
  sheenRoughness: number; // 0.0 - 1.0
  normalScale: number; // 0.0 - 2.0
  weaveRepeat: number; // UV tiling repeat count
  texturePattern: 'plain' | 'twill' | 'ribbed' | 'terry' | 'knit';
}

// -------------------------------------------------------------
// 4. ARTWORK & GRAPHICS LAYERS
// -------------------------------------------------------------

export type ArtworkLayerType = 'image' | 'text' | 'shape';

export interface ArtworkLayer {
  id: string;
  name: string;
  type: ArtworkLayerType;
  surfaceId: SurfacePrintZone;
  visible: boolean;
  locked: boolean;
  opacity: number;
  position: [number, number]; // [0..1] normalized
  scale: [number, number];
  rotation: number;
  dataUrl?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '900';
  color?: string;
  letterSpacing?: number;
}

// -------------------------------------------------------------
// 5. GARMENT INSTANCE & DOCUMENT
// -------------------------------------------------------------

export interface GarmentParameters {
  bodyLength: number; // mm
  chestWidth: number; // mm
  sleeveLength: number; // mm
  shoulderWidth: number; // mm
  fit: FitProfile;
}

export interface GarmentComponentOptions {
  hood: 'double-layer' | 'single-layer' | 'cowl' | 'none';
  pockets: 'kangaroo' | 'hidden-side' | 'none';
  cuffs: 'ribbed' | 'elastic' | 'hemmed';
  waistband: 'ribbed' | 'drawstring' | 'hemmed';
  drawstrings: 'round-cord' | 'flat-lace' | 'none';
}

export interface GarmentInstance {
  id: string;
  templateId: string;
  name: string;
  type: GarmentType;
  parameters: GarmentParameters;
  components: GarmentComponentOptions;
  materials: Record<GarmentPartId, FabricMaterial>;
  physicalFabrics: Record<string, PhysicalFabricProperties>;
  patternPieces: PatternPiece[];
  seams: SewingConnection[];
  artworkLayers: ArtworkLayer[];
  simulationSettings: SimulationSettings;
}

export interface AvatarConfiguration {
  visible: boolean;
  presetId: 'neutral-medium' | 'female-medium' | 'male-athletic' | 'mannequin-stylized';
  skinTone: string;
  pose: 'a-pose' | 't-pose' | 'relaxed';
  measurements: {
    heightMm?: number;
    chestCircumferenceMm?: number;
    waistCircumferenceMm?: number;
    hipCircumferenceMm?: number;
    shoulderWidthMm?: number;
  };
}

export interface StudioEnvironmentConfig {
  lightingPreset: 'warm-studio' | 'clean-neutral' | 'dramatic-rim' | 'runway';
  backgroundColor: string;
  showFloorGrid: boolean;
  showShadows: boolean;
  exposure: number;
}

export interface GarmentProject {
  schemaVersion: number;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  units: 'mm' | 'cm';
  activeGarmentId: string;
  garments: GarmentInstance[];
  avatar: AvatarConfiguration;
  environment: StudioEnvironmentConfig;
}
