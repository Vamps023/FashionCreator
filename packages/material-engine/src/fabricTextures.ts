import * as THREE from 'three';

// Cache generated canvas textures to avoid re-allocating GPU memory
const textureCache = new Map<string, THREE.CanvasTexture>();

export function getProceduralNormalMap(
  pattern: 'plain' | 'twill' | 'ribbed' | 'terry' | 'knit',
  repeat: number = 32
): THREE.CanvasTexture {
  const cacheKey = `norm_${pattern}_${repeat}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let nx = 0;
      let ny = 0;
      let nz = 1;

      if (pattern === 'ribbed') {
        // High-frequency vertical ridges
        const freq = (x / size) * Math.PI * 2 * 16;
        nx = Math.sin(freq) * 0.7;
        ny = 0.05 * Math.cos((y / size) * Math.PI * 2 * 32);
      } else if (pattern === 'twill') {
        // Diagonal 45-degree twill weave ridges
        const diag = ((x + y) / size) * Math.PI * 2 * 20;
        nx = Math.sin(diag) * 0.5;
        ny = Math.sin(diag) * 0.5;
      } else if (pattern === 'knit') {
        // Looped interlock knit pattern
        const u = (x / size) * Math.PI * 2 * 16;
        const v = (y / size) * Math.PI * 2 * 24;
        nx = Math.sin(u) * Math.cos(v) * 0.6;
        ny = Math.cos(u) * Math.sin(v) * 0.6;
      } else if (pattern === 'terry') {
        // Micro loops and pebble texture
        const noiseX = Math.sin(x * 0.8) * Math.cos(y * 0.4);
        const noiseY = Math.cos(x * 0.4) * Math.sin(y * 0.8);
        nx = noiseX * 0.4;
        ny = noiseY * 0.4;
      } else {
        // Plain weave crosshatch
        const cx = Math.sin((x / size) * Math.PI * 2 * 28);
        const cy = Math.sin((y / size) * Math.PI * 2 * 28);
        nx = cx * 0.35;
        ny = cy * 0.35;
      }

      // Normalize normal vector
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len;
      ny /= len;
      nz /= len;

      // Pack [-1, 1] normal into [0, 255] RGB
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.needsUpdate = true;

  textureCache.set(cacheKey, tex);
  return tex;
}
