import React from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import { GarmentPartId } from '@fashion-studio/garment-schema';
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
  ShieldAlert
} from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const {
    selectedPartId,
    selectedArtworkLayerId,
    selectPart,
    selectArtworkLayer,
    updateArtworkLayer,
    removeArtworkLayer,
    switchGarmentTemplate,
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
          <span className="text-[10px] text-[var(--text-secondary)] font-mono">v1.0</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchGarmentTemplate('hoodie')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
              activeGarment.type === 'hoodie'
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-xl mb-1">🧥</span>
            <span className="text-xs">Hoodie</span>
            <span className="text-[9px] opacity-70">Oversized</span>
          </button>

          <button
            onClick={() => switchGarmentTemplate('tshirt')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
              activeGarment.type === 'tshirt'
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-xl mb-1">👕</span>
            <span className="text-xs">T-Shirt</span>
            <span className="text-[9px] opacity-70">Boxy Fit</span>
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
