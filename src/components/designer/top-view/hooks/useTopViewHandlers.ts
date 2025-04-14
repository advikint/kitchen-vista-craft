
import { useRef, useState, useCallback } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "sonner";
import { useKitchenStore, Point } from "@/store/kitchenStore";
import { v4 as uuidv4 } from 'uuid';

const useTopViewHandlers = (
  stageRef: React.RefObject<any>,
  scale: number,
  position: { x: number; y: number },
  setScale: React.Dispatch<React.SetStateAction<number>>,
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  isDragging: boolean
) => {
  const {
    currentToolMode,
    setSelectedItemId,
    walls,
    addWall,
    doors,
    addDoor,
    windows,
    addWindow,
    cabinets,
    addCabinet,
    appliances,
    addAppliance,
    room
  } = useKitchenStore();

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const isDrawingWall = useRef(false);

  // Template data for various items
  const [templateData, setTemplateData] = useState({
    door: null,
    window: null,
    cabinet: null,
    appliance: null
  });

  const getPointerPosition = () => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return null;

    // Adjust position based on stage scaling and position
    return {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale
    };
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const oldScale = scale;
    
    // Get pointer position relative to stage
    const pointer = stageRef.current.getPointerPosition();
    
    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Calculate new position so the point under the mouse stays in the same position
    const newPos = {
      x: pointer.x - (pointer.x - position.x) * newScale / oldScale,
      y: pointer.y - (pointer.y - position.y) * newScale / oldScale
    };
    
    setPosition(newPos);
    setScale(newScale);
  };

  // Handling click on the stage
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // Get mouse position in the stage
    const pos = getPointerPosition();
    if (!pos) return;

    // Ensure e.target matches e.currentTarget to detect clicks directly on the stage (not on shapes)
    const clickedOnEmptySpace = e.target === e.currentTarget;
    
    if (clickedOnEmptySpace && currentToolMode === 'select') {
      setSelectedItemId(null);
      return;
    }

    // Handle different tool modes
    switch (currentToolMode) {
      case 'wall':
        handleWallClick(pos);
        break;
      case 'door':
        handleDoorClick(pos);
        break;
      case 'window':
        handleWindowClick(pos);
        break;
      case 'cabinet':
        handleCabinetClick(pos);
        break;
      case 'appliance':
        handleApplianceClick(pos);
        break;
    }
  }, [currentToolMode, isDragging, scale, position, startPoint]);

  const handleWallClick = (pos: Point) => {
    if (!startPoint) {
      // First click - set start point
      setStartPoint(pos);
      isDrawingWall.current = true;
    } else {
      // Second click - create wall
      addWall({
        start: startPoint,
        end: pos,
        height: 240 // Default wall height
      });
      setStartPoint(null);
      isDrawingWall.current = false;
    }
  };

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

    addDoor({
      wallId: closestWall.id,
      position,
      width: doorTemplate.width || 80,
      height: doorTemplate.height || 200,
      type: doorTemplate.type || 'standard'
    });

    toast.success("Door added");
  };

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

  const handleCabinetClick = (pos: Point) => {
    // Get the template cabinet data
    const cabinetTemplate = loadTemplate('cabinet');
    if (!cabinetTemplate) {
      toast.error("Cabinet template not found");
      return;
    }

    // Create a new cabinet
    addCabinet({
      ...cabinetTemplate,
      position: pos,
      rotation: 0
    }, {});

    toast.success("Cabinet added");
  };

  const handleApplianceClick = (pos: Point) => {
    // Get the template appliance data
    const applianceTemplate = loadTemplate('appliance');
    if (!applianceTemplate) {
      toast.error("Appliance template not found");
      return;
    }

    // Create a new appliance
    addAppliance({
      ...applianceTemplate,
      position: pos,
      rotation: 0
    }, {});

    toast.success("Appliance added");
  };

  // Helper function to load template data from local storage
  const loadTemplate = (type: string) => {
    try {
      const template = localStorage.getItem(`template_${type}`);
      return template ? JSON.parse(template) : null;
    } catch (error) {
      console.error(`Error loading template for ${type}:`, error);
      return null;
    }
  };

  // Find the closest wall to a point
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

  // Calculate the distance from a point to a line segment
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

  // Calculate position along a wall (0-1)
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
    startPoint,
    handleStageClick,
    handleWheel
  };
};

export default useTopViewHandlers;
