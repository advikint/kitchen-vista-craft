
import { useRef, useState, useCallback } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "sonner";
import { useKitchenStore, Point } from "@/store/kitchenStore";
import { useTemplateLoader } from "./useTemplateLoader";
import { useWallInteractions } from "./useWallInteractions";
import { useOpeningPlacement } from "./useOpeningPlacement";
import { useFurniturePlacement } from "./useFurniturePlacement";
import { useIsMobile } from "@/hooks/use-mobile";

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
    isWallDialogOpen,
    setWallDialogOpen,
    gridSize
  } = useKitchenStore();

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const isDrawingWall = useRef(false);
  const lastTapRef = useRef<number>(0);
  const lastTouchDistance = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const [snapEnabled, setSnapEnabled] = useState(true);

  // Load template data using the custom hook
  const { loadTemplate } = useTemplateLoader();
  
  // Wall interaction handlers
  const { handleWallClick } = useWallInteractions(startPoint, setStartPoint, isDrawingWall);
  
  // Door and window placement handlers
  const { handleDoorClick, handleWindowClick } = useOpeningPlacement(loadTemplate);
  
  // Cabinet and appliance placement handlers
  const { handleCabinetClick, handleApplianceClick } = useFurniturePlacement(loadTemplate);

  // Helper function to check if a point is near a wall
  const isNearWall = useCallback((point: Point): boolean => {
    const { walls } = useKitchenStore.getState();
    const threshold = 30; // Distance threshold in pixels
    
    return walls.some(wall => {
      // Calculate distances using point-to-line algorithm
      const A = point.x - wall.start.x;
      const B = point.y - wall.start.y;
      const C = wall.end.x - wall.start.x;
      const D = wall.end.y - wall.start.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      
      // If wall length is zero, use point-to-point distance
      if (lenSq === 0) return Math.sqrt(A * A + B * B) <= threshold;
      
      let param = dot / lenSq;
      param = Math.max(0, Math.min(1, param));
      
      const xx = wall.start.x + param * C;
      const yy = wall.start.y + param * D;
      
      const distance = Math.sqrt((point.x - xx) * (point.x - xx) + (point.y - yy) * (point.y - yy));
      return distance <= threshold;
    });
  }, []);

  // Helper function to snap point to grid
  const snapToGrid = useCallback((point: Point): Point => {
    if (!snapEnabled) return point;
    
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }, [gridSize, snapEnabled]);

  // Helper function to snap point to nearest wall
  const snapToWall = useCallback((point: Point): Point => {
    if (!snapEnabled) return point;
    
    const { walls } = useKitchenStore.getState();
    const snapThreshold = 30;
    let closestWallPoint: Point | null = null;
    let minDistance = snapThreshold;
    
    walls.forEach(wall => {
      // Calculate distances using point-to-line algorithm
      const A = point.x - wall.start.x;
      const B = point.y - wall.start.y;
      const C = wall.end.x - wall.start.x;
      const D = wall.end.y - wall.start.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      
      if (lenSq === 0) return; // Skip zero-length walls
      
      let param = dot / lenSq;
      param = Math.max(0, Math.min(1, param));
      
      const xx = wall.start.x + param * C;
      const yy = wall.start.y + param * D;
      
      const distance = Math.sqrt((point.x - xx) * (point.x - xx) + (point.y - yy) * (point.y - yy));
      
      if (distance < minDistance) {
        minDistance = distance;
        closestWallPoint = { x: xx, y: yy };
      }
    });
    
    return closestWallPoint || point;
  }, [snapEnabled]);

  const getPointerPosition = useCallback((event?: KonvaEventObject<any>) => {
    let pos;
    
    if (event && isMobile) {
      // For touch events on mobile
      const touch = event.evt.touches[0];
      pos = {
        x: touch.clientX,
        y: touch.clientY
      };
    } else {
      // For mouse events or direct access
      pos = stageRef.current?.getPointerPosition();
    }
    
    if (!pos) return null;

    return {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale
    };
  }, [isMobile, position.x, position.y, scale, stageRef]);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const oldScale = scale;
    
    const pointer = stageRef.current.getPointerPosition();
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setScale(newScale);
    setPosition(newPos);
  }, [scale, position, setScale, setPosition, stageRef]);

  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (isDragging) return;
    
    // Detect double taps on mobile
    if (isMobile && e.evt.type === 'touchend') {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap detected - reset view
        setScale(1);
        setPosition({ x: 0, y: 0 });
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    }
    
    // Get click position
    const pointerPos = getPointerPosition(e);
    if (!pointerPos) return;
    
    // Check if clicking on stage background (not on an object)
    if (e.target === e.currentTarget) {
      // Clear selection when clicking on empty area
      if (currentToolMode === 'select') {
        setSelectedItemId(null);
        return;
      }
      
      const snappedPos = snapToGrid(pointerPos);
      
      // Handle different tool modes
      switch (currentToolMode) {
        case 'wall':
          handleWallClick(snappedPos);
          break;
          
        case 'door':
          // For doors, check if near a wall
          if (isNearWall(pointerPos)) {
            handleDoorClick(pointerPos);
          } else {
            toast.warning("Doors must be placed on a wall");
          }
          break;
          
        case 'window':
          // For windows, check if near a wall
          if (isNearWall(pointerPos)) {
            handleWindowClick(pointerPos);
          } else {
            toast.warning("Windows must be placed on a wall");
          }
          break;
          
        case 'cabinet':
          // For cabinets, try to snap to wall if close enough
          const cabinetPos = isNearWall(pointerPos) ? snapToWall(pointerPos) : snapToGrid(pointerPos);
          handleCabinetClick(cabinetPos);
          break;
          
        case 'appliance':
          const appliancePos = snapToGrid(pointerPos);
          handleApplianceClick(appliancePos);
          break;
          
        case 'room':
          setWallDialogOpen(true);
          break;
          
        default:
          break;
      }
    }
  }, [
    currentToolMode, isDragging, isMobile, handleWallClick, handleDoorClick, handleWindowClick,
    handleCabinetClick, handleApplianceClick, getPointerPosition, snapToGrid, snapToWall,
    isNearWall, setSelectedItemId, setWallDialogOpen, setPosition, setScale
  ]);

  // Handle touch events for mobile pinch-to-zoom
  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length === 2) {
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      
      const distance = Math.sqrt(dx * dx + dy * dy);
      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length === 2 && lastTouchDistance.current !== null) {
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const midPoint = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
      
      const oldScale = scale;
      const newScale = oldScale * (distance / lastTouchDistance.current!);
      
      const mousePointTo = {
        x: (midPoint.x - position.x) / oldScale,
        y: (midPoint.y - position.y) / oldScale,
      };
      
      const newPos = {
        x: midPoint.x - mousePointTo.x * newScale,
        y: midPoint.y - mousePointTo.y * newScale,
      };
      
      setScale(newScale);
      setPosition(newPos);
      
      lastTouchDistance.current = distance;
    }
  }, [scale, position, setScale, setPosition]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
  }, []);

  return {
    startPoint,
    handleStageClick,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    snapEnabled,
    setSnapEnabled
  };
};

export default useTopViewHandlers;
