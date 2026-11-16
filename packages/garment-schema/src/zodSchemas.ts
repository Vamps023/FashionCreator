import { z } from 'zod';

export const IdSchema = z.string().min(1);

export const GarmentTypeSchema = z.enum([
  'hoodie',
  'tshirt',
  'sweatshirt',
  'shirt',
  'jacket',
  'trousers',
  'dress',
  'skirt',
  'tunic',
  'croptop',
  'shorts'
]);

export const EditorModeSchema = z.enum([
  'design',
  'pattern',
  'sewing',
  'simulation',
  'fabric',
  'fitting',
  'artwork',
  'render'
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

export const PatternSegmentSchema = z.object({
  stableId: IdSchema,
  startIndex: z.number().int().min(0),
  endIndex: z.number().int().min(0),
  geometryType: z.enum(['line', 'cubic-bezier', 'arc']).default('line'),
  curveControlPoints: z.array(z.tuple([z.number(), z.number()])).optional(),
  lengthMm: z.number().min(0),
  name: z.string().optional()
});

export const PatternPieceSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  category: z.enum(['front', 'back', 'sleeve', 'hood', 'pocket', 'collar', 'cuff', 'waistband', 'custom']).default('custom'),
  outlinePoints: z.array(z.tuple([z.number(), z.number()])).min(3),
  segments: z.array(PatternSegmentSchema).default([]),
  internalLines: z.array(z.object({
    id: IdSchema,
    points: z.array(z.tuple([z.number(), z.number()]))
  })).default([]),
  grainlineAngle: z.number().default(90),
  seamAllowanceMm: z.number().default(10),
  materialId: z.string().default('default'),
  quantity: z.number().int().min(1).default(1),
  mirrored: z.boolean().default(false),
  transform2D: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    rotation: z.number().default(0)
  }).default({ x: 0, y: 0, rotation: 0 }),
  transform3D: z.object({
    position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
    rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
    curvatureRadius: z.number().optional(),
    facingDirection: z.enum(['front', 'back', 'left', 'right']).optional(),
    arrangementPoint: z.string().optional()
  }).default({ position: [0, 0, 0], rotation: [0, 0, 0] }),
  meshDensityMm: z.number().min(5).max(100).default(20)
});

export const SewingConnectionSchema = z.object({
  id: IdSchema,
  name: z.string().optional(),
  sourcePieceId: IdSchema,
  sourceEdgeIndex: z.number().int().min(0),
  targetPieceId: IdSchema,
  targetEdgeIndex: z.number().int().min(0),
  orientation: z.enum(['normal', 'reversed']).default('normal'),
  sewingMode: z.enum(['1-to-1', 'pleat', 'gather']).default('1-to-1'),
  active: z.boolean().default(true)
});

export const PhysicalFabricPropertiesSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  arealDensityGsm: z.number().min(30).max(1000).default(200),
  warpStiffness: z.number().min(0).max(1).default(0.8),
  weftStiffness: z.number().min(0).max(1).default(0.7),
  shearStiffness: z.number().min(0).max(1).default(0.5),
  bendingStiffness: z.number().min(0).max(1).default(0.5),
  damping: z.number().min(0.5).max(1).default(0.985),
  friction: z.number().min(0).max(1).default(0.4),
  thicknessMm: z.number().min(0.1).max(20).default(1.5)
});

export const SimulationSettingsSchema = z.object({
  gravity: z.number().default(9.81),
  substeps: z.number().int().min(1).max(50).default(12),
  damping: z.number().min(0.8).max(0.999).default(0.985),
  sewingForce: z.number().min(0.1).max(5).default(0.85),
  collisionThicknessMm: z.number().min(1).max(50).default(12),
  groundCollision: z.boolean().default(true),
  avatarCollision: z.boolean().default(true),
  isRunning: z.boolean().default(false)
});

export const GarmentParametersSchema = z.object({
  bodyLength: z.number().min(400).max(1200).default(720),
  chestWidth: z.number().min(300).max(1000).default(620),
  sleeveLength: z.number().min(0).max(950).default(650),
  shoulderWidth: z.number().min(200).max(800).default(540),
  fit: FitProfileSchema.default('relaxed')
});

export const GarmentComponentOptionsSchema = z.object({
  hood: z.enum(['double-layer', 'single-layer', 'cowl', 'none']).default('none'),
  pockets: z.enum(['kangaroo', 'hidden-side', 'none']).default('none'),
  cuffs: z.enum(['ribbed', 'elastic', 'hemmed']).default('hemmed'),
  waistband: z.enum(['ribbed', 'drawstring', 'hemmed']).default('hemmed'),
  drawstrings: z.enum(['round-cord', 'flat-lace', 'none']).default('none')
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
  texturePattern: z.enum(['plain', 'twill', 'ribbed', 'terry', 'knit']).default('plain')
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
  physicalFabrics: z.record(z.string(), PhysicalFabricPropertiesSchema).default({}),
  patternPieces: z.array(PatternPieceSchema).default([]),
  seams: z.array(SewingConnectionSchema).default([]),
  artworkLayers: z.array(ArtworkLayerSchema).default([]),
  simulationSettings: SimulationSettingsSchema.default({
    gravity: 9.81,
    substeps: 12,
    damping: 0.985,
    sewingForce: 0.85,
    collisionThicknessMm: 12,
    groundCollision: true,
    avatarCollision: true,
    isRunning: false
  })
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
