import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore, useActiveGarment } from '@fashion-studio/editor-core';
import { PatternPiece, SewingConnection } from '@fashion-studio/garment-schema';
import {
  MousePointer,
  Scissors,
  Plus,
  Trash2,
  RotateCcw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Ruler,
  Check
} from 'lucide-react';

export type CADTool = 'select' | 'sew' | 'add-rect' | 'measure';

export const PatternCADCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    activeGarmentId,
    updateActiveGarment,
    setStatusMessage
  } = useEditorStore();

  const garment = useActiveGarment();
  const pieces = garment.patternPieces || [];
  const seams = garment.seams || [];

  const [activeTool, setActiveTool] = useState<CADTool>('select');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(pieces[0]?.id || null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Sewing tool selection state: [pieceId, edgeIndex]
  const [sewingSource, setSewingSource] = useState<{ pieceId: string; edgeIndex: number } | null>(null);

  // Pan and Zoom
  const [zoom, setZoom] = useState<number>(0.55); // pixels per mm
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging piece or vertex
  const [isDraggingTarget, setIsDraggingTarget] = useState<'piece' | 'vertex' | null>(null);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear background
    ctx.fillStyle = '#181920';
    ctx.fillRect(0, 0, w, h);

    // Draw millimeter grid
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    drawGrid(ctx, w / zoom, h / zoom, pan.x / zoom, pan.y / zoom);

    // Draw Pattern Pieces
    pieces.forEach((piece) => {
      const isSelected = piece.id === selectedPieceId;
      drawPiece(ctx, piece, isSelected);
    });

    // Draw Sewing Seam Lines between pieces
    drawSeams(ctx, pieces, seams, sewingSource);

    ctx.restore();
  }, [pieces, seams, selectedPieceId, selectedPointIndex, sewingSource, zoom, pan]);

  function drawGrid(ctx: CanvasRenderingContext2D, _w: number, _h: number, _panX: number, _panY: number) {
    ctx.lineWidth = 1 / zoom;
    const stepMm = 100; // 10 cm major grid
    const subStepMm = 20; // 2 cm minor grid

    ctx.strokeStyle = '#232530';
    for (let x = -1000; x <= 2500; x += subStepMm) {
      ctx.beginPath();
      ctx.moveTo(x, -500);
      ctx.lineTo(x, 2000);
      ctx.stroke();
    }
    for (let y = -500; y <= 2000; y += subStepMm) {
      ctx.beginPath();
      ctx.moveTo(-1000, y);
      ctx.lineTo(2500, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#303444';
    for (let x = -1000; x <= 2500; x += stepMm) {
      ctx.beginPath();
      ctx.moveTo(x, -500);
      ctx.lineTo(x, 2000);
      ctx.stroke();
    }
    for (let y = -500; y <= 2000; y += stepMm) {
      ctx.beginPath();
      ctx.moveTo(-1000, y);
      ctx.lineTo(2500, y);
      ctx.stroke();
    }
  }

  function drawPiece(ctx: CanvasRenderingContext2D, piece: PatternPiece, isSelected: boolean) {
    ctx.save();
    ctx.translate(piece.transform2D.x, piece.transform2D.y);
    ctx.rotate((piece.transform2D.rotation * Math.PI) / 180);

    const pts = piece.outlinePoints;
    if (pts.length < 3) {
      ctx.restore();
      return;
    }

    // 1. Fill pattern panel
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    ctx.fillStyle = isSelected ? 'rgba(167, 139, 250, 0.18)' : 'rgba(255, 255, 255, 0.06)';
    ctx.fill();

    // 2. Seam allowance boundary (offset outer line)
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Cut line perimeter
    ctx.strokeStyle = isSelected ? '#a78bfa' : '#94a3b8';
    ctx.lineWidth = (isSelected ? 2.5 : 1.5) / zoom;
    ctx.stroke();

    // 4. Draw vertices
    pts.forEach(([x, y], i) => {
      const isPtSelected = isSelected && selectedPointIndex === i;
      ctx.beginPath();
      ctx.arc(x, y, (isPtSelected ? 5.5 : 3.5) / zoom, 0, Math.PI * 2);
      ctx.fillStyle = isPtSelected ? '#fbbf24' : isSelected ? '#a78bfa' : '#cbd5e1';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1 / zoom;
      ctx.stroke();
    });

    // 5. Draw edge lengths and sewing edge highlights
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const midX = (p1[0] + p2[0]) / 2;
      const midY = (p1[1] + p2[1]) / 2;
      const lenMm = Math.round(Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2));

      // Check if this edge is selected in sewing mode
      const isSewingSelected = sewingSource?.pieceId === piece.id && sewingSource.edgeIndex === i;

      if (isSewingSelected) {
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4 / zoom;
        ctx.stroke();
      }

      // Edge dimension text
      ctx.fillStyle = isSewingSelected ? '#38bdf8' : '#64748b';
      ctx.font = `${Math.max(9, Math.round(11 / zoom))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${lenMm} mm`, midX, midY - 6 / zoom);
    }

    // 6. Piece Label & Grainline
    ctx.fillStyle = isSelected ? '#ffffff' : '#e2e8f0';
    ctx.font = `bold ${Math.max(12, Math.round(14 / zoom))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(piece.name, pts[0][0] + 120, pts[0][1] + 40);

    ctx.restore();
  }

  function drawSeams(
    ctx: CanvasRenderingContext2D,
    piecesList: PatternPiece[],
    seamsList: SewingConnection[],
    activeSource: any
  ) {
    const pieceMap = new Map<string, PatternPiece>(piecesList.map((p) => [p.id, p]));

    seamsList.forEach((seam) => {
      const pA = pieceMap.get(seam.sourcePieceId);
      const pB = pieceMap.get(seam.targetPieceId);
      if (!pA || !pB) return;

      const ptsA = pA.outlinePoints;
      const ptsB = pB.outlinePoints;

      const pA1 = ptsA[seam.sourceEdgeIndex];
      const pA2 = ptsA[(seam.sourceEdgeIndex + 1) % ptsA.length];
      const pB1 = ptsB[seam.targetEdgeIndex];
      const pB2 = ptsB[(seam.targetEdgeIndex + 1) % ptsB.length];

      if (!pA1 || !pA2 || !pB1 || !pB2) return;

      const midAX = pA.transform2D.x + (pA1[0] + pA2[0]) / 2;
      const midAY = pA.transform2D.y + (pA1[1] + pA2[1]) / 2;
      const midBX = pB.transform2D.x + (pB1[0] + pB2[0]) / 2;
      const midBY = pB.transform2D.y + (pB1[1] + pB2[1]) / 2;

      // Draw curved sewing indicator line between corresponding seams
      ctx.beginPath();
      ctx.moveTo(midAX, midAY);
      const cpX = (midAX + midBX) / 2;
      const cpY = (midAY + midBY) / 2 - 30;
      ctx.quadraticCurveTo(cpX, cpY, midBX, midBY);

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sewing tag
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(midAX, midAY, 4 / zoom, 0, Math.PI * 2);
      ctx.arc(midBX, midBY, 4 / zoom, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Pointer Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Right click or middle click -> pan
    if (e.button === 2 || e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setDragStart({ x: mouseX - pan.x, y: mouseY - pan.y });
      return;
    }

    // Convert mouse to document coordinates in mm
    const docX = (mouseX - pan.x) / zoom;
    const docY = (mouseY - pan.y) / zoom;

    // Check hit on pattern pieces
    for (let i = pieces.length - 1; i >= 0; i--) {
      const piece = pieces[i];
      const localX = docX - piece.transform2D.x;
      const localY = docY - piece.transform2D.y;

      // Check vertex hit
      for (let v = 0; v < piece.outlinePoints.length; v++) {
        const [vx, vy] = piece.outlinePoints[v];
        const dist = Math.hypot(localX - vx, localY - vy);
        if (dist <= 12 / zoom) {
          setSelectedPieceId(piece.id);
          setSelectedPointIndex(v);
          setIsDraggingTarget('vertex');
          return;
        }
      }

      // Check edge hit (for Sewing tool)
      for (let eIdx = 0; eIdx < piece.outlinePoints.length; eIdx++) {
        const p1 = piece.outlinePoints[eIdx];
        const p2 = piece.outlinePoints[(eIdx + 1) % piece.outlinePoints.length];
        const dEdge = distToSegment([localX, localY], p1, p2);

        if (dEdge <= 14 / zoom) {
          if (activeTool === 'sew') {
            if (!sewingSource) {
              setSewingSource({ pieceId: piece.id, edgeIndex: eIdx });
              setStatusMessage(`Selected seam edge on ${piece.name}. Now click matching target edge.`);
            } else {
              // Create seam connection between source and target!
              if (sewingSource.pieceId !== piece.id || sewingSource.edgeIndex !== eIdx) {
                createSeamConnection(sewingSource.pieceId, sewingSource.edgeIndex, piece.id, eIdx);
                setSewingSource(null);
              }
            }
            return;
          }
        }
      }

      // Check piece interior hit
      if (isPointInsidePolygon([localX, localY], piece.outlinePoints)) {
        setSelectedPieceId(piece.id);
        setSelectedPointIndex(null);
        setIsDraggingTarget('piece');
        setDragStart({ x: docX - piece.transform2D.x, y: docY - piece.transform2D.y });
        return;
      }
    }

    // Clicked in empty space
    if (activeTool === 'sew') {
      setSewingSource(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isPanning) {
      setPan({ x: mouseX - dragStart.x, y: mouseY - dragStart.y });
      return;
    }

    const docX = (mouseX - pan.x) / zoom;
    const docY = (mouseY - pan.y) / zoom;

    if (isDraggingTarget === 'piece' && selectedPieceId) {
      const piece = pieces.find((p) => p.id === selectedPieceId);
      if (piece) {
        const newX = Math.round(docX - dragStart.x);
        const newY = Math.round(docY - dragStart.y);
        updatePieceTransform(piece.id, newX, newY);
      }
    } else if (isDraggingTarget === 'vertex' && selectedPieceId && selectedPointIndex !== null) {
      const piece = pieces.find((p) => p.id === selectedPieceId);
      if (piece) {
        const localX = Math.round(docX - piece.transform2D.x);
        const localY = Math.round(docY - piece.transform2D.y);
        updatePieceVertex(piece.id, selectedPointIndex, localX, localY);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingTarget(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom((z) => Math.max(0.15, Math.min(2.5, z * zoomFactor)));
  };

  function updatePieceTransform(pieceId: string, x: number, y: number) {
    const updated = pieces.map((p) =>
      p.id === pieceId ? { ...p, transform2D: { ...p.transform2D, x, y } } : p
    );
    updateActiveGarment((g) => ({ ...g, patternPieces: updated }));
  }

  function updatePieceVertex(pieceId: string, ptIdx: number, newX: number, newY: number) {
    const updated = pieces.map((p) => {
      if (p.id !== pieceId) return p;
      const newPts = [...p.outlinePoints];
      newPts[ptIdx] = [newX, newY];
      return { ...p, outlinePoints: newPts };
    });
    updateActiveGarment((g) => ({ ...g, patternPieces: updated }));
  }

  function createSeamConnection(pA: string, eA: number, pB: string, eB: number) {
    const newSeam: SewingConnection = {
      id: `seam-${Date.now().toString(36)}`,
      name: `Seam ${pA}:${eA} to ${pB}:${eB}`,
      sourcePieceId: pA,
      sourceEdgeIndex: eA,
      targetPieceId: pB,
      targetEdgeIndex: eB,
      orientation: 'normal',
      sewingMode: '1-to-1',
      active: true
    };
    updateActiveGarment((g) => ({
      ...g,
      seams: [...(g.seams || []), newSeam]
    }));
    setStatusMessage(`Created sewing seam connection between panels`);
  }

  function handleAddRectanglePiece() {
    const newId = `piece-rect-${Date.now().toString(36)}`;
    const newPiece: PatternPiece = {
      id: newId,
      name: `Panel ${pieces.length + 1}`,
      category: 'custom',
      outlinePoints: [
        [0, 0],
        [320, 0],
        [320, 480],
        [0, 480]
      ],
      segments: [],
      internalLines: [],
      grainlineAngle: 90,
      seamAllowanceMm: 10,
      materialId: 'default',
      quantity: 1,
      mirrored: false,
      transform2D: { x: 100, y: 100, rotation: 0 },
      transform3D: { position: [0, 0.1, 0.2], rotation: [0, 0, 0] },
      meshDensityMm: 22
    };
    updateActiveGarment((g) => ({
      ...g,
      patternPieces: [...pieces, newPiece]
    }));
    setSelectedPieceId(newId);
    setStatusMessage('Added new pattern piece');
  }

  function handleDeleteSelected() {
    if (!selectedPieceId) return;
    const updatedPieces = pieces.filter((p) => p.id !== selectedPieceId);
    const updatedSeams = seams.filter(
      (s) => s.sourcePieceId !== selectedPieceId && s.targetPieceId !== selectedPieceId
    );
    updateActiveGarment((g) => ({
      ...g,
      patternPieces: updatedPieces,
      seams: updatedSeams
    }));
    setSelectedPieceId(updatedPieces[0]?.id || null);
    setStatusMessage('Deleted selected pattern piece');
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-app)] overflow-hidden select-none relative">
      {/* CAD Toolbar */}
      <div className="h-10 bg-[var(--bg-panel)] border-b border-[var(--border)] px-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${
              activeTool === 'select'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
            title="Select & Move (V)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>

          <button
            onClick={() => {
              setActiveTool('sew');
              setSewingSource(null);
            }}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${
              activeTool === 'sew'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
            title="Sewing Tool (S) — Click edge A, then edge B to create seam"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Sew Seam</span>
          </button>

          <button
            onClick={handleAddRectanglePiece}
            className="p-1.5 rounded text-xs flex items-center gap-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white transition-colors"
            title="Create New Fabric Panel"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Panel</span>
          </button>

          {selectedPieceId && (
            <button
              onClick={handleDeleteSelected}
              className="p-1.5 rounded text-xs flex items-center gap-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Selected Panel"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Viewport Zoom & Reset */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-mono">
          <button onClick={() => setZoom((z) => Math.max(0.15, z - 0.1))} className="p-1 hover:text-white">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))} className="p-1 hover:text-white">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(0.55);
              setPan({ x: 80, y: 80 });
            }}
            className="p-1 hover:text-white"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2D Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#181920]">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full cursor-crosshair"
        />

        {/* Floating Tool Instructions */}
        <div className="absolute bottom-3 left-3 bg-[var(--bg-panel)]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[var(--border)] text-[10px] text-[var(--text-secondary)] font-mono flex items-center gap-2 shadow-lg">
          {activeTool === 'sew' ? (
            <span className="text-cyan-400">
              {sewingSource ? 'Click matching edge to complete seam' : 'Click first seam edge to start sewing'}
            </span>
          ) : (
            <span>Drag pieces to arrange • Drag vertices to shape • Right-click to pan</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Distance from point to line segment
function distToSegment(p: [number, number], v: [number, number], w: [number, number]): number {
  const l2 = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2;
  if (l2 === 0) return Math.hypot(p[0] - v[0], p[1] - v[1]);
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (v[0] + t * (w[0] - v[0])), p[1] - (v[1] + t * (w[1] - v[1])));
}

function isPointInsidePolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
