# Canonical schemas and domain contracts

## Representation conventions
- Persistent garment measurements are in **millimeters**; render conversion is explicit (`mm / 1000`).
- 3D renderer world: meters, **Y up**, front facing **+Z** by convention (document per asset), right **+X**. Never silently mix Blender axes with world axes; normalize on import.
- Artwork transforms: normalized `u, v` coordinates in a named print zone, deterministic rotation degrees, nonnegative scale. Document whether `v=0` is top or bottom; use top-left as editor-normalized origin and convert during UV projection.
- IDs stable and collision-resistant (UUID/ULID); no array index IDs in project documents.
- All documents include a schema version and explicit defaults. Migrations pure and idempotent where possible.
- Asset references must resolve from bundled manifest, an imported asset bundle or authorized storage—not transient blob URLs.

## TypeScript interfaces to implement (suggested, adapt with Zod)
```ts
export type Id = string;
export type GarmentType = 'tshirt' | 'hoodie' | 'shirt' | 'jacket' | 'trousers' | 'dress';
export type EditorMode = 'design' | 'fabric' | 'artwork' | 'pattern' | 'fitting' | 'render';
export type ProjectDocument = {
  schemaVersion: 1;
  id: Id;
  name: string;
  units: 'mm';
  garments: GarmentInstance[];
  assets: Record<Id, AssetRef>;
  materials: Record<Id, FabricMaterialData>;
  artwork: Record<Id, ArtworkLayer>;
  avatar?: AvatarConfig;
  patterns?: Record<Id, PatternDocument>; // future/feature-flagged
  metadata: { createdAt: string; updatedAt: string };
};
export type AssetRef = {
  id: Id;
  uri: string;
  kind: 'glb' | 'image' | 'texture' | 'font' | 'pattern';
  hash?: string;
  license?: string;
  source?: string;
};
export type GarmentInstance = {
  id: Id;
  type: GarmentType;
  templateId: Id;
  assetId: Id;
  parametersMm: Record<string, number>;
  componentVariants: Record<string, string>;
  materialAssignments: Record<string, Id>;
  artworkLayerIds: Id[];
  visible: boolean;
};
export type FabricMaterialData = {
  id: Id;
  name: string;
  color: string;              // validated #RRGGBB or #RRGGBBAA
  roughness: number;          // 0..1
  metalness: number;          // 0..1
  sheen?: { color: string; roughness: number };
  normalMapAssetId?: Id;
  baseColorMapAssetId?: Id;
  normalScale?: number;
  uvRepeat?: [number, number];
};
export type ArtworkLayer = {
  id: Id;
  garmentId: Id;
  zoneId: string;             // e.g. 'front-chest'
  type: 'text' | 'image' | 'shape';
  name: string;
  order: number;
  visible: boolean;
  opacity: number;            // 0..1
  transform: { u: number; v: number; scaleX: number; scaleY: number; rotationDeg: number };
  content: Record<string, unknown>; // use a discriminated Zod union in real code
};
export type AvatarConfig = {
  templateId: Id;
  measurementsMm?: Record<string, number>;
  poseId?: string;
};
```
The code above is a concept, not a finished schema. Use discriminated unions for artwork content, bounded numeric Zod validation, migration tests, and authored source types (avoid `unknown` drifting into runtime logic).

## Garment template manifest
```json
{
  "id": "hoodie-basic-v1",
  "garmentType": "hoodie",
  "assetId": "hoodie-basic-glb-v1",
  "version": 1,
  "parts": [
    {"id": "body", "meshNode": "GARMENT_BODY", "materialSlot": "body"},
    {"id": "sleeve-left", "meshNode": "SLEEVE_L", "materialSlot": "sleeves"},
    {"id": "sleeve-right", "meshNode": "SLEEVE_R", "materialSlot": "sleeves"},
    {"id": "hood", "meshNode": "HOOD", "materialSlot": "hood"},
    {"id": "pocket", "meshNode": "POCKET_FRONT", "materialSlot": "body"}
  ],
  "parameters": {
    "bodyLength": {"unit": "mm", "min": 560, "max": 820, "default": 720, "strategy": "approved-morph"},
    "sleeveLength": {"unit": "mm", "min": 500, "max": 740, "default": 640, "strategy": "approved-morph"}
  },
  "printZones": [
    {"id": "front-chest", "materialSlot": "body", "uvSet": 0, "mapAssetId": "front-chest-map"},
    {"id": "back-center", "materialSlot": "body", "uvSet": 0, "mapAssetId": "back-center-map"}
  ]
}
```
Example dimensions are illustrative. Real template parameter ranges and morph availability must be derived from actual authored meshes; if no shape exists, disable the control instead of pretending to change geometry.

## Future pattern contracts
`PatternDocument`: `{id, units:'mm', panels[], seamPairs[], parameters, version}`.
`Panel`: ordered contour of line/curve segments, winding, interior details and named edge IDs.
`SeamPair`: `{id, panelA, edgeIdsA[], panelB, edgeIdsB[], alignment, allowanceMm}`.
`SolverInput`: triangular rest meshes, seam constraints, per-panel physical properties, avatar collider references, units, solver settings, seed.
`SolverResult`: positions/normals, convergence metrics, collision metrics, timing, warnings, versioned solver config.

## Validation and migration tests
- Reject unknown newer major schema without corrupting active project.
- Migrate known older schema versions; no silent data loss.
- Reject NaN/infinity, invalid IDs, references to nonexistent garment/slot/zone, malicious huge payloads, impossible parameters and artwork with invalid transforms.
- Roundtrip project serialization deterministically (allow canonical normalized sort and timestamps as documented).
- Every asset reference resolves; report missing asset instead of loading broken output.
