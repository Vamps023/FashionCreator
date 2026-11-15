import React, { useRef } from 'react';
import { useEditorStore } from '@fashion-studio/editor-core';
import { EditorMode } from '@fashion-studio/garment-schema';
import { exportProjectFile, importProjectFile } from '@fashion-studio/export-engine';
import { useTheme } from '@fashion-studio/ui';
import {
  Undo2,
  Redo2,
  Download,
  FolderOpen,
  RotateCcw,
  Sparkles,
  Scissors,
  Palette,
  Image as ImageIcon,
  User,
  Camera,
  Sun,
  Moon,
  Grid,
  CheckCircle,
  LayoutDashboard,
  Box,
  Link2,
  Activity
} from 'lucide-react';

interface HeaderProps {
  onOpenDashboard: () => void;
  onOpenGLBValidator: () => void;
  onExportPNG: (transparent: boolean) => void;
  onExportGLB: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDashboard,
  onOpenGLBValidator,
  onExportGLB
}) => {
  const {
    project,
    activeMode,
    canUndo,
    canRedo,
    setActiveMode,
    updateProjectName,
    undo,
    redo,
    resetProject,
    loadProject
  } = useEditorStore();

  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes: { id: EditorMode; label: string; icon: React.ReactNode }[] = [
    { id: 'design', label: 'Design', icon: <Scissors className="w-3.5 h-3.5" /> },
    { id: 'pattern', label: 'Pattern CAD', icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'sewing', label: 'Sewing', icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: 'simulation', label: 'Cloth Sim', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'fabric', label: 'Fabric', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'artwork', label: 'Artwork', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'fitting', label: 'Fitting', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'render', label: 'Render', icon: <Camera className="w-3.5 h-3.5" /> }
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const loaded = await importProjectFile(file);
        loadProject(loaded);
      } catch (err: any) {
        alert('Failed to load project: ' + err.message);
      }
    }
  };

  return (
    <header className="h-12 bg-[var(--bg-panel)] border-b border-[var(--border)] flex items-center justify-between px-3 z-30 select-none text-[var(--text-primary)]">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenDashboard}
          className="flex items-center gap-2 font-bold tracking-wider text-xs hover:opacity-80 transition-opacity"
          title="Open Project Dashboard"
        >
          <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm">Fashion Studio</span>
        </button>

        <span className="text-[var(--text-secondary)] text-xs">/</span>

        <input
          type="text"
          value={project.name}
          onChange={(e) => updateProjectName(e.target.value)}
          className="bg-transparent hover:bg-[var(--bg-elevated)] focus:bg-[var(--bg-elevated)] px-2 py-1 rounded text-xs text-[var(--text-primary)] font-medium border border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-44 transition-all"
          title="Click to rename project"
        />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-l border-[var(--border)] pl-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                : 'text-[var(--text-secondary)] cursor-not-allowed opacity-30'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                : 'text-[var(--text-secondary)] cursor-not-allowed opacity-30'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetProject}
            className="p-1.5 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-amber-500 transition-colors"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Mode Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border)]">
        {modes.map((m) => {
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Actions, Theme Toggle, Export */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".fstudio,.json"
          className="hidden"
        />

        {/* Dashboard button */}
        <button
          onClick={onOpenDashboard}
          className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Open Dashboard"
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>

        {/* GLB Validator Tool */}
        <button
          onClick={onOpenGLBValidator}
          className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Validate Exported GLB File"
        >
          <Box className="w-4 h-4" />
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-panel)] text-[var(--text-primary)] text-xs font-medium border border-[var(--border)] transition-colors"
          title="Open .fstudio project"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Open
        </button>

        <button
          onClick={() => exportProjectFile(project)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-panel)] text-[var(--text-primary)] text-xs font-medium border border-[var(--border)] transition-colors"
          title="Save project locally as .fstudio"
        >
          <Download className="w-3.5 h-3.5" />
          Save
        </button>

        <button
          onClick={onExportGLB}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--accent)] hover:opacity-90 text-white text-xs font-medium shadow transition-opacity"
          title="Export 3D Model with PBR materials and graphics"
        >
          Export GLB
        </button>
      </div>
    </header>
  );
};
