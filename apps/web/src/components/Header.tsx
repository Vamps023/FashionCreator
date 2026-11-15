import React, { useRef } from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import { EditorMode } from '@fashion-studio/garment-schema';
import {
  exportProjectFile,
  importProjectFile
} from '@fashion-studio/export-engine';
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
  Camera
} from 'lucide-react';

interface HeaderProps {
  onExportPNG: (transparent: boolean) => void;
  onExportGLB: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExportPNG, onExportGLB }) => {
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

  const activeGarment = useActiveGarment();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes: { id: EditorMode; label: string; icon: React.ReactNode }[] = [
    { id: 'design', label: 'Design', icon: <Scissors className="w-3.5 h-3.5" /> },
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
    <header className="h-12 bg-studio-900 border-b border-studio-800 flex items-center justify-between px-3 z-30 select-none">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold tracking-wider text-sm text-white">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-studio-200">Fashion Studio</span>
        </div>

        <span className="text-studio-600 text-xs">/</span>

        <input
          type="text"
          value={project.name}
          onChange={(e) => updateProjectName(e.target.value)}
          className="bg-transparent hover:bg-studio-850 focus:bg-studio-850 px-2 py-1 rounded text-xs text-studio-300 font-medium border border-transparent hover:border-studio-750 focus:border-blue-500 outline-none w-44 transition-all"
          title="Click to rename project"
        />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-l border-studio-800 pl-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-studio-300 hover:bg-studio-800 hover:text-white'
                : 'text-studio-600 cursor-not-allowed opacity-40'
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
                ? 'text-studio-300 hover:bg-studio-800 hover:text-white'
                : 'text-studio-600 cursor-not-allowed opacity-40'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetProject}
            className="p-1.5 rounded text-studio-400 hover:bg-studio-800 hover:text-amber-400 transition-colors"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Mode Switcher */}
      <nav className="flex items-center gap-1 bg-studio-950 p-1 rounded-lg border border-studio-850">
        {modes.map((m) => {
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-studio-400 hover:text-studio-200 hover:bg-studio-850'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Project I/O and Export Actions */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".fstudio,.json"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-studio-850 hover:bg-studio-800 text-studio-300 text-xs font-medium border border-studio-750 transition-colors"
          title="Open .fstudio project"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Open
        </button>

        <button
          onClick={() => exportProjectFile(project)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-studio-850 hover:bg-studio-800 text-studio-300 text-xs font-medium border border-studio-750 transition-colors"
          title="Save project locally as .fstudio"
        >
          <Download className="w-3.5 h-3.5" />
          Save
        </button>

        {/* Quick GLB Export */}
        <button
          onClick={onExportGLB}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium shadow transition-all"
          title="Export 3D Model with PBR materials and graphics"
        >
          Export GLB
        </button>
      </div>
    </header>
  );
};
