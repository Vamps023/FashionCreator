import { GarmentProject, GarmentInstance, FabricMaterial } from './types';

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
  },
  'burgundy-fleece': {
    id: 'burgundy-fleece',
    name: 'Burgundy Heavy Fleece',
    category: 'fleece',
    color: '#5b1d28',
    roughness: 0.84,
    metalness: 0.0,
    sheen: 0.5,
    sheenRoughness: 0.6,
    normalScale: 0.85,
    weaveRepeat: 32,
    texturePattern: 'knit'
  }
};

export function createDefaultHoodieInstance(): GarmentInstance {
  const baseFabric = FABRIC_PRESETS['heavy-cotton-black'];
  const ribFabric = FABRIC_PRESETS['ribbed-knit-dark'];

  return {
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
    ]
  };
}

export function createDefaultTShirtInstance(): GarmentInstance {
  const baseFabric = FABRIC_PRESETS['heavy-cotton-cream'];
  const ribFabric = { ...baseFabric, weaveRepeat: 40, texturePattern: 'ribbed' as const };

  return {
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
      collar: { ...ribFabric }
    },
    artworkLayers: [
      {
        id: 'art-front-tee-1',
        name: 'Graphic Typography',
        type: 'text',
        surfaceId: 'front-print',
        visible: true,
        locked: false,
        opacity: 0.9,
        position: [0.5, 0.4],
        scale: [0.4, 0.4],
        rotation: 0,
        text: 'PARIS / TOKYO 2026',
        fontSize: 22,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '900',
        color: '#18181b',
        letterSpacing: 4
      }
    ]
  };
}

export function createInitialProject(): GarmentProject {
  const defaultHoodie = createDefaultHoodieInstance();

  return {
    schemaVersion: 1,
    projectId: 'project-studio-' + Date.now().toString(36),
    name: 'Untitled Streetwear Capsule',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    units: 'mm',
    activeGarmentId: defaultHoodie.id,
    garments: [defaultHoodie],
    avatar: {
      visible: true,
      presetId: 'mannequin-stylized',
      skinTone: '#4a4036',
      pose: 'relaxed',
      measurements: {
        heightMm: 1820,
        chestCircumferenceMm: 980,
        waistCircumferenceMm: 800,
        hipCircumferenceMm: 940
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
