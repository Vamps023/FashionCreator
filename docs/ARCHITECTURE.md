# Technical architecture

## Philosophy
A data-driven, non-destructive editor with one canonical project document. The main browser thread handles interaction; Three.js renders a derived scene; background workers and later server processes perform heavy work. Use explicit module contracts and command dispatch rather than directly mutating meshes from UI sliders.

## MVP data flow
```
User input (panel / keyboard / canvas)
       ↓
Validated editor command (execute / undo / redo)
       ↓
Canonical ProjectDocument + transient EditorSession state
       ├─→ Garment Engine → Derived mesh/variant configuration
       ├─→ Material Engine → Material instances / texture refs
       ├─→ Artwork Engine → Print-zone compositing/texture
       ├─→ Persistence → Native project JSON / local storage
       └─→ Render Adapter → Three.js scene / selection / camera
                          └─→ Export adapter → PNG, baked GLB
```

## Ownership and package boundaries
- `garment-schema`: pure types, Zod validation, schema versions, migrations, stable IDs and normalized units. No React or Three.js.
- `editor-core`: command bus, transactional edits, history/redo, selection and immutable document updates. No renderer-specific assumptions.
- `garment-engine`: template registry, component compatibility, validated parameter evaluation, part visibility, attachment points, morph/variant resolver. Can describe intended geometry but should not own React UI.
- `renderer-3d`: Three.js/R3F mesh rendering, lighting/cameras, picking, bounds, gizmos, screenshot hooks, resource lifecycle. Consumes derived scene data.
- `material-engine`: fabric definitions, named material slots, derived PBR properties and texture management; separate shader appearance from cloth physical properties.
- `artwork-engine`: logical artwork layer state, UV-space transforms, print-zone mapping, texture compositor and export-ready bitmap. Konva UI is an adapter in `apps/web`.
- `asset-pipeline`: loading, cache policy, asset manifest validation, optimization/processing scripts and provenance checks.
- `export-engine`: native file exports, screen/raster capture, material+print baking and glTF export validation.
- `ui`: generic accessible components, tokens, themes, forms, layout primitives. May not import domain/renderer packages.
- Future `pattern-engine`: pure panel, curve, seam graph, pattern measurements. No direct render-specific ownership.
- Future `avatar-engine`: rig and body parameters with avatar/garment compatibility.
- Future `simulation-adapter`: async solver interface and capability detection, never a dependency of MVP editor startup.

## Allowed dependency direction
```
web application → editor-core, garment-engine, renderer-3d,
                  material-engine, artwork-engine, export-engine, ui
editor-core → garment-schema
all domain packages → garment-schema, shared-utils (only where required)
renderer-3d → garment-schema and types/adapters, three
export-engine → garment-schema, renderer/material/artwork adapters
ui → no domain packages
```
Avoid domain packages directly importing one another's implementation internals. Define public interfaces or orchestrate at app level. Enforce import boundaries via lint rules and dependency graph checks.

## State layers
1. **Persistent ProjectDocument**: templates, measurements, material assignments, artwork layers, panel data (later), avatar preset, project metadata and schema version.
2. **EditorSessionState**: selected part, tool, mode, camera preset, panels, active tab, drag gesture, loading/error state; not saved as project content except optional separately saved layout preferences.
3. **Runtime cache**: loaded glTF scenes, GPU resources, composited textures, font atlases, object URLs, workers; disposed/refcounted explicitly.
4. **Async job state**: progress/error/status for export/simulation; separate from immutable project history.

## Command pattern
Command structure: `id`, `type`, `description`, `createdAt`, `apply(document):document`, `invert(previous,next):command` (or capture undo patch), `canCoalesce`, `serialize` if needed. UI dispatches `setGarmentColor`, `replaceComponent`, `setMeasurement`, `addArtworkLayer`, `transformArtworkLayer`, etc. Group pointer-drag/slider updates into one undo step. Keep deterministic command reducers and unit tests.

## Renderer lifecycle
- Renderer root mounted once per editor session; updates use props/selectors and resource caches.
- Do not recreate GPU textures every React render or rebuild scenes on inspector redraw.
- Cleanup textures/materials/geometries after replacement using explicit ownership/refcounts.
- Clamp pixel ratio for high-density displays; pause expensive rendering when canvas hidden.
- Feature detect WebGL2; show fallback when unavailable. WebGPU optional and experimental.

## Worker design
- Optional Web Workers for print compositing (if OffscreenCanvas supported), geometry validation, topology processing and export prep.
- Async protocols contain `requestId`, `type`, `payload`, `progress`, `error`, `cancel` and timeouts.
- Keep messages structured-clone-friendly; send transferables only when ownership is understood.
- Advanced Python pattern-service must expose versioned I/O JSON schema; use separate process and fail gracefully.

## Persistence and revisions
- User downloads a human-readable `.fashion.json` project in MVP, with asset references either embedded under size guardrails or included via a future `.fashion.zip` asset bundle. Ensure no broken cross-session blob URLs.
- IndexedDB autosave is optional; distinguish manual save from automatic recovery with clear status.
- Validate and migrate document before applying any scene mutations; unsupported schema versions must fail with an explanation and leave current project intact.
- Future server API adds ownership, revisions, optimistic locking and object storage; no initial cloud dependency.

## Security and privacy
- Validate file MIME/type by content when possible; enforce size/pixel limits; sanitize SVG or rasterize safely; do not execute uploaded HTML/script.
- Avoid rendering raw unsanitized SVG into DOM; do not load arbitrary cross-origin URLs for texture assets.
- No secret/API key in frontend bundles. Signed URLs and authorization for later server uploads.
- Track license/provenance metadata for all imported sample assets; do not commit someone else's proprietary apparel assets.

## API skeleton (future)
`POST/GET/PATCH /api/projects`, project revisions; `GET /api/garment-templates`, `POST /api/assets`, `GET /api/materials`, `POST /api/exports`, `GET /api/exports/:id`. Pattern/simulation jobs become async with status, cancellation, quotas and reproducible input hashes.

## Decision priorities
Prefer concrete, boring, testable foundations over sophisticated abstractions. Avoid premature microservices, physics frameworks and database synchronization in the MVP. Code for well-defined extension seams instead.
