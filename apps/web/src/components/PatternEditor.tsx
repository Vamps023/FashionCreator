import React, { useState } from 'react';
import { useActiveGarment, useEditorStore } from '@fashion-studio/editor-core';
import { generateHoodiePatterns, exportPatternToSVG, PatternPanel } from '@fashion-studio/pattern-engine';
import { Download, Scissors, Eye, Maximize2, ShieldAlert } from 'lucide-react';

export const PatternEditor: React.FC = () => {
  const activeGarment = useActiveGarment();
  const { setStatusMessage } = useEditorStore();
  const [selectedPanelId, setSelectedPanelId] = useState<string>('panel-front-bodice');
  const [zoom, setZoom] = useState<number>(0.65);

  const patternDoc = generateHoodiePatterns(activeGarment.id, activeGarment.parameters);
  const activePanel = patternDoc.panels.find((p) => p.id === selectedPanelId) || patternDoc.panels[0];

  const handleExportSVG = () => {
    const svgData = exportPatternToSVG(patternDoc);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeGarment.name.toLowerCase().replace(/\s+/g, '_')}_patterns_1to1.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatusMessage('Exported 1:1 scale sewing pattern SVG');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden select-none">
      {/* Pattern Header Toolbar */}
      <div className="h-11 bg-[var(--bg-panel)] border-b border-[var(--border)] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-semibold">2D Sewing Pattern CAD (Experimental PoC)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-mono">
            1:1 mm Scale
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border)] text-xs font-mono">
            <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} className="px-1 text-[var(--text-secondary)] hover:text-white">-</button>
            <span className="w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="px-1 text-[var(--text-secondary)] hover:text-white">+</button>
          </div>

          <button
            onClick={handleExportSVG}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--accent)] hover:opacity-90 text-white text-xs font-medium shadow-sm transition-opacity"
            title="Download true-scale SVG for laser cutter or printer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Pattern SVG
          </button>
        </div>
      </div>

      {/* Main Pattern Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Pattern Panels List */}
        <div className="w-64 bg-[var(--bg-panel)] border-r border-[var(--border)] p-3 overflow-y-auto">
          <div className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Panels ({patternDoc.panels.length})
          </div>
          <div className="space-y-1">
            {patternDoc.panels.map((panel) => {
              const isSelected = selectedPanelId === panel.id;
              return (
                <button
                  key={panel.id}
                  onClick={() => setSelectedPanelId(panel.id)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium border border-[var(--accent)]/40'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate font-medium">{panel.name}</div>
                    <div className="text-[10px] opacity-70 font-mono">
                      {panel.dimensionsMm.width} × {panel.dimensionsMm.height} mm
                    </div>
                  </div>
                  {isSelected && <Eye className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Research Honesty Alert per docs/AGENTS.md */}
          <div className="mt-6 p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] text-[var(--text-secondary)] leading-relaxed">
            <div className="flex items-center gap-1 font-semibold text-[var(--warning)] mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              CAD Research Status
            </div>
            This module generates exact 1:1 cutting contours mathematically derived from 3D garment measurements. Physical assembly requires calibrated seam allowances and fabric stretch compensation.
          </div>
        </div>

        {/* Center: 2D Drafting Canvas */}
        <div className="flex-1 bg-[var(--bg-viewport)] flex items-center justify-center p-8 overflow-auto relative">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="transition-transform duration-75 shadow-2xl rounded-xl bg-white p-6 border border-slate-300"
          >
            {/* SVG Renderer of the Active Panel */}
            <svg
              width={activePanel.dimensionsMm.width + 120}
              height={activePanel.dimensionsMm.height + 120}
              viewBox={`-60 -60 ${activePanel.dimensionsMm.width + 120} ${activePanel.dimensionsMm.height + 120}`}
            >
              {/* Grid / Calibration */}
              <defs>
                <pattern id="cadGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect x="-60" y="-60" width="100%" height="100%" fill="url(#cadGrid)" />

              {/* Panel Path */}
              <path
                d={activePanel.points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(' ') + ' Z'}
                fill="#f1f5f9"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Grainline */}
              <line
                x1={activePanel.grainLine.start[0]}
                y1={activePanel.grainLine.start[1]}
                x2={activePanel.grainLine.end[0]}
                y2={activePanel.grainLine.end[1]}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />

              {/* Labels */}
              <text x="20" y="30" fontSize="16" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">
                {activePanel.name}
              </text>
              <text x="20" y="55" fontSize="12" fill="#64748b" fontFamily="sans-serif">
                Width: {activePanel.dimensionsMm.width} mm • Height: {activePanel.dimensionsMm.height} mm
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Seam & Dimension Inspector */}
        <div className="w-72 bg-[var(--bg-panel)] border-l border-[var(--border)] p-4 space-y-4 text-xs">
          <h4 className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-[11px]">
            Panel Specification
          </h4>

          <div className="space-y-2 bg-[var(--bg-elevated)] p-3 rounded-lg border border-[var(--border)] font-mono">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Category</span>
              <span className="text-[var(--text-primary)] capitalize">{activePanel.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Cutting Width</span>
              <span className="text-[var(--text-primary)]">{activePanel.dimensionsMm.width} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Cutting Height</span>
              <span className="text-[var(--text-primary)]">{activePanel.dimensionsMm.height} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Cut Count</span>
              <span className="text-[var(--text-primary)]">{activePanel.cutQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Seam Allowance</span>
              <span className="text-emerald-500 font-semibold">10 mm (Standard)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
