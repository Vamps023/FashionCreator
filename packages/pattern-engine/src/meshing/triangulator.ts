export interface TriangulatedMesh2D {
  vertices: [number, number][]; // 2D [x, y] in mm
  indices: number[]; // Triangle indices [i0, i1, i2, ...]
  boundaryIndices: number[]; // Indices of vertices on the outer perimeter in order
  boundaryVertexIndices?: number[]; // Alias for boundaryIndices
  segmentVertexMap: Map<number, number[]>; // segmentIndex -> vertex indices along that segment
}

/**
 * Triangulates a 2D polygon pattern piece with uniform internal vertices based on particle distance.
 * Uses Bowyer-Watson Delaunay triangulation with point-in-polygon filtering.
 */
export function triangulatePatternPiece(
  outlineOrPiece: [number, number][] | { outlinePoints: [number, number][] },
  particleDistanceMm: number = 25
): TriangulatedMesh2D {
  const outlinePoints = Array.isArray(outlineOrPiece)
    ? outlineOrPiece
    : outlineOrPiece?.outlinePoints || [];

  if (!outlinePoints || outlinePoints.length < 3) {
    return { vertices: [], indices: [], boundaryIndices: [], boundaryVertexIndices: [], segmentVertexMap: new Map() };
  }

  // 1. Resample perimeter edges to maintain consistent particle distance
  const boundaryVertices: [number, number][] = [];
  const boundaryIndices: number[] = [];
  const segmentVertexMap = new Map<number, number[]>();

  for (let i = 0; i < outlinePoints.length; i++) {
    const p1 = outlinePoints[i];
    const p2 = outlinePoints[(i + 1) % outlinePoints.length];

    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.round(dist / particleDistanceMm));

    const segVerts: number[] = [];

    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const vx = p1[0] + dx * t;
      const vy = p1[1] + dy * t;
      const idx = boundaryVertices.length;
      boundaryVertices.push([vx, vy]);
      boundaryIndices.push(idx);
      segVerts.push(idx);
    }

    segmentVertexMap.set(i, segVerts);
  }

  // 2. Compute 2D Bounding Box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  boundaryVertices.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  // 3. Generate uniform interior grid vertices strictly inside the polygon
  const interiorVertices: [number, number][] = [];
  const inset = particleDistanceMm * 0.7;

  for (let y = minY + inset; y <= maxY - inset; y += particleDistanceMm) {
    for (let x = minX + inset; x <= maxX - inset; x += particleDistanceMm) {
      // Jitter grid slightly to prevent collinear Delaunay degeneracies
      const jx = x + (Math.sin(y * 12.34) * 0.15 * particleDistanceMm);
      const jy = y + (Math.cos(x * 12.34) * 0.15 * particleDistanceMm);

      if (isPointInsidePolygon([jx, jy], boundaryVertices)) {
        interiorVertices.push([jx, jy]);
      }
    }
  }

  const allVertices: [number, number][] = [...boundaryVertices, ...interiorVertices];

  // 4. Bowyer-Watson Delaunay Triangulation
  const rawTriangles = bowyerWatsonDelaunay(allVertices, minX, maxX, minY, maxY);

  // 5. Filter out triangles outside the polygon
  const finalIndices: number[] = [];
  for (let t = 0; t < rawTriangles.length; t += 3) {
    const i0 = rawTriangles[t];
    const i1 = rawTriangles[t + 1];
    const i2 = rawTriangles[t + 2];

    const p0 = allVertices[i0];
    const p1 = allVertices[i1];
    const p2 = allVertices[i2];

    // Centroid of the triangle
    const cx = (p0[0] + p1[0] + p2[0]) / 3;
    const cy = (p0[1] + p1[1] + p2[1]) / 3;

    if (isPointInsidePolygon([cx, cy], boundaryVertices)) {
      finalIndices.push(i0, i1, i2);
    }
  }

  return {
    vertices: allVertices,
    indices: finalIndices,
    boundaryIndices,
    boundaryVertexIndices: boundaryIndices,
    segmentVertexMap
  };
}

/**
 * Standard Ray-Casting algorithm for point-in-polygon test
 */
export function isPointInsidePolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Robust Bowyer-Watson 2D Delaunay Triangulator
 */
function bowyerWatsonDelaunay(
  points: [number, number][],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): number[] {
  const dx = maxX - minX;
  const dy = maxY - minY;
  const deltaMax = Math.max(dx, dy) * 2;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  // Super-triangle vertices that completely encompass all points
  const pSuper1: [number, number] = [midX - 2 * deltaMax, midY - deltaMax];
  const pSuper2: [number, number] = [midX, midY + 2 * deltaMax];
  const pSuper3: [number, number] = [midX + 2 * deltaMax, midY - deltaMax];

  const pts: [number, number][] = [...points, pSuper1, pSuper2, pSuper3];
  const superIdx1 = points.length;
  const superIdx2 = points.length + 1;
  const superIdx3 = points.length + 2;

  interface Triangle {
    a: number;
    b: number;
    c: number;
    circX: number;
    circY: number;
    circR2: number;
  }

  function getCircumcircle(a: number, b: number, c: number): Triangle {
    const pA = pts[a];
    const pB = pts[b];
    const pC = pts[c];

    const d = 2 * (pA[0] * (pB[1] - pC[1]) + pB[0] * (pC[1] - pA[1]) + pC[0] * (pA[1] - pB[1]));
    if (Math.abs(d) < 1e-9) {
      return { a, b, c, circX: 0, circY: 0, circR2: Infinity };
    }

    const ux = ((pA[0] * pA[0] + pA[1] * pA[1]) * (pB[1] - pC[1]) +
      (pB[0] * pB[0] + pB[1] * pB[1]) * (pC[1] - pA[1]) +
      (pC[0] * pC[0] + pC[1] * pC[1]) * (pA[1] - pB[1])) / d;

    const uy = ((pA[0] * pA[0] + pA[1] * pA[1]) * (pC[0] - pB[0]) +
      (pB[0] * pB[0] + pB[1] * pB[1]) * (pA[0] - pC[0]) +
      (pC[0] * pC[0] + pC[1] * pC[1]) * (pB[0] - pA[0])) / d;

    const r2 = (pA[0] - ux) * (pA[0] - ux) + (pA[1] - uy) * (pA[1] - uy);
    return { a, b, c, circX: ux, circY: uy, circR2: r2 };
  }

  let triangles: Triangle[] = [getCircumcircle(superIdx1, superIdx2, superIdx3)];

  for (let i = 0; i < points.length; i++) {
    const px = points[i][0];
    const py = points[i][1];

    const badTriangles: Triangle[] = [];

    for (let t = 0; t < triangles.length; t++) {
      const tri = triangles[t];
      const d2 = (px - tri.circX) * (px - tri.circX) + (py - tri.circY) * (py - tri.circY);
      if (d2 <= tri.circR2) {
        badTriangles.push(tri);
      }
    }

    // Find boundary of polygonal hole
    const polygonEdges: [number, number][] = [];
    for (let j = 0; j < badTriangles.length; j++) {
      const tri = badTriangles[j];
      const edges: [number, number][] = [
        [tri.a, tri.b],
        [tri.b, tri.c],
        [tri.c, tri.a]
      ];

      for (const [eA, eB] of edges) {
        let isShared = false;
        for (let k = 0; k < badTriangles.length; k++) {
          if (j === k) continue;
          const other = badTriangles[k];
          if (
            (eA === other.a && eB === other.b) || (eA === other.b && eB === other.a) ||
            (eA === other.b && eB === other.c) || (eA === other.c && eB === other.b) ||
            (eA === other.c && eB === other.a) || (eA === other.a && eB === other.c)
          ) {
            isShared = true;
            break;
          }
        }
        if (!isShared) {
          polygonEdges.push([eA, eB]);
        }
      }
    }

    // Remove bad triangles
    triangles = triangles.filter((t) => !badTriangles.includes(t));

    // Re-triangulate hole
    for (const [eA, eB] of polygonEdges) {
      triangles.push(getCircumcircle(eA, eB, i));
    }
  }

  // Remove triangles that share vertices with super-triangle
  const result: number[] = [];
  for (const tri of triangles) {
    if (
      tri.a !== superIdx1 && tri.a !== superIdx2 && tri.a !== superIdx3 &&
      tri.b !== superIdx1 && tri.b !== superIdx2 && tri.b !== superIdx3 &&
      tri.c !== superIdx1 && tri.c !== superIdx2 && tri.c !== superIdx3
    ) {
      result.push(tri.a, tri.b, tri.c);
    }
  }

  return result;
}
