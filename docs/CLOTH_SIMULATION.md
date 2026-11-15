# XPBD Cloth Simulation Engine

## 1. Overview
The Cloth Simulation Engine (`packages/simulation-adapter/src/xpbdClothSolver.ts`) implements Extended Position-Based Dynamics (XPBD) (Macklin et al., 2016; Müller et al., 2007) tailored for real-time browser execution. It solves cloth motion, gravitational draping, edge stretch, wrinkle bending, sewing spring forces, and avatar body collisions directly on the GPU/CPU at 60 FPS.

---

## 2. XPBD Formulation & Equations

### 2.1 Time Integration (Verlet Predictor)
For each particle $i$ with position $\mathbf{x}_i$, velocity $\mathbf{v}_i$, and inverse mass $w_i = \frac{1}{m_i}$:
1. Compute external forces (gravity $\mathbf{g} = (0, -9.81, 0)$):
   $$\mathbf{v}_i^* = \mathbf{v}_i + \Delta t \, \mathbf{g}$$
   $$\mathbf{v}_i^* = \mathbf{v}_i^* \cdot d_{\text{damping}}$$
2. Predict candidate positions:
   $$\mathbf{p}_i = \mathbf{x}_i + \Delta t \, \mathbf{v}_i^*$$

### 2.2 Constraint Projection with Compliance
XPBD introduces physical compliance $\alpha = \frac{1}{k \Delta t^2}$, making constraint stiffness independent of time step size and substep counts.
For a constraint $C(\mathbf{p}) = 0$, the Lagrange multiplier update is:

$$\Delta \lambda = \frac{-C(\mathbf{p}) - \alpha \lambda}{\sum_j w_j |\nabla C_j(\mathbf{p})|^2 + \alpha}$$

The position correction for particle $i$ is:

$$\Delta \mathbf{p}_i = w_i \nabla C_i(\mathbf{p}) \, \Delta \lambda$$

---

## 3. Constraint System

### 3.1 Distance / Stretch Constraints
Maintains the rest length $L_0$ along mesh edges between particles $A$ and $B$:
$$C_{\text{dist}}(\mathbf{p}_A, \mathbf{p}_B) = |\mathbf{p}_A - \mathbf{p}_B| - L_0$$
- $\nabla C_A = \frac{\mathbf{p}_A - \mathbf{p}_B}{|\mathbf{p}_A - \mathbf{p}_B|} = \mathbf{n}$
- $\nabla C_B = -\mathbf{n}$
- Compliance is modulated by fabric `warpStiffness` and `weftStiffness`.

### 3.2 Isometric Bending Constraints (Dihedral Wing Hinge)
Bending resistance controls how fabric drapes and creases. For two adjacent triangles sharing an edge $(v_0, v_1)$ with outer wing vertices $v_2$ and $v_3$:
- The solver projects position corrections onto $v_2$ and $v_3$ to restore the rest dihedral angle $\theta_0$.
- High bending stiffness (e.g., Raw Denim, $\beta = 0.92$) creates wide, rigid folds.
- Low bending stiffness (e.g., Silk Satin, $\beta = 0.15$) produces fine, fluid ripples.

### 3.3 Dynamic Sewing Springs
Connects boundary vertices on matching pattern seams across 3D space:
$$C_{\text{sew}}(\mathbf{p}_A, \mathbf{p}_B) = |\mathbf{p}_A - \mathbf{p}_B|$$
$$\Delta \mathbf{p}_A = -0.5 \cdot (\mathbf{p}_A - \mathbf{p}_B) \cdot k_{\text{sew}} \cdot \text{multiplier}$$
$$\Delta \mathbf{p}_B = +0.5 \cdot (\mathbf{p}_A - \mathbf{p}_B) \cdot k_{\text{sew}} \cdot \text{multiplier}$$
As simulation progresses, sewing springs draw open fabric edges together until seams close completely.

---

## 4. Collision Detection & Response

### 4.1 Avatar Mannequin Colliders
The virtual avatar is modeled using an analytical bounding hierarchy of spheres and capsules:
- **Chest & Torso:** Sphere colliders at $(0, 0.20, 0, r=0.165\,\text{m})$ and $(0, -0.18, 0, r=0.155\,\text{m})$.
- **Neck & Head:** Capsule/Sphere at $(0, 0.52, 0, r=0.11\,\text{m})$.
- **Shoulders & Arms:** Spheres at $(\pm 0.22, 0.38, 0, r=0.10\,\text{m})$.

For each particle $\mathbf{p}$:
1. Compute the distance to the collider surface:
   $$\mathbf{d} = \mathbf{p} - \mathbf{c}_{\text{closest}}$$
   $$\text{dist} = |\mathbf{d}|$$
2. If $\text{dist} < r_{\text{collider}} + \text{collisionThickness}$:
   $$\mathbf{p} \leftarrow \mathbf{c}_{\text{closest}} + \frac{\mathbf{d}}{\text{dist}} (r_{\text{collider}} + \text{collisionThickness})$$
   Apply Coulomb surface friction to tangential velocity.

### 4.2 Ground Plane Collision
If particle $y < 0.005\,\text{m}$, clamp $y = 0.005\,\text{m}$ and apply ground friction ($0.5$).

---

## 5. Physical Fabric Presets

Physical behaviors are decoupled from visual PBR colors. Available presets in `PHYSICAL_FABRIC_PRESETS`:

| Preset ID | Name | GSM | Warp Stiffness | Weft Stiffness | Bending Resistance | Behavior |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `heavy-cotton-fleece` | French Terry Fleece | 380 | 0.85 | 0.75 | 0.70 | Heavy, structured hoodie drape |
| `lightweight-cotton` | Cotton Jersey | 160 | 0.70 | 0.55 | 0.35 | Soft, relaxed T-shirt drape |
| `raw-rigid-denim` | Raw Selvedge Denim | 420 | 0.95 | 0.90 | 0.92 | Crisp, rigid boxy silhouette |
| `fluid-silk-satin` | Silk Satin | 95 | 0.60 | 0.60 | 0.15 | Flowing, highly creased folds |
| `ribbed-knit-trim` | Ribbed Knit Trim | 260 | 0.80 | 0.35 | 0.40 | High lateral elasticity for cuffs/hems |

---

## 6. Execution Loop & Substepping

To guarantee stability with stiff fabrics and strong sewing forces:
- **Physics Framerate:** 60 Hz ($\Delta t = 16.6\,\text{ms}$).
- **Substeps:** $S = 12$ sub-iterations per render frame ($\Delta t_{\text{sub}} \approx 1.38\,\text{ms}$).
- **Post-Step:** Recompute vertex normals via Three.js `geometry.computeVertexNormals()` for smooth PBR lighting reflections.
