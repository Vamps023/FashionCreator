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
