# Known Limitations & Engineering Disclaimers

## 1. Overview
In alignment with strict engineering honesty, this document catalogues the architectural boundaries, algorithmic trade-offs, and pending capabilities of FashionCreator's 2D/3D garment CAD and simulation system.

---

## 2. Limitations by Subsystem

### 2.1 Cloth Physics & Self-Collision
- **Self-Collision Approximation:** The current XPBD solver focuses on robust avatar mannequin collision, ground collision, tensile stretch, dihedral bending, and seam pulling. Full cloth-on-cloth self-collision (preventing cloth layers from intersecting themselves in complex accordion folds or multi-layer pockets) is currently omitted to maintain smooth 60 FPS in pure JavaScript CPU threads.
- **Particle Count Thresholds:**
  - Optimal real-time performance is achieved between **1,500 and 4,500 particles** (particle distance: $25\,\text{mm} - 35\,\text{mm}$).
  - Particle distances below $12\,\text{mm}$ (>12,000 vertices) can cause frame drops on low-tier mobile devices without WebGPU compute acceleration.
- **Self-Intersecting Pattern Starts:** If 3D initial placement positions place front and back panels directly intersecting the mannequin bone mesh, the solver will project vertices outward, but initial placement should remain outside the body volume.

### 2.2 Sewing & Seam Topology
- **1-to-1 Segment Seams:** The seam engine currently matches Segment A on Piece 1 to Segment B on Piece 2. Multi-panel continuous seams (e.g., 1 front waist edge sewn to 2 separate pleated skirt panels) require pre-splitting the segment into matching sub-segments.
- **Dart Seams:** Dart closing (pinching a triangular wedge shut within a single pattern piece) can be simulated by defining an internal seam between the two dart legs; full automatic geometric dart collapsing in 2D drafting is planned for Phase 7.

### 2.3 Computational Geometry & CAD Drafting
- **Freehand Curved Splines in Triangulation:** The 2D triangulator discretizes cubic Bézier segments into polyline approximations based on `particleDistanceMm`. Highly curved edges are rendered as smooth multi-segment boundaries, but true non-uniform rational B-spline (NURBS) surfaces are converted to discrete triangle meshes before physics integration.
- **Pattern Nesting & Yield Calculation:** While 1:1 SVG export with test scale squares is supported, automatic marker making and fabric roll nesting optimization (maximizing yardage efficiency) is not yet integrated.

### 2.4 Avatar Colliders
- **Analytical vs Arbitrary Mesh Colliders:** Avatar collisions utilize an analytical tree of capsules and spheres approximating the human torso, chest, neck, and shoulders. This delivers deterministic, glitch-free simulation, but will not capture micro-creases of anatomical features like individual fingers or ears.
- **Skeletal Animation:** Draping operates in static poses (T-Pose / Relaxed Pose). Dynamic skeletal motion during draping (e.g. running or walking animations while simulating) is scheduled for the WebGPU solver update.

### 2.5 Industrial Pattern Formats
- **Export Standards:** Full 1:1 millimeter SVG export, GLB 3D scene export, and native `.fstudio` project documents are fully implemented. Industrial CAD plotter formats (`.dxf` AAMA / ASTM) require a future specialized vector converter.
