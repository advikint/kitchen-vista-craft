
import { Point, Cabinet } from '../types';

// Helper function to check if two rectangles overlap
export const isRectangleOverlap = (
  r1Pos: Point, r1Width: number, r1Depth: number, r1Rotation: number,
  r2Pos: Point, r2Width: number, r2Depth: number, r2Rotation: number
): boolean => {
  // Simple overlap check for now - can be enhanced for rotated cabinets
  // We'll check if the bounding boxes overlap
  const r1Left = r1Pos.x - r1Width / 2;
  const r1Right = r1Pos.x + r1Width / 2;
  const r1Top = r1Pos.y - r1Depth / 2;
  const r1Bottom = r1Pos.y + r1Depth / 2;
  
  const r2Left = r2Pos.x - r2Width / 2;
  const r2Right = r2Pos.x + r2Width / 2;
  const r2Top = r2Pos.y - r2Depth / 2;
  const r2Bottom = r2Pos.y + r2Depth / 2;
  
  return !(r2Left > r1Right || 
           r2Right < r1Left || 
           r2Top > r1Bottom ||
           r2Bottom < r1Top);
};

// Check if a point is inside a cabinet
export const isPointInsideCabinet = (point: Point, cabinet: Cabinet): boolean => {
  // Simple check for now, assuming no rotation
  const left = cabinet.position.x - cabinet.width / 2;
  const right = cabinet.position.x + cabinet.width / 2;
  const top = cabinet.position.y - cabinet.depth / 2;
  const bottom = cabinet.position.y + cabinet.depth / 2;
  
  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
};
