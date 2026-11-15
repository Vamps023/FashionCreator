import React from 'react';
import { useEditorStore, useActiveGarment } from '@fashion-studio/editor-core';
import { PerformanceStats } from '@fashion-studio/renderer-3d';
import { CheckCircle2, Activity } from 'lucide-react';

interface BottomBarProps {
  stats: PerformanceStats;
}

export const BottomBar: React.FC<BottomBarProps> = ({ stats }) => {
  const { statusMessage, isDirty } = useEditorStore();
  const activeGarment = useActiveGarment();

  return (
    <footer className="h-7 bg-[var(--bg-app)] border-t border-[var(--border)] flex items-center justify-between px-3 text-[11px] font-mono text-[var(--text-secondary)] select-none z-30">
      {/* Left Status Message */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[var(--text-primary)]">{statusMessage}</span>
        {isDirty && <span className="text-[10px] text-amber-500 font-sans">• Unsaved edits</span>}
      </div>

      {/* Center Details */}
      <div className="hidden md:flex items-center gap-3 text-[10px]">
        <span>{activeGarment.name}</span>
        <span>•</span>
        <span>Units: mm</span>
        <span>•</span>
        <span>Preset: {activeGarment.parameters.fit.toUpperCase()}</span>
      </div>

      {/* Right: Engine & Real-time Performance Metrics */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
          <Activity className="w-3 h-3 text-[var(--accent)]" />
          <span>{stats.fps} FPS</span>
        </div>

        <span className="opacity-40">|</span>

        <span>{stats.triangles.toLocaleString()} tris</span>

        <span className="opacity-40">|</span>

        <span className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-[10px] border border-[var(--border)]">
          WebGL2
        </span>
      </div>
    </footer>
  );
};
