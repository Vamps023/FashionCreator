import React, { useRef } from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import {
  FABRIC_PRESETS,
  GarmentPartId,
  SurfacePrintZone
} from '@fashion-studio/garment-schema';
import {
  Sliders,
  Palette,
  Type,
  Plus,
  Upload,
  Camera,
  Check,
  RotateCw,
  Sun,
  Grid
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
    selectArtworkLayer,
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

  // Get active part fabric
  const targetPartId: GarmentPartId = selectedPartId || 'body_front';
  const currentMaterial = activeGarment.materials[targetPartId] || activeGarment.materials.body_front;

  // Get active artwork layer
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
    <aside className="w-80 bg-studio-900 border-l border-studio-800 flex flex-col h-full select-none z-20 overflow-y-auto">
      {/* ---------------- MODE: DESIGN ---------------- */}
      {activeMode === 'design' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-studio-800 pb-2">
            <h3 className="text-xs font-semibold text-studio-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Proportions & Fit
            </h3>
            <span className="text-[10px] text-blue-400 font-mono">
              {activeGarment.parameters.fit.toUpperCase()}
            </span>
          </div>

          {/* Fit Profile Selector */}
          <div>
            <label className="text-[11px] text-studio-400 block mb-1.5 font-medium">Silhouette Fit</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['slim', 'regular', 'relaxed', 'oversized'] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => updateGarmentParameters({ fit })}
                  className={`py-1.5 rounded text-[11px] capitalize transition-colors ${
                    activeGarment.parameters.fit === fit
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'bg-studio-850 text-studio-400 hover:text-studio-200 border border-studio-750'
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
              <div className="flex justify-between text-xs text-studio-300 mb-1">
                <span>Body Length</span>
                <span className="font-mono text-studio-400">
                  {(activeGarment.parameters.bodyLength / 10).toFixed(1)} cm
                </span>
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
              <div className="flex justify-between text-xs text-studio-300 mb-1">
                <span>Chest Width</span>
                <span className="font-mono text-studio-400">
                  {(activeGarment.parameters.chestWidth / 10).toFixed(1)} cm
                </span>
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
              <div className="flex justify-between text-xs text-studio-300 mb-1">
                <span>Sleeve Length</span>
                <span className="font-mono text-studio-400">
                  {(activeGarment.parameters.sleeveLength / 10).toFixed(1)} cm
                </span>
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
          <div className="border-t border-studio-800 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
              Component Variants
            </h4>

            {activeGarment.type === 'hoodie' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-studio-400">Hood Style</span>
                  <select
                    value={activeGarment.components.hood}
                    onChange={(e) => updateComponentOption('hood', e.target.value as any)}
                    className="bg-studio-850 text-xs text-studio-200 border border-studio-750 rounded px-2 py-1 outline-none"
                  >
                    <option value="double-layer">Double Layer Cowl</option>
                    <option value="single-layer">Single Layer</option>
                    <option value="none">No Hood (Crewneck)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-studio-400">Pockets</span>
                  <select
                    value={activeGarment.components.pockets}
                    onChange={(e) => updateComponentOption('pockets', e.target.value as any)}
                    className="bg-studio-850 text-xs text-studio-200 border border-studio-750 rounded px-2 py-1 outline-none"
                  >
                    <option value="kangaroo">Kangaroo Pouch</option>
                    <option value="none">Clean Front (None)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-studio-400">Drawstrings</span>
                  <select
                    value={activeGarment.components.drawstrings}
                    onChange={(e) => updateComponentOption('drawstrings', e.target.value as any)}
                    className="bg-studio-850 text-xs text-studio-200 border border-studio-750 rounded px-2 py-1 outline-none"
                  >
                    <option value="round-cord">Round Cord & Tips</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-studio-400">Wrist Cuffs</span>
              <select
                value={activeGarment.components.cuffs}
                onChange={(e) => updateComponentOption('cuffs', e.target.value as any)}
                className="bg-studio-850 text-xs text-studio-200 border border-studio-750 rounded px-2 py-1 outline-none"
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
          <div className="flex items-center justify-between border-b border-studio-800 pb-2">
            <h3 className="text-xs font-semibold text-studio-200 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              Fabric & Materials
            </h3>
            <span className="text-[10px] text-blue-400 font-mono">
              Target: {targetPartId.replace('_', ' ')}
            </span>
          </div>

          {/* Color Picker & Swatches */}
          <div>
            <label className="text-[11px] text-studio-400 block mb-1.5 font-medium">Fabric Base Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={currentMaterial.color}
                onChange={(e) => updatePartMaterial(targetPartId, { color: e.target.value })}
                className="w-10 h-10 rounded border border-studio-700 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={currentMaterial.color.toUpperCase()}
                onChange={(e) => updatePartMaterial(targetPartId, { color: e.target.value })}
                className="bg-studio-850 px-2.5 py-1.5 rounded text-xs font-mono text-studio-200 border border-studio-750 w-28 uppercase"
              />
            </div>
          </div>

          {/* Curated Fabric Presets */}
          <div>
            <label className="text-[11px] text-studio-400 block mb-2 font-medium">Fabric Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(FABRIC_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyMaterialPresetToPart(targetPartId, preset)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-750 text-left transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: preset.color }}
                  />
                  <div className="truncate">
                    <div className="text-[11px] text-studio-200 truncate">{preset.name}</div>
                    <div className="text-[9px] text-studio-500 capitalize">{preset.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PBR Surface Physics */}
          <div className="border-t border-studio-800 pt-4 space-y-3.5">
            <h4 className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
              PBR Surface Parameters
            </h4>

            <div>
              <div className="flex justify-between text-xs text-studio-300 mb-1">
                <span>Roughness</span>
                <span className="font-mono text-studio-400">{currentMaterial.roughness.toFixed(2)}</span>
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
              <div className="flex justify-between text-xs text-studio-300 mb-1">
                <span>Cloth Sheen</span>
                <span className="font-mono text-studio-400">{currentMaterial.sheen.toFixed(2)}</span>
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
              <div className="flex justify-between text-xs text-studio-300 mb-1">
                <span>Weave Relief (Normal Scale)</span>
                <span className="font-mono text-studio-400">{currentMaterial.normalScale.toFixed(2)}</span>
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
              <label className="text-[11px] text-studio-400 block mb-1">Weave Pattern</label>
              <select
                value={currentMaterial.texturePattern}
                onChange={(e) => updatePartMaterial(targetPartId, { texturePattern: e.target.value as any })}
                className="w-full bg-studio-850 text-xs text-studio-200 border border-studio-750 rounded px-2.5 py-1.5 outline-none"
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
              className="w-full mt-2 py-2 rounded bg-studio-800 hover:bg-studio-750 border border-studio-700 text-xs text-studio-200 font-medium transition-colors"
            >
              Apply This Fabric to Entire Garment
            </button>
          </div>
        </div>
      )}

      {/* ---------------- MODE: ARTWORK ---------------- */}
      {activeMode === 'artwork' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-studio-800 pb-2">
            <h3 className="text-xs font-semibold text-studio-200 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" />
              Artwork & Graphics
            </h3>
          </div>

          {/* Surface Print Zone Switcher */}
          <div>
            <label className="text-[11px] text-studio-400 block mb-1.5 font-medium">Print Zone</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setActivePrintZone('front-print')}
                className={`py-1.5 rounded text-xs transition-colors ${
                  activePrintZone === 'front-print'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-studio-850 text-studio-400 border border-studio-750 hover:bg-studio-800'
                }`}
              >
                Front Chest
              </button>
              <button
                onClick={() => setActivePrintZone('back-print')}
                className={`py-1.5 rounded text-xs transition-colors ${
                  activePrintZone === 'back-print'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-studio-850 text-studio-400 border border-studio-750 hover:bg-studio-800'
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
              className="flex items-center justify-center gap-1.5 py-2 rounded bg-studio-850 hover:bg-studio-800 border border-studio-750 text-xs text-studio-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
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
              className="flex items-center justify-center gap-1.5 py-2 rounded bg-studio-850 hover:bg-studio-800 border border-studio-750 text-xs text-studio-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Add Text
            </button>
          </div>

          {/* Active Layer Inspector */}
          {activeLayer ? (
            <div className="border-t border-studio-800 pt-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-studio-200 truncate">
                  {activeLayer.name}
                </span>
                <span className="text-[10px] text-blue-400 font-mono capitalize">
                  {activeLayer.type}
                </span>
              </div>

              {activeLayer.type === 'text' && (
                <>
                  <div>
                    <label className="text-[11px] text-studio-400 block mb-1">Text Content</label>
                    <input
                      type="text"
                      value={activeLayer.text || ''}
                      onChange={(e) => updateArtworkLayer(activeLayer.id, { text: e.target.value })}
                      className="w-full bg-studio-850 text-xs text-studio-100 border border-studio-750 rounded px-2.5 py-1.5 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] text-studio-400 block mb-1">Color</label>
                      <input
                        type="color"
                        value={activeLayer.color || '#ffffff'}
                        onChange={(e) => updateArtworkLayer(activeLayer.id, { color: e.target.value })}
                        className="w-full h-8 rounded border border-studio-700 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] text-studio-400 block mb-1">Letter Spacing</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={activeLayer.letterSpacing || 0}
                        onChange={(e) =>
                          updateArtworkLayer(activeLayer.id, { letterSpacing: Number(e.target.value) })
                        }
                        className="w-full bg-studio-850 text-xs text-studio-100 border border-studio-750 rounded px-2 py-1.5 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Transform Controls */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-studio-300 mb-1">
                    <span>Vertical Position (Y)</span>
                    <span className="font-mono text-studio-400">
                      {Math.round(activeLayer.position[1] * 100)}%
                    </span>
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
                  <div className="flex justify-between text-xs text-studio-300 mb-1">
                    <span>Horizontal Position (X)</span>
                    <span className="font-mono text-studio-400">
                      {Math.round(activeLayer.position[0] * 100)}%
                    </span>
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
                  <div className="flex justify-between text-xs text-studio-300 mb-1">
                    <span>Scale</span>
                    <span className="font-mono text-studio-400">
                      {Math.round(activeLayer.scale[0] * 100)}%
                    </span>
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
                  <div className="flex justify-between text-xs text-studio-300 mb-1">
                    <span>Rotation</span>
                    <span className="font-mono text-studio-400">{activeLayer.rotation}°</span>
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
            <div className="text-center py-6 text-studio-500 text-xs italic">
              Select an artwork layer from the left tree or click "Add Text" to begin.
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODE: FITTING ---------------- */}
      {activeMode === 'fitting' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-studio-800 pb-2">
            <h3 className="text-xs font-semibold text-studio-200 uppercase tracking-wider flex items-center gap-1.5">
              Virtual Mannequin
            </h3>
            <span className="text-[10px] text-blue-400 font-mono">Avatar V1</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-studio-850 border border-studio-750">
            <div>
              <div className="text-xs text-studio-200 font-medium">Show Avatar Mannequin</div>
              <div className="text-[10px] text-studio-500">Visualize garment fit over body frame</div>
            </div>
            <input
              type="checkbox"
              checked={project.avatar.visible}
              onChange={(e) => setAvatarVisible(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2 border-t border-studio-800 pt-3">
            <h4 className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
              Avatar Dimensions
            </h4>
            <div className="bg-studio-950 p-3 rounded-lg border border-studio-850 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-studio-300">
                <span>Height</span>
                <span className="text-studio-400">182 cm</span>
              </div>
              <div className="flex justify-between text-studio-300">
                <span>Chest Circumference</span>
                <span className="text-studio-400">98 cm</span>
              </div>
              <div className="flex justify-between text-studio-300">
                <span>Waist</span>
                <span className="text-studio-400">80 cm</span>
              </div>
              <div className="flex justify-between text-studio-300">
                <span>Garment Ease</span>
                <span className="text-emerald-400">+14 cm (Relaxed)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODE: RENDER ---------------- */}
      {activeMode === 'render' && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-studio-800 pb-2">
            <h3 className="text-xs font-semibold text-studio-200 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              Render & Studio Output
            </h3>
          </div>

          {/* Wireframe toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-studio-850 border border-studio-750">
            <div>
              <div className="text-xs text-studio-200 font-medium">Topology Wireframe</div>
              <div className="text-[10px] text-studio-500">Inspect 3D mesh polygon distribution</div>
            </div>
            <input
              type="checkbox"
              checked={wireframeMode}
              onChange={(e) => setWireframeMode(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
          </div>

          {/* PNG Export Actions */}
          <div className="border-t border-studio-800 pt-3 space-y-2.5">
            <h4 className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
              Image Export
            </h4>
            <button
              onClick={() => onExportPNG(true)}
              className="w-full py-2 px-3 rounded bg-studio-850 hover:bg-studio-800 border border-studio-750 text-xs text-studio-200 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Export Transparent PNG
            </button>
            <button
              onClick={() => onExportPNG(false)}
              className="w-full py-2 px-3 rounded bg-studio-850 hover:bg-studio-800 border border-studio-750 text-xs text-studio-200 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Export Studio Backdrop PNG
            </button>
          </div>

          {/* 3D GLB Export */}
          <div className="border-t border-studio-800 pt-3 space-y-2.5">
            <h4 className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
              3D File Export
            </h4>
            <button
              onClick={onExportGLB}
              className="w-full py-2.5 px-3 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium shadow flex items-center justify-center gap-2 transition-colors"
            >
              Export Standard GLB (glTF 2.0)
            </button>
            <p className="text-[10px] text-studio-500 leading-relaxed">
              Standard GLB binary with baked PBR materials, procedural textures, and custom decals
              ready for Blender, Unreal, Unity, or AR viewer.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
