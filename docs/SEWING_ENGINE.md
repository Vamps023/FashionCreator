# Sewing Engine & Constraint Architecture

## 1. Overview
In digital garment design (CLO 3D / Marvelous Designer), patterns are not glued into a single static shell; they are individual fabric cuts stitched together along designated edges. The Sewing Engine (`packages/garment-engine/src/meshing/patternMeshAssembler.ts` and `packages/simulation-adapter/src/xpbdClothSolver.ts`) manages seam graphs, directional edge pairings, and dynamic sewing spring constraints that pull 2D patterns shut around 3D bodies.

---

## 2. Seam Connection Specification (`@fashion-studio/garment-schema`)

Every seam is defined by two connected pattern pieces, the segment indices along their boundaries, and directional alignment metadata:

```typescript
export interface SewingConnection {
  id: string;
  pieceAId: string;
  segmentAIndex: number;
  pieceBId: string;
  segmentBIndex: number;
  orientation: 'normal' | 'reversed'; // Directed seam alignment
  elasticity?: number;               // 0 = rigid thread, >0 = elastic gathering
  tackStitch?: boolean;              // Basting / temporary tack
}
```

---

## 3. Directional Seam Orientation (`normal` vs `reversed`)

### 3.1 The Winding Problem
When two 2D pattern panels face each other in 3D:
- Front Panel: Facing positive Z ($+Z$). Counter-clockwise outline points traverse the left seam bottom-to-top.
- Back Panel: Facing negative Z ($-Z$) or flipped towards front. Its matching edge may traverse top-to-bottom or bottom-to-top depending on drafting orientation.
- If vertices are paired directly index-by-index ($v_A[i] \leftrightarrow v_B[i]$), the seam can create an accidental twisted "hour-glass" or "bowtie" constraint.

### 3.2 Seam Mapping Algorithm (`patternMeshAssembler.ts`)
```typescript
const countA = vertsA.length;
const countB = vertsB.length;
const maxCount = Math.max(countA, countB);

for (let s = 0; s < maxCount; s++) {
  const tA = countA > 1 ? s / (maxCount - 1) : 0;
  const idxA = Math.min(countA - 1, Math.round(tA * (countA - 1)));
  
  // Apply orientation reversal if configured
  const tB = seam.orientation === 'reversed' ? 1.0 - tA : tA;
  const idxB = Math.min(countB - 1, Math.round(tB * (countB - 1)));

  sewingConstraints.push({
    vertexA: vertsA[idxA],
    vertexB: vertsB[idxB],
    targetLength: 0.0, // Fully pulled together
    seamId: seam.id
  });
}
```
This continuous normalized parameterization $t \in [0, 1]$ smoothly handles seam edges with differing vertex densities (e.g. gathering or eased sleeve caps).

---

## 4. Seam Length Validation & Ratio Tolerances

A valid seam requires compatible physical lengths between connected edges:
- **Ratio Metric:** $R = \frac{\text{length}(A)}{\text{length}(B)}$
- **Target:** $R \in [0.95, 1.05]$ for standard straight seams (side seams, shoulder seams).
- **Gathering / Ease:** $R \in [1.05, 1.25]$ for gathered waistbands, puffed sleeves, or eased armholes.
- **Error Flag:** $R < 0.70$ or $R > 1.40$ highlights an alert in the Sewing Inspector, warning the designer of puckering or pattern drafting mismatch.

---

## 5. Dynamic Sewing Force Ramp

Pulling unsewn panels from their flat arrangement in space into 3D contact using full stiffness instantly can induce severe numerical explosions in explicit/XPBD integrators. 
To prevent instability, `GarmentClothSolver` ramps the sewing spring multiplier progressively:

$$\text{sewingMultiplier} = \min(1.0, \, t_{\text{sim}} \times 0.85)$$

During the first 1.2 seconds of simulation:
1. Vertices accelerate smoothly across the spatial air gap toward their sewing partners.
2. Avatar colliders push the fabric outward, preventing inside-out folding.
3. Once the seams close ($\text{dist} < 2\,\text{mm}$), the sewing springs lock into rigid tensile constraints.

---

## 6. Interactive Sewing UI

- **Direct Stitching Tool:** In `Pattern CAD`, select the `Sew` tool (Scissors icon or `S`), click Segment 1 on Piece A, and click Segment 2 on Piece B.
- **Seam Inspector (`RightSidebar.tsx`):**
  - Displays all active seams with their connected pieces and segments.
  - One-click `Reverse Direction` button to flip seam orientation if stitches cross.
  - Delete button to break seams.
