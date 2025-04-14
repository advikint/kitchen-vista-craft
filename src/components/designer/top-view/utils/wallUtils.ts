
import { Wall } from "@/store/kitchenStore";

export const findNearestWall = (point: { x: number; y: number }, walls: Wall[]) => {
  let nearestWall = null;
  let minDistance = Infinity;
  
  walls.forEach(wall => {
    const distance = distanceToWall(point, wall);
    if (distance < minDistance && distance < 50) {
      minDistance = distance;
      nearestWall = wall;
    }
  });
  
  return nearestWall;
};

export const distanceToWall = (point: { x: number; y: number }, wall: Wall) => {
  const { start, end } = wall;
  
  const wallVector = {
    x: end.x - start.x,
    y: end.y - start.y
  };
  
  const pointVector = {
    x: point.x - start.x,
    y: point.y - start.y
  };
  
  const wallLengthSq = wallVector.x * wallVector.x + wallVector.y * wallVector.y;
  
  if (wallLengthSq === 0) {
    return Math.sqrt(pointVector.x * pointVector.x + pointVector.y * pointVector.y);
  }
  
  const t = (pointVector.x * wallVector.x + pointVector.y * wallVector.y) / wallLengthSq;
  
  const clampedT = Math.max(0, Math.min(1, t));
  
  const closestPoint = {
    x: start.x + clampedT * wallVector.x,
    y: start.y + clampedT * wallVector.y
  };
  
  return Math.sqrt(
    Math.pow(point.x - closestPoint.x, 2) + 
    Math.pow(point.y - closestPoint.y, 2)
  );
};

export const calculatePositionOnWall = (point: { x: number; y: number }, wall: Wall) => {
  const { start, end } = wall;
  
  const wallVector = {
    x: end.x - start.x,
    y: end.y - start.y
  };
  
  const pointVector = {
    x: point.x - start.x,
    y: point.y - start.y
  };
  
  const wallLengthSq = wallVector.x * wallVector.x + wallVector.y * wallVector.y;
  
  const t = (pointVector.x * wallVector.x + pointVector.y * wallVector.y) / wallLengthSq;
  
  return Math.max(0, Math.min(1, t));
};
