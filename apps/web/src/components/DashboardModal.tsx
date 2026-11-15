import React from 'react';
import { useEditorStore } from '@fashion-studio/editor-core';
import { Sparkles, Shirt, Plus, FolderOpen, Clock, X } from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFile: () => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose, onOpenFile }) => {
  const { switchGarmentTemplate, resetProject, project } = useEditorStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[var(--bg-panel)] text-[var(--text-primary)] w-full max-w-2xl rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-[var(--border)] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Fashion Studio Dashboard</h2>
              <p className="text-[11px] text-[var(--text-secondary)]">Start a new project or resume existing apparel design</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-secondary)] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Start New Garment Project
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => {
                switchGarmentTemplate('hoodie');
                onClose();
              }}
              className="p-4 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] hover:border-[var(--accent)] text-left transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧥</div>
              <div className="font-semibold text-xs text-[var(--text-primary)] mb-0.5">Oversized Hoodie</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Drop shoulders, kangaroo pouch, double-layer cowl</div>
            </button>

            <button
              onClick={() => {
                switchGarmentTemplate('tshirt');
                onClose();
              }}
              className="p-4 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] hover:border-[var(--accent)] text-left transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👕</div>
              <div className="font-semibold text-xs text-[var(--text-primary)] mb-0.5">Boxy Heavyweight Tee</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Relaxed silhouette, ribbed collar band</div>
            </button>

            <button
              onClick={() => {
                onOpenFile();
                onClose();
              }}
              className="p-4 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-dashed border-[var(--border)] hover:border-[var(--accent)] text-left transition-all flex flex-col justify-center items-center text-center group"
            >
              <FolderOpen className="w-8 h-8 text-[var(--accent)] mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-xs text-[var(--text-primary)]">Open Local File</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Import .fstudio or .json</div>
            </button>
          </div>

          {/* Current Active Workspace */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              Active Project
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div>
                <div className="font-semibold text-xs text-[var(--text-primary)]">{project.name}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                  Garment ID: {project.activeGarmentId} • Units: {project.units}
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
