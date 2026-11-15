import React from 'react';
import { useEditorStore, useActiveGarment } from '@fashion-studio/editor-core';
import { PerformanceStats } from '@fashion-studio/renderer-3d';
import { CheckCircle2, Cpu, Activity } from 'lucide-react';

interface BottomBarProps {
  stats: PerformanceStats;
}

export const BottomBar: React.FC<BottomBarProps> = ({ stats }) => {
  const { statusMessage, isDirty } = useEditorStore();
  const activeGarment = useActiveGarment();

  return (
    <footer className="h-7 bg-studio-950 border-t border-studio-800 flex items-center justify-between px-3 text-[11px] font-mono text-studio-400 select-none z-30">
      {/* Left Status Message */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-studio-300">{statusMessage}</span>
        {isDirty && <span className="text-[10px] text-amber-400 font-sans">• Unsaved edits</span>}
      </div>

      {/* Center Details */}
      <div className="hidden md:flex items-center gap-3 text-studio-500 text-[10px]">
        <span>{activeGarment.name}</span>
        <span>•</span>
        <span>Units: mm</span>
        <span>•</span>
        <span>Preset: {activeGarment.parameters.fit.toUpperCase()}</span>
      </div>

      {/* Right: Engine & Real-time Performance Metrics */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-studio-300">
          <Activity className="w-3 h-3 text-blue-400" />
          <span>{stats.fps} FPS</span>
        </div>

        <span className="text-studio-700">|</span>

        <span className="text-studio-400">
          {stats.triangles.toLocaleString()} tris
        </span>

        <span className="text-studio-700">|</span>

        <span className="px-1.5 py-0.5 rounded bg-studio-850 text-blue-400 text-[10px] border border-studio-750">
          WebGL2
        </span>
      </div>
    </footer>
  );
};
