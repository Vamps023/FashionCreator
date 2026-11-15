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
