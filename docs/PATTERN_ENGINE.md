# 2D Pattern CAD & Computational Geometry Engine

## 1. Overview
The Pattern Engine (`packages/pattern-engine` & `apps/web/src/components/PatternCADCanvas.tsx`) transforms FashionCreator into a genuine sewing-pattern drafting CAD studio inspired by CLO 3D and Marvelous Designer. Instead of treating clothing as fixed parametric meshes, garments are drafted as 2D polygonal fabric panels that deform, stitch, and drape in 3D physical space.

---

## 2. Core Data Model (`@fashion-studio/garment-schema`)

### 2.1 `PatternSegment`
Represents an individual directed edge along a pattern boundary:
```typescript
export interface PatternSegment {
  stableId: string;
  startIndex: number;
  endIndex: number;
  geometryType: 'line' | 'cubic-bezier' | 'arc';
  curveControlPoints?: [number, number][]; // in millimeters
  lengthMm: number;
  name?: string;
}
```

### 2.2 `PatternPiece`
Represents an entire fabric panel with 2D geometry, grainline, and 3D initial placement hints:
```typescript
export interface PatternPiece {
  id: string;
  name: string;
  category: 'front' | 'back' | 'sleeve' | 'hood' | 'pocket' | 'collar' | 'cuff' | 'waistband' | 'custom';
  outlinePoints: [number, number][]; // 2D contour in millimeters
  segments: PatternSegment[];
  internalLines: { id: string; points: [number, number][] }[];
  grainlineAngle: number; // degrees relative to X axis
  initial3DPlacement: {
    position: [number, number, number]; // [x, y, z] in meters relative to avatar
    rotationEuler: [number, number, number]; // [rx, ry, rz] in radians
    curvatureRadius?: number; // Pre-bent cylindrical radius for sleeves / collars
    facingDirection: 'front' | 'back' | 'left' | 'right';
  };
}
```

---

## 3. Computational Meshing Pipeline (`packages/pattern-engine/src/meshing/triangulator.ts`)

### 3.1 Boundary Resampling
To ensure regular triangle sizing and avoid high-aspect-ratio sliver triangles:
1. Every segment between consecutive outline points $P_i$ and $P_{i+1}$ is computed:
   $$\text{dist} = \sqrt{(x_{i+1} - x_i)^2 + (y_{i+1} - y_i)^2}$$
2. The number of subdividing steps is determined by the `particleDistanceMm`:
   $$\text{steps} = \max\left(1, \text{round}\left(\frac{\text{dist}}{\text{particleDistanceMm}}\right)\right)$$
3. Points along the segment are sampled at $t = \frac{s}{\text{steps}}$ for $s \in [0, \text{steps}-1]$.
4. Each segment's ordered vertex indices are recorded in `segmentVertexMap` for sewing constraints.

### 3.2 Uniform Interior Grid Sampling
Cloth cannot bend, wrinkle, or shear across 3D volumes with only perimeter vertices. The triangulator:
1. Computes the axis-aligned bounding box $[x_{\min}, x_{\max}] \times [y_{\min}, y_{\max}]$.
2. Steps across the bounding box at spacing $\Delta = \text{particleDistanceMm}$ with an offset staggered lattice.
3. Tests each candidate point $(x, y)$ using a ray-casting point-in-polygon algorithm with an inward safety margin ($0.7 \times \text{particleDistanceMm}$).
4. Only points strictly inside the panel are appended to the vertex array.

### 3.3 Bowyer-Watson Delaunay Triangulation
The full set of boundary and interior vertices is triangulated using the Bowyer-Watson incremental algorithm:
1. An enclosing super-triangle is established.
2. Each vertex is inserted sequentially:
   - Identify all existing triangles whose circumcircle contains the point.
   - Remove these triangles to form a star-shaped polygonal hole.
   - Connect the new point to all boundary edges of the hole.
3. Remove all triangles that share any vertex with the initial super-triangle.
4. Filter out any remaining triangles whose centroid falls outside the polygon contour (handling concave armholes, neck drops, and curved hems).

---

## 4. Interactive 2D CAD Canvas (`apps/web/src/components/PatternCADCanvas.tsx`)

The interactive 2D pattern CAD canvas provides standard digital apparel drafting capabilities:
- **Pan & Zoom Grid:** Real-world millimeter grid (10mm minor, 100mm major) with zoom level from 0.15x to 3.0x.
- **Direct Vertex Editing:** Click and drag any polygon vertex to alter garment dimensions in real-time.
- **Edge Length Annotation:** Displays calculated edge lengths in millimeters (e.g., `520 mm`, `120 mm`) directly on segment midpoints.
- **Direct Edge-to-Edge Sewing Tool:** In `Sew` mode, click an edge on Panel A, then click an edge on Panel B to establish a directional sewing seam.
- **Piece Translation:** Drag whole pattern panels across the drafting table.
- **Scale Calibration & SVG Export:** Export true 1:1 scale SVG cutting patterns with millimeter units and reference calibration squares.
