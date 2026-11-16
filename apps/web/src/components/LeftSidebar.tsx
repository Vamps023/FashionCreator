import React from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import { GarmentPartId } from '@fashion-studio/garment-schema';
import { generateGarmentByType } from '@fashion-studio/garment-engine';
import {
  Layers,
  Shirt,
  Box,
  Eye,
  EyeOff,
  Trash2,
  Type,
  Image as ImageIcon,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface LeftSidebarProps {
  onOpenCreateGarment?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onOpenCreateGarment }) => {
  const {
    selectedPartId,
    selectedArtworkLayerId,
    selectPart,
    selectArtworkLayer,
    updateArtworkLayer,
    removeArtworkLayer,
    switchGarmentTemplate,
    createNewGarment,
    setActiveMode
  } = useEditorStore();

  const activeGarment = useActiveGarment();

  const partsList: { id: GarmentPartId; label: string; icon: string }[] = [
    { id: 'body_front', label: 'Front Panel', icon: '🎽' },
    { id: 'body_back', label: 'Back Panel', icon: '👕' },
    { id: 'sleeves', label: 'Sleeves (L/R)', icon: '🥋' },
    { id: 'hood', label: 'Hood Cowl', icon: '🧢' },
    { id: 'pocket', label: 'Kangaroo Pocket', icon: '👝' },
    { id: 'cuffs', label: 'Ribbed Cuffs', icon: '🧤' },
    { id: 'waistband', label: 'Bottom Hem', icon: '🩳' },
    { id: 'drawstrings', label: 'Drawstrings', icon: '🎗️' }
  ];

  return (
    <aside className="w-full bg-[var(--bg-panel)] border-r border-[var(--border)] flex flex-col h-full select-none text-[var(--text-primary)]">
      {/* 1. Garment Library Section */}
      <div className="p-3 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-[var(--accent)]" />
            Garment Library
          </span>
          {onOpenCreateGarment && (
            <button
              onClick={onOpenCreateGarment}
              className="text-[10px] bg-[var(--accent)] text-white px-2 py-0.5 rounded font-medium hover:opacity-90 flex items-center gap-1 transition-opacity shadow-sm"
              title="Create Custom Garment with Wizard"
            >
              <Sparkles className="w-2.5 h-2.5" />
              + Wizard
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => switchGarmentTemplate('hoodie')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
              activeGarment.type === 'hoodie'
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-base mb-0.5">🧥</span>
            <span className="text-[10px] leading-tight font-medium">Hoodie</span>
            <span className="text-[8px] opacity-70">7-Piece</span>
          </button>

          <button
            onClick={() => createNewGarment(generateGarmentByType('tshirt', { fit: 'relaxed' }))}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
              activeGarment.type === 'tshirt'
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-base mb-0.5">👕</span>
            <span className="text-[10px] leading-tight font-medium">T-Shirt</span>
            <span className="text-[8px] opacity-70">4-Panel</span>
          </button>

          <button
            onClick={() => createNewGarment(generateGarmentByType('dress', { fit: 'regular' }))}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
              activeGarment.type === 'dress'
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-base mb-0.5">👗</span>
            <span className="text-[10px] leading-tight font-medium">Dress</span>
            <span className="text-[8px] opacity-70">A-Line</span>
          </button>

          <button
            onClick={() => createNewGarment(generateGarmentByType('trousers', { fit: 'regular' }))}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
              activeGarment.type === 'trousers'
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-base mb-0.5">👖</span>
            <span className="text-[10px] leading-tight font-medium">Pants</span>
            <span className="text-[8px] opacity-70">Wide-Leg</span>
          </button>

          <button
            onClick={() => createNewGarment(generateGarmentByType('croptop', { fit: 'slim' }))}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
              activeGarment.type === 'croptop'
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-base mb-0.5">👚</span>
            <span className="text-[10px] leading-tight font-medium">Crop Top</span>
            <span className="text-[8px] opacity-70">Fitted</span>
          </button>

          <button
            onClick={() => switchGarmentTemplate('tunic')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
              activeGarment.type === 'tunic'
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Reference 2-panel sewn garment with active XPBD cloth simulation"
          >
            <span className="text-base mb-0.5">🎽</span>
            <span className="text-[10px] leading-tight font-medium">2P Tunic</span>
            <span className="text-[8px] opacity-70">Sim Ready</span>
          </button>
        </div>
      </div>

      {/* 2. Garment Part Hierarchy */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
            Components & Parts
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">Click to inspect</span>
        </div>

        <div className="space-y-1">
          {partsList.map((part) => {
            const isSelected = selectedPartId === part.id;
            const isAvailable =
              part.id === 'pocket'
                ? activeGarment.components.pockets !== 'none'
                : part.id === 'hood'
                ? activeGarment.components.hood !== 'none'
                : true;

            if (!isAvailable) return null;

            return (
              <button
                key={part.id}
                onClick={() => selectPart(part.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white font-medium shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{part.icon}</span>
                  <span>{part.label}</span>
                </div>
                {isSelected && <ChevronRight className="w-3 h-3 opacity-80" />}
              </button>
            );
          })}
        </div>

        {/* 3. Artwork Layer Tree */}
        <div className="mt-5 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-[var(--positive)]" />
              Artwork Layers ({activeGarment.artworkLayers.length})
            </span>
            <button
              onClick={() => setActiveMode('artwork')}
              className="text-[10px] text-[var(--accent)] hover:underline"
            >
              + Add
            </button>
          </div>

          {activeGarment.artworkLayers.length === 0 ? (
            <div className="text-center py-4 text-[var(--text-secondary)] text-xs italic">
              No artwork layers placed.
            </div>
          ) : (
            <div className="space-y-1">
              {activeGarment.artworkLayers.map((layer) => {
                const isSelected = selectedArtworkLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => {
                      selectArtworkLayer(layer.id);
                      setActiveMode('artwork');
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {layer.type === 'text' ? (
                        <Type className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-[var(--positive)] flex-shrink-0" />
                      )}
                      <span className="truncate">{layer.name}</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => updateArtworkLayer(layer.id, { visible: !layer.visible })}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.visible ? (
                          <Eye className="w-3 h-3 text-[var(--text-primary)]" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-[var(--text-secondary)]" />
                        )}
                      </button>
                      <button
                        onClick={() => removeArtworkLayer(layer.id)}
                        className="p-1 text-[var(--text-secondary)] hover:text-rose-500"
                        title="Delete layer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-[var(--border)] text-[10px] text-[var(--text-secondary)] bg-[var(--bg-elevated)] flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Non-destructive parametric stack</span>
      </div>
    </aside>
  );
};
