# Fashion Studio — All-in-One Codex Prompt & Context

> This is a self-contained copy of the project instructions and documents. Prefer the multi-file kit within a repository, because Codex can revisit and update individual files.


---

<!-- SOURCE FILE: CODEX_MASTER_PROMPT.md -->

# MASTER CODEX PROMPT — Fashion Studio

## Role and objective
You are the lead product engineer, frontend architect, technical artist, real-time graphics developer, platform engineer and QA owner. **Build the complete browser-based 3D Fashion Studio**, incrementally, from the repository in front of you. Do not merely generate plans, demos that pretend to work, or isolated UI mockups. Implement and validate real features. Deliver a professional editor with a clear path from garment customization to 2D patterns and simulated sewing.

Read every file in this kit before working. `AGENTS.md` contains the permanent guardrails. Follow `docs/ROADMAP.md` in order and use `STATUS.md` to communicate verified progress. User wants a complete, coherent codebase with consistent theming, organized files/dependencies, no duplicate functionality and a reliable export pipeline.

## Product statement
Fashion Studio is a desktop-first browser editor to (a) customize existing apparel; (b) change garment variants and controlled dimensions; (c) apply fabric PBR materials; (d) add and edit vector/raster/text artwork; (e) preview on a 3D avatar; (f) save/reopen a versioned editable project; (g) render/download images and optimized GLB; (h) later create 2D sewing patterns and drape them with physics. Support T-shirt and hoodie first; extend to jacket, trousers, shirts and dresses after base workflows pass acceptance.

## Non-negotiable honesty
Changing a sleeve morph is **not** sewing pattern editing. Rendering a skirt on an avatar is **not** fit validation. Animating a deformed mesh is **not** physics-based cloth simulation. Exporting a 3D mesh is **not** a manufacturing pattern. Mark every implemented feature by actual capability; separate unimplemented research features from shipping UI. Avoid unlicensed/copied assets, fabricated functionality, fake unit tests or reported performance measurements without benchmarks.

## Deliverables
1. A working locally runnable web editor with dashboard, project creation, editor layouts, real 3D viewport, garment selection and controls, fabric library/editor, editable artwork placement, save/reopen, image and GLB export.
2. A clean and reusable monorepo structure with strict TypeScript types, stable module interfaces, one design system, usable error handling, command-based undo/redo, schemas, tests and CI.
3. A documented asset authoring workflow from Blender to optimized GLB with validated geometry/material/UV conventions and reproducible example assets.
4. Well-scoped future modules for avatars, 2D patterns, sewing graph and physics, with proofs of concept when feasible, never false production claims.
5. Documents, changelog, STATUS.md and a specific continuation path through all roadmap phases.

## UX / Design bar
Build an editor that feels like a polished professional creative application, not generic CRUD panels. Header: logo, project name, save state, undo/redo, preview/export and settings. Mode tabs: Design, Fabric, Artwork, Pattern, Fitting, Render. Left: searchable asset library, garment parts and scene layers. Center: large resizable 3D viewport with orbit/zoom/pan, camera presets, lighting, floor/grid toggles and gizmos. Right: context-sensitive property inspector with measurements, materials, part options and image/text controls. Bottom optional timeline/history/task status. Use restrained dark neutral UI with subtle violet accents and a quality light theme. Include split view for pattern mode when implemented. Use desktop keyboard shortcuts, visible focus, semantic controls, empty/error/loading states, responsive panel collapse, consistent icon sizing and labels. Refer to `docs/DESIGN_SYSTEM.md` for details.

## Concrete user experience — first complete journey
On first run the user selects 'Create project > Hoodie'. The app opens with a visible hoodie mesh (an intentionally authored/freely licensed real geometry asset; no external URL at runtime). The user can orbit the camera, select body/hood/sleeves/pocket, choose material presets and colors, adjust approved measurement parameters within documented ranges, add an uploaded image/logo or text into a defined front print region, adjust position/scale/rotation, and switch front/back views. Every meaningful edit updates the viewport, supports undo/redo and survives a saved project reopen. The user can export a PNG and GLB and inspect both outputs. UI should not crash if a file is invalid or WebGL is unavailable.

## Architecture contract
- React + Vite + TypeScript strict; React Three Fiber/Three.js 3D; Konva 2D; Zustand + command history; Tailwind + accessible UI primitives; Zod schemas; Vitest and Playwright.
- Single `ProjectDocument` is the versioned source of truth. Ephemeral viewport state, GPU resources, canvas caches and URLs are never serialized as document data.
- Domain-specific modules: editor-core, garment-schema, garment-engine, renderer-3d, material-engine, artwork-engine, asset-pipeline, export-engine, ui. Add pattern-engine, avatar-engine, simulation-adapter later. Use ports/adapters and explicit public imports, no circular dependency graph.
- Use normalized millimeters for garment measurements in persisted documents, three-dimensional world units in meters, and documented world axes. Define stable mesh identifiers, material slots, print zones and avatar rig conventions.
- Asset preparation must be reproducible; runtime handles loading, caching, error fallback and disposal. For GLB use documented glTF export and texture baking behavior; test with a parser or independent GLB load.
- Save locally first (download/import `.fashion.json` or zip-based project after implementing a manifest) and optionally IndexedDB for autosave. No mandatory backend/cloud keys. Later add Fastify + PostgreSQL + object storage + workers when project accounts and background tasks justify them.
- Prefer lazy-loaded editor modes, bounded render-loop work and worker offloading for expensive processing.
- Do not introduce free-floating magic numbers, duplicate local store copies of domain data, `any`-heavy scene objects, or component files holding an entire application.

## Modules and acceptance criteria
### Editor and layout
Create an application shell, dashboard, mode navigation, resizable panes, dock/panel state, dialogs, tooltips, searchable asset browser, status indicator, keyboard shortcuts, accessible controls, consistent theme and recent-project recovery. Persist user layout separately from project document. Provide undo/redo with command coalescing.

### 3D viewport
Implement canvas mounting, perspective/orthographic camera, orbit/pan/zoom, focus object, front/back/side presets, selection via hit-testing, selection outline, transform controls where appropriate, lighting presets, neutral environment, grid/floor, screenshot capture, asset loading errors, device pixel ratio limits, resize, GPU resource disposal. Avoid re-mounting scene for every panel change.

### Garment engine
Create template descriptors with stable `templateId`, `assetId`, `partId`, material slots, named attachment points, editable parameter definitions (type, min/max/default/unit), constraints and compatibility. Initial base hoodie and T-shirt; adjust sleeves/fit/length via approved mesh morphs or compatible preauthored variants. Don't promise arbitrary parametrically correct topology unless implemented. Use constraints to avoid obvious geometry interpenetration, and warn of unsupported variants.

### Fabric and materials
Implement categorized presets (cotton, denim, silk-look, leather-look, wool-look, polyester), color swatches, roughness, metalness where relevant, normal-scale, repeat, texture thumbnails, material copy-on-edit, reset. Support relevant glTF sheen if exporter and runtime support it. Do not confuse physically based appearance with measured physical fabric properties.

### Artwork
Implement 2D canvas with movable, scalable, rotatable text/image layers, reordering, alignment, snap guides, undo/redo and a defined printing surface. Store logical artwork transforms in project schema and use an explicit UV/texture projection pipeline. Correctly propagate edited artwork to 3D materials, and bake output for export. Handle front/back zones with stable IDs. Validate file types/sizes and safely handle SVG; local object URLs must be revoked.

### Save/reopen/export
Define schema version, migration registry, validation and stable IDs. Create project/save as/open (including import invalid file errors), optional autosave, project history. PNG screenshot with predictable resolution and transparent option. GLB export must preserve visible garment, applied materials and baked artwork, and be reloadable with no missing textures. Distinguish native project format from GLB. Export jobs report progress/errors.

### Avatar/fitting (later)
Add preauthored rigged avatar(s), standardized measurement attributes, garment alignment and posing; label visual fit as preview, not verified sizing. Prove garment compatibility before broadening sizes.

### Pattern engine (later)
2D geometry primitives, panels, named edges, parametric curves, seam graph, notches, seam allowances, symmetry tools, real units, pattern validation, SVG/DXF export feasibility. Investigate GarmentCode MIT as a research/integration option, isolate Python service, review transitive dependencies and reproducibility. Pattern-authoring data remains editable and separate from generated meshes.

### Simulation (R&D)
Experiment with triangle-mesh cloth constraints using XPBD, gravity and basic collisions, later self-collision and seams. Define deterministic test scenes and honest benchmarks. A GPU/WebGPU solver is optional, not a precondition for MVP. Keep as an optional adapter with graceful fallbacks. No production fit claims without measured validation and convergence testing.

## Code hygiene and design-system requirements
- Centralized color, typography, spacing, radii, borders, shadows, motion and control sizes. Dark and light themes tested in all panels. No duplicate theme definitions.
- Naming: PascalCase React components; camelCase services/hooks; kebab-case folders; package public `index.ts` exports; co-located tests; separate view/control/domain/service concerns.
- Explicit input validation and error boundaries. Dependencies must be inspected and pinned by lockfile. Delete obsolete duplicates only when safe and covered by tests.
- Include CI with lint, typecheck, unit tests, build and browser tests where runner available. Fix failures rather than documenting broken tests as success.
- Write useful `README.md`, architectural decisions, API contracts, asset authoring steps, and debugging guidance. Keep docs aligned with implementation.

## Work execution — mandatory
1. Audit repository, installed tools, platform/Node/pnpm versions, current files and git status. Do not overwrite existing progress.
2. Read entire context pack, summarize implementation plan privately or briefly in a status note. Register assumptions/risks in `docs/DECISIONS.md` and `STATUS.md`.
3. Build phase-by-phase following `docs/ROADMAP.md`; do not scaffold every advanced backend/service until the MVP actually needs it. Ship a first vertical slice that visibly works.
4. At each phase, run real checks and user-journey tests, fix issues, update `STATUS.md` with exact evidence and links/paths. If a feature requires an unavailable asset or external credential, use an honest local fallback and record limitation.
5. Continue to later phases as session/tool limits permit. Never claim incomplete R&D as completed. Leave precise next tasks for subsequent Codex sessions.

## Final response template for each session
`Implemented:` functional changes with file paths. `Verified:` exact commands and outcomes, plus demonstration steps. `Architecture:` any decisions. `Remaining:` unimplemented tasks and blockers. `Next:` first task of next phase. Do not report guessed FPS or imaginary test passes.

Start with the repo audit and the working foundation, then build the hoodie customization path end-to-end immediately. Preserve a runnable application at each milestone.


---

<!-- SOURCE FILE: AGENTS.md -->

# Repository-wide instructions for Codex and other coding agents

## Read first
1. `CODEX_MASTER_PROMPT.md` — primary implementation brief.
2. `docs/PROJECT_CONTEXT.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`.
3. `docs/DESIGN_SYSTEM.md`, `docs/SCHEMAS.md`, `docs/GARMENT_AND_ASSET_SPEC.md`.
4. `docs/ACCEPTANCE_TESTS.md`, `docs/OPEN_SOURCE_REFERENCES.md`, `docs/DECISIONS.md`.
5. `STATUS.md`, then inspect the current code, test results, and version-control changes.

## Working practices
- The repository state and tests are truth; documentation describes intent. If they disagree, investigate and fix the discrepancy, then document the resolution.
- Work in bounded, verifiable vertical slices. Implement real behavior, not static screenshots, fake endpoints, or 'coming soon' buttons presented as complete.
- Default to making progress autonomously. Ask for a decision only when it materially changes scope, requires credentials, requires paid/licensed assets, or could destructively modify existing user work. Document other assumptions.
- Never delete/overwrite unrelated user files; never erase git history. Inspect the repository before scaffolding.
- Keep each feature self-contained; no implicit global variables, circular dependencies, duplicate design tokens, or duplicate state stores.
- Use TypeScript strict mode; validate all untrusted inputs and persistence boundaries. Avoid `any`, untyped casts, ignored errors, and disabling lint rules without a documented reason.
- Use one canonical, versioned document model (`@fashion-studio/garment-schema`). The 3D scene is derived/render state, not the design's persisted source of truth.
- Prefer CSS tokens and shared `@fashion-studio/ui` components for the entire UI. Do not hardcode scattered UI styles or create multiple competing theme engines.
- Isolate side effects: network, storage, rendering, serialization, and worker communication behind services/adapters.
- All editor modifications should be undoable/redoable commands, with safe coalescing for continuous sliders and text editing.
- Long-running tasks must expose progress/cancel/error when practical; never block the browser main thread for heavy geometry or asset processing.
- Do not fetch random 3D assets or textures and assume rights to redistribute them. Prefer authored primitives or clearly licensed bundled assets and record licenses.
- Do not introduce cloud requirements into the MVP. Provide local persistence and file downloads first; wire backend/cloud later.
- Verify compatibility before installing libraries. Stay on compatible stable React/R3F/Three versions; avoid alpha dependencies in production unless explicitly justified.
- No fake cloth simulator, arbitrary precision fit claims, or fake AI outputs. A stub must be labeled `EXPERIMENTAL / NOT IMPLEMENTED` and isolated behind a feature flag.

## Mandatory validation before marking a milestone complete
- `pnpm install --frozen-lockfile` (when lockfile exists) or validated initial install.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (add and maintain commands).
- `pnpm test:e2e` when applicable and browser/runtime available; if unavailable explain why and provide reproducible local instructions.
- Actual interactive operation and, for export milestones, round-trip validation of exported data. A function returning a URL is not sufficient proof that exported 3D content is correct.
- Inspect browser console, asset requests, rendering warnings, resizing and disposal for new 3D/UI features.
- Check accessibility basics (keyboard focus, controls labelled, contrast, reduced-motion when relevant).
- Update `STATUS.md` with finished items, verification logs, shortcomings, next actions, and any pending research decisions.

## DoD / stopping rules
- No task is 'done' until acceptance criteria are met and tests/build pass, or a verified limitation is explicitly disclosed.
- Do not fill files with giant monolithic components. Maintain small public interfaces and colocated tests.
- On interruption, leave the app runnable, ideally with a green build. Revert only your own incomplete changes if necessary and document blockers.
- End every substantial session with: actual files changed, commands run/results, demonstrable functionality, known limitations, remaining roadmap tasks, next Codex prompt.

## Tech defaults (check current stable compatibility)
- Node: active stable/LTS that satisfies dependency engines (prefer Node 24 LTS if available); pnpm via Corepack.
- React 19 + TypeScript + Vite; Three.js + compatible stable `@react-three/fiber` + Drei.
- Tailwind CSS + shadcn/ui primitives + a semantic token system; Zustand for editor orchestration; React Konva for artwork editing.
- Vitest + React Testing Library for unit/components, Playwright for browser tests.
- Optional monorepo via pnpm workspaces/Turborepo; reserve `apps/api`, workers, database and Python research service for relevant later phases.
- No Linux-only assumptions: develop/test cleanly on Windows PowerShell as well as cross-platform CI.


---

<!-- SOURCE FILE: docs/PROJECT_CONTEXT.md -->

# Product context / PRD

## Name
Fashion Studio (working title).

## Vision
Give creators a web-native, professional-feeling place to design and customize apparel in interactive 3D, eventually including accurate pattern drafting, garment assembly and experimental physics-based draping. Combine the ease of an online configurator with the workflow structure of a desktop 3D design tool. Avoid intellectual property copies of competing interfaces.

## Primary user
3D and fashion creators using desktop browsers. Secondary users: independent clothing brands preparing visual samples; downstream buyers customizing a template. Initial users are assumed technically literate; defaults and labels must be clear to non-experts.

## Jobs to be done
- Start an editable garment project from a template.
- Change fabric, colors, part variants and supported dimensions, and immediately see the result.
- Add brand marks, patterns or text to defined print zones.
- Inspect garment from multiple angles under consistent lighting.
- Save and reopen without losing editor-specific settings or unflattened artwork.
- Export a usable image or portable 3D mesh.
- Later: edit sewing panels and test their assembly, customize size and visual fit.

## User journeys
### J1: Hoodie customization (MVP gate)
Create hoodie → inspect front/back → change body color → choose hood/pocket option → adjust sleeve/body length within bounded sliders → upload logo and position in front print region → duplicate/reorder artwork layer → undo/redo → save to disk → reload → verify exact design → export PNG and textured GLB → reopen GLB independently.

### J2: Fabric exploration
Choose an existing garment → select cotton/denim/wool/silk-like presets → tune color/roughness/normal intensity → save reusable fabric preset → confirm material affects only intended regions → export.

### J3: Outfits and fitting (future)
Choose avatar → load top/trousers → adjust visual garment dimensions and pose → report approximate visual fit (not physical measurements).

### J4: Pattern-to-3D R&D (future)
Edit simple sewing panels with measurement units → define seam pairings → generate triangulated surfaces → position around an avatar → simulate until draped → re-edit panel and regenerate deterministically → export patterns in verified scale.

## Minimum product capabilities
- Template picker; one functional hoodie and T-shirt template.
- Responsive multi-panel editor with accessible keyboard controls.
- 3D garment viewer with camera presets and scene selection.
- Configurable supported parts/shapes; PBR materials; fabric presets.
- Editable text/image artwork on front/back print zones.
- Versioned document model with local save/load and undo/redo.
- Real PNG and GLB export with validation tests.
- Error states and performance instrumentation.

## Explicit non-goals for MVP
- Manufacturing-level accuracy or grading/cutting patterns.
- Verified virtual try-on sizing, photogrammetry, scan-based avatars.
- Full cloth solver, AI image generation, generative garments.
- Ecommerce, checkout, public user accounts, payments, shop integrations.
- Multi-user collaborative editing or app marketplace.
- Arbitrary mesh sculpting and full DCC feature parity.

## Success measures
- End-to-end hoodie journey passes repeatably in Playwright/manual tests.
- No broken core interactions, lost edits, missing textures or export failures.
- Project roundtrip preserves all editable selections and transformations within documented tolerances.
- UI uses shared components/tokens without theme inconsistencies.
- Production build, unit tests, typecheck and lint pass; quality and known limitations documented.

## Expansion priorities
1. More garment families and modular components.
2. Avatar preview and garment layering.
3. Pattern editor proof of concept.
4. Sewing graph, geometry regeneration and physics experiments.
5. Cloud collaboration, brand storefronts or AI only after the core designer is robust.

## Assumptions
- Desktop-first, pointer and keyboard input; mobile view-only/limited editing initially.
- Browser graphics via stable WebGL2 path, not mandatory WebGPU.
- No cloud accounts needed to reach first milestone.
- A real, authorized garment GLB might need to be created via Blender if no suitable licensed asset is available. Basic procedural geometry is acceptable for an early functional slice **only if clearly labeled provisional**.


---

<!-- SOURCE FILE: docs/ARCHITECTURE.md -->

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


---

<!-- SOURCE FILE: docs/REPOSITORY_STRUCTURE.md -->

# Repository layout and code organization

Target structure after relevant phases have been created (do not scaffold empty advanced services purely for appearance):

```text
fashion-studio/
├── AGENTS.md
├── CODEX_MASTER_PROMPT.md
├── STATUS.md
├── apps/
│   ├── web/
│   │   ├── public/assets/
│   │   └── src/
│   │       ├── app/             # Providers, router, bootstrapping
│   │       ├── layouts/         # DashboardLayout, EditorLayout
│   │       ├── features/
│   │       │   ├── garment-editor/
│   │       │   ├── material-editor/
│   │       │   ├── artwork-editor/
│   │       │   ├── asset-browser/
│   │       │   ├── project-manager/
│   │       │   ├── pattern-editor/  # Future
│   │       │   ├── fitting-room/    # Future
│   │       │   └── render-studio/
│   │       ├── hooks/
│   │       ├── assets/
│   │       └── main.tsx
│   ├── api/                    # Future when cloud is needed
│   └── worker/                 # Future server jobs
├── packages/
│   ├── ui/
│   ├── shared-utils/
│   ├── garment-schema/
│   ├── editor-core/
│   ├── garment-engine/
│   ├── renderer-3d/
│   ├── material-engine/
│   ├── artwork-engine/
│   ├── export-engine/
│   ├── asset-pipeline/
│   ├── avatar-engine/          # Future
│   ├── pattern-engine/         # Future
│   ├── simulation-adapter/     # Future
│   └── config/
├── services/
│   └── pattern-service/       # Future isolated Python adapter
├── assets/
│   ├── garments/
│   ├── materials/
│   ├── avatars/
│   └── environments/
├── tools/
│   ├── blender/
│   ├── validation/
│   └── generators/
├── docs/
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── performance/
├── .github/workflows/
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Feature internals
```text
features/garment-editor/
├── components/           # UI components only
├── hooks/                # Feature React hooks
├── commands/             # User intent adapters to editor-core
├── services/             # Feature orchestration adapters
├── tests/                # Interaction tests
├── types/                # Private UI-only types
└── index.ts              # Public feature entry
```

## Rules
- Keep domain algorithms in packages, not in React JSX or UI hook bodies.
- Default to smaller files based on responsibility rather than artificial line limits. Split a file when it has multiple responsibilities or becomes hard to test.
- One store owns canonical state; consumers select slices. Don't copy full document into Konva local state and Three state concurrently without explicit bidirectional sync rules.
- Package names use `@fashion-studio/{package-name}` and are imported through public exports, not relative climbs into other packages' `src/`.
- Never put all asset catalog definitions in a giant component. Use typed manifests and registries.
- Don't create a new component if a shared primitive can be extended without breaking semantics.
- Use absolute-path alias configuration consistently or use workspace package imports; don't mix conflicting alias approaches.
- Remove dead code only after `rg`-based reference checks and test verification; do not delete user modifications without review.
- Set up automatic formatting and import ordering; don't manually duplicate configuration across each package.

## Names
- Components: `GarmentPropertiesPanel.tsx`, `FabricSwatch.tsx`
- Functions/services: `createProjectDocument.ts`, `validateGarmentAsset.ts`
- Hooks: `useGarmentSelection.ts`, `useArtworkTexture.ts`
- Schemas: `projectDocument.schema.ts`
- Tests: `garmentParameters.test.ts`, `hoodie-flow.spec.ts`
- Folders: `kebab-case`; enums/fields have consistent domain vocabulary.


---

<!-- SOURCE FILE: docs/DESIGN_SYSTEM.md -->

# Editor design system and UX contract

## Visual identity
Professional creative-app aesthetic: dark graphite canvas, neutral layered surfaces, light typography, restrained lavender accent for selection and actions. Avoid decorative gradients, excessive borders, and dense form clutter. Use semantic tokens—not hex values scattered in components. Include a high-quality light theme of equal functionality.

## Design tokens (initial proposal)
```css
:root[data-theme='dark'] {
  --bg-app: #15171c;
  --bg-panel: #20232b;
  --bg-elevated: #2a2e38;
  --bg-viewport: #292d35;
  --border: #393e49;
  --text-primary: #f2f3f6;
  --text-secondary: #aeb3c0;
  --accent: #a78bfa;
  --accent-hover: #bba7ff;
  --accent-subtle: #3a3252;
  --positive: #67c7a2;
  --warning: #f1c47d;
  --negative: #f28f97;
}
:root[data-theme='light'] {
  --bg-app: #eff1f5;
  --bg-panel: #ffffff;
  --bg-elevated: #f6f7f9;
  --bg-viewport: #e5e8ed;
  --border: #d4d8e1;
  --text-primary: #20232c;
  --text-secondary: #5e6572;
  --accent: #6e55cb;
  --accent-hover: #5941b5;
  --accent-subtle: #e9e3fb;
  --positive: #27775b;
  --warning: #9b691d;
  --negative: #b73f52;
}
```
Create tokens for spacing in 4px steps (4/8/12/16/24/32), radii (6/10/14), text hierarchy (12/13/14/16/20/28), control height (~32/36 px), focus rings and motion speeds. Theme via CSS custom properties; support system preference and persisted override.

## Editor layout (desktop)
```
┌──────────────────────────────────────────────────────────────────────┐
│ Logo  Project name  Saved state       Undo Redo   Preview  Export   │
├──────────────────────────────────────────────────────────────────────┤
│ Design | Fabric | Artwork | Pattern | Fitting | Render | Settings  │
├───────────────┬──────────────────────────────────────┬───────────────┤
│ Asset browser │                                      │ Inspector     │
│ Garment parts │          3D Viewport                 │ Contextual    │
│ Layer tree    │      orbit / pan / select            │ Parameters    │
│               │                                      │ Materials     │
│               │                                      │ Print options │
├───────────────┴──────────────────────────────────────┴───────────────┤
│ Status / hints / load progress / validation warnings                 │
└──────────────────────────────────────────────────────────────────────┘
```
Left and right panels independently resizable, collapsible, min/max widths; central viewport never becomes unusably small. On narrower screens collapse panels to drawers. Mode-specific inspector: Design (parts/measurements), Fabric (materials), Artwork (layer controls), Pattern (panel/curve/seams), Fitting (avatar/pose), Render (quality/output). Pattern mode can split a 2D pane and the 3D pane later.

## Interactions
- Select a garment part by viewport click or parts tree; selection stays synchronized across panels.
- Orbit: pointer drag; pan: right/middle drag or modifier; scroll/pinch zoom; implement discoverable controls and reset/focus actions.
- Undo `Ctrl/Cmd+Z`; redo `Ctrl/Cmd+Shift+Z`; save `Ctrl/Cmd+S` (prevent browser page-save only when editor focused and handled); `Delete` removes selected artwork with a confirmation when destructive; `Esc` cancels active interactions.
- Slider gestures produce immediate visual preview but one undo entry on release.
- Use clear dirty/saving/saved/error indicator. Avoid promising saved state until persistence completes.
- Every button must perform an action or be explicitly disabled with a tooltip saying why.
- All interactive controls have labels, keyboard focus, disabled states, feedback. Support high contrast and reduced motion preference.

## User-facing surfaces
### Dashboard
Recent projects, New Project, garment template tiles, local import. Empty state should explain import/create without blocking navigation. Don't expose broken cloud sign-in.
### Design mode
Garment catalog, part tree, shape/measurement sliders with units and input validation, variation chips, lock/show toggles.
### Fabric mode
Fabric swatch library, color picker, roughness/normal/tiling, material assignment by slot, reset material.
### Artwork mode
Front/back zone selector, canvas and live 3D preview, text/image creation, layers/reorder, alignment/snapping, delete, opacity and color controls.
### Pattern mode
Future: centimeters/mm rulers, 2D point/curve editing, seam inspector, validity warnings and linked 3D preview. Feature flag until tested.
### Fitting mode
Future: avatar selection, body measurements, pose. Label visual approximation, not verified physical fit.
### Render mode
Camera presets, transparent background, output resolution, export PNG/GLB and downloadable native project.

## Component library
Build `AppShell`, `AppHeader`, `ModeTabs`, `ResizablePanel`, `IconButton`, `PropertyGroup`, `PropertyField`, `UnitNumberField`, `ColorPicker`, `MaterialSwatch`, `LayerTree`, `AssetCard`, `AssetSearch`, `ViewportToolbar`, `StatusBar`, `ErrorBoundary`, `ConfirmDialog`, `Toast`, `ExportDialog`. Use shared component API and token names.

## Quality bar
- No random overlapping panels, invisible labels, uneven density, hardcoded theme colors or repeated icon buttons without tooltips.
- Focus selected element is visible and inspector displays correct values.
- Empty/loading/error/success states exist for all async flows.
- Use a consistent UI font available as a permitted open-source/web-safe font or system font; do not bundle third-party fonts without authorization.
- Capture and review visual regression screenshots for dark/light modes at desktop widths.


---

<!-- SOURCE FILE: docs/SCHEMAS.md -->

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


---

<!-- SOURCE FILE: docs/GARMENT_AND_ASSET_SPEC.md -->

# Garment, material, artwork and Blender asset specification

## Goal
An asset authored once must load, remain selectable/editable, accept materials and artwork, and export predictably. Set conventions before adding a large asset catalog. First goal: a hoodie with separately selectable body, hood, sleeves, pocket and cuffs, plus front/back print areas.

## Source and license
- Source `.blend` files, render previews and final optimized `.glb` in an asset pipeline with license/provenance manifest.
- Author original test garments in Blender or use explicitly authorized/license-compatible assets. Do not scrape images/meshes from CLO, online stores, or games.
- Store asset authorship, license, attribution needs, source URL, modification details and hash.
- Distinguish procedural placeholder garments from production-quality garments in UI/demo docs.

## Coordinate conventions
- Working Blender units and export transforms must normalize to Three.js world units in meters and +Y up, +Z front. Blender has +Z up; handle transform once at export/import and validate normals/orientation.
- Garment height and sleeve/body dimensions are defined in mm in project schema, converted on evaluation.
- Pivots: origin at garment/avatar central torso reference; stable attachments; same local alignment for variants and avatar.
- Freeze transforms/applied scales for final meshes; no negative scale ambiguity in exported variants.

## Mesh naming and authored objects
```
HOODIE_ROOT
  GARMENT_BODY
  SLEEVE_L
  SLEEVE_R
  HOOD
  CUFF_L
  CUFF_R
  POCKET_FRONT
  DRAWSTRING_L
  DRAWSTRING_R
```
Only promise selectable parts that actually exist. Provide semantic part IDs independent of Blender mesh node names via a template manifest. Avoid mesh cloning that accidentally shares editable materials across unrelated garment instances.

## UV and print zones
- Author continuous, non-overlapping UV islands for designated printable zones, with documented UV set and 2D preview map.
- Front/back print zones have explicit IDs, bounds, intended safe margins, z-order and mappings to material slots/meshes.
- Artwork edit coordinates are normalized to the print zone with a documented y-axis flip for UV space.
- Preferred MVP: compose a print zone atlas on a canvas, then use the atlas as a material texture through stable UV mapping; support non-destructive layer sources. A decal technique may be used for interactive preview but the GLB export must bake equivalent graphics or document the limits.
- Test art placement near UV seam boundaries and on curved cloth. Prevent out-of-zone transforms or visibly indicate clipping.
- Preserve source resolution where practical; export texture resolution must be explicit. Non-power-of-two textures may be supported but set sane max dimensions/memory budgets.

## Garment shape strategy
Three levels, never conflate them:
1. **Variants**: preauthored mesh modules with compatible attachment rigs and UV/material rules; e.g. pockets, hood versions, collar.
2. **Deformation**: approved morph target or skeletal deformation for supported bounded dimensions; annotate what changes physically and what is only visual.
3. **Pattern-generated mesh (R&D)**: derived from 2D panels and seam graph, then optionally draped. Do not enable unsupported controls.

## Materials
- Material slots by semantic key: `body`, `sleeves`, `hood`, `ribbing`, `pocket`, `drawstrings`, optionally `front-print` and `back-print`.
- glTF-compatible PBR: base color, roughness, optional normal/baseColor maps, relevant sheen, transparency only when needed.
- Store physical simulation coefficients separately from display PBR material. Do not label arbitrary `roughness` as cloth stiffness.
- Ensure correct color-space conversion (sRGB color textures, appropriate linear data textures) and map wrapping/tiling.

## Export pipeline
```
Blender source file
  → Validate object names/transforms/normals/manifold where needed
  → Validate UV sets / print zones / material slots / mesh IDs
  → Export GLB in predictable axis/unit conventions
  → glTF Transform validation/optimization where compatible
  → Bundle manifest, previews and attribution
  → Runtime load/inspection
  → Apply material/artwork variants
  → Bake visible artwork for final GLB export
  → Reopen exported GLB independently and compare screenshots/structure
```
Use reproducible Blender scripts in `tools/blender/` for validation/export if Blender is installed. Do not require Blender at app runtime.

## Compression
- Consider Meshopt for geometry and KTX2 for textures, with loader support and fallbacks verified. Do not compress assets if it breaks morph targets/animations or export fidelity. Benchmark effects on download size, decode time and VRAM rather than assume improvement.

## Avatar standards (later)
- Rig/pose naming conventions, full-body avatar coordinates, joint hierarchy, collision proxy mesh separate from render mesh, body measurements in mm, garment anchor points, pose IDs.
- Begin with one licensed neutral mannequin. A visual 'fit' is just a preview; industrial fit prediction requires solver and measured fabric/body inputs.

## Validation checklist
- Nonzero mesh vertices, valid indices, finite positions/normals, usable bounds.
- Correct orientation and scale; material and part names match manifest.
- Every documented print zone has usable UVs, overlays with stable expected position.
- Asset loads offline; no missing external textures or temporary blob URLs.
- GPU resources released when switching garment or disposing scene.
- Screenshot and GLB export reproduce chosen color/material/artwork within documented tolerances.


---

<!-- SOURCE FILE: docs/ROADMAP.md -->

# Execution roadmap and issue plan

Complete phases sequentially where they depend on one another. At each checkpoint the app must run and STATUS.md must report the real result. Timelines are intentionally omitted: actual scope depends on team, asset quality and research outcomes.

## Phase 0 — Audit and bootstrap
**Tasks**: inspect repository/toolchain/git status; document decisions and external dependencies; initialize pnpm monorepo and stable versions; create workspace commands and env example; set up ESLint/Prettier/TypeScript strict/Vitest/Playwright; initialize CI; set up app shell and README.
**Done when**: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` can execute successfully (tests may start small); landing route renders locally. No destructive overwrite.

## Phase 1 — Editor foundation and 3D viewport
**Tasks**: design tokens and shared UI; dark/light themes; header/tabs/dockable or adjustable panels; inspector, asset library, status bar; camera controls, scene, lighting presets, grid/floor; render-error fallback; one locally bundled geometry/asset; selection model; command manager and core Zod schemas.
**Done when**: UI resizes and changes theme without broken layout; user can orbit/zoom/focus/select garment; commands can undo/redo; browser test takes editor screenshot without runtime console errors.

## Phase 2 — Garment assets and template customization
**Tasks**: establish blender authoring/export spec; provide licensed hoodie and T-shirt assets or documented/procedurally authored interim assets; stable part names, material slots, UV/print zones; garment template registry and parameter constraints; selectable hoodie parts; modular variants and bounded length/fit changes; test transitions, reload, collision edge cases.
**Done when**: garment switches, material slots and supported part changes work; invalid configurations are blocked; warnings are honest; authored assets have validation reports.

## Phase 3 — Fabric and artwork
**Tasks**: material preset registry with texture caching and copy-on-edit; fabric parameter inspector; Konva artwork editor; text/image/shape layers; move/rotate/scale, front/back print zones, safe import, transparent backgrounds, artwork state, texture projection and UV baking.
**Done when**: artwork manipulation updates garment correctly; saved project stores editable layer data; material changes don't unexpectedly affect unrelated parts; browser tests cover editing/undo/redo.

## Phase 4 — Persistence and export (MVP release gate)
**Tasks**: native project JSON import/export with schema migrations; local autosave with recovery; PNG capture with verified dimensions and background; GLB export with material + artwork baking; independent GLB reload test; batch/manual smoke tests; production build docs.
**Done when**: full J1 project journey passes; project roundtrip and GLB re-import preserve expected design; export errors surface clearly; lint/typecheck/tests/build green. Label this MVP release.

## Phase 5 — Advanced visual garment platform
**Tasks**: expand garment catalog; variants and preset authoring tools; avatar and pose previews; multiple garments/outfits; layer visibility; resource manager; better asset browser and project dashboard; optional backend cloud storage only after local flow is stable.
**Done when**: at least two garment types share core code without duplicates; avatar preview and layered outfit load; performance baseline recorded and regression tests maintained. No fit-accuracy claims.

## Phase 6 — Parametric 2D pattern proof of concept
**Tasks**: investigation report; 2D panel schema with explicit units; basic line/curve editing and measurement dimensioning; seam graph, stitching edges, seam lengths/notches; triangulation and panel placement; limited parametric pattern generation via a local algorithm or isolated GarmentCode adapter, if viable; SVG/pattern export.
**Done when**: edit a small test panel set → regenerate test mesh deterministically → maintain valid seam references; import/export has measurement validation. Avoid production CAD claims.

## Phase 7 — Fabric simulation R&D
**Tasks**: evaluate solver options (XPBD / WASM / WebGPU); constraints, mass, gravity, bend/stretch, collision with simple primitives and later avatar; separate simulated geometry from canonical pattern; progress/cancel controls, performance benchmarks, deterministic reference cases; plan self-collision and robustness.
**Done when**: a minimal cloth test drapes against a known collider and passes numerical or image regressions. Mark failures/limitations clearly; no silent fake solvers.

## Phase 8 — Quality, hosting and commercial readiness
**Tasks**: authenticated projects, versioning and permissions if desired; S3 object storage; Fastify API, PostgreSQL migrations, job processing; upload-security hardening; production monitoring, profiling, larger-asset tests, cross-browser/accessibility checks; dependency/licensing audit; backups/privacy policies.
**Done when**: deployed features pass checks and have operational runbooks. Optional features remain off until proven.

## Initial detailed backlog (first 20 tickets)
- FS-001 Workspace/toolchain audit and bootstrap.
- FS-002 Design token system and themes.
- FS-003 Shared layout primitives and resizable panels.
- FS-004 Header, route navigation and project dashboard.
- FS-005 Versioned project Zod schema and migrations.
- FS-006 Command history/undo/redo and keyboard bindings.
- FS-007 Three.js renderer setup and camera presets.
- FS-008 Selection/picking, inspector coordination.
- FS-009 Error boundaries, loading, fallback renderer.
- FS-010 Garment asset naming/UV contract.
- FS-011 Blender export and model validation script.
- FS-012 Hoodie template and selectable parts.
- FS-013 T-shirt template and compatible variant registry.
- FS-014 Garment parameters, constraints and morphology.
- FS-015 Material presets, edit/copy/reset.
- FS-016 Artwork JSON layer schema and Konva editor.
- FS-017 Image upload sanitization/size limits.
- FS-018 Artwork texture composition and 3D linkage.
- FS-019 Local project save/load/autosave and recovery.
- FS-020 PNG/GLB export and roundtrip E2E tests.

## Session continuation policy
If time or tokens expire, finish the current safe checkpoint, run applicable checks, and update STATUS.md with: last completed milestone, files changed, commands/results, known defects, one next bounded task and the relevant files to read. Do not restart the repo from scratch in a new Codex session.


---

<!-- SOURCE FILE: docs/ACCEPTANCE_TESTS.md -->

# Acceptance tests, QA and performance budgets

Test the real browser/editor. Unit tests of pure functions alone do not prove a 3D workflow works. Record actual results in STATUS.md. Use Playwright for browser/E2E and Vitest for domain logic; use web screenshots and independent exported GLB inspection as additional evidence.

## MVP functional acceptance — must pass
**AT-001** Create a new hoodie project from dashboard; hoodie visible in viewport without external network asset requests.
**AT-002** Orbit, pan, zoom, reset camera, focus selected garment, and switch front/back/side presets.
**AT-003** Select part in scene → same part highlighted in layer tree and inspector; select tree part → correct mesh selection.
**AT-004** Change body fabric color and roughness → visible update, unrelated garment material slots unchanged.
**AT-005** Choose compatible component variant → correct object toggles; incompatible changes rejected with feedback.
**AT-006** Adjust supported sleeve/body parameter → visible geometry/transform change and numeric value remains within validated bounds. Unsupported parameters disabled, not faked.
**AT-007** Undo 3 operations, redo 2, make a new operation → redo branch invalidated correctly.
**AT-008** Drag a slider through 30 updates → one meaningful command history entry after commit.
**AT-009** Add text artwork to front chest → text appears at chosen position on 3D garment.
**AT-010** Upload permissible PNG/JPG image → design canvas and garment update, no missing texture.
**AT-011** Move, rotate, scale, re-order, hide, duplicate and delete artwork layers → all operations reversible.
**AT-012** Switch to back print zone → artwork placed on back, not unexpectedly mirrored onto front.
**AT-013** Resize editor panels → viewport remains functional, camera aspect correct.
**AT-014** Toggle dark/light theme → accessible contrast and consistent components in all main panels.
**AT-015** Save native project, refresh, import/reopen → garment parameters, material assignments, artwork and assets recover accurately.
**AT-016** Try opening invalid project → descriptive error, previous working project remains unmodified.
**AT-017** Export PNG at requested dimensions → correct size, expected backdrop/transparency and visible garment.
**AT-018** Export GLB → parse independently with GLTFLoader/validator → geometry, materials, artwork textures and transforms survive.
**AT-019** Switch templates repeatedly (at least 20) → no unbounded memory growth from leaked GPU resources/object URLs.
**AT-020** Invalid uploaded file, oversized image, unavailable WebGL → useful non-crashing fallback.
**AT-021** All mode buttons have working features or are explicitly marked disabled/experimental with clear reason.
**AT-022** Keyboard shortcuts and editor focus do not accidentally trigger browser defaults or text-field global actions.
**AT-023** Browser reload/new session recovers autosaved drafts if implemented; unsaved changes are not mislabeled Saved.
**AT-024** Direct production build via static hosting loads same 3D assets and survives routing refresh.

## Unit/integration tests
- Schema parse valid, invalid, unknown future version, migration, and backward-compatibility behavior.
- Command apply/invert, change coalescing, edge cases and reset.
- Variant compatibility constraints and measurement unit conversion.
- Material copy-on-edit, shared preset immutability and color-space handling.
- UV print-zone transform forward/inverse mapping and bounds clipping.
- Artwork serialization without object URLs or browser-only class instances.
- Asset registry missing paths and fallback behavior.
- Export GLB reopened to check material maps, scene nodes and expected texture dimensions.
- UI resizing and selection synchronization; no repeated global event listeners.

## Performance budgets (targets, must measure and adapt)
- Midrange desktop target 60 FPS for one garment in normal orbit view; maintain >=30 FPS fallback target under heavier scenes.
- Limit DPR appropriately, use lazy loading and texture size caps.
- Establish separate browser timings for load, 3D first frame, material change, texture rebuild and export.
- Track draw calls, geometry count, triangles and GPU texture memory. Avoid inventing absolute numbers before representative assets exist.
- Benchmark 1, 5 and 10 garment variants/complex scene previews and record actual hardware/browser.
- Worker-offload operations that block main thread; provide progress and cancellation for long actions.

## Accessibility and security
- Label controls; keyboard focus visible; reasonable contrast in both themes.
- Uploaded images/SVGs handled safely; confirm file size limits and data URL/asset constraints.
- Project import cannot inject script, path traversal, or arbitrary remote asset origins.
- No secrets exposed to frontend or committed in repository.

## Verification commands (implement scripts and adapt to actual workspace)
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```
Do not mark the phase complete when a required validation command fails. If a runtime/browser is unavailable in Codex environment, report skipped checks precisely and provide a reproducible human verification procedure; do not claim pass.

## Visual QA
Take screenshots of dashboard, editor with hoodie, fabric editing, artwork editing, export modal, light theme and narrow layout. Confirm text alignment, panel proportions, viewport visibility, no overlapping dropdowns or clipped controls. Real browser screenshots only; don't substitute stylized generated promotional images for acceptance proof.

## Future pattern/simulation tests
- Closed contour validation, curve intersections, seam edge compatibility, seam length warning.
- Known-size simple panel has correct exported measurement units.
- Deterministic panel triangulation and seam graph regeneration.
- Cloth test falls on sphere/box under gravity with measurable constraint convergence; collision penetration metrics, timing and numerical stability recorded.
- Solver results reproducible within tolerances; unsupported fabric presets are labeled estimates rather than tested physics.


---

<!-- SOURCE FILE: docs/OPEN_SOURCE_REFERENCES.md -->

# Research references and integration guidance

Research starting points verified as publicly findable in November 2026. These links are for technical evaluation; they are not automatic permission to copy assets, text or code. Verify exact dependency/asset version and LICENSE before integration, including transitive dependencies.

## Core web stack
- React Three Fiber (React renderer for Three.js): https://github.com/pmndrs/react-three-fiber  | Docs: https://r3f.docs.pmnd.rs/getting-started/introduction
  - Current docs describe v9 stable with React 19, v10 alpha with new WebGPU-centric behavior; prefer stable v9 initially and verify before installing.
- Three.js: https://threejs.org/docs/
- React Konva: https://konvajs.org/docs/react/index.html  | React interactive canvas for print/artwork editor; check compatibility with installed React 19 minor.
- Zustand: https://github.com/pmndrs/zustand
- glTF Transform: https://gltf-transform.dev/  | Asset optimization, Meshopt, texture workflows.
- Vite: https://vite.dev/  | Local development/build tooling.
- shadcn/ui: https://ui.shadcn.com/  | Accessible component patterns to customize with a centralized design system.
- Zod: https://zod.dev/  | Runtime validation and inferred types.
- Playwright: https://playwright.dev/  | Browser acceptance testing.

## Garment and pattern research
- GarmentCode / PyGarment: https://github.com/maria-korosteleva/GarmentCode  | MIT on main repository at time of research. Parametric sewing panels, GUI, component-oriented pattern generation; inspect dependencies separately and isolate any Python integration.
- GarmentCode demo: https://garmentcode.ethz.ch/
- FreeSewing: https://github.com/freesewing/freesewing  | Parametric sewing patterns; inspect current active repository state and archive status before adopting code.
- Seamly2D: https://github.com/FashionFreedom/Seamly2D  | GPLv3+ open-source patternmaking reference. Do not copy into proprietary app without understanding GPL obligations; study workflows and implement original code if needed.
- JSCAD: https://github.com/jscad/OpenJSCAD.org  | General-purpose parametric modeling ideas; not clothing-specific.

## Cloth and fitting research
- WebGPU XPBD Cloth Simulator: https://github.com/ccincotti3/webgpu_cloth_simulator  | Numerical/GPU simulation research; verify license and suitability.
- Example cloth simulation: https://github.com/FurkanZhlp/cloth-sim  | Research reference; verify implementation/license before using.
- Blender: https://www.blender.org/  | Authoring and validating mesh, rig, UV and material assets.

## Integration requirements
- Maintain `THIRD_PARTY_NOTICES.md` (create with source/license/dependencies) if external assets/packages are bundled or directly adapted.
- A research link must not become a dependency without a short decision record: capability, license, maintenance, bundle size, compatibility, alternatives, security and test plan.
- GarmentCode MIT license does not automatically mean all assets, datasets, fonts and third-party simulation components in its ecosystem carry the same license.
- Pattern, avatar, texture and garment assets need independent provenance.
- Avoid closed/source-proprietary competitors' assets or UI screenshot cloning.
- If a repository is unavailable or its API changed, record failure and implement a separate adapter rather than fabricating a working integration.


---

<!-- SOURCE FILE: docs/DECISIONS.md -->

# Architecture decisions and open research questions

## Adopted design assumptions
- **ADR-001** Desktop-first local browser editor; cloud services deferred until core authoring flow works.
- **ADR-002** Single versioned `ProjectDocument` is source of truth; R3F scene and Konva stage are derived editors.
- **ADR-003** Stable WebGL2-compatible React Three Fiber baseline; WebGPU as independent R&D.
- **ADR-004** Blender/GLB asset contract with stable semantic part IDs and print-zone UVs.
- **ADR-005** Modular garment variants and bounded morphs before full pattern-based construction.
- **ADR-006** One theme token source and shared UI package; all modes use same component system.
- **ADR-007** Local save/reopen and export must be validated before adding cloud features.
- **ADR-008** 2D pattern and physics systems are separate research tracks and must not masquerade as working MVP functionality.

## Decisions to validate during implementation
- Whether to use JSON with embedded assets, JSON + separate asset files, or ZIP bundled project format for portable offline save; select based on data size and test cases.
- Hoodie asset creation method and redistribution license; if no production-grade garment is supplied, make a self-authored interim asset and identify quality limitations explicitly.
- Whether print regions use atlas textures, decals or mixed preview/export path; choose based on curved mesh coverage and GLB fidelity tests.
- Whether avatar deformation/garment sizing remains approximate or obtains authored morphs/size variants.
- Whether GarmentCode is integrated as a Python adapter or used only as algorithmic research; investigate dependency license, packaging and runtime requirements.
- Which physics solver has suitable license, performance, quality and reproducibility. Benchmark before adopting WebGPU.
- What authenticated/storage features justify adding Fastify, PostgreSQL and queue workers; don't add dead backend infrastructure in MVP.

## Agent update procedure
For each substantial decision, append an ADR with date, context, options considered, selected approach, consequences and reversibility. Don't silently introduce new frameworks to solve localized problems.


---

<!-- SOURCE FILE: docs/CODEX_SESSION_PROMPTS.md -->

# Codex session prompts

Use these when starting a fresh session or a focused phase. The master brief and AGENTS.md remain authoritative.

## A. Initial full-project kickoff
```text
Read AGENTS.md, CODEX_MASTER_PROMPT.md, all docs and STATUS.md. Audit this repository. Implement Phase 0 then Phase 1, with real code and checks. Keep app runnable, no mock functionality. Make subsequent roadmap progress when possible; log tested results and exact next step in STATUS.md. Do not stop after only writing a plan.
```

## B. Continue from previous context
```text
Read AGENTS.md, CODEX_MASTER_PROMPT.md, docs/ROADMAP.md, STATUS.md and the actual git diff before acting. Summarize current verified progress, identify the first incomplete milestone, implement the next coherent vertical slice, run checks and update STATUS.md. Do not reinitialize, rewrite or delete existing working code. Continue automatically if unblocked.
```

## C. Professional UI/UX overhaul (without breaking behavior)
```text
Audit all editor pages, dialogs, left/right panels, inspectors, toolbars and loading/error states. Consolidate tokens and shared components in packages/ui, enforce both dark/light themes, improve typography, spacing, alignment, keyboard support, selection sync, resizable layout and responsive behavior. Preserve all working functionality. Add screenshot regressions and accessibility checks. Remove duplicate UI logic after verifying references. Run build/tests and report actual differences.
```

## D. Garment/asset engine sprint
```text
Implement the next garment engine milestone in docs/ROADMAP.md. First validate the actual bundled GLB and manifest. Add stable part selection, material slots, supported variants, parameter limits and actual morph/mesh changes. Do not make sliders that only change a label. Add asset-authoring/validation scripts and tests. Confirm actual GLB orientation, UVs and material behavior by loading it in the browser.
```

## E. Fabric and artwork editor sprint
```text
Build a non-destructive layer-based artwork editor using Konva linked to the canonical ProjectDocument and live 3D garment. Support front/back print zones, text/images, transforms, layer ordering, undo/redo, input validation and actual composited texture updates. Verify print alignment on front/back and texture baking in exported GLB; test save/reopen. Document UV conventions and restrictions.
```

## F. Save, export and QA sprint
```text
Implement robust native project import/export, migration and error handling, reproducible PNG screenshot capture and GLB export with baked artwork. Independently reimport the GLB and compare material/texture/geometry. Run all AT-001..AT-024 applicable scenarios, fix failures and create a real working demo flow. No fake passes or placeholder file content.
```

## G. Parametric pattern research sprint
```text
Review GarmentCode and its dependencies/licenses, then implement an isolated proof of concept for a 2D pattern document, editable panel contours, seam pair references, measured units, deterministic triangulation and export. Provide a real example with tests; do not claim arbitrary real-garment sewing or validated manufacturing output. Keep the MVP editor functioning independently of this experimental module.
```

## H. Cloth simulation research sprint
```text
Research, evaluate and implement a minimal real XPBD cloth prototype isolated behind a feature flag, with simple draping against sphere/box and explicit gravity, stretch/bend constraints, collision metrics, progress and cancellation. Write reproducible numerical/visual tests and performance report. Do not claim full self-collision, apparel sewing or fit accuracy without implementing and validating those cases.
```

## I. Full codebase audit and refactor
```text
Audit dependency boundaries, TypeScript safety, state ownership, render-loop allocations, GPU disposal, asset provenance, duplicated modules, dead code, naming and directory layout. Produce findings ranked by severity and fix high-risk issues without breaking accepted functionality. Consolidate design tokens, package imports and code patterns. Run all quality checks and update architecture/status docs. Never delete user changes without checking git state.
```
