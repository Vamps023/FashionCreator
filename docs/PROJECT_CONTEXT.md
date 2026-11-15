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
