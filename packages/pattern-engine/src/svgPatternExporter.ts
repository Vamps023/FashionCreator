import { PatternDocument } from './types';

/**
 * Serializes a 2D Pattern Document to standard production SVG with 1:1 millimeter scale.
 */
export function exportPatternToSVG(patternDoc: PatternDocument): string {
  let currentOffsetX = 60;
  let currentOffsetY = 60;
  const padding = 80;
  let maxW = 1200;
  let maxH = 900;

  let svgPanels = '';

  patternDoc.panels.forEach((panel) => {
    // Generate SVG path for outer cutting line
    const pathD = panel.points
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0] + currentOffsetX} ${pt[1] + currentOffsetY}`)
      .join(' ') + ' Z';

    // Grainline
    const gStart = `${panel.grainLine.start[0] + currentOffsetX},${panel.grainLine.start[1] + currentOffsetY}`;
    const gEnd = `${panel.grainLine.end[0] + currentOffsetX},${panel.grainLine.end[1] + currentOffsetY}`;

    svgPanels += `
    <!-- ${panel.name} -->
    <g id="${panel.id}">
      <!-- Cutting Line -->
      <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="1.5" />
      
      <!-- Grain Line Arrow -->
      <line x1="${panel.grainLine.start[0] + currentOffsetX}" y1="${panel.grainLine.start[1] + currentOffsetY}" 
            x2="${panel.grainLine.end[0] + currentOffsetX}" y2="${panel.grainLine.end[1] + currentOffsetY}" 
            stroke="#64748b" stroke-width="1" stroke-dasharray="4,4" />
      
      <!-- Labels -->
      <text x="${currentOffsetX + 20}" y="${currentOffsetY + 40}" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#1e293b">
        ${panel.name}
      </text>
      <text x="${currentOffsetX + 20}" y="${currentOffsetY + 60}" font-family="Inter, sans-serif" font-size="11" fill="#64748b">
        Size: L • ${panel.dimensionsMm.width}mm × ${panel.dimensionsMm.height}mm
      </text>
    </g>`;

    currentOffsetX += panel.dimensionsMm.width + padding;
    if (currentOffsetX > maxW - 300) {
      currentOffsetX = 60;
      currentOffsetY += 450;
    }
  });

  maxH = Math.max(maxH, currentOffsetY + 500);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${maxW}mm" height="${maxH}mm" 
     viewBox="0 0 ${maxW} ${maxH}">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>

  <!-- Title & Calibration Box -->
  <rect x="20" y="20" width="100" height="100" fill="none" stroke="#ef4444" stroke-width="1.5" />
  <text x="25" y="45" font-size="10" font-weight="bold" fill="#ef4444">100mm × 100mm</text>
  <text x="25" y="60" font-size="9" fill="#ef4444">Test Scale Square</text>

  <text x="140" y="50" font-size="20" font-weight="bold" fill="#0f172a">3D Fashion Studio — Sewing Pattern</text>
  <text x="140" y="70" font-size="12" fill="#64748b">Units: Millimeters (1:1 scale) • Garment: ${patternDoc.garmentId}</text>

  ${svgPanels}
</svg>`;
}
