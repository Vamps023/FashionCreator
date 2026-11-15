import React, { useRef } from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import {
  FABRIC_PRESETS,
  PHYSICAL_FABRIC_PRESETS,
  GarmentPartId,
  PhysicalFabricProperties
} from '@fashion-studio/garment-schema';
import {
  Sliders,
  Palette,
  Type,
  Plus,
  Upload,
  Camera,
  Layers,
  Scissors,
  Activity,
  Trash2,
  RotateCw,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface RightSidebarProps {
  onExportPNG: (transparent: boolean) => void;
  onExportGLB: () => void;
  onToggleSimulation?: () => void;
  onResetSimulation?: () => void;
  isSimRunning?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onExportPNG,
  onExportGLB,
  onToggleSimulation,
  onResetSimulation,
  isSimRunning = false
}) => {
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
    wireframeMode,
    updateActiveGarment
  } = useEditorStore();

  const activeGarment = useActiveGarment();
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const targetPartId: GarmentPartId = selectedPartId || 'body_front';
  const currentMaterial = activeGarment.materials[targetPartId] || activeGarment.materials.body_front;
  const currentPhysical = activeGarment.physicalFabrics.default || PHYSICAL_FABRIC_PRESETS['heavy-cotton-fleece'];
  const activeLayer = activeGarment.artworkLayers.find((l) => l.id === selectedArtworkLayerId);
  const seams = activeGarment.seams || [];
  const pieces = activeGarment.patternPieces || [];

  const handleApplyPhysicalPreset = (preset: PhysicalFabricProperties) => {
    updateActiveGarment((g) => ({
      ...g,
      physicalFabrics: {
        ...g.physicalFabrics,
        default: { ...preset }
      }
    }));
  };

  const handleUpdatePhysical = (updates: Partial<PhysicalFabricProperties>) => {
    updateActiveGarment((g) => ({
      ...g,
      physicalFabrics: {
        ...g.physicalFabrics,
        default: { ...currentPhysical, ...updates }
      }
    }));
  };

  const handleUpdateSimulation = (updates: any) => {
    updateActiveGarment((g) => ({
      ...g,
      simulationSettings: {
        ...g.simulationSettings,
        ...updates
      }
    }));
  };

  const handleToggleSeamOrientation = (seamId: string) => {
    const updated = seams.map((s) =>
      s.id === seamId ? { ...s, orientation: s.orientation === 'normal' ? 'reversed' as const : 'normal' as const } : s
    );
    updateActiveGarment((g) => ({ ...g, seams: updated }));
  };

  const handleDeleteSeam = (seamId: string) => {
    const updated = seams.filter((s) => s.id !== seamId);
    updateActiveGarment((g) => ({ ...g, seams: updated }));
  };

  return (
    <aside className="w-full bg-[var(--bg-panel)] border-l border-[var(--border)] flex flex-col h-full select-none text-[var(--text-primary)] overflow-y-auto">
      {/* ---------------- MODE: SIMULATION ---------------- */}
      {(activeMode === 'simulation' || activeMode === 'sewing') && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
              Cloth Physics Solver
            </h3>
            <span className="text-[10px] text-[var(--accent)] font-mono">XPBD Engine</span>
          </div>

          {/* Quick Solver Controls */}
          <div className="flex gap-2">
            <button
              onClick={onToggleSimulation}
              className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow transition-all ${
                isSimRunning ? 'bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimRunning ? 'Pause Draping' : 'Run Draping'}</span>
            </button>
            <button
              onClick={onResetSimulation}
              className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-white"
              title="Reset Simulation Mesh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Physical Fabric Presets */}
          <div>
            <label className="text-[11px] text-[var(--text-secondary)] block mb-2 font-medium">
              Physical Fabric Behaviors
            </label>
            <div className="space-y-1.5">
              {Object.entries(PHYSICAL_FABRIC_PRESETS).map(([key, preset]) => {
                const isSelected = currentPhysical.id === preset.id;
                return (
                  <button
                    key={key}
                    onClick={() => handleApplyPhysicalPreset(preset)}
                    className={`w-full text-left p-2 rounded-lg text-xs border transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-medium'
                        : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div>
                      <div className="font-medium truncate">{preset.name}</div>
                      <div className="text-[10px] opacity-70 font-mono">
                        {preset.arealDensityGsm} GSM • Stretch: {Math.round(preset.warpStiffness * 100)}% • Bend: {Math.round(preset.bendingStiffness * 100)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Parameters Sliders */}
          <div className="border-t border-[var(--border)] pt-4 space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider">Physical Properties</h4>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Warp Stretch Resistance</span>
                <span className="font-mono">{Math.round(currentPhysical.warpStiffness * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.02}
                value={currentPhysical.warpStiffness}
                onChange={(e) => handleUpdatePhysical({ warpStiffness: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Bending / Fold Stiffness</span>
                <span className="font-mono">{Math.round(currentPhysical.bendingStiffness * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.02}
                value={currentPhysical.bendingStiffness}
                onChange={(e) => handleUpdatePhysical({ bendingStiffness: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Areal Density (Weight)</span>
                <span className="font-mono">{currentPhysical.arealDensityGsm} GSM</span>
              </div>
              <input
                type="range"
                min={80}
                max={600}
                step={10}
                value={currentPhysical.arealDensityGsm}
                onChange={(e) => handleUpdatePhysical({ arealDensityGsm: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          {/* Active Seams List in Sewing Mode */}
          {activeMode === 'sewing' && (
            <div className="border-t border-[var(--border)] pt-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>Active Seams ({seams.length})</span>
                <Scissors className="w-3.5 h-3.5 text-emerald-400" />
              </h4>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {seams.map((seam) => (
                  <div
                    key={seam.id}
                    className="p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-[var(--text-primary)] truncate">{seam.name || seam.id}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                        Orientation: {seam.orientation}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleSeamOrientation(seam.id)}
                        className="p-1 hover:text-[var(--accent)]"
                        title="Reverse Seam Direction"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSeam(seam.id)}
                        className="p-1 hover:text-rose-400"
                        title="Delete Seam"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODE: DESIGN / PATTERN ---------------- */}
      {(activeMode === 'design' || activeMode === 'pattern') && (
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
              Proportions & Pattern Pieces
            </h3>
            <span className="text-[10px] text-[var(--accent)] font-mono">
              {pieces.length} Panels
            </span>
          </div>

          {/* Pattern Pieces Summary */}
          <div>
            <label className="text-[11px] text-[var(--text-secondary)] block mb-1.5 font-medium">Garment Pattern Panels</label>
            <div className="space-y-1">
              {pieces.map((p) => (
                <div key={p.id} className="p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-xs flex justify-between items-center">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">{p.outlinePoints.length} vertices</span>
                </div>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-4 border-t border-[var(--border)] pt-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Garment Body Length</span>
                <span className="font-mono">{(activeGarment.parameters.bodyLength / 10).toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min={500}
                max={950}
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
                min={400}
                max={800}
                value={activeGarment.parameters.chestWidth}
                onChange={(e) => updateGarmentParameters({ chestWidth: Number(e.target.value) })}
                className="w-full"
              />
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
            <span className="text-[10px] text-[var(--accent)] font-mono">Visual PBR</span>
          </div>

          {/* Color Picker */}
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

          {/* Visual Presets */}
          <div>
            <label className="text-[11px] text-[var(--text-secondary)] block mb-2 font-medium">Visual PBR Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(FABRIC_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyMaterialPresetToPart(targetPartId, preset)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] text-left transition-colors"
                >
                  <span className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0" style={{ backgroundColor: preset.color }} />
                  <div className="truncate">
                    <div className="text-[11px] text-[var(--text-primary)] truncate">{preset.name}</div>
                    <div className="text-[9px] text-[var(--text-secondary)] capitalize">{preset.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
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
              <div className="text-[10px] text-[var(--text-secondary)]">Anatomical colliders for cloth draping</div>
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
                <span>+{((activeGarment.parameters.chestWidth * 2 - 980) / 10).toFixed(0)} cm</span>
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
              <div className="text-[10px] text-[var(--text-secondary)]">Inspect simulated mesh triangles</div>
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
              Export Simulated GLB (glTF 2.0)
            </button>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              Exports the actual draped 3D geometry with sewn seams, embedded materials, and vertex normals.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
