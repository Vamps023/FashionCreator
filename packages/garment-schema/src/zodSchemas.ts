import { z } from 'zod';

export const IdSchema = z.string().min(1);

export const GarmentTypeSchema = z.enum([
  'hoodie',
  'tshirt',
  'sweatshirt',
  'shirt',
  'jacket',
  'trousers',
  'dress'
]);

export const EditorModeSchema = z.enum([
  'design',
  'fabric',
  'artwork',
  'pattern',
  'fitting',
  'render',
  'simulation'
]);

export const FitProfileSchema = z.enum(['slim', 'regular', 'relaxed', 'oversized']);

export const SurfacePrintZoneSchema = z.enum([
  'front-chest',
  'back-center',
  'front-print',
  'back-print',
  'left-sleeve',
  'right-sleeve',
  'hood-print'
]);

export const GarmentParametersSchema = z.object({
  bodyLength: z.number().min(500).max(950).default(720), // mm
  chestWidth: z.number().min(400).max(800).default(620), // mm
  sleeveLength: z.number().min(200).max(850).default(650), // mm
  shoulderWidth: z.number().min(350).max(700).default(540), // mm
  fit: FitProfileSchema.default('relaxed')
});

export const GarmentComponentOptionsSchema = z.object({
  hood: z.enum(['double-layer', 'single-layer', 'cowl', 'none']).default('double-layer'),
  pockets: z.enum(['kangaroo', 'hidden-side', 'none']).default('kangaroo'),
  cuffs: z.enum(['ribbed', 'elastic', 'hemmed']).default('ribbed'),
  waistband: z.enum(['ribbed', 'drawstring', 'hemmed']).default('ribbed'),
  drawstrings: z.enum(['round-cord', 'flat-lace', 'none']).default('round-cord')
});

export const FabricMaterialSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  category: z.enum(['cotton', 'fleece', 'ribbed', 'denim', 'silk', 'leather', 'wool', 'polyester']),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, 'Invalid hex color'),
  roughness: z.number().min(0).max(1).default(0.85),
  metalness: z.number().min(0).max(1).default(0.0),
  sheen: z.number().min(0).max(1).default(0.4),
  sheenRoughness: z.number().min(0).max(1).default(0.6),
  normalScale: z.number().min(0).max(3).default(0.8),
  weaveRepeat: z.number().min(1).max(128).default(32),
  texturePattern: z.enum(['plain', 'twill', 'ribbed', 'terry', 'knit']).default('knit')
});

export const ArtworkLayerSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  type: z.enum(['text', 'image', 'shape']),
  surfaceId: SurfacePrintZoneSchema,
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  opacity: z.number().min(0).max(1).default(1.0),
  position: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).default([0.5, 0.5]),
  scale: z.tuple([z.number().min(0.01).max(2), z.number().min(0.01).max(2)]).default([0.35, 0.35]),
  rotation: z.number().min(-360).max(360).default(0),
  dataUrl: z.string().optional(),
  text: z.string().optional(),
  fontSize: z.number().min(8).max(200).optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.enum(['normal', 'bold', '900']).optional(),
  color: z.string().optional(),
  letterSpacing: z.number().min(0).max(50).optional()
});

export const GarmentInstanceSchema = z.object({
  id: IdSchema,
  templateId: IdSchema,
  name: z.string().min(1),
  type: GarmentTypeSchema,
  parameters: GarmentParametersSchema,
  components: GarmentComponentOptionsSchema,
  materials: z.record(z.string(), FabricMaterialSchema),
  artworkLayers: z.array(ArtworkLayerSchema).default([])
});

export const AvatarConfigurationSchema = z.object({
  visible: z.boolean().default(true),
  presetId: z.enum(['neutral-medium', 'female-medium', 'male-athletic', 'mannequin-stylized']).default('mannequin-stylized'),
  skinTone: z.string().default('#4a4036'),
  pose: z.enum(['a-pose', 't-pose', 'relaxed']).default('relaxed'),
  measurements: z.object({
    heightMm: z.number().default(1820),
    chestCircumferenceMm: z.number().default(980),
    waistCircumferenceMm: z.number().default(800),
    hipCircumferenceMm: z.number().default(940),
    shoulderWidthMm: z.number().default(480)
  }).default({
    heightMm: 1820,
    chestCircumferenceMm: 980,
    waistCircumferenceMm: 800,
    hipCircumferenceMm: 940,
    shoulderWidthMm: 480
  })
});

export const StudioEnvironmentConfigSchema = z.object({
  lightingPreset: z.enum(['warm-studio', 'clean-neutral', 'dramatic-rim', 'runway']).default('clean-neutral'),
  backgroundColor: z.string().default('#121316'),
  showFloorGrid: z.boolean().default(true),
  showShadows: z.boolean().default(true),
  exposure: z.number().min(0.1).max(3).default(1.05)
});

export const ProjectDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: IdSchema,
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  units: z.enum(['mm', 'cm']).default('mm'),
  activeGarmentId: IdSchema,
  garments: z.array(GarmentInstanceSchema).min(1),
  avatar: AvatarConfigurationSchema.default({
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
  }),
  environment: StudioEnvironmentConfigSchema.default({
    lightingPreset: 'clean-neutral',
    backgroundColor: '#121316',
    showFloorGrid: true,
    showShadows: true,
    exposure: 1.05
  })
});

export type ProjectDocumentValidated = z.infer<typeof ProjectDocumentSchema>;
