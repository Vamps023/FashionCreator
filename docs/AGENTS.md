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
