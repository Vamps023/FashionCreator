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
