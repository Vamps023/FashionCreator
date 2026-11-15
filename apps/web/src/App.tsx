import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore, useActiveGarment } from '@fashion-studio/editor-core';
import { exportPNGImage, exportGLBFile, exportProjectFile } from '@fashion-studio/export-engine';
import { PerformanceStats } from '@fashion-studio/renderer-3d';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Viewport3D, Viewport3DHandle } from './components/Viewport3D';
import { ArtworkCanvasEditor } from './components/ArtworkCanvasEditor';
import { BottomBar } from './components/BottomBar';

export const App: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    drawCalls: 12,
    triangles: 14200
  });

  const viewportRef = useRef<Viewport3DHandle>(null);
  const {
    project,
    activeMode,
    viewMode2D3D,
    canUndo,
    canRedo,
    undo,
    redo,
    setStatusMessage
  } = useEditorStore();

  const activeGarment = useActiveGarment();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        exportProjectFile(project);
        setStatusMessage('Project saved to disk');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, project]);

  // PNG Snapshot Export
  const handleExportPNG = (transparent: boolean) => {
    if (!viewportRef.current) return;
    setStatusMessage('Generating studio render snapshot...');
    const dataUrl = viewportRef.current.takeSnapshot(transparent);
    if (dataUrl) {
      const filename = `${activeGarment.name.toLowerCase().replace(/\s+/g, '_')}_render.png`;
      exportPNGImage(dataUrl, filename);
      setStatusMessage(`Exported snapshot: ${filename}`);
    }
  };

  // GLB 3D Binary Export
  const handleExportGLB = async () => {
    if (!viewportRef.current) return;
    const garmentGroup = viewportRef.current.getGarmentGroup();
    if (!garmentGroup) {
      alert('Garment scene not loaded yet');
      return;
    }

    try {
      setStatusMessage('Baking materials and generating GLB binary...');
      const filename = `${activeGarment.name.toLowerCase().replace(/\s+/g, '_')}.glb`;
      await exportGLBFile(garmentGroup, filename);
      setStatusMessage(`Successfully exported ${filename}`);
    } catch (err: any) {
      alert('GLB Export failed: ' + err.message);
      setStatusMessage('Export error');
    }
  };

  const show2DLayout = viewMode2D3D === 'split' || activeMode === 'artwork';

  return (
    <div className="h-screen w-screen flex flex-col bg-studio-950 text-studio-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header onExportPNG={handleExportPNG} onExportGLB={handleExportGLB} />

      {/* Main Studio Workspace (Left Panel | Center 3D & 2D | Right Inspector) */}
      <main className="flex-1 flex overflow-hidden relative">
        <LeftSidebar />

        {show2DLayout && <ArtworkCanvasEditor />}

        <Viewport3D ref={viewportRef} onPerformanceUpdate={setStats} />

        <RightSidebar onExportPNG={handleExportPNG} onExportGLB={handleExportGLB} />
      </main>

      {/* Bottom Status Bar */}
      <BottomBar stats={stats} />
    </div>
  );
};
