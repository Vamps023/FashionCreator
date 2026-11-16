import { create } from 'zustand';
import {
  GarmentProject,
  GarmentInstance,
  GarmentType,
  ViewportDisplayMode,
  EditorMode,
  GarmentPartId,
  FabricMaterial,
  ArtworkLayer,
  GarmentParameters,
  GarmentComponentOptions,
  SurfacePrintZone,
  createInitialProject,
  createDefaultHoodieInstance,
  createDefaultTShirtInstance,
  createTwoPanelTunicInstance
} from '@fashion-studio/garment-schema';
import { HistoryManager } from './history';

export interface EditorState {
  // Document Data
  project: GarmentProject;
  activeGarmentId: string;
  
  // Editor UI State
  activeMode: EditorMode;
  selectedPartId: GarmentPartId | null;
  selectedArtworkLayerId: string | null;
  activePrintZone: SurfacePrintZone;
  cameraPreset: 'front' | 'back' | 'left' | 'right' | 'perspective';
  wireframeMode: boolean;
  displayMode: ViewportDisplayMode;
  showArrangementPoints: boolean;
  viewMode2D3D: '3d-only' | 'split' | '2d-only';
  statusMessage: string;
  isDirty: boolean;

  // History State
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  setActiveMode: (mode: EditorMode) => void;
  selectPart: (partId: GarmentPartId | null) => void;
  selectArtworkLayer: (layerId: string | null) => void;
  setActivePrintZone: (zone: SurfacePrintZone) => void;
  setCameraPreset: (preset: 'front' | 'back' | 'left' | 'right' | 'perspective') => void;
  setWireframeMode: (enabled: boolean) => void;
  setDisplayMode: (mode: ViewportDisplayMode) => void;
  setShowArrangementPoints: (show: boolean) => void;
  setViewMode2D3D: (mode: '3d-only' | 'split' | '2d-only') => void;
  setStatusMessage: (msg: string) => void;
  setAvatarVisible: (visible: boolean) => void;

  // Document Mutators with Undo/Redo recording
  updateProjectName: (name: string) => void;
  updateActiveGarment: (updater: (g: GarmentInstance) => GarmentInstance) => void;
  createNewGarment: (garment: GarmentInstance) => void;
  updateGarmentParameters: (params: Partial<GarmentParameters>) => void;
  updateComponentOption: <K extends keyof GarmentComponentOptions>(
    slot: K,
    value: GarmentComponentOptions[K]
  ) => void;
  updatePartMaterial: (partId: GarmentPartId, material: Partial<FabricMaterial>) => void;
  applyMaterialPresetToPart: (partId: GarmentPartId, preset: FabricMaterial) => void;
  applyMaterialPresetToAllParts: (preset: FabricMaterial) => void;
  
  // Artwork Layer Operations
  addArtworkLayer: (layer: Omit<ArtworkLayer, 'id'>) => void;
  updateArtworkLayer: (layerId: string, updates: Partial<ArtworkLayer>) => void;
  removeArtworkLayer: (layerId: string) => void;
  reorderArtworkLayers: (sourceIndex: number, destIndex: number) => void;

  // Template / Project level
  switchGarmentTemplate: (type: GarmentType | 'hoodie' | 'tshirt' | 'tunic') => void;
  loadProject: (project: GarmentProject) => void;
  resetProject: () => void;
  undo: () => void;
  redo: () => void;
}

const history = new HistoryManager();

function getActiveGarment(project: GarmentProject): GarmentInstance {
  const active = project.garments.find((g) => g.id === project.activeGarmentId);
  return active || project.garments[0];
}

function updateActiveGarmentInProject(
  project: GarmentProject,
  updater: (garment: GarmentInstance) => GarmentInstance
): GarmentProject {
  const active = getActiveGarment(project);
  const updatedGarment = updater(active);
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    garments: project.garments.map((g) => (g.id === active.id ? updatedGarment : g))
  };
}

export const useEditorStore = create<EditorState>((set, get) => {
  const initialProject = createInitialProject();
  return {
    project: initialProject,
    activeGarmentId: initialProject.activeGarmentId,
    activeMode: 'design',
    selectedPartId: 'body_front',
    selectedArtworkLayerId: 'art-front-logo-1',
    activePrintZone: 'front-print',
    cameraPreset: 'perspective',
    wireframeMode: false,
    displayMode: 'pbr',
    showArrangementPoints: false,
    viewMode2D3D: 'split',
    statusMessage: 'Ready · Saved locally',
    isDirty: false,
    canUndo: false,
    canRedo: false,

    setActiveMode: (mode) => set({ activeMode: mode }),
    
    selectPart: (partId) => set({ 
      selectedPartId: partId,
      // When a part is selected, contextually align mode or surface if appropriate
      activePrintZone: partId === 'body_back' ? 'back-print' : 'front-print'
    }),

    selectArtworkLayer: (layerId) => set({ selectedArtworkLayerId: layerId }),

    setActivePrintZone: (zone) => set({ activePrintZone: zone }),

    setCameraPreset: (preset) => set({ cameraPreset: preset }),

    setWireframeMode: (enabled) => set({ wireframeMode: enabled }),

    setDisplayMode: (mode) => set({ displayMode: mode }),

    setShowArrangementPoints: (show) => set({ showArrangementPoints: show }),

    setViewMode2D3D: (mode) => set({ viewMode2D3D: mode }),

    setStatusMessage: (statusMessage) => set({ statusMessage }),

    setAvatarVisible: (visible) => {
      const prev = get().project;
      const next: GarmentProject = {
        ...prev,
        avatar: { ...prev.avatar, visible }
      };
      set({ project: next });
    },

    updateProjectName: (name) => {
      const prev = get().project;
      set({ project: { ...prev, name } });
    },

    updateActiveGarment: (updater) => {
      const prev = get().project;
      const next = updateActiveGarmentInProject(prev, updater);
      set({
        project: next,
        activeGarmentId: next.activeGarmentId,
        isDirty: true
      });
    },

    createNewGarment: (newGarment) => {
      const prev = get().project;
      const next: GarmentProject = {
        ...prev,
        name: newGarment.name,
        activeGarmentId: newGarment.id,
        garments: [newGarment]
      };
      history.clear();
      set({
        project: next,
        activeGarmentId: newGarment.id,
        selectedPartId: 'body_front',
        selectedArtworkLayerId: newGarment.artworkLayers?.[0]?.id || null,
        canUndo: false,
        canRedo: false,
        statusMessage: `Loaded ${newGarment.name}`
      });
    },

  updateGarmentParameters: (params) => {
    const prev = get().project;
    const active = getActiveGarment(prev);
    const oldParams = { ...active.parameters };
    const newParams = { ...oldParams, ...params };

    const next = updateActiveGarmentInProject(prev, (g) => ({
      ...g,
      parameters: newParams
    }));

    history.push({
      id: 'update-params-' + Date.now(),
      name: 'Adjust Proportions',
      timestamp: Date.now(),
      undo: (p) => updateActiveGarmentInProject(p, (g) => ({ ...g, parameters: oldParams })),
      redo: (p) => updateActiveGarmentInProject(p, (g) => ({ ...g, parameters: newParams }))
    });

    set({
      project: next,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      isDirty: true,
      statusMessage: 'Updated garment measurements'
    });
  },

  updateComponentOption: (slot, value) => {
    const prev = get().project;
    const active = getActiveGarment(prev);
    const oldOption = active.components[slot];

    const next = updateActiveGarmentInProject(prev, (g) => ({
      ...g,
      components: { ...g.components, [slot]: value }
    }));

    history.push({
      id: 'update-comp-' + Date.now(),
      name: `Change ${String(slot)}`,
      timestamp: Date.now(),
      undo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        components: { ...g.components, [slot]: oldOption }
      })),
      redo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        components: { ...g.components, [slot]: value }
      }))
    });

    set({
      project: next,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      isDirty: true,
      statusMessage: `Changed ${String(slot)} component to ${String(value)}`
    });
  },

  updatePartMaterial: (partId, materialPatch) => {
    const prev = get().project;
    const active = getActiveGarment(prev);
    const oldMat = active.materials[partId] || { ...active.materials.body_front };
    const newMat = { ...oldMat, ...materialPatch };

    const next = updateActiveGarmentInProject(prev, (g) => ({
      ...g,
      materials: { ...g.materials, [partId]: newMat }
    }));

    history.push({
      id: 'update-material-' + Date.now(),
      name: `Modify Material (${partId})`,
      timestamp: Date.now(),
      undo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        materials: { ...g.materials, [partId]: oldMat }
      })),
      redo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        materials: { ...g.materials, [partId]: newMat }
      }))
    });

    set({
      project: next,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      isDirty: true
    });
  },

  applyMaterialPresetToPart: (partId, preset) => {
    const prev = get().project;
    const active = getActiveGarment(prev);
    const oldMat = active.materials[partId];
    const newMat = { ...preset };

    const next = updateActiveGarmentInProject(prev, (g) => ({
      ...g,
      materials: { ...g.materials, [partId]: newMat }
    }));

    history.push({
      id: 'apply-preset-' + Date.now(),
      name: `Apply Preset (${preset.name}) to ${partId}`,
      timestamp: Date.now(),
      undo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        materials: { ...g.materials, [partId]: oldMat }
      })),
      redo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        materials: { ...g.materials, [partId]: newMat }
      }))
    });

    set({
      project: next,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      isDirty: true,
      statusMessage: `Applied ${preset.name} to ${partId}`
    });
  },

  applyMaterialPresetToAllParts: (preset) => {
    const prev = get().project;
    const active = getActiveGarment(prev);
    const oldMaterials = { ...active.materials };
    const newMaterials: Record<GarmentPartId, FabricMaterial> = {} as any;

    Object.keys(oldMaterials).forEach((k) => {
      newMaterials[k as GarmentPartId] = { ...preset };
    });

    const next = updateActiveGarmentInProject(prev, (g) => ({
      ...g,
      materials: newMaterials
    }));

    history.push({
      id: 'apply-preset-all-' + Date.now(),
      name: `Apply ${preset.name} across garment`,
      timestamp: Date.now(),
      undo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        materials: oldMaterials
      })),
      redo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        materials: newMaterials
      }))
    });

    set({
      project: next,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      isDirty: true,
      statusMessage: `Applied ${preset.name} across all parts`
    });
  },

  addArtworkLayer: (layerData) => {
    const prev = get().project;
    const newLayer: ArtworkLayer = {
      ...layerData,
      id: 'layer-' + Date.now().toString(36)
    };

    const next = updateActiveGarmentInProject(prev, (g) => ({
      ...g,
      artworkLayers: [...g.artworkLayers, newLayer]
    }));

    history.push({
      id: 'add-artwork-' + Date.now(),
      name: `Add Artwork (${newLayer.name})`,
      timestamp: Date.now(),
      undo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        artworkLayers: g.artworkLayers.filter((l) => l.id !== newLayer.id)
      })),
      redo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        artworkLayers: [...g.artworkLayers, newLayer]
      }))
    });

    set({
      project: next,
      selectedArtworkLayerId: newLayer.id,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      isDirty: true,
      statusMessage: `Added artwork layer: ${newLayer.name}`
    });
  },

  updateArtworkLayer: (layerId, updates) => {
    const prev = get().project;
    const active = getActiveGarment(prev);
    const existing = active.artworkLayers.find((l) => l.id === layerId);
    if (!existing) return;

    const oldState = { ...existing };
    const newState = { ...existing, ...updates };

    const next = updateActiveGarmentInProject(prev, (g) => ({
      ...g,
      artworkLayers: g.artworkLayers.map((l) => (l.id === layerId ? newState : l))
    }));

    history.push({
      id: 'update-artwork-' + Date.now(),
      name: `Modify Layer (${existing.name})`,
      timestamp: Date.now(),
      undo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        artworkLayers: g.artworkLayers.map((l) => (l.id === layerId ? oldState : l))
      })),
      redo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        artworkLayers: g.artworkLayers.map((l) => (l.id === layerId ? newState : l))
      }))
    });

    set({
      project: next,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      isDirty: true
    });
  },

  removeArtworkLayer: (layerId) => {
    const prev = get().project;
    const active = getActiveGarment(prev);
    const target = active.artworkLayers.find((l) => l.id === layerId);
    if (!target) return;

    const next = updateActiveGarmentInProject(prev, (g) => ({
      ...g,
      artworkLayers: g.artworkLayers.filter((l) => l.id !== layerId)
    }));

    history.push({
      id: 'remove-artwork-' + Date.now(),
      name: `Delete Layer (${target.name})`,
      timestamp: Date.now(),
      undo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        artworkLayers: [...g.artworkLayers, target]
      })),
      redo: (p) => updateActiveGarmentInProject(p, (g) => ({
        ...g,
        artworkLayers: g.artworkLayers.filter((l) => l.id !== target.id)
      }))
    });

    set({
      project: next,
      selectedArtworkLayerId: null,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      isDirty: true,
      statusMessage: `Removed layer: ${target.name}`
    });
  },

  reorderArtworkLayers: (sourceIndex, destIndex) => {
    const prev = get().project;
    const next = updateActiveGarmentInProject(prev, (g) => {
      const layers = [...g.artworkLayers];
      const [removed] = layers.splice(sourceIndex, 1);
      layers.splice(destIndex, 0, removed);
      return { ...g, artworkLayers: layers };
    });
    set({ project: next, isDirty: true });
  },

  switchGarmentTemplate: (type) => {
    let newGarment;
    if (type === 'hoodie') {
      newGarment = createDefaultHoodieInstance();
    } else if (type === 'tshirt') {
      newGarment = createDefaultTShirtInstance();
    } else {
      newGarment = createTwoPanelTunicInstance();
    }
    const prev = get().project;
    const next: GarmentProject = {
      ...prev,
      name: newGarment.name,
      activeGarmentId: newGarment.id,
      garments: [newGarment]
    };
    history.clear();
    set({
      project: next,
      activeGarmentId: newGarment.id,
      selectedPartId: 'body_front',
      selectedArtworkLayerId: newGarment.artworkLayers[0]?.id || null,
      canUndo: false,
      canRedo: false,
      statusMessage: `Switched template to ${newGarment.name}`
    });
  },

  loadProject: (project) => {
    history.clear();
    const active = getActiveGarment(project);
    set({
      project,
      activeGarmentId: project.activeGarmentId,
      selectedPartId: 'body_front',
      selectedArtworkLayerId: active.artworkLayers[0]?.id || null,
      canUndo: false,
      canRedo: false,
      isDirty: false,
      statusMessage: `Loaded project: ${project.name}`
    });
  },

  resetProject: () => {
    history.clear();
    const initial = createInitialProject();
    set({
      project: initial,
      activeGarmentId: initial.activeGarmentId,
      selectedPartId: 'body_front',
      selectedArtworkLayerId: initial.garments[0].artworkLayers[0]?.id || null,
      canUndo: false,
      canRedo: false,
      isDirty: false,
      statusMessage: 'Project reset to default state'
    });
  },

  undo: () => {
    const current = get().project;
    const restored = history.undo(current);
    if (restored) {
      set({
        project: restored,
        canUndo: history.canUndo(),
        canRedo: history.canRedo(),
        statusMessage: 'Undo'
      });
    }
  },

  redo: () => {
    const current = get().project;
    const redone = history.redo(current);
    if (redone) {
      set({
        project: redone,
        canUndo: history.canUndo(),
        canRedo: history.canRedo(),
        statusMessage: 'Redo'
      });
    }
  }
  };
});

// Export helper for accessing active garment easily
export function useActiveGarment() {
  const project = useEditorStore((s) => s.project);
  return getActiveGarment(project);
}
