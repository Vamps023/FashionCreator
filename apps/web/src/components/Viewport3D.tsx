import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import {
  ViewportController,
  PerformanceStats
} from '@fashion-studio/renderer-3d';
import {
  Compass,
  Grid,
  Box,
  Eye,
  Columns,
  Maximize2
} from 'lucide-react';
import * as THREE from 'three';

export interface Viewport3DHandle {
  takeSnapshot: (transparent: boolean) => string;
  getGarmentGroup: () => THREE.Group | null;
}

interface Viewport3DProps {
  onPerformanceUpdate: (stats: PerformanceStats) => void;
}

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(({ onPerformanceUpdate }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ViewportController | null>(null);

  const {
    project,
    selectedPartId,
    cameraPreset,
    wireframeMode,
    viewMode2D3D,
    selectPart,
    setCameraPreset,
    setWireframeMode,
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
    }
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    const controller = new ViewportController();
    controller.init(mountRef.current);
    controllerRef.current = controller;

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

  // Update garment whenever activeGarment or wireframeMode changes
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setGarment(activeGarment, wireframeMode);
    }
  }, [activeGarment, wireframeMode]);

  // Update selected part highlight in Three.js
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setSelectedPart(selectedPartId);
    }
  }, [selectedPartId]);

  // Update camera preset
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  // Update avatar mannequin
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setAvatar(project.avatar);
    }
  }, [project.avatar]);

  // Update studio environment
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setEnvironment(project.environment);
    }
  }, [project.environment]);

  return (
    <div className="relative w-full h-full flex-1 bg-studio-950 overflow-hidden">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Floating Viewport Control Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-studio-900/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-studio-750 shadow-lg text-xs">
        {/* Preset Angles */}
        {(['perspective', 'front', 'back', 'left', 'right'] as const).map((angle) => (
          <button
            key={angle}
            onClick={() => setCameraPreset(angle)}
            className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
              cameraPreset === angle
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-studio-400 hover:text-white hover:bg-studio-800'
            }`}
          >
            {angle === 'perspective' ? '3D' : angle}
          </button>
        ))}

        <div className="w-[1px] h-4 bg-studio-750 mx-1" />

        {/* Wireframe toggle */}
        <button
          onClick={() => setWireframeMode(!wireframeMode)}
          className={`p-1.5 rounded transition-colors ${
            wireframeMode ? 'bg-blue-600 text-white' : 'text-studio-400 hover:text-white hover:bg-studio-800'
          }`}
          title="Toggle Wireframe"
        >
          <Box className="w-3.5 h-3.5" />
        </button>

        {/* Mannequin toggle */}
        <button
          onClick={() => setAvatarVisible(!project.avatar.visible)}
          className={`p-1.5 rounded transition-colors ${
            project.avatar.visible ? 'bg-blue-600 text-white' : 'text-studio-400 hover:text-white hover:bg-studio-800'
          }`}
          title="Toggle Avatar Mannequin"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* 2D/3D Split View toggle */}
        <button
          onClick={() => setViewMode2D3D(viewMode2D3D === 'split' ? '3d-only' : 'split')}
          className={`p-1.5 rounded transition-colors ${
            viewMode2D3D === 'split' ? 'bg-blue-600 text-white' : 'text-studio-400 hover:text-white hover:bg-studio-800'
          }`}
          title="Toggle 2D Print Layout / 3D Split View"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected Part Overlay Badge */}
      {selectedPartId && (
        <div className="absolute top-3 right-3 z-10 bg-studio-900/80 backdrop-blur-sm px-3 py-1 rounded border border-studio-750 text-[11px] text-blue-400 font-mono shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Active Part: {selectedPartId.replace('_', ' ').toUpperCase()}</span>
        </div>
      )}

      {/* Center Viewport Watermark / Navigation hint */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none text-[10px] text-studio-500 font-mono flex items-center gap-2">
        <span>L-Click: Rotate</span>
        <span>•</span>
        <span>R-Click: Pan</span>
        <span>•</span>
        <span>Wheel: Zoom</span>
      </div>
    </div>
  );
});
