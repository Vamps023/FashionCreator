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
  restAngle: number;
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

  // Solver Parameters
  public fabric: SolverFabricConfig = {
    warpStiffness: 0.85,
    weftStiffness: 0.75,
    shearStiffness: 0.65,
    bendingStiffness: 0.6,
    arealDensityGsm: 280,
    damping: 0.985,
    friction: 0.45,
    collisionThickness: 0.012
  };

  public gravity: number = 9.81; // m/s^2
  public substeps: number = 12;
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

    // Extract Bending Constraints from interior shared edges
    edgeToTriangles.forEach(({ tri1Wing, tri2Wing, v0, v1 }) => {
      if (tri1Wing !== undefined && tri2Wing !== undefined) {
        this.bendingConstraints.push({
          v0,
          v1,
          v2: tri1Wing,
          v3: tri2Wing,
          restAngle: 0.0
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
   */
  public setupDefaultAvatarColliders(): void {
    this.avatarColliders = [
      // 1. Torso Center Ellipsoid / Capsule
      {
        type: 'capsule',
        centerA: new THREE.Vector3(0, -0.25, 0),
        centerB: new THREE.Vector3(0, 0.32, 0),
        radius: 0.175
      },
      // 2. Chest Bulge
      {
        type: 'sphere',
        centerA: new THREE.Vector3(0, 0.22, 0.04),
        radius: 0.165
      },
      // 3. Neck
      {
        type: 'sphere',
        centerA: new THREE.Vector3(0, 0.44, 0),
        radius: 0.08
      },
      // 4. Left Shoulder & Upper Arm
      {
        type: 'capsule',
        centerA: new THREE.Vector3(-0.20, 0.32, 0),
        centerB: new THREE.Vector3(-0.45, 0.05, 0),
        radius: 0.095
      },
      // 5. Right Shoulder & Upper Arm
      {
        type: 'capsule',
        centerA: new THREE.Vector3(0.20, 0.32, 0),
        centerB: new THREE.Vector3(0.45, 0.05, 0),
        radius: 0.095
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

    // Gradual sewing force progression during the first seconds
    const sewingMultiplier = Math.min(1.0, this.simulationTime * 0.85);

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
        this.positions[idx + 1] += vy - this.gravity * subDt2;
        this.positions[idx + 2] += vz;
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

      // 4. Solve Bending Constraints (Crease resistance)
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

        // Approximate isometric bend constraint
        const lambda = (dist * 0.05) / (wSum + alphaBend);
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

      // 5. Collisions (Avatar Body & Ground)
      const clearDist = this.fabric.collisionThickness;

      for (let i = 0; i < this.numParticles; i++) {
        if (this.invMasses[i] === 0.0) continue;
        const idx = i * 3;

        // Ground collision plane
        if (this.positions[idx + 1] < -0.84) {
          this.positions[idx + 1] = -0.84;
        }

        // Avatar Colliders
        for (const col of this.avatarColliders) {
          if (col.type === 'sphere') {
            const dx = this.positions[idx] - col.centerA.x;
            const dy = this.positions[idx + 1] - col.centerA.y;
            const dz = this.positions[idx + 2] - col.centerA.z;
            const d2 = dx * dx + dy * dy + dz * dz;
            const targetR = col.radius + clearDist;

            if (d2 < targetR * targetR) {
              const d = Math.sqrt(d2) || 0.001;
              const push = (targetR - d) / d;
              this.positions[idx] += dx * push;
              this.positions[idx + 1] += dy * push;
              this.positions[idx + 2] += dz * push;
            }
          } else if (col.type === 'capsule' && col.centerB) {
            // Closest point on line segment A-B
            const abX = col.centerB.x - col.centerA.x;
            const abY = col.centerB.y - col.centerA.y;
            const abZ = col.centerB.z - col.centerA.z;
            const abLen2 = abX * abX + abY * abY + abZ * abZ;

            const apX = this.positions[idx] - col.centerA.x;
            const apY = this.positions[idx + 1] - col.centerA.y;
            const apZ = this.positions[idx + 2] - col.centerA.z;

            const t = Math.max(0, Math.min(1, (apX * abX + apY * abY + apZ * abZ) / abLen2));
            const closestX = col.centerA.x + abX * t;
            const closestY = col.centerA.y + abY * t;
            const closestZ = col.centerA.z + abZ * t;

            const dx = this.positions[idx] - closestX;
            const dy = this.positions[idx + 1] - closestY;
            const dz = this.positions[idx + 2] - closestZ;
            const d2 = dx * dx + dy * dy + dz * dz;
            const targetR = col.radius + clearDist;

            if (d2 < targetR * targetR) {
              const d = Math.sqrt(d2) || 0.001;
              const push = (targetR - d) / d;
              this.positions[idx] += dx * push;
              this.positions[idx + 1] += dy * push;
              this.positions[idx + 2] += dz * push;
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
}
