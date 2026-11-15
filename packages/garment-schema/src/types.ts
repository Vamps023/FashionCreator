/**
 * 3D Fashion Studio - Document Schema
 * Formal schema definition for garments, materials, artwork, avatars, and projects.
 */

export type EditorMode = 'design' | 'fabric' | 'artwork' | 'fitting' | 'render';

export type GarmentType = 'hoodie' | 'tshirt' | 'sweatshirt';

export type FitProfile = 'slim' | 'regular' | 'relaxed' | 'oversized';

export type SurfacePrintZone = 'front-print' | 'back-print' | 'left-sleeve' | 'right-sleeve' | 'hood-print';

export interface GarmentParameters {
  bodyLength: number;     // e.g. 720 mm (range 600 - 850)
  chestWidth: number;     // e.g. 600 mm (range 480 - 720)
  sleeveLength: number;   // e.g. 640 mm (range 520 - 750)
  fit: FitProfile;
  shoulderWidth: number;  // e.g. 500 mm (range 400 - 600)
}

export interface GarmentComponentOptions {
  hood: 'double-layer' | 'single-layer' | 'cowl' | 'none';
  pockets: 'kangaroo' | 'hidden-side' | 'none';
  cuffs: 'ribbed' | 'elastic' | 'hemmed';
  waistband: 'ribbed' | 'drawstring' | 'hemmed';
  drawstrings: 'round-cord' | 'flat-lace' | 'none';
}

export type GarmentPartId = 
  | 'body_front'
  | 'body_back'
  | 'sleeves'
  | 'hood'
  | 'cuffs'
  | 'pocket'
  | 'waistband'
  | 'drawstrings'
  | 'collar';

export interface FabricMaterial {
  id: string;
  name: string;
  category: 'cotton' | 'fleece' | 'ribbed' | 'denim' | 'silk' | 'leather';
  color: string;            // Hex code, e.g. #3b82f6
  roughness: number;        // 0.0 - 1.0
  metalness: number;        // 0.0 - 1.0
  sheen: number;            // 0.0 - 1.0 for cloth sheen
  sheenRoughness: number;   // 0.0 - 1.0
  normalScale: number;      // 0.0 - 2.0
  weaveRepeat: number;      // UV tiling repeat count
  texturePattern: 'plain' | 'twill' | 'ribbed' | 'terry' | 'knit';
}

export type ArtworkLayerType = 'image' | 'text' | 'shape';

export interface ArtworkLayer {
  id: string;
  name: string;
  type: ArtworkLayerType;
  surfaceId: SurfacePrintZone;
  visible: boolean;
  locked: boolean;
  opacity: number;          // 0.0 - 1.0
  // Normalized 2D coordinates [0..1] on the print zone surface
  position: [number, number];
  scale: [number, number];
  rotation: number;         // Degrees
  // Image-specific
  dataUrl?: string;
  // Text-specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '900';
  color?: string;
  letterSpacing?: number;
}

export interface GarmentInstance {
  id: string;
  templateId: string;
  name: string;
  type: GarmentType;
  parameters: GarmentParameters;
  components: GarmentComponentOptions;
  materials: Record<GarmentPartId, FabricMaterial>;
  artworkLayers: ArtworkLayer[];
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
