import { GarmentParameters } from '@fashion-studio/garment-schema';
import { PatternPanel, PatternDocument } from './types';

/**
 * Generates parametric 2D sewing patterns for a hoodie based on input measurements.
 */
export function generateHoodiePatterns(
  garmentId: string,
  params: GarmentParameters
): PatternDocument {
  const L = params.bodyLength; // mm, e.g. 720
  const W = params.chestWidth / 2; // mm half-chest, e.g. 310
  const S = params.sleeveLength; // mm, e.g. 650
  const armholeDepth = 240;
  const neckDropFront = 85;
  const neckDropBack = 35;
  const neckWidth = 95;

  const panels: PatternPanel[] = [];

  // --- 1. FRONT BODICE PANEL ---
  const frontPoints: [number, number][] = [
    [0, 0], // Center bottom
    [W, 0], // Bottom side seam
    [W, L - armholeDepth], // Underarm point
    [W - 40, L - 40], // Shoulder corner
    [neckWidth, L - 25], // Neck shoulder point
    [0, L - neckDropFront], // Center front neck drop
    [0, 0] // Close contour
  ];
  panels.push({
    id: 'panel-front-bodice',
    name: 'Front Bodice (Cut 1 on fold)',
    category: 'bodice',
    points: frontPoints,
    edges: [],
    cutQuantity: 1,
    grainLine: { start: [W * 0.3, 50], end: [W * 0.3, L - 100] },
    dimensionsMm: { width: W, height: L }
  });

  // --- 2. BACK BODICE PANEL ---
  const backPoints: [number, number][] = [
    [0, 0],
    [W, 0],
    [W, L - armholeDepth],
    [W - 40, L - 35],
    [neckWidth, L - 20],
    [0, L - neckDropBack],
    [0, 0]
  ];
  panels.push({
    id: 'panel-back-bodice',
    name: 'Back Bodice (Cut 1 on fold)',
    category: 'bodice',
    points: backPoints,
    edges: [],
    cutQuantity: 1,
    grainLine: { start: [W * 0.3, 50], end: [W * 0.3, L - 100] },
    dimensionsMm: { width: W, height: L }
  });

  // --- 3. SLEEVE PANEL ---
  const bicepWidth = 230;
  const wristWidth = 130;
  const capHeight = 140;
  const sleevePoints: [number, number][] = [
    [-wristWidth / 2, 0],
    [wristWidth / 2, 0],
    [bicepWidth / 2, S - capHeight],
    [0, S], // Sleeve crown top
    [-bicepWidth / 2, S - capHeight],
    [-wristWidth / 2, 0]
  ];
  panels.push({
    id: 'panel-sleeve-pair',
    name: 'Sleeve (Cut 2 mirrored)',
    category: 'sleeve',
    points: sleevePoints,
    edges: [],
    cutQuantity: 2,
    grainLine: { start: [0, 50], end: [0, S - 80] },
    dimensionsMm: { width: bicepWidth, height: S }
  });

  // --- 4. HOOD COWL PANEL ---
  const hoodH = 370;
  const hoodW = 270;
  const hoodPoints: [number, number][] = [
    [0, 0], // Neck point
    [hoodW, 0], // Front neck point
    [hoodW - 20, hoodH * 0.7], // Forehead curve
    [hoodW * 0.5, hoodH], // Crown apex
    [0, hoodH * 0.9], // Back skull curve
    [0, 0]
  ];
  panels.push({
    id: 'panel-hood-pair',
    name: 'Hood Cowl (Cut 2 outer + 2 lining)',
    category: 'hood',
    points: hoodPoints,
    edges: [],
    cutQuantity: 4,
    grainLine: { start: [50, 50], end: [50, hoodH - 60] },
    dimensionsMm: { width: hoodW, height: hoodH }
  });

  // --- 5. KANGAROO POUCH PANEL ---
  const pouchBottom = 260;
  const pouchTop = 180;
  const pouchH = 210;
  const pocketPoints: [number, number][] = [
    [0, 0],
    [pouchBottom / 2, 0],
    [pouchBottom / 2, 60], // Bottom side
    [pouchTop / 2, pouchH], // Slanted hand opening
    [0, pouchH],
    [0, 0]
  ];
  panels.push({
    id: 'panel-kangaroo-pocket',
    name: 'Kangaroo Pouch (Cut 1 on fold)',
    category: 'pocket',
    points: pocketPoints,
    edges: [],
    cutQuantity: 1,
    grainLine: { start: [40, 30], end: [40, pouchH - 30] },
    dimensionsMm: { width: pouchBottom / 2, height: pouchH }
  });

  return {
    id: `pattern-${garmentId}`,
    garmentId,
    units: 'mm',
    version: 1,
    panels,
    totalAreaM2: 1.85
  };
}
