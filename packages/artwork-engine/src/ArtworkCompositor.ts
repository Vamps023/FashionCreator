import * as THREE from 'three';
import { ArtworkLayer, SurfacePrintZone } from '@fashion-studio/garment-schema';

export class ArtworkCompositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private width: number = 1024;
  private height: number = 1024;
  public surfaceId: SurfacePrintZone;

  constructor(surfaceId: SurfacePrintZone, width: number = 1024, height: number = 1024) {
    this.surfaceId = surfaceId;
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for artwork compositor');
    this.ctx = ctx;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public async render(layers: ArtworkLayer[], baseColor?: string): Promise<void> {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Reset canvas
    ctx.clearRect(0, 0, w, h);

    if (baseColor) {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, w, h);
    }

    // Filter visible layers that belong to this surface
    const surfaceLayers = layers.filter((l) => l.visible && l.surfaceId === this.surfaceId);

    for (const layer of surfaceLayers) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));

      // Layer normalized coordinate translation
      const cx = layer.position[0] * w;
      const cy = layer.position[1] * h;

      ctx.translate(cx, cy);
      if (layer.rotation) {
        ctx.rotate((layer.rotation * Math.PI) / 180);
      }

      if (layer.type === 'text' && layer.text) {
        this.renderTextLayer(ctx, layer, w, h);
      } else if (layer.type === 'image' && layer.dataUrl) {
        await this.renderImageLayer(ctx, layer, w, h);
      } else if (layer.type === 'shape') {
        this.renderShapeLayer(ctx, layer, w, h);
      }

      ctx.restore();
    }

    this.texture.needsUpdate = true;
  }

  private renderTextLayer(ctx: CanvasRenderingContext2D, layer: ArtworkLayer, _w: number, _h: number): void {
    const fontSize = layer.fontSize || 32;
    const fontWeight = layer.fontWeight || 'bold';
    const fontFamily = layer.fontFamily || 'Inter, sans-serif';
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = layer.color || '#ffffff';

    const text = layer.text || '';
    const letterSpacing = layer.letterSpacing || 0;

    if (letterSpacing > 0 && typeof (ctx as any).letterSpacing !== 'undefined') {
      (ctx as any).letterSpacing = `${letterSpacing}px`;
      ctx.fillText(text, 0, 0);
    } else if (letterSpacing > 0) {
      // Manual letter spacing fallback
      const chars = text.split('');
      const charWidths = chars.map((c) => ctx.measureText(c).width + letterSpacing);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0) - letterSpacing;
      let startX = -totalWidth / 2;

      for (let i = 0; i < chars.length; i++) {
        ctx.fillText(chars[i], startX + charWidths[i] / 2, 0);
        startX += charWidths[i];
      }
    } else {
      ctx.fillText(text, 0, 0);
    }
  }

  private async renderImageLayer(ctx: CanvasRenderingContext2D, layer: ArtworkLayer, w: number, h: number): Promise<void> {
    if (!layer.dataUrl) return;

    let img = this.imageCache.get(layer.dataUrl);
    if (!img) {
      img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = layer.dataUrl!;
      });
      this.imageCache.set(layer.dataUrl, img);
    }

    const scaleX = layer.scale[0] || 0.3;
    const scaleY = layer.scale[1] || 0.3;
    const targetW = w * scaleX;
    const targetH = (img.height / img.width) * targetW * (scaleY / scaleX);

    ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
  }

  private renderShapeLayer(ctx: CanvasRenderingContext2D, layer: ArtworkLayer, w: number, _h: number): void {
    const size = w * (layer.scale[0] || 0.2);
    ctx.fillStyle = layer.color || '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, 16);
    ctx.fill();
  }

  public dispose(): void {
    this.texture.dispose();
    this.imageCache.clear();
  }
}
