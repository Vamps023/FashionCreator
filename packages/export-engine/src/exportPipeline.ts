import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { GarmentProject } from '@fashion-studio/garment-schema';

/**
 * Downloads editable .fstudio project file
 */
export function exportProjectFile(project: GarmentProject): void {
  const data = JSON.stringify(project, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const filename = `${sanitizeFilename(project.name || 'garment-project')}.fstudio`;
  triggerDownload(blob, filename);
}

/**
 * Parses and validates an uploaded .fstudio file
 */
export async function importProjectFile(file: File): Promise<GarmentProject> {
  const text = await file.text();
  const parsed = JSON.parse(text) as GarmentProject;

  if (!parsed.schemaVersion || !parsed.garments || parsed.garments.length === 0) {
    throw new Error('Invalid project file: missing schemaVersion or garment definitions');
  }

  return parsed;
}

/**
 * Exports current 3D viewport canvas image as PNG
 */
export function exportPNGImage(dataUrl: string, filename: string = 'fashion-studio-render.png'): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports the 3D Garment Scene Graph into standard GLB binary
 */
export async function exportGLBFile(
  garmentGroup: THREE.Group,
  filename: string = 'garment.glb'
): Promise<void> {
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      garmentGroup,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: 'model/gltf-binary' });
          triggerDownload(blob, filename);
          resolve();
        } else {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: 'application/json' });
          triggerDownload(blob, filename.replace('.glb', '.gltf'));
          resolve();
        }
      },
      (error) => {
        reject(error);
      },
      {
        binary: true,
        onlyVisible: true,
        embedImages: true
      }
    );
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}
