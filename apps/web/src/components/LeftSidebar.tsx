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
    <aside className="w-64 bg-studio-900 border-r border-studio-800 flex flex-col h-full select-none z-20">
      {/* 1. Garment Library Section */}
      <div className="p-3 border-b border-studio-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-studio-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-blue-500" />
            Garment Library
          </span>
          <span className="text-[10px] text-studio-500 font-mono">v1.0</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchGarmentTemplate('hoodie')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
              activeGarment.type === 'hoodie'
                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-medium'
                : 'bg-studio-850 border-studio-750 text-studio-400 hover:text-studio-200 hover:bg-studio-800'
            }`}
          >
            <span className="text-xl mb-1">🧥</span>
            <span className="text-xs">Hoodie</span>
            <span className="text-[9px] text-studio-500">Oversized</span>
          </button>

          <button
            onClick={() => switchGarmentTemplate('tshirt')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
              activeGarment.type === 'tshirt'
                ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-medium'
                : 'bg-studio-850 border-studio-750 text-studio-400 hover:text-studio-200 hover:bg-studio-800'
            }`}
          >
            <span className="text-xl mb-1">👕</span>
            <span className="text-xs">T-Shirt</span>
            <span className="text-[9px] text-studio-500">Boxy Fit</span>
          </button>
        </div>
      </div>

      {/* 2. Garment Part Hierarchy */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-studio-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Components & Parts
          </span>
          <span className="text-[10px] text-studio-500">Select to inspect</span>
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
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-studio-300 hover:bg-studio-850 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{part.icon}</span>
                  <span>{part.label}</span>
                </div>
                {isSelected && <ChevronRight className="w-3 h-3 opacity-70" />}
              </button>
            );
          })}
        </div>

        {/* 3. Artwork Layer Tree */}
        <div className="mt-5 pt-3 border-t border-studio-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-studio-400 uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-emerald-400" />
              Artwork Layers ({activeGarment.artworkLayers.length})
            </span>
            <button
              onClick={() => setActiveMode('artwork')}
              className="text-[10px] text-blue-400 hover:underline"
            >
              + Add
            </button>
          </div>

          {activeGarment.artworkLayers.length === 0 ? (
            <div className="text-center py-4 text-studio-500 text-xs italic">
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
                        ? 'bg-studio-750 text-white border border-studio-600'
                        : 'text-studio-300 hover:bg-studio-850'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {layer.type === 'text' ? (
                        <Type className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{layer.name}</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => updateArtworkLayer(layer.id, { visible: !layer.visible })}
                        className="p-1 text-studio-400 hover:text-white"
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.visible ? (
                          <Eye className="w-3 h-3 text-studio-300" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-studio-600" />
                        )}
                      </button>
                      <button
                        onClick={() => removeArtworkLayer(layer.id)}
                        className="p-1 text-studio-500 hover:text-rose-400"
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
      <div className="p-3 border-t border-studio-800 text-[10px] text-studio-500 bg-studio-950/60 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-studio-400" />
        <span>Non-destructive parametric stack</span>
      </div>
    </aside>
  );
};
