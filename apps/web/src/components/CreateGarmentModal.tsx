import React, { useState } from 'react';
import {
  GarmentType,
  PHYSICAL_FABRIC_PRESETS
} from '@fashion-studio/garment-schema';
import { generateGarmentByType } from '@fashion-studio/garment-engine';
import { useEditorStore } from '@fashion-studio/editor-core';
import {
  Sparkles,
  X,
  Check,
  Shirt,
  Scissors,
  Layers,
  Palette,
  Play
} from 'lucide-react';

interface CreateGarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GarmentCardOption {
  type: GarmentType;
  title: string;
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear';
  icon: string;
  description: string;
  patternCount: number;
  seamCount: number;
}

const TEMPLATE_CARDS: GarmentCardOption[] = [
  {
    type: 'tshirt',
    title: 'Crewneck Classic T-Shirt',
    category: 'Tops',
    icon: '👕',
    description: 'Standard crewneck tee with front bodice, back bodice, and left/right sleeves.',
    patternCount: 4,
    seamCount: 6
  },
  {
    type: 'dress',
    title: 'A-Line Summer Dress',
    category: 'Dresses',
    icon: '👗',
    description: 'Fitted scoop bodice with flowing flared trapezoid skirt panels.',
    patternCount: 4,
    seamCount: 6
  },
  {
    type: 'trousers',
    title: 'Wide-Leg Relaxed Pants',
    category: 'Bottoms',
    icon: '👖',
    description: 'Casual wide-leg cut with front/back legs, rise curves, and outseams.',
    patternCount: 4,
    seamCount: 6
  },
  {
    type: 'croptop',
    title: 'Cropped Boxy Tee',
    category: 'Tops',
    icon: '👚',
    description: 'Streetwear drop-shoulder crop top with modern relaxed proportions.',
    patternCount: 2,
    seamCount: 4
  },
  {
    type: 'hoodie',
    title: 'Oversized Streetwear Hoodie',
    category: 'Outerwear',
    icon: '🧥',
    description: 'Heavyweight fleece hoodie with kangaroo pocket and double-layer hood.',
    patternCount: 2,
    seamCount: 4
  },
  {
    type: 'tunic',
    title: 'Two-Panel Minimalist Tunic',
    category: 'Tops',
    icon: '🎽',
    description: 'Simple 2-piece front and back panel construction for rapid simulation testing.',
    patternCount: 2,
    seamCount: 4
  }
];

export const CreateGarmentModal: React.FC<CreateGarmentModalProps> = ({ isOpen, onClose }) => {
  const { createNewGarment, setStatusMessage } = useEditorStore();

  const [selectedType, setSelectedType] = useState<GarmentType>('tshirt');
  const [garmentName, setGarmentName] = useState('My Custom T-Shirt');
  const [fit, setFit] = useState<'slim' | 'regular' | 'relaxed' | 'oversized'>('regular');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [color, setColor] = useState('#2563eb');
  const [physicalFabric, setPhysicalFabric] = useState('lightweight-cotton');

  if (!isOpen) return null;

  const filteredCards = selectedCategory === 'All'
    ? TEMPLATE_CARDS
    : TEMPLATE_CARDS.filter((c) => c.category === selectedCategory);

  const handleCreate = () => {
    let newGarment;
    if (selectedType === 'tunic') {
      newGarment = generateGarmentByType('tshirt', {
        name: garmentName,
        fit,
        color
      });
    } else {
      newGarment = generateGarmentByType(selectedType, {
        name: garmentName,
        fit,
        color
      });
    }

    // Apply chosen physical fabric
    const chosenPhysical = PHYSICAL_FABRIC_PRESETS[physicalFabric];
    if (chosenPhysical) {
      newGarment.physicalFabrics = { default: { ...chosenPhysical } };
    }

    createNewGarment(newGarment);
    setStatusMessage(`Created and draped ${newGarment.name}`);
    onClose();
  };

  const handleSelectCard = (card: GarmentCardOption) => {
    setSelectedType(card.type);
    setGarmentName(`My ${card.title}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[var(--text-primary)] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Create New Garment</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Select a modular pattern silhouette and configure fabric properties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-xs">
            {['All', 'Tops', 'Dresses', 'Bottoms', 'Outerwear'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Garment Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCards.map((card) => {
              const isSelected = selectedType === card.type;
              return (
                <button
                  key={card.type}
                  onClick={() => handleSelectCard(card)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all text-xs relative ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)] shadow-md ring-1 ring-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-zinc-500 hover:bg-[var(--bg-elevated)]/80'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <span className="text-2xl mb-2">{card.icon}</span>
                  <span className="font-semibold text-sm mb-1">{card.title}</span>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">
                    {card.description}
                  </p>
                  <div className="mt-auto pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                    <span>{card.patternCount} Panels</span>
                    <span>•</span>
                    <span>{card.seamCount} Seams</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Configuration Form */}
          <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] space-y-4 text-xs">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[var(--accent)]" />
              Garment Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Garment Name
                </label>
                <input
                  type="text"
                  value={garmentName}
                  onChange={(e) => setGarmentName(e.target.value)}
                  className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Fit Profile
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['slim', 'regular', 'relaxed', 'oversized'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFit(f)}
                      className={`py-1.5 rounded capitalize text-[11px] font-medium border text-center transition-colors ${
                        fit === f
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                          : 'border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Physical Fabric Preset
                </label>
                <select
                  value={physicalFabric}
                  onChange={(e) => setPhysicalFabric(e.target.value)}
                  className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="lightweight-cotton">Cotton Jersey Tee (160 GSM - Soft Drape)</option>
                  <option value="heavy-cotton-fleece">Heavy French Terry (380 GSM - Structured)</option>
                  <option value="raw-rigid-denim">Raw Selvedge Denim (420 GSM - Rigid)</option>
                  <option value="fluid-silk-satin">Fluid Silk Satin (95 GSM - High Creasing)</option>
                  <option value="ribbed-knit-trim">Ribbed Knit Trim (260 GSM - High Stretch)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Fabric Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg px-3 py-1 text-xs font-mono uppercase text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg-panel)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white shadow-lg transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Generate & Drape Garment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
