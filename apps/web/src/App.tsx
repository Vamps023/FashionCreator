import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore, useActiveGarment } from '@fashion-studio/editor-core';
import { exportPNGImage, exportGLBFile, exportProjectFile } from '@fashion-studio/export-engine';
import { PerformanceStats } from '@fashion-studio/renderer-3d';
import { ThemeProvider, ResizablePanel, ErrorBoundary } from '@fashion-studio/ui';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Viewport3D, Viewport3DHandle } from './components/Viewport3D';
import { ArtworkCanvasEditor } from './components/ArtworkCanvasEditor';
import { PatternEditor } from './components/PatternEditor';
import { BottomBar } from './components/BottomBar';
import { DashboardModal } from './components/DashboardModal';
import { GLBValidatorModal } from './components/GLBValidatorModal';

export const AppContent: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    drawCalls: 12,
    triangles: 14200
  });

  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isGLBValidatorOpen, setIsGLBValidatorOpen] = useState(false);

  const viewportRef = useRef<Viewport3DHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Autosave to localStorage every 15 seconds if project is dirty
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        localStorage.setItem('fashion_studio_autosave', JSON.stringify(project));
      } catch (e) {
        // storage quota exceeded ignore
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [project]);

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

  const show2DArtwork = activeMode === 'artwork' || (viewMode2D3D === 'split' && activeMode !== 'pattern');

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenGLBValidator={() => setIsGLBValidatorOpen(true)}
        onExportPNG={handleExportPNG}
        onExportGLB={handleExportGLB}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Resizable Panel */}
        <ResizablePanel side="left" defaultWidth={260} minWidth={200} maxWidth={380}>
          <LeftSidebar />
        </ResizablePanel>

        {/* Center Viewport or Pattern Editor */}
        <div className="flex-1 flex h-full overflow-hidden">
          {activeMode === 'pattern' ? (
            <PatternEditor />
          ) : (
            <>
              {show2DArtwork && <ArtworkCanvasEditor />}
              <ErrorBoundary fallbackTitle="3D Viewport Encountered an Issue">
                <Viewport3D ref={viewportRef} onPerformanceUpdate={setStats} />
              </ErrorBoundary>
            </>
          )}
        </div>

        {/* Right Resizable Inspector */}
        <ResizablePanel side="right" defaultWidth={320} minWidth={260} maxWidth={460}>
          <RightSidebar onExportPNG={handleExportPNG} onExportGLB={handleExportGLB} />
        </ResizablePanel>
      </main>

      {/* Bottom Status Bar */}
      <BottomBar stats={stats} />

      {/* Dashboard Modal */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onOpenFile={() => fileInputRef.current?.click()}
      />

      {/* GLB Validator Modal */}
      <GLBValidatorModal
        isOpen={isGLBValidatorOpen}
        onClose={() => setIsGLBValidatorOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};
