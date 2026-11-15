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
