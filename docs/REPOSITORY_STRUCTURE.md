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
