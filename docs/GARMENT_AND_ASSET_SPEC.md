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
