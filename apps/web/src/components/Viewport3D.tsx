import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import {
  ViewportController,
  PerformanceStats
} from '@fashion-studio/renderer-3d';
import {
  Box,
  Eye,
  Columns,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Layers,
  Gauge,
  MapPin,
  Sparkles
} from 'lucide-react';
import * as THREE from 'three';

export interface Viewport3DHandle {
  takeSnapshot: (transparent: boolean) => string;
  getGarmentGroup: () => THREE.Group | null;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  toggleSimulation: () => void;
  isSimulating: () => boolean;
}

interface Viewport3DProps {
  onPerformanceUpdate: (stats: PerformanceStats) => void;
  onSimulationStateChange?: (isRunning: boolean) => void;
  onArrangementPointSelected?: (pointId: string) => void;
}

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(({
  onPerformanceUpdate,
  onArrangementPointSelected,
  onSimulationStateChange
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ViewportController | null>(null);
  const [isSimRunning, setIsSimRunning] = useState(false);

  const {
    project,
    selectedPartId,
    cameraPreset,
    wireframeMode,
    displayMode,
    showArrangementPoints,
    viewMode2D3D,
    selectPart,
    setCameraPreset,
    setWireframeMode,
    setDisplayMode,
    setShowArrangementPoints,
    setViewMode2D3D,
    setAvatarVisible
  } = useEditorStore();

  const activeGarment = useActiveGarment();

  useImperativeHandle(ref, () => ({
    takeSnapshot: (transparent: boolean) => {
      return controllerRef.current ? controllerRef.current.takeSnapshot({ transparent }) : '';
    },
    getGarmentGroup: () => {
      return controllerRef.current ? controllerRef.current.getGarmentGroup() : null;
    },
    startSimulation: () => {
      controllerRef.current?.startSimulation();
      setIsSimRunning(true);
    },
    pauseSimulation: () => {
      controllerRef.current?.pauseSimulation();
      setIsSimRunning(false);
    },
    resetSimulation: () => {
      controllerRef.current?.resetSimulation();
      setIsSimRunning(false);
    },
    toggleSimulation: () => {
      if (controllerRef.current?.isSimulating()) {
        controllerRef.current?.pauseSimulation();
        setIsSimRunning(false);
      } else {
        controllerRef.current?.startSimulation();
        setIsSimRunning(true);
      }
    },
    isSimulating: () => {
      return controllerRef.current ? controllerRef.current.isSimulating() : false;
    }
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    const controller = new ViewportController();
    controller.init(mountRef.current);
    controllerRef.current = controller;

    controller.onSimulationStateChange = (running) => {
      setIsSimRunning(running);
      onSimulationStateChange?.(running);
    };

    controller.onArrangementPointClicked = (pointId) => {
      onArrangementPointSelected?.(pointId);
    };

    controller.onPartSelected = (partId) => {
      selectPart(partId);
    };

    controller.onPerformanceStats = (stats) => {
      onPerformanceUpdate(stats);
    };

    // Initial setup
    controller.setGarment(activeGarment, wireframeMode);
    controller.setAvatar(project.avatar);
    controller.setEnvironment(project.environment);

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  // Update garment when activeGarment or its patternPieces / seams change
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setGarment(activeGarment, wireframeMode);
    }
  }, [activeGarment, wireframeMode]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setSelectedPart(selectedPartId);
    }
  }, [selectedPartId]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setAvatar(project.avatar);
    }
  }, [project.avatar]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setEnvironment(project.environment);
    }
  }, [project.environment]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setDisplayMode(displayMode);
    }
  }, [displayMode]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setShowArrangementPoints(showArrangementPoints);
    }
  }, [showArrangementPoints]);

  const toggleSimulation = () => {
    if (!controllerRef.current) return;
    if (isSimRunning) {
      controllerRef.current.pauseSimulation();
      setIsSimRunning(false);
    } else {
      controllerRef.current.startSimulation();
      setIsSimRunning(true);
    }
  };

  const resetSimulation = () => {
    if (!controllerRef.current) return;
    controllerRef.current.resetSimulation();
    setIsSimRunning(false);
  };

  return (
    <div className="relative w-full h-full flex-1 bg-[var(--bg-app)] overflow-hidden">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Floating Viewport Control Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[var(--bg-panel)]/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-[var(--border)] shadow-lg text-xs">
        {/* Preset Angles */}
        {(['perspective', 'front', 'back', 'left', 'right'] as const).map((angle) => (
          <button
            key={angle}
            onClick={() => setCameraPreset(angle)}
            className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
              cameraPreset === angle
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {angle === 'perspective' ? '3D' : angle}
          </button>
        ))}

        <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

        {/* Wireframe toggle */}
        <button
          onClick={() => setWireframeMode(!wireframeMode)}
          className={`p-1.5 rounded transition-colors ${
            wireframeMode ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
          }`}
          title="Toggle Wireframe"
        >
          <Box className="w-3.5 h-3.5" />
        </button>

        {/* Mannequin toggle */}
        <button
          onClick={() => setAvatarVisible(!project.avatar.visible)}
          className={`p-1.5 rounded transition-colors ${
            project.avatar.visible ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
          }`}
          title="Toggle Avatar Mannequin"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* 2D/3D Split View toggle */}
        <button
          onClick={() => setViewMode2D3D(viewMode2D3D === 'split' ? '3d-only' : 'split')}
          className={`p-1.5 rounded transition-colors ${
            viewMode2D3D === 'split' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
          }`}
          title="Toggle 2D Pattern / 3D Split View"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

        {/* CLO 3D Arrangement Points Toggle */}
        <button
          onClick={() => setShowArrangementPoints(!showArrangementPoints)}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            showArrangementPoints ? 'bg-sky-500 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
          }`}
          title="Toggle Avatar Arrangement Points (Cylindrical Wrapping Targets)"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Points</span>
        </button>

        <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

        {/* Display Mode: PBR vs Strain Map vs Fit Map */}
        <div className="flex items-center bg-[var(--bg-elevated)] p-0.5 rounded border border-[var(--border)]">
          <button
            onClick={() => setDisplayMode('pbr')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              displayMode === 'pbr' ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
            title="Photorealistic PBR Material View"
          >
            PBR
          </button>
          <button
            onClick={() => setDisplayMode('strain')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              displayMode === 'strain' ? 'bg-amber-500 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
            title="Strain / Tension Heatmap: Red = Stretched, Green = Relaxed, Blue = Loose"
          >
            <Gauge className="w-3 h-3" />
            Strain
          </button>
          <button
            onClick={() => setDisplayMode('fit')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              displayMode === 'fit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
            title="Avatar Pressure / Contact Ease Map"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Center Top: Simulation Play / Pause / Reset Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-[var(--bg-panel)]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--border)] shadow-xl text-xs">
        <button
          onClick={toggleSimulation}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
            isSimRunning
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
          }`}
          title="Play / Pause Cloth Simulation (Spacebar)"
        >
          {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimRunning ? 'Pause Draping' : 'Simulate Cloth'}</span>
        </button>

        <button
          onClick={resetSimulation}
          className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Reset Simulation to Initial Rest Placement"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)]">
          <span className={`w-2 h-2 rounded-full ${isSimRunning ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
          <span>{isSimRunning ? 'XPBD Active' : 'Physics Idle'}</span>
        </div>
      </div>

      {/* Selected Part Badge */}
      {selectedPartId && (
        <div className="absolute top-3 right-3 z-10 bg-[var(--bg-panel)]/90 backdrop-blur-sm px-3 py-1 rounded border border-[var(--border)] text-[11px] text-[var(--accent)] font-mono shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span>Active Part: {selectedPartId.replace('_', ' ').toUpperCase()}</span>
        </div>
      )}

      {/* Navigation Guide Hint & Interactive Cloth Grabbing */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none text-[10px] text-[var(--text-secondary)] font-mono flex items-center gap-2 bg-[var(--bg-panel)]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-[var(--border)]">
        <span className="text-[var(--accent)] font-semibold">Tug: Drag Cloth</span>
        <span>•</span>
        <span>Pin: Shift+Click</span>
        <span>•</span>
        <span>Orbit: L-Click</span>
        <span>•</span>
        <span>Pan: R-Click</span>
        <span>•</span>
        <span>Zoom: Wheel</span>
      </div>
    </div>
  );
});
