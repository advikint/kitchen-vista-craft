
import { toast } from "sonner";
import { useKitchenStore, Point, Wall } from "@/store/kitchenStore";

/**
 * Custom hook for placing doors and windows on walls
 */
export const useOpeningPlacement = (loadTemplate: (type: string) => any) => {
  const { walls, addDoor, addWindow } = useKitchenStore();

  /**
   * Handle door placement
   */
  const handleDoorClick = (pos: Point) => {
    // Find the closest wall to place door on
    const closestWall = findClosestWallToPoint(pos);
    if (!closestWall) {
      toast.error("No wall found to place door on");
      return;
    }

    // Get the template door data
    const doorTemplate = loadTemplate('door');
    if (!doorTemplate) {
      toast.error("Door template not found");
      return;
    }

    // Calculate position along the wall (0-1)
    const position = calculatePositionAlongWall(closestWall, pos);
    
    // Calculate wall angle for correct orientation
    const wallAngle = calculateWallAngle(closestWall);

    addDoor({
      wallId: closestWall.id,
      position,
      width: doorTemplate.width || 80,
      height: doorTemplate.height || 200,
      type: doorTemplate.type || 'standard'
    });

    toast.success("Door added");
  };

  /**
   * Handle window placement
   */
  const handleWindowClick = (pos: Point) => {
    // Find the closest wall to place window on
    const closestWall = findClosestWallToPoint(pos);
    if (!closestWall) {
      toast.error("No wall found to place window on");
      return;
    }

    // Get the template window data
    const windowTemplate = loadTemplate('window');
    if (!windowTemplate) {
      toast.error("Window template not found");
      return;
    }

    // Calculate position along the wall (0-1)
    const position = calculatePositionAlongWall(closestWall, pos);

    addWindow({
      wallId: closestWall.id,
      position,
      width: windowTemplate.width || 100,
      height: windowTemplate.height || 120,
      sillHeight: windowTemplate.sillHeight || 90,
      type: windowTemplate.type || 'standard'
    });

    toast.success("Window added");
  };

  /**
   * Calculate wall angle in degrees
   */
  const calculateWallAngle = (wall: Wall) => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  /**
   * Find the closest wall to a point
   */
  const findClosestWallToPoint = (point: Point) => {
    if (walls.length === 0) return null;

    let closestWall = null;
    let minDistance = Infinity;

    walls.forEach(wall => {
      const distance = pointToLineDistance(point, wall.start, wall.end);
      if (distance < minDistance) {
        minDistance = distance;
        closestWall = wall;
      }
    });

    // Only return the wall if it's close enough (within 50 units)
    return minDistance <= 50 ? closestWall : null;
  };

  /**
   * Calculate the distance from a point to a line segment
   */
  const pointToLineDistance = (point: Point, lineStart: Point, lineEnd: Point) => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
    
    // Calculate projection
    const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length);
    
    // If projection is outside the line segment, return distance to closest endpoint
    if (t < 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
    if (t > 1) return Math.sqrt((point.x - lineEnd.x) ** 2 + (point.y - lineEnd.y) ** 2);
    
    // Return distance to projection point
    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;
    return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
  };

  /**
   * Calculate position along a wall (0-1)
   */
  const calculatePositionAlongWall = (wall: any, point: Point) => {
    const { start, end } = wall;
    
    // Calculate vector from start to end
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return 0;
    
    // Calculate vector from start to point
    const px = point.x - start.x;
    const py = point.y - start.y;
    
    // Calculate projection of point onto wall
    const projection = (px * dx + py * dy) / (length * length);
    
    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, projection));
  };

  return {
    handleDoorClick,
    handleWindowClick,
    findClosestWallToPoint,
    calculatePositionAlongWall,
    calculateWallAngle
  };
};
