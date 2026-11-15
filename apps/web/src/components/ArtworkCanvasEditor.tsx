import React, { useRef, useEffect } from 'react';
import {
  useEditorStore,
  useActiveGarment
} from '@fashion-studio/editor-core';
import { SurfacePrintZone } from '@fashion-studio/garment-schema';

export const ArtworkCanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    activePrintZone,
    selectedArtworkLayerId,
    setActivePrintZone,
    selectArtworkLayer,
    updateArtworkLayer
  } = useEditorStore();

  const activeGarment = useActiveGarment();
  const layers = activeGarment.artworkLayers.filter(
    (l) => l.surfaceId === activePrintZone && l.visible
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#181920';
    ctx.fillRect(0, 0, w, h);

    // Grid guide
    ctx.strokeStyle = '#272935';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Print zone boundary box
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(w * 0.15, h * 0.15, w * 0.7, h * 0.7);
    ctx.setLineDash([]);

    // Print zone label
    ctx.fillStyle = '#60a5fa';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      activePrintZone === 'front-print' ? 'FRONT CHEST PRINT ZONE' : 'BACK PANEL PRINT ZONE',
      w * 0.15 + 8,
      h * 0.15 + 18
    );

    // Draw active layers on the 2D surface
    layers.forEach((layer) => {
      ctx.save();
      const cx = layer.position[0] * w;
      const cy = layer.position[1] * h;

      ctx.translate(cx, cy);
      if (layer.rotation) {
        ctx.rotate((layer.rotation * Math.PI) / 180);
      }

      const isSelected = selectedArtworkLayerId === layer.id;

      if (layer.type === 'text' && layer.text) {
        ctx.font = `${layer.fontWeight || 'bold'} ${(layer.fontSize || 24) * 0.8}px ${layer.fontFamily || 'Inter'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = layer.color || '#ffffff';
        ctx.fillText(layer.text, 0, 0);

        // Bounding box if selected
        if (isSelected) {
          const metrics = ctx.measureText(layer.text);
          const boxW = metrics.width + 16;
          const boxH = (layer.fontSize || 24) + 12;
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
        }
      } else if (layer.type === 'image' && layer.dataUrl) {
        const img = new Image();
        img.src = layer.dataUrl;
        const scaleX = layer.scale[0] || 0.3;
        const targetW = w * scaleX * 0.8;
        const targetH = targetW * (img.height / (img.width || 1));
        if (img.complete) {
          ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
        }
        if (isSelected) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-targetW / 2, -targetH / 2, targetW, targetH);
        }
      }

      ctx.restore();
    });
  }, [layers, activePrintZone, selectedArtworkLayerId]);

  return (
    <div className="w-80 bg-studio-900 border-r border-studio-800 flex flex-col h-full select-none">
      <div className="p-3 border-b border-studio-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
          2D Print Layout
        </span>
        <div className="flex gap-1 text-[11px]">
          <button
            onClick={() => setActivePrintZone('front-print')}
            className={`px-2 py-0.5 rounded ${
              activePrintZone === 'front-print' ? 'bg-blue-600 text-white' : 'text-studio-400'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => setActivePrintZone('back-print')}
            className={`px-2 py-0.5 rounded ${
              activePrintZone === 'back-print' ? 'bg-blue-600 text-white' : 'text-studio-400'
            }`}
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 bg-studio-950/60 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-lg border border-studio-750 shadow-inner max-w-full aspect-square"
        />
      </div>

      <div className="p-2.5 border-t border-studio-800 text-[10px] text-studio-500 font-mono text-center">
        Normalized UV Canvas (1024 x 1024)
      </div>
    </div>
  );
};
