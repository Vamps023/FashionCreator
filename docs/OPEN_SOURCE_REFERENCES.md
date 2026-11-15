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
