export type PatternPoint = [number, number]; // [x, y] in millimeters

export interface PatternEdge {
  id: string;
  name: string;
  startPoint: PatternPoint;
  endPoint: PatternPoint;
  controlPoint?: PatternPoint; // Optional quadratic/cubic bezier control
  isSeam: boolean;
  seamAllowanceMm: number;     // e.g. 10 mm standard apparel allowance
  stitchedToEdgeId?: string;
}

export interface PatternPanel {
  id: string;
  name: string;
  category: 'bodice' | 'sleeve' | 'hood' | 'pocket' | 'trim';
  points: PatternPoint[];       // Ordered contour points in mm
  edges: PatternEdge[];
  cutQuantity: number;          // e.g. Cut 1 on fold, or Cut 2 mirrored
  grainLine: {
    start: PatternPoint;
    end: PatternPoint;
  };
  dimensionsMm: {
    width: number;
    height: number;
  };
}

export interface PatternDocument {
  id: string;
  garmentId: string;
  units: 'mm';
  version: number;
  panels: PatternPanel[];
  totalAreaM2: number;
}
