import { GarmentProject } from '@fashion-studio/garment-schema';

export interface Command {
  id: string;
  name: string;
  timestamp: number;
  undo: (project: GarmentProject) => GarmentProject;
  redo: (project: GarmentProject) => GarmentProject;
}

export class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxDepth: number = 60;

  public push(command: Command): void {
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }
    // Any new user action invalidates the redo branch
    this.redoStack = [];
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public undo(currentProject: GarmentProject): GarmentProject | null {
    const cmd = this.undoStack.pop();
    if (!cmd) return null;
    const restored = cmd.undo(currentProject);
    this.redoStack.push(cmd);
    return restored;
  }

  public redo(currentProject: GarmentProject): GarmentProject | null {
    const cmd = this.redoStack.pop();
    if (!cmd) return null;
    const redone = cmd.redo(currentProject);
    this.undoStack.push(cmd);
    return redone;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  public getUndoCount(): number {
    return this.undoStack.length;
  }

  public getRedoCount(): number {
    return this.redoStack.length;
  }
}
