import * as THREE from 'three';

export interface ClothPhysicalProperties {
  stretchCompliance: number; // XPBD compliance (0 = stiff, >0 = elastic)
  bendCompliance: number;
  damping: number;
  gravity: number; // m/s^2, e.g. 9.81
  iterations: number;
}

export class XPBDClothSolver {
  private positions: Float32Array;
  private prevPositions: Float32Array;
  private invMasses: Float32Array;
  private edgeIndices: Uint32Array;
  private restLengths: Float32Array;
  private numParticles: number;
  private numEdges: number;
  private geometry: THREE.BufferGeometry;
  private isRunning: boolean = false;

  public properties: ClothPhysicalProperties = {
    stretchCompliance: 0.0001,
    bendCompliance: 0.005,
    damping: 0.985,
    gravity: 9.81,
    iterations: 8
  };

  constructor(geometry: THREE.BufferGeometry, fixedVertexIndices: number[] = []) {
    this.geometry = geometry;
    const posAttr = geometry.attributes.position;
    this.numParticles = posAttr.count;

    this.positions = new Float32Array(posAttr.array);
    this.prevPositions = new Float32Array(posAttr.array);
    this.invMasses = new Float32Array(this.numParticles);

    // Default mass = 1.0 (invMass = 1.0)
    for (let i = 0; i < this.numParticles; i++) {
      this.invMasses[i] = 1.0;
    }
    // Anchor specified fixed vertices (e.g. collar or shoulders)
    for (const idx of fixedVertexIndices) {
      if (idx < this.numParticles) {
        this.invMasses[idx] = 0.0;
      }
    }

    // Build unique edge constraints from index
    const edgesMap = new Map<string, [number, number]>();
    const indices = geometry.index ? geometry.index.array : [];

    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i];
      const b = indices[i + 1];
      const c = indices[i + 2];
      this.addEdge(edgesMap, a, b);
      this.addEdge(edgesMap, b, c);
      this.addEdge(edgesMap, c, a);
    }

    this.numEdges = edgesMap.size;
    this.edgeIndices = new Uint32Array(this.numEdges * 2);
    this.restLengths = new Float32Array(this.numEdges);

    let edgeIdx = 0;
    edgesMap.forEach(([u, v]) => {
      this.edgeIndices[edgeIdx * 2] = u;
      this.edgeIndices[edgeIdx * 2 + 1] = v;

      const dx = this.positions[u * 3] - this.positions[v * 3];
      const dy = this.positions[u * 3 + 1] - this.positions[v * 3 + 1];
      const dz = this.positions[u * 3 + 2] - this.positions[v * 3 + 2];
      this.restLengths[edgeIdx] = Math.sqrt(dx * dx + dy * dy + dz * dz);
      edgeIdx++;
    });
  }

  private addEdge(map: Map<string, [number, number]>, a: number, b: number) {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    if (!map.has(key)) {
      map.set(key, [a, b]);
    }
  }

  public step(dt: number, avatarColliders: { center: THREE.Vector3; radius: number }[] = []): void {
    if (dt <= 0 || dt > 0.05) dt = 0.016; // Clamp time step for numerical stability
    const dt2 = dt * dt;

    // 1. External forces & Verlet position prediction
    for (let i = 0; i < this.numParticles; i++) {
      if (this.invMasses[i] === 0.0) continue;

      const idx = i * 3;
      // Velocity = (pos - prevPos) * damping
      const vx = (this.positions[idx] - this.prevPositions[idx]) * this.properties.damping;
      const vy = (this.positions[idx + 1] - this.prevPositions[idx + 1]) * this.properties.damping;
      const vz = (this.positions[idx + 2] - this.prevPositions[idx + 2]) * this.properties.damping;

      this.prevPositions[idx] = this.positions[idx];
      this.prevPositions[idx + 1] = this.positions[idx + 1];
      this.prevPositions[idx + 2] = this.positions[idx + 2];

      // Gravity applied on Y
      this.positions[idx] += vx;
      this.positions[idx + 1] += vy - this.properties.gravity * dt2;
      this.positions[idx + 2] += vz;
    }

    // 2. XPBD Constraint Projection (Sub-iterations)
    for (let iter = 0; iter < this.properties.iterations; iter++) {
      for (let e = 0; e < this.numEdges; e++) {
        const u = this.edgeIndices[e * 2];
        const v = this.edgeIndices[e * 2 + 1];

        const w1 = this.invMasses[u];
        const w2 = this.invMasses[v];
        const wSum = w1 + w2;
        if (wSum === 0.0) continue;

        const uIdx = u * 3;
        const vIdx = v * 3;

        let dx = this.positions[uIdx] - this.positions[vIdx];
        let dy = this.positions[uIdx + 1] - this.positions[vIdx + 1];
        let dz = this.positions[uIdx + 2] - this.positions[vIdx + 2];

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
        const diff = (dist - this.restLengths[e]) / dist;

        // Compliance correction factor
        const alpha = this.properties.stretchCompliance / dt2;
        const lambda = (diff * dist) / (wSum + alpha);

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

      // 3. Avatar Collision Handling
      for (let i = 0; i < this.numParticles; i++) {
        if (this.invMasses[i] === 0.0) continue;
        const idx = i * 3;

        // Ground collision plane
        if (this.positions[idx + 1] < -0.84) {
          this.positions[idx + 1] = -0.84;
        }

        // Avatar sphere/capsule colliders
        for (const col of avatarColliders) {
          const dx = this.positions[idx] - col.center.x;
          const dy = this.positions[idx + 1] - col.center.y;
          const dz = this.positions[idx + 2] - col.center.z;
          const d2 = dx * dx + dy * dy + dz * dz;

          if (d2 < col.radius * col.radius) {
            const d = Math.sqrt(d2) || 0.001;
            const push = (col.radius - d) / d;
            this.positions[idx] += dx * push;
            this.positions[idx + 1] += dy * push;
            this.positions[idx + 2] += dz * push;
          }
        }
      }
    }

    // 4. Update GPU mesh attributes
    const posAttr = this.geometry.attributes.position;
    for (let i = 0; i < this.positions.length; i++) {
      posAttr.array[i] = this.positions[i];
    }
    posAttr.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  public reset(originalGeometry: THREE.BufferGeometry): void {
    const orig = originalGeometry.attributes.position.array;
    this.positions.set(orig);
    this.prevPositions.set(orig);
    const posAttr = this.geometry.attributes.position;
    posAttr.array.set(orig);
    posAttr.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }
}
