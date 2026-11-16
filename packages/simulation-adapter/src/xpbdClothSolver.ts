import * as THREE from 'three';

export interface AvatarCollider {
  type: 'sphere' | 'capsule';
  centerA: THREE.Vector3;
  centerB?: THREE.Vector3;
  radius: number;
}

export interface SewingSpring {
  vA: number;
  vB: number;
  restLength: number; // typically 0
  stiffness: number;  // 0..1
}

export interface SolverFabricConfig {
  warpStiffness: number;    // 0..1 (stretch along grain)
  weftStiffness: number;    // 0..1 (stretch across grain)
  shearStiffness: number;   // 0..1 (diagonal shear resistance)
  bendingStiffness: number; // 0..1 (crease/fold resistance)
  arealDensityGsm: number;  // cloth mass in g/m^2
  damping: number;          // velocity decay
  friction: number;         // surface friction
  collisionThickness: number; // in meters (e.g. 0.012)
}

export interface BendingConstraint {
  v0: number; // Shared edge start
  v1: number; // Shared edge end
  v2: number; // Wing vertex 1
  v3: number; // Wing vertex 2
  restLength: number; // Rest distance between wing 1 and wing 2
}

export class GarmentClothSolver {
  public geometry: THREE.BufferGeometry;
  private positions: Float32Array;
  private prevPositions: Float32Array;
  private originalPositions: Float32Array;
  private invMasses: Float32Array;
  private numParticles: number;

  // Stretch Constraints
  private edgeIndices: Uint32Array;
  private restLengths: Float32Array;
  private numEdges: number;

  // Bending Constraints
  private bendingConstraints: BendingConstraint[] = [];

  // Sewing Constraints
  public sewingConstraints: SewingSpring[] = [];

  // Colliders
  public avatarColliders: AvatarCollider[] = [];

  // Interactive Live Grab (3D Tug Tool)
  public grabTarget: {
    vertexIndex: number;
    targetPosition: THREE.Vector3;
    radius: number;
    strength: number;
  } | null = null;

  // Vertex Pinning
  public pinnedIndices: Set<number> = new Set();

  // Solver Parameters
  public fabric: SolverFabricConfig = {
    warpStiffness: 0.88,
    weftStiffness: 0.80,
    shearStiffness: 0.65,
    bendingStiffness: 0.5,
    arealDensityGsm: 280,
    damping: 0.992,
    friction: 0.65,
    collisionThickness: 0.008
  };

  public gravity: number = 9.81; // m/s^2
  public substeps: number = 15;
  public isRunning: boolean = false;
  private simulationTime: number = 0;

  constructor(geometry: THREE.BufferGeometry, fixedVertexIndices: number[] = []) {
    this.geometry = geometry;
    const posAttr = geometry.attributes.position;
    this.numParticles = posAttr.count;

    this.positions = new Float32Array(posAttr.array);
    this.prevPositions = new Float32Array(posAttr.array);
    this.originalPositions = new Float32Array(posAttr.array);
    this.invMasses = new Float32Array(this.numParticles);

    // Initial mass distribution based on areal density
    const particleMass = Math.max(0.01, (this.fabric.arealDensityGsm / 1000) * 0.02);
    for (let i = 0; i < this.numParticles; i++) {
      this.invMasses[i] = 1.0 / particleMass;
    }
    // Fixed / pinned vertices
    for (const idx of fixedVertexIndices) {
      if (idx < this.numParticles) {
        this.invMasses[idx] = 0.0;
      }
    }

    // Build edges and adjacent triangle structure
    const edgesMap = new Map<string, [number, number]>();
    const edgeToTriangles = new Map<string, { tri1Wing?: number; tri2Wing?: number; v0: number; v1: number }>();
    const indices = geometry.index ? geometry.index.array : [];

    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i];
      const b = indices[i + 1];
      const c = indices[i + 2];

      this.processTriangleEdge(edgesMap, edgeToTriangles, a, b, c);
      this.processTriangleEdge(edgesMap, edgeToTriangles, b, c, a);
      this.processTriangleEdge(edgesMap, edgeToTriangles, c, a, b);
    }

    this.numEdges = edgesMap.size;
    this.edgeIndices = new Uint32Array(this.numEdges * 2);
    this.restLengths = new Float32Array(this.numEdges);

    let eIdx = 0;
    edgesMap.forEach(([u, v]) => {
      this.edgeIndices[eIdx * 2] = u;
      this.edgeIndices[eIdx * 2 + 1] = v;

      const dx = this.positions[u * 3] - this.positions[v * 3];
      const dy = this.positions[u * 3 + 1] - this.positions[v * 3 + 1];
      const dz = this.positions[u * 3 + 2] - this.positions[v * 3 + 2];
      this.restLengths[eIdx] = Math.sqrt(dx * dx + dy * dy + dz * dz);
      eIdx++;
    });

    // Extract Bending Constraints from interior shared edges with initial rest distance
    edgeToTriangles.forEach(({ tri1Wing, tri2Wing, v0, v1 }) => {
      if (tri1Wing !== undefined && tri2Wing !== undefined) {
        const dx = this.positions[tri1Wing * 3] - this.positions[tri2Wing * 3];
        const dy = this.positions[tri1Wing * 3 + 1] - this.positions[tri2Wing * 3 + 1];
        const dz = this.positions[tri1Wing * 3 + 2] - this.positions[tri2Wing * 3 + 2];
        const restLength = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;

        this.bendingConstraints.push({
          v0,
          v1,
          v2: tri1Wing,
          v3: tri2Wing,
          restLength
        });
      }
    });

    this.setupDefaultAvatarColliders();
  }

  private processTriangleEdge(
    edgesMap: Map<string, [number, number]>,
    edgeToTriangles: Map<string, any>,
    v0: number,
    v1: number,
    wing: number
  ) {
    const minV = Math.min(v0, v1);
    const maxV = Math.max(v0, v1);
    const key = `${minV}_${maxV}`;

    if (!edgesMap.has(key)) {
      edgesMap.set(key, [minV, maxV]);
    }

    if (!edgeToTriangles.has(key)) {
      edgeToTriangles.set(key, { v0: minV, v1: maxV, tri1Wing: wing });
    } else {
      const record = edgeToTriangles.get(key);
      record.tri2Wing = wing;
    }
  }

  /**
   * Sets up default anatomical colliders for the mannequin avatar.
   * Accurately matches the visual dress form mannequin dimensions.
   */
  public setupDefaultAvatarColliders(): void {
    this.avatarColliders = [
      // 1. Shoulders Beam (Accurate clavicle shelf matching mannequin.glb)
      {
        type: 'capsule',
        centerA: new THREE.Vector3(-0.18, 0.30, -0.01),
        centerB: new THREE.Vector3(0.18, 0.30, -0.01),
        radius: 0.075
      },
      // 2. Torso Core (Ribcage & abdomen)
      {
        type: 'capsule',
        centerA: new THREE.Vector3(0, -0.25, 0.03),
        centerB: new THREE.Vector3(0, 0.25, 0.02),
        radius: 0.142
      },
      // 3. Chest Bulge (Natural pectoral shelf)
      {
        type: 'sphere',
        centerA: new THREE.Vector3(0, 0.18, 0.05),
        radius: 0.130
      },
      // 4. Neck / Collar
      {
        type: 'capsule',
        centerA: new THREE.Vector3(0, 0.30, 0.01),
        centerB: new THREE.Vector3(0, 0.45, 0.02),
        radius: 0.065
      },
      // 5. Left Arm (Hangs naturally along torso matching mannequin.glb)
      {
        type: 'capsule',
        centerA: new THREE.Vector3(-0.21, 0.26, -0.01),
        centerB: new THREE.Vector3(-0.22, -0.08, -0.02),
        radius: 0.052
      },
      // 6. Right Arm (Hangs naturally along torso matching mannequin.glb)
      {
        type: 'capsule',
        centerA: new THREE.Vector3(0.21, 0.26, -0.01),
        centerB: new THREE.Vector3(0.22, -0.08, -0.02),
        radius: 0.052
      },
      // 7. Pelvis & Lower Torso
      {
        type: 'capsule',
        centerA: new THREE.Vector3(0, -0.24, 0.03),
        centerB: new THREE.Vector3(0, -0.42, 0.03),
        radius: 0.140
      },
      // 8. Left Leg / Thigh
      {
        type: 'capsule',
        centerA: new THREE.Vector3(-0.10, -0.38, 0.02),
        centerB: new THREE.Vector3(-0.10, -0.80, 0.02),
        radius: 0.075
      },
      // 9. Right Leg / Thigh
      {
        type: 'capsule',
        centerA: new THREE.Vector3(0.10, -0.38, 0.02),
        centerB: new THREE.Vector3(0.10, -0.80, 0.02),
        radius: 0.075
      }
    ];
  }

  /**
   * Advances the simulation by dt seconds with multiple sub-steps.
   */
  public step(dt: number = 0.016): void {
    const clampedDt = Math.min(0.033, Math.max(0.005, dt));
    const subDt = clampedDt / this.substeps;
    const subDt2 = subDt * subDt;
    this.simulationTime += clampedDt;

    // Assembly phase: sewing active from start, gravity gracefully ramped over first 0.3s
    const sewingMultiplier = 1.0;
    const gravityFactor = Math.min(1.0, Math.max(0.15, this.simulationTime * 3.0));

    for (let step = 0; step < this.substeps; step++) {
      // 1. External forces & Verlet numerical integration
      for (let i = 0; i < this.numParticles; i++) {
        if (this.invMasses[i] === 0.0) continue;
        const idx = i * 3;

        const vx = (this.positions[idx] - this.prevPositions[idx]) * this.fabric.damping;
        const vy = (this.positions[idx + 1] - this.prevPositions[idx + 1]) * this.fabric.damping;
        const vz = (this.positions[idx + 2] - this.prevPositions[idx + 2]) * this.fabric.damping;

        this.prevPositions[idx] = this.positions[idx];
        this.prevPositions[idx + 1] = this.positions[idx + 1];
        this.prevPositions[idx + 2] = this.positions[idx + 2];

        this.positions[idx] += vx;
        this.positions[idx + 1] += vy - this.gravity * gravityFactor * subDt2;
        this.positions[idx + 2] += vz;
      }

      // 1.5 Interactive User Grab (Mouse 3D Tug Tool)
      if (this.grabTarget) {
        const { targetPosition, vertexIndex, radius, strength } = this.grabTarget;
        const centerIdx = vertexIndex * 3;
        const cX = this.positions[centerIdx];
        const cY = this.positions[centerIdx + 1];
        const cZ = this.positions[centerIdx + 2];

        for (let i = 0; i < this.numParticles; i++) {
          if (this.invMasses[i] === 0.0) continue;
          const idx = i * 3;
          const dx = this.positions[idx] - cX;
          const dy = this.positions[idx + 1] - cY;
          const dz = this.positions[idx + 2] - cZ;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d <= radius) {
            const factor = Math.max(0, 1.0 - d / radius) * strength;
            this.positions[idx] += (targetPosition.x - this.positions[idx]) * factor;
            this.positions[idx + 1] += (targetPosition.y - this.positions[idx + 1]) * factor;
            this.positions[idx + 2] += (targetPosition.z - this.positions[idx + 2]) * factor;
          }
        }
      }

      // 2. Solve Sewing Constraints (Pulling seams together)
      for (let s = 0; s < this.sewingConstraints.length; s++) {
        const seam = this.sewingConstraints[s];
        const u = seam.vA;
        const v = seam.vB;

        const w1 = this.invMasses[u];
        const w2 = this.invMasses[v];
        const wSum = w1 + w2;
        if (wSum === 0.0) continue;

        const uIdx = u * 3;
        const vIdx = v * 3;

        const dx = this.positions[uIdx] - this.positions[vIdx];
        const dy = this.positions[uIdx + 1] - this.positions[vIdx + 1];
        const dz = this.positions[uIdx + 2] - this.positions[vIdx + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;

        const diff = (dist - seam.restLength) / dist;
        const force = (diff * dist) / wSum * seam.stiffness * sewingMultiplier;

        const corrX = dx * (force / dist);
        const corrY = dy * (force / dist);
        const corrZ = dz * (force / dist);

        if (w1 > 0) {
          this.positions[uIdx] -= corrX * w1;
          this.positions[uIdx + 1] -= corrY * w1;
          this.positions[uIdx + 2] -= corrZ * w1;
        }
        if (w2 > 0) {
          this.positions[vIdx] += corrX * w2;
          this.positions[vIdx + 1] += corrY * w2;
          this.positions[vIdx + 2] += corrZ * w2;
        }
      }

      // 3. Solve Stretch Constraints (Warp & Weft compliance)
      const stretchCompliance = (1.0 - this.fabric.warpStiffness) * 0.0002;
      const alphaStretch = stretchCompliance / subDt2;

      for (let e = 0; e < this.numEdges; e++) {
        const u = this.edgeIndices[e * 2];
        const v = this.edgeIndices[e * 2 + 1];

        const w1 = this.invMasses[u];
        const w2 = this.invMasses[v];
        const wSum = w1 + w2;
        if (wSum === 0.0) continue;

        const uIdx = u * 3;
        const vIdx = v * 3;

        const dx = this.positions[uIdx] - this.positions[vIdx];
        const dy = this.positions[uIdx + 1] - this.positions[vIdx + 1];
        const dz = this.positions[uIdx + 2] - this.positions[vIdx + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;

        const diff = (dist - this.restLengths[e]) / dist;
        const lambda = (diff * dist) / (wSum + alphaStretch);

        const corrX = dx * (lambda / dist);
        const corrY = dy * (lambda / dist);
        const corrZ = dz * (lambda / dist);

        if (w1 > 0) {
          this.positions[uIdx] -= corrX * w1;
          this.positions[uIdx + 1] -= corrY * w1;
          this.positions[uIdx + 2] -= corrZ * w1;
        }
        if (w2 > 0) {
          this.positions[vIdx] += corrX * w2;
          this.positions[vIdx + 1] += corrY * w2;
          this.positions[vIdx + 2] += corrZ * w2;
        }
      }

      // 4. Solve Bending Constraints (Crease resistance against initial rest distance)
      const bendCompliance = (1.0 - this.fabric.bendingStiffness) * 0.005;
      const alphaBend = bendCompliance / subDt2;

      for (let b = 0; b < this.bendingConstraints.length; b++) {
        const bc = this.bendingConstraints[b];
        const u = bc.v2; // wing 1
        const v = bc.v3; // wing 2

        const w1 = this.invMasses[u];
        const w2 = this.invMasses[v];
        const wSum = w1 + w2;
        if (wSum === 0.0) continue;

        const uIdx = u * 3;
        const vIdx = v * 3;

        const dx = this.positions[uIdx] - this.positions[vIdx];
        const dy = this.positions[uIdx + 1] - this.positions[vIdx + 1];
        const dz = this.positions[uIdx + 2] - this.positions[vIdx + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;

        // Compare against rest distance between wings
        const diff = (dist - bc.restLength) / dist;
        const lambda = (diff * dist) / (wSum + alphaBend);
        const corrX = dx * (lambda / dist);
        const corrY = dy * (lambda / dist);
        const corrZ = dz * (lambda / dist);

        if (w1 > 0) {
          this.positions[uIdx] -= corrX * w1;
          this.positions[uIdx + 1] -= corrY * w1;
          this.positions[uIdx + 2] -= corrZ * w1;
        }
        if (w2 > 0) {
          this.positions[vIdx] += corrX * w2;
          this.positions[vIdx + 1] += corrY * w2;
          this.positions[vIdx + 2] += corrZ * w2;
        }
      }

      // 5. Collisions (Avatar Body & Ground) with Coulomb Friction
      const clearDist = this.fabric.collisionThickness;

      for (let i = 0; i < this.numParticles; i++) {
        if (this.invMasses[i] === 0.0) continue;
        const idx = i * 3;

        // Ground collision plane
        if (this.positions[idx + 1] < -0.84) {
          this.positions[idx + 1] = -0.84;
          this.prevPositions[idx + 1] = -0.84;
        }

        // Avatar Colliders
        for (const col of this.avatarColliders) {
          let cx = 0, cy = 0, cz = 0;
          if (col.type === 'sphere') {
            cx = col.centerA.x;
            cy = col.centerA.y;
            cz = col.centerA.z;
          } else if (col.type === 'capsule' && col.centerB) {
            const abX = col.centerB.x - col.centerA.x;
            const abY = col.centerB.y - col.centerA.y;
            const abZ = col.centerB.z - col.centerA.z;
            const abLen2 = abX * abX + abY * abY + abZ * abZ;

            const apX = this.positions[idx] - col.centerA.x;
            const apY = this.positions[idx + 1] - col.centerA.y;
            const apZ = this.positions[idx + 2] - col.centerA.z;

            const t = Math.max(0, Math.min(1, (apX * abX + apY * abY + apZ * abZ) / abLen2));
            cx = col.centerA.x + abX * t;
            cy = col.centerA.y + abY * t;
            cz = col.centerA.z + abZ * t;
          }

          const dx = this.positions[idx] - cx;
          const dy = this.positions[idx + 1] - cy;
          const dz = this.positions[idx + 2] - cz;
          const d2 = dx * dx + dy * dy + dz * dz;
          const targetR = col.radius + clearDist;

          if (d2 < targetR * targetR) {
            const d = Math.sqrt(d2) || 0.0001;
            const nx = dx / d;
            const ny = dy / d;
            const nz = dz / d;
            const penetration = targetR - d;

            // 1. Project position outside collider
            this.positions[idx] += nx * penetration;
            this.positions[idx + 1] += ny * penetration;
            this.positions[idx + 2] += nz * penetration;

            // 2. Adjust velocity (prevPositions) to account for normal stop & static/kinetic friction
            const vx = this.positions[idx] - this.prevPositions[idx];
            const vy = this.positions[idx + 1] - this.prevPositions[idx + 1];
            const vz = this.positions[idx + 2] - this.prevPositions[idx + 2];

            const vDotN = vx * nx + vy * ny + vz * nz;
            // Eliminate normal velocity penetrating inward
            const vNormX = Math.min(0, vDotN) * nx;
            const vNormY = Math.min(0, vDotN) * ny;
            const vNormZ = Math.min(0, vDotN) * nz;

            // Apply realistic static & kinetic friction to tangential velocity
            const frictionFactor = Math.min(1.0, Math.max(0.0, this.fabric.friction));
            const rawTangX = vx - vDotN * nx;
            const rawTangY = vy - vDotN * ny;
            const rawTangZ = vz - vDotN * nz;
            const tangSpeed2 = rawTangX * rawTangX + rawTangY * rawTangY + rawTangZ * rawTangZ;
            const staticThreshold = 0.008; // 8 mm static stick limit on supporting avatar surfaces

            if (ny > 0.15 && tangSpeed2 < staticThreshold * staticThreshold * frictionFactor) {
              // Static friction: lock resting cloth in place on supporting surfaces (shoulders, chest)
              this.prevPositions[idx] = this.positions[idx];
              this.prevPositions[idx + 1] = this.positions[idx + 1];
              this.prevPositions[idx + 2] = this.positions[idx + 2];
            } else {
              // Kinetic friction: dynamic tangential slide damping
              const vTangX = rawTangX * (1.0 - frictionFactor);
              const vTangY = rawTangY * (1.0 - frictionFactor);
              const vTangZ = rawTangZ * (1.0 - frictionFactor);

              this.prevPositions[idx] = this.positions[idx] - (vTangX + vNormX);
              this.prevPositions[idx + 1] = this.positions[idx + 1] - (vTangY + vNormY);
              this.prevPositions[idx + 2] = this.positions[idx + 2] - (vTangZ + vNormZ);
            }
          }
        }
      }
    }

    // 6. Push updated vertex positions to GPU
    const posAttr = this.geometry.attributes.position;
    for (let i = 0; i < this.positions.length; i++) {
      posAttr.array[i] = this.positions[i];
    }
    posAttr.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  public reset(): void {
    this.positions.set(this.originalPositions);
    this.prevPositions.set(this.originalPositions);
    this.simulationTime = 0;

    const posAttr = this.geometry.attributes.position;
    posAttr.array.set(this.originalPositions);
    posAttr.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  public togglePinVertex(idx: number): boolean {
    if (idx < 0 || idx >= this.numParticles) return false;
    if (this.pinnedIndices.has(idx)) {
      this.pinnedIndices.delete(idx);
      const particleMass = Math.max(0.01, (this.fabric.arealDensityGsm / 1000) * 0.02);
      this.invMasses[idx] = 1.0 / particleMass;
      return false; // unpinned
    } else {
      this.pinnedIndices.add(idx);
      this.invMasses[idx] = 0.0;
      return true; // pinned
    }
  }

  public isPinned(idx: number): boolean {
    return this.pinnedIndices.has(idx);
  }

  public setGrabTarget(
    vertexIndex: number,
    targetPosition: THREE.Vector3,
    radius: number = 0.09,
    strength: number = 0.96
  ): void {
    this.grabTarget = {
      vertexIndex,
      targetPosition,
      radius,
      strength
    };
  }

  public clearGrabTarget(): void {
    this.grabTarget = null;
  }

  /**
   * Evaluates XPBD strain (stretch/compression) across all edges
   * and returns an RGB Float32Array for Three.js vertex coloring.
   */
  public computeStrainColors(): Float32Array {
    const colors = new Float32Array(this.numParticles * 3);
    const edgeCounts = new Uint8Array(this.numParticles);
    const accumulatedStrain = new Float32Array(this.numParticles);

    for (let e = 0; e < this.numEdges; e++) {
      const u = this.edgeIndices[e * 2];
      const v = this.edgeIndices[e * 2 + 1];
      const uIdx = u * 3;
      const vIdx = v * 3;

      const dx = this.positions[uIdx] - this.positions[vIdx];
      const dy = this.positions[uIdx + 1] - this.positions[vIdx + 1];
      const dz = this.positions[uIdx + 2] - this.positions[vIdx + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;

      const strain = (dist - this.restLengths[e]) / (this.restLengths[e] || 1.0);
      accumulatedStrain[u] += strain;
      edgeCounts[u]++;
      accumulatedStrain[v] += strain;
      edgeCounts[v]++;
    }

    for (let i = 0; i < this.numParticles; i++) {
      const avgStrain = edgeCounts[i] > 0 ? accumulatedStrain[i] / edgeCounts[i] : 0;
      const cIdx = i * 3;

      if (avgStrain < 0.0) {
        // Slack / Compression (Blue)
        const t = Math.min(1.0, Math.abs(avgStrain) * 5.0);
        colors[cIdx] = 0.1 * (1 - t);
        colors[cIdx + 1] = 0.4 + 0.2 * (1 - t);
        colors[cIdx + 2] = 0.8 + 0.2 * t;
      } else if (avgStrain <= 0.06) {
        // Comfortable Fit (Green)
        const t = avgStrain / 0.06;
        colors[cIdx] = 0.1 + 0.6 * t;
        colors[cIdx + 1] = 0.85;
        colors[cIdx + 2] = 0.2 * (1 - t);
      } else if (avgStrain <= 0.15) {
        // Moderate Tension (Yellow to Orange)
        const t = (avgStrain - 0.06) / 0.09;
        colors[cIdx] = 0.95;
        colors[cIdx + 1] = 0.85 - 0.45 * t;
        colors[cIdx + 2] = 0.05;
      } else {
        // High Strain / Tight (Red)
        colors[cIdx] = 0.95;
        colors[cIdx + 1] = 0.1;
        colors[cIdx + 2] = 0.1;
      }
    }

    return colors;
  }

  /**
   * Evaluates proximity / contact pressure against avatar colliders
   * and returns an RGB Float32Array for Three.js vertex coloring.
   */
  public computeFitColors(): Float32Array {
    const colors = new Float32Array(this.numParticles * 3);

    for (let i = 0; i < this.numParticles; i++) {
      const idx = i * 3;
      const pX = this.positions[idx];
      const pY = this.positions[idx + 1];
      const pZ = this.positions[idx + 2];

      let minClearance = Infinity;

      for (const col of this.avatarColliders) {
        if (col.type === 'sphere') {
          const dx = pX - col.centerA.x;
          const dy = pY - col.centerA.y;
          const dz = pZ - col.centerA.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const clearance = dist - col.radius;
          if (clearance < minClearance) minClearance = clearance;
        } else if (col.type === 'capsule' && col.centerB) {
          const abX = col.centerB.x - col.centerA.x;
          const abY = col.centerB.y - col.centerA.y;
          const abZ = col.centerB.z - col.centerA.z;
          const abLen2 = abX * abX + abY * abY + abZ * abZ;

          const apX = pX - col.centerA.x;
          const apY = pY - col.centerA.y;
          const apZ = pZ - col.centerA.z;

          const t = Math.max(0, Math.min(1, (apX * abX + apY * abY + apZ * abZ) / abLen2));
          const closestX = col.centerA.x + abX * t;
          const closestY = col.centerA.y + abY * t;
          const closestZ = col.centerA.z + abZ * t;

          const dx = pX - closestX;
          const dy = pY - closestY;
          const dz = pZ - closestZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const clearance = dist - col.radius;
          if (clearance < minClearance) minClearance = clearance;
        }
      }

      const cIdx = i * 3;
      if (minClearance < 0.005) {
        // Tight Contact (Red)
        colors[cIdx] = 0.95;
        colors[cIdx + 1] = 0.15;
        colors[cIdx + 2] = 0.15;
      } else if (minClearance <= 0.025) {
        // Ideal Ease (Green)
        colors[cIdx] = 0.15;
        colors[cIdx + 1] = 0.85;
        colors[cIdx + 2] = 0.25;
      } else {
        // Loose Drape (Blue)
        colors[cIdx] = 0.2;
        colors[cIdx + 1] = 0.5;
        colors[cIdx + 2] = 0.95;
      }
    }

    return colors;
  }
}
