import React, { useRef } from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import {
  FABRIC_PRESETS,
  GarmentPartId
} from '@fashion-studio/garment-schema';
import {
  Sliders,
  Palette,
  Type,
  Plus,
  Upload,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';

interface RightSidebarProps {
  onExportPNG: (transparent: boolean) => void;
  onExportGLB: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onExportPNG, onExportGLB }) => {
  const {
    project,
    activeMode,
    selectedPartId,
    selectedArtworkLayerId,
    activePrintZone,
    setActivePrintZone,
    updateGarmentParameters,
    updateComponentOption,
    updatePartMaterial,
    applyMaterialPresetToPart,
    applyMaterialPresetToAllParts,
    addArtworkLayer,
    updateArtworkLayer,
    setAvatarVisible,
    setWireframeMode,
    wireframeMode
  } = useEditorStore();

  const activeGarment = useActiveGarment();
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const targetPartId: GarmentPartId = selectedPartId || 'body_front';
  const currentMaterial = activeGarment.materials[targetPartId] || activeGarment.materials.body_front;
  const activeLayer = activeGarment.artworkLayers.find((l) => l.id === selectedArtworkLayerId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addArtworkLayer({
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'image',
          surfaceId: activePrintZone,
          visible: true,
          locked: false,
          opacity: 1.0,
          position: [0.5, 0.45],
          scale: [0.35, 0.35],
          rotation: 0,
          dataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-full bg-[var(--bg-panel)] border-l border-[var(--border)] flex flex-col h-full select-none text-[var(--text-primary)] overflow-y-auto">
      {/* ---------------- MODE: DESIGN ---------------- */}
      {activeMode === 'design' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
              Proportions & Fit
            </h3>
            <span className="text-[10px] text-[var(--accent)] font-mono">
              {activeGarment.parameters.fit.toUpperCase()}
            </span>
          </div>

          {/* Fit Profile Selector */}
          <div>
            <label className="text-[11px] text-[var(--text-secondary)] block mb-1.5 font-medium">Silhouette Fit</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['slim', 'regular', 'relaxed', 'oversized'] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => updateGarmentParameters({ fit })}
                  className={`py-1.5 rounded text-[11px] capitalize transition-colors ${
                    activeGarment.parameters.fit === fit
                      ? 'bg-[var(--accent)] text-white font-medium shadow-sm'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Body Length</span>
                <span className="font-mono">{(activeGarment.parameters.bodyLength / 10).toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min={580}
                max={850}
                value={activeGarment.parameters.bodyLength}
                onChange={(e) => updateGarmentParameters({ bodyLength: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Chest Width</span>
                <span className="font-mono">{(activeGarment.parameters.chestWidth / 10).toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min={480}
                max={740}
                value={activeGarment.parameters.chestWidth}
                onChange={(e) => updateGarmentParameters({ chestWidth: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Sleeve Length</span>
                <span className="font-mono">{(activeGarment.parameters.sleeveLength / 10).toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min={500}
                max={750}
                value={activeGarment.parameters.sleeveLength}
                onChange={(e) => updateGarmentParameters({ sleeveLength: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          {/* Modular Components */}
          <div className="border-t border-[var(--border)] pt-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider">Component Variants</h4>

            {activeGarment.type === 'hoodie' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Hood Style</span>
                  <select
                    value={activeGarment.components.hood}
                    onChange={(e) => updateComponentOption('hood', e.target.value as any)}
                    className="bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] border border-[var(--border)] rounded px-2 py-1 outline-none"
                  >
                    <option value="double-layer">Double Layer Cowl</option>
                    <option value="single-layer">Single Layer</option>
                    <option value="none">No Hood (Crewneck)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Pockets</span>
                  <select
                    value={activeGarment.components.pockets}
                    onChange={(e) => updateComponentOption('pockets', e.target.value as any)}
                    className="bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] border border-[var(--border)] rounded px-2 py-1 outline-none"
                  >
                    <option value="kangaroo">Kangaroo Pouch</option>
                    <option value="none">Clean Front (None)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Drawstrings</span>
                  <select
                    value={activeGarment.components.drawstrings}
                    onChange={(e) => updateComponentOption('drawstrings', e.target.value as any)}
                    className="bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] border border-[var(--border)] rounded px-2 py-1 outline-none"
                  >
                    <option value="round-cord">Round Cord & Tips</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Wrist Cuffs</span>
              <select
                value={activeGarment.components.cuffs}
                onChange={(e) => updateComponentOption('cuffs', e.target.value as any)}
                className="bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] border border-[var(--border)] rounded px-2 py-1 outline-none"
              >
                <option value="ribbed">Ribbed Knit Cuffs</option>
                <option value="hemmed">Straight Hemmed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODE: FABRIC ---------------- */}
      {activeMode === 'fabric' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
              Fabric & Materials
            </h3>
            <span className="text-[10px] text-[var(--accent)] font-mono">
              Target: {targetPartId.replace('_', ' ')}
            </span>
          </div>

          {/* Color Picker & Swatches */}
          <div>
            <label className="text-[11px] text-[var(--text-secondary)] block mb-1.5 font-medium">Fabric Base Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={currentMaterial.color}
                onChange={(e) => updatePartMaterial(targetPartId, { color: e.target.value })}
                className="w-10 h-10 rounded border border-[var(--border)] cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={currentMaterial.color.toUpperCase()}
                onChange={(e) => updatePartMaterial(targetPartId, { color: e.target.value })}
                className="bg-[var(--bg-elevated)] px-2.5 py-1.5 rounded text-xs font-mono text-[var(--text-primary)] border border-[var(--border)] w-28 uppercase"
              />
            </div>
          </div>

          {/* Fabric Presets */}
          <div>
            <label className="text-[11px] text-[var(--text-secondary)] block mb-2 font-medium">Fabric Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(FABRIC_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyMaterialPresetToPart(targetPartId, preset)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] text-left transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0"
                    style={{ backgroundColor: preset.color }}
                  />
                  <div className="truncate">
                    <div className="text-[11px] text-[var(--text-primary)] truncate">{preset.name}</div>
                    <div className="text-[9px] text-[var(--text-secondary)] capitalize">{preset.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PBR Surface Physics */}
          <div className="border-t border-[var(--border)] pt-4 space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider">PBR Surface Parameters</h4>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Roughness</span>
                <span className="font-mono">{currentMaterial.roughness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.02}
                value={currentMaterial.roughness}
                onChange={(e) => updatePartMaterial(targetPartId, { roughness: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Cloth Sheen</span>
                <span className="font-mono">{currentMaterial.sheen.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={currentMaterial.sheen}
                onChange={(e) => updatePartMaterial(targetPartId, { sheen: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Weave Relief (Normal Scale)</span>
                <span className="font-mono">{currentMaterial.normalScale.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={2.0}
                step={0.1}
                value={currentMaterial.normalScale}
                onChange={(e) => updatePartMaterial(targetPartId, { normalScale: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1">Weave Pattern</label>
              <select
                value={currentMaterial.texturePattern}
                onChange={(e) => updatePartMaterial(targetPartId, { texturePattern: e.target.value as any })}
                className="w-full bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] border border-[var(--border)] rounded px-2.5 py-1.5 outline-none"
              >
                <option value="knit">Looped Heavy Knit</option>
                <option value="twill">45° Twill Denim Weave</option>
                <option value="ribbed">Ribbed Ridge Knit</option>
                <option value="terry">French Terry Loops</option>
                <option value="plain">Clean Plain Weave</option>
              </select>
            </div>

            <button
              onClick={() => applyMaterialPresetToAllParts(currentMaterial)}
              className="w-full mt-2 py-2 rounded bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] text-xs font-medium transition-colors"
            >
              Apply Fabric to Entire Garment
            </button>
          </div>
        </div>
      )}

      {/* ---------------- MODE: ARTWORK ---------------- */}
      {activeMode === 'artwork' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[var(--accent)]" />
              Artwork & Graphics
            </h3>
          </div>

          {/* Surface Print Zone Switcher */}
          <div>
            <label className="text-[11px] text-[var(--text-secondary)] block mb-1.5 font-medium">Print Zone</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setActivePrintZone('front-print')}
                className={`py-1.5 rounded text-xs transition-colors ${
                  activePrintZone === 'front-print'
                    ? 'bg-[var(--accent)] text-white font-medium'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'
                }`}
              >
                Front Chest
              </button>
              <button
                onClick={() => setActivePrintZone('back-print')}
                className={`py-1.5 rounded text-xs transition-colors ${
                  activePrintZone === 'back-print'
                    ? 'bg-[var(--accent)] text-white font-medium'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'
                }`}
              >
                Back Panel
              </button>
            </div>
          </div>

          {/* Add Layer Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="file"
              ref={fileUploadRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileUploadRef.current?.click()}
              className="flex items-center justify-center gap-1.5 py-2 rounded bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
              Upload Logo
            </button>

            <button
              onClick={() =>
                addArtworkLayer({
                  name: 'Custom Typography',
                  type: 'text',
                  surfaceId: activePrintZone,
                  visible: true,
                  locked: false,
                  opacity: 1.0,
                  position: [0.5, 0.45],
                  scale: [0.35, 0.35],
                  rotation: 0,
                  text: 'STUDIO 2026',
                  fontSize: 26,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  letterSpacing: 4
                })
              }
              className="flex items-center justify-center gap-1.5 py-2 rounded bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[var(--positive)]" />
              Add Text
            </button>
          </div>

          {/* Active Layer Controls */}
          {activeLayer ? (
            <div className="border-t border-[var(--border)] pt-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold truncate">{activeLayer.name}</span>
                <span className="text-[10px] text-[var(--accent)] font-mono capitalize">{activeLayer.type}</span>
              </div>

              {activeLayer.type === 'text' && (
                <>
                  <div>
                    <label className="text-[11px] text-[var(--text-secondary)] block mb-1">Text Content</label>
                    <input
                      type="text"
                      value={activeLayer.text || ''}
                      onChange={(e) => updateArtworkLayer(activeLayer.id, { text: e.target.value })}
                      className="w-full bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] border border-[var(--border)] rounded px-2.5 py-1.5 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] text-[var(--text-secondary)] block mb-1">Color</label>
                      <input
                        type="color"
                        value={activeLayer.color || '#ffffff'}
                        onChange={(e) => updateArtworkLayer(activeLayer.id, { color: e.target.value })}
                        className="w-full h-8 rounded border border-[var(--border)] cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] text-[var(--text-secondary)] block mb-1">Letter Spacing</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={activeLayer.letterSpacing || 0}
                        onChange={(e) =>
                          updateArtworkLayer(activeLayer.id, { letterSpacing: Number(e.target.value) })
                        }
                        className="w-full bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] border border-[var(--border)] rounded px-2 py-1.5 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">Vertical (Y)</span>
                    <span className="font-mono">{Math.round(activeLayer.position[1] * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.15}
                    max={0.85}
                    step={0.01}
                    value={activeLayer.position[1]}
                    onChange={(e) =>
                      updateArtworkLayer(activeLayer.id, {
                        position: [activeLayer.position[0], Number(e.target.value)]
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">Horizontal (X)</span>
                    <span className="font-mono">{Math.round(activeLayer.position[0] * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.15}
                    max={0.85}
                    step={0.01}
                    value={activeLayer.position[0]}
                    onChange={(e) =>
                      updateArtworkLayer(activeLayer.id, {
                        position: [Number(e.target.value), activeLayer.position[1]]
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">Scale</span>
                    <span className="font-mono">{Math.round(activeLayer.scale[0] * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.02}
                    value={activeLayer.scale[0]}
                    onChange={(e) => {
                      const s = Number(e.target.value);
                      updateArtworkLayer(activeLayer.id, { scale: [s, s] });
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">Rotation</span>
                    <span className="font-mono">{activeLayer.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={activeLayer.rotation}
                    onChange={(e) =>
                      updateArtworkLayer(activeLayer.id, { rotation: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-[var(--text-secondary)] text-xs italic">
              Select an artwork layer from the left tree or click "Add Text" to begin.
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODE: FITTING ---------------- */}
      {activeMode === 'fitting' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider">Virtual Mannequin</h3>
            <span className="text-[10px] text-[var(--accent)] font-mono">Avatar V1</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div>
              <div className="text-xs font-medium">Show Avatar Mannequin</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Visualize garment ease over anatomical frame</div>
            </div>
            <input
              type="checkbox"
              checked={project.avatar.visible}
              onChange={(e) => setAvatarVisible(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
            />
          </div>

          <div className="space-y-2 border-t border-[var(--border)] pt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider">Garment Ease Analysis</h4>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-lg border border-[var(--border)] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Avatar Chest</span>
                <span>98 cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Garment Chest</span>
                <span>{(activeGarment.parameters.chestWidth * 2 / 10).toFixed(0)} cm</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-1 text-[var(--positive)] font-semibold font-sans">
                <span>Calculated Ease</span>
                <span>+{((activeGarment.parameters.chestWidth * 2 - 980) / 10).toFixed(0)} cm ({activeGarment.parameters.fit})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODE: RENDER ---------------- */}
      {activeMode === 'render' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[var(--accent)]" />
              Render & Studio Output
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div>
              <div className="text-xs font-medium">Topology Wireframe</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Inspect 3D mesh polygon distribution</div>
            </div>
            <input
              type="checkbox"
              checked={wireframeMode}
              onChange={(e) => setWireframeMode(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
            />
          </div>

          <div className="border-t border-[var(--border)] pt-3 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider">Image Export</h4>
            <button
              onClick={() => onExportPNG(true)}
              className="w-full py-2 px-3 rounded bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Export Transparent PNG
            </button>
            <button
              onClick={() => onExportPNG(false)}
              className="w-full py-2 px-3 rounded bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Export Studio Backdrop PNG
            </button>
          </div>

          <div className="border-t border-[var(--border)] pt-3 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider">3D File Export</h4>
            <button
              onClick={onExportGLB}
              className="w-full py-2.5 px-3 rounded bg-[var(--accent)] hover:opacity-90 text-xs text-white font-medium shadow flex items-center justify-center gap-2 transition-opacity"
            >
              Export Standard GLB (glTF 2.0)
            </button>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              Standard GLB binary with baked PBR materials, procedural textures, and custom decals ready for Blender, Unreal, or AR.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
