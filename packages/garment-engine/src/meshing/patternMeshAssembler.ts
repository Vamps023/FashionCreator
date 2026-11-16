import * as THREE from 'three';
import { PatternPiece, SewingConnection } from '@fashion-studio/garment-schema';
import { triangulatePatternPiece, TriangulatedMesh2D } from '@fashion-studio/pattern-engine';

export interface SewingVertexPair {
  vertexA: number; // Index in unified global mesh
  vertexB: number; // Index in unified global mesh
  targetLength: number; // Usually 0 mm (seam closed)
  seamId: string;
}

export interface AssembledGarmentMesh {
  geometry: THREE.BufferGeometry;
  sewingConstraints: SewingVertexPair[];
  pieceVertexOffsets: Map<string, { start: number; count: number }>;
  triangulatedPieces: Map<string, TriangulatedMesh2D>;
}

/**
 * Converts 2D pattern pieces and seams into an assembled 3D simulation mesh
 * with explicit sewing constraints.
 */
export function assembleGarmentFromPatterns(
  pieces: PatternPiece[],
  seams: SewingConnection[]
): AssembledGarmentMesh {
  const allPositions: number[] = [];
  const allUvs: number[] = [];
  const allIndices: number[] = [];

  const pieceVertexOffsets = new Map<string, { start: number; count: number }>();
  const triangulatedPieces = new Map<string, TriangulatedMesh2D>();
  const pieceGlobalSegMap = new Map<string, Map<number, number[]>>();

  let globalVertexOffset = 0;

  // 1. Triangulate each piece and transform into 3D initial arrangement
  for (const piece of pieces) {
    const mesh2D = triangulatePatternPiece(piece.outlinePoints, piece.meshDensityMm || 22);
    triangulatedPieces.set(piece.id, mesh2D);

    const startIdx = globalVertexOffset;
    const count = mesh2D.vertices.length;
    pieceVertexOffsets.set(piece.id, { start: startIdx, count });

    // Map local 2D segment vertices to global vertex indices
    const segMap = new Map<number, number[]>();
    mesh2D.segmentVertexMap.forEach((localVerts, segIdx) => {
      segMap.set(segIdx, localVerts.map((lv) => lv + startIdx));
    });
    pieceGlobalSegMap.set(piece.id, segMap);

    // Compute bounding box for UV normalization
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    mesh2D.vertices.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);

    // 3D Transform parameters (mm to meters)
    const pos3D = piece.transform3D.position; // [x, y, z] in meters
    const rotEuler = new THREE.Euler(
      piece.transform3D.rotation[0],
      piece.transform3D.rotation[1],
      piece.transform3D.rotation[2],
      'XYZ'
    );
    const rotMat = new THREE.Matrix4().makeRotationFromEuler(rotEuler);

    for (let v = 0; v < mesh2D.vertices.length; v++) {
      const [pxMm, pyMm] = mesh2D.vertices[v];

      // Normalized UV
      const u = (pxMm - minX) / spanX;
      const vUv = (pyMm - minY) / spanY;
      allUvs.push(u, vUv);

      // Center piece around its own local origin in mm, convert to meters
      let localX = (pxMm - (minX + maxX) / 2) / 1000;
      if (piece.mirrored) {
        localX = -localX;
      }
      const localY = (pyMm - (minY + maxY) / 2) / 1000;
      let localZ = 0;

      // Apply cylindrical pre-wrapping around limbs / body if curvatureRadius is defined
      const curvatureR = piece.transform3D.curvatureRadius;
      if (curvatureR && curvatureR > 0.01) {
        const theta = localX / curvatureR;
        localX = curvatureR * Math.sin(theta);
        localZ = curvatureR * (1 - Math.cos(theta));
      }

      // Apply 3D rotation and translation
      const vec = new THREE.Vector3(localX, localY, localZ);
      vec.applyMatrix4(rotMat);
      vec.x += pos3D[0];
      vec.y += pos3D[1];
      vec.z += pos3D[2];

      allPositions.push(vec.x, vec.y, vec.z);
    }

    // Add indices with offset (reversing winding if mirrored so face normals point outward)
    for (let i = 0; i < mesh2D.indices.length; i += 3) {
      if (piece.mirrored) {
        allIndices.push(
          mesh2D.indices[i] + startIdx,
          mesh2D.indices[i + 2] + startIdx,
          mesh2D.indices[i + 1] + startIdx
        );
      } else {
        allIndices.push(
          mesh2D.indices[i] + startIdx,
          mesh2D.indices[i + 1] + startIdx,
          mesh2D.indices[i + 2] + startIdx
        );
      }
    }

    globalVertexOffset += count;
  }

  // 2. Build 3D Sewing Constraints from Seam Graph
  const sewingConstraints: SewingVertexPair[] = [];

  for (const seam of seams) {
    if (!seam.active) continue;

    const sourceSegs = pieceGlobalSegMap.get(seam.sourcePieceId);
    const targetSegs = pieceGlobalSegMap.get(seam.targetPieceId);
    if (!sourceSegs || !targetSegs) continue;

    const sourceVerts = sourceSegs.get(seam.sourceEdgeIndex);
    const targetVerts = targetSegs.get(seam.targetEdgeIndex);
    if (!sourceVerts || !targetVerts || sourceVerts.length === 0 || targetVerts.length === 0) continue;

    // Pair boundary vertices along matching seam edges
    const numPairs = Math.min(sourceVerts.length, targetVerts.length);

    for (let p = 0; p < numPairs; p++) {
      const vA = sourceVerts[p];
      // If reversed orientation, pair from end to start
      const targetIdx = seam.orientation === 'reversed' ? targetVerts.length - 1 - p : p;
      const vB = targetVerts[targetIdx];

      sewingConstraints.push({
        vertexA: vA,
        vertexB: vB,
        targetLength: 0.0, // Bring edges flush together
        seamId: seam.id
      });
    }
  }

  // 3. Create Three.js BufferGeometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allPositions), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(allUvs), 2));
  geometry.setIndex(allIndices);
  geometry.computeVertexNormals();

  return {
    geometry,
    sewingConstraints,
    pieceVertexOffsets,
    triangulatedPieces
  };
}
