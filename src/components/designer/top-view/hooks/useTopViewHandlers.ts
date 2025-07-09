import { useRef, useState, useCallback } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "sonner";
import { useKitchenStore, Point } from "@/store/kitchenStore";
import { useTemplateLoader } from "./useTemplateLoader";
import { useWallInteractions } from "./useWallInteractions";
import { useOpeningPlacement } from "./useOpeningPlacement";
import { useFurniturePlacement } from "./useFurniturePlacement";
import { useIsMobile } from "@/hooks/use-mobile";
import { Vector2d } from "konva/lib/types"; // For pointer positions

const useTopViewHandlers = (
  stageRef: React.RefObject<any>, // Konva.Stage
  scale: number,
  position: Vector2d, // Using Vector2d for consistency with Konva
  setScale: React.Dispatch<React.SetStateAction<number>>,
  setPosition: React.Dispatch<React.SetStateAction<Vector2d>>,
  isStageDragging: boolean // Renamed from isDragging to be specific to stage drag state
) => {
  const {
    currentToolMode,
    setSelectedItemId,
    setWallDialogOpen,
    gridSize
  } = useKitchenStore();

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const isDrawingWall = useRef(false);
  const lastTapRef = useRef<number>(0); // For double-tap detection

  // For Pinch Zoom
  const lastTouchDistance = useRef<number | null>(null);

  // For Double-Click Pan
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({
    pointerX: 0, // Raw pointer X from stage.getPointerPosition()
    pointerY: 0, // Raw pointer Y from stage.getPointerPosition()
    stageX: 0,   // Initial stage X
    stageY: 0    // Initial stage Y
  });

  const isMobile = useIsMobile();
  const [snapEnabled, setSnapEnabled] = useState(true);

  const { loadTemplate } = useTemplateLoader();
  const { handleWallClick } = useWallInteractions(startPoint, setStartPoint, isDrawingWall);
  const { handleDoorClick, handleWindowClick } = useOpeningPlacement(loadTemplate);
  const { handleCabinetClick, handleApplianceClick } = useFurniturePlacement(loadTemplate);

  const isNearWall = useCallback((point: Point): boolean => {
    const { walls } = useKitchenStore.getState();
    const threshold = 30 / scale; // Adjust threshold by scale for world units
    return walls.some(wall => {
      const A = point.x - wall.start.x;
      const B = point.y - wall.start.y;
      const C = wall.end.x - wall.start.x;
      const D = wall.end.y - wall.start.y;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      if (lenSq === 0) return Math.sqrt(A * A + B * B) <= threshold;
      let param = dot / lenSq;
      param = Math.max(0, Math.min(1, param));
      const xx = wall.start.x + param * C;
      const yy = wall.start.y + param * D;
      const distance = Math.sqrt((point.x - xx) * (point.x - xx) + (point.y - yy) * (point.y - yy));
      return distance <= threshold;
    });
  }, [scale]); // Added scale dependency for threshold

  const snapToGrid = useCallback((point: Point): Point => {
    if (!snapEnabled) return point;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }, [gridSize, snapEnabled]);

  const snapToWall = useCallback((point: Point): Point => {
    if (!snapEnabled) return point;
    const { walls } = useKitchenStore.getState();
    const snapThreshold = 30 / scale; // Adjust threshold by scale
    let closestWallPoint: Point | null = null;
    let minDistance = snapThreshold;
    walls.forEach(wall => {
      const A = point.x - wall.start.x;
      const B = point.y - wall.start.y;
      const C = wall.end.x - wall.start.x;
      const D = wall.end.y - wall.start.y;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      if (lenSq === 0) return;
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
  }, [snapEnabled, scale]); // Added scale dependency

  const getPointerPosition = useCallback((event?: KonvaEventObject<any>): Point | null => {
    let rawPointerPos: Vector2d | null = null;
    const stage = stageRef.current;
    if (!stage) return null;

    if (event && isMobile) {
      let touchPoint: Touch | undefined = undefined;
      if (event.evt.touches && event.evt.touches.length > 0) {
        touchPoint = event.evt.touches[0];
      } else if (event.evt.changedTouches && event.evt.changedTouches.length > 0) {
        touchPoint = event.evt.changedTouches[0];
      }
      if (touchPoint) {
        // Get position relative to stage container, not clientX/Y directly
        const stageRect = stage.container().getBoundingClientRect();
        rawPointerPos = {
            x: touchPoint.clientX - stageRect.left,
            y: touchPoint.clientY - stageRect.top,
        };
      } else {
        rawPointerPos = stage.getPointerPosition();
      }
    } else {
      rawPointerPos = stage.getPointerPosition();
    }
    
    if (!rawPointerPos) return null;

    return {
      x: (rawPointerPos.x - position.x) / scale,
      y: (rawPointerPos.y - position.y) / scale
    };
  }, [isMobile, position.x, position.y, scale, stageRef]);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => { /* ... existing ... */ }, [scale, position, setScale, setPosition, stageRef]);

  // Double-click/tap to initiate panning mode
  const handleStageDblClick = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target !== e.currentTarget || currentToolMode !== 'select') { // Pan only in select mode and on stage itself
      return;
    }
    
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition(); // Raw pointer relative to stage container
    if (!pointer) return;

    setIsPanning(true);
    panStartRef.current = {
      pointerX: pointer.x,
      pointerY: pointer.y,
      stageX: stage.x(), // Current stage position X
      stageY: stage.y(), // Current stage position Y
    };
    stage.container().style.cursor = 'grabbing';
    e.evt.preventDefault();
  }, [stageRef, setIsPanning, panStartRef, currentToolMode]);

  // Handles stage movement when panning is active
  const handleStagePanMove = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isPanning || !stageRef.current) {
      return;
    }
    e.evt.preventDefault();

    const pointer = stageRef.current.getPointerPosition(); // Raw pointer relative to stage container
    if (!pointer) return;

    const dx = pointer.x - panStartRef.current.pointerX;
    const dy = pointer.y - panStartRef.current.pointerY;

    setPosition({
      x: panStartRef.current.stageX + dx,
      y: panStartRef.current.stageY + dy,
    });
  }, [isPanning, stageRef, panStartRef, setPosition]);

  // Ends panning mode
  const handleStagePanEnd = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      if (stageRef.current) {
        stageRef.current.container().style.cursor = (currentToolMode === 'select' ? 'grab' : 'default');
      }
    }
  }, [isPanning, stageRef, setIsPanning, currentToolMode]);


  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (isStageDragging || isPanning) return;
    
    if (isMobile && e.evt.type === 'touchend') {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Reset view on double tap (using the new pan end logic to reset cursor if needed)
        handleStagePanEnd(); // Ensure any panning state is cleared
        const stage = stageRef.current;
        if (stage) {
            const container = stage.container().parentElement;
            if (container) {
                // Simplified reset - could be improved with fitToContent logic
                const viewWidth = container.clientWidth;
                const viewHeight = container.clientHeight;
                setScale(1); // Reset scale
                setPosition({ x: viewWidth / 2, y: viewHeight / 2 }); // Attempt to center roughly
            }
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    }
    
    const pointerPos = getPointerPosition(e);
    if (!pointerPos) return;
    
    if (e.target === e.currentTarget) {
      if (currentToolMode === 'select') {
        setSelectedItemId(null);
        return;
      }
      const snappedPos = snapToGrid(pointerPos);
      switch (currentToolMode) {
        case 'wall': handleWallClick(snappedPos); break;
        case 'door':
          if (isNearWall(pointerPos)) { handleDoorClick(pointerPos); }
          else { toast.warning("Doors must be placed on a wall"); }
          break;
        case 'window':
          if (isNearWall(pointerPos)) { handleWindowClick(pointerPos); }
          else { toast.warning("Windows must be placed on a wall"); }
          break;
        case 'cabinet':
          const cabinetPos = isNearWall(pointerPos) ? snapToWall(pointerPos) : snapToGrid(pointerPos);
          handleCabinetClick(cabinetPos);
          break;
        case 'appliance':
          const appliancePos = snapToGrid(pointerPos);
          handleApplianceClick(appliancePos);
          break;
        case 'room': setWallDialogOpen(true); break;
        default: break;
      }
    }
  }, [
    currentToolMode, isStageDragging, isMobile, handleWallClick, handleDoorClick, handleWindowClick,
    handleCabinetClick, handleApplianceClick, getPointerPosition, snapToGrid, snapToWall,
    isNearWall, setSelectedItemId, setWallDialogOpen, setPosition, setScale, stageRef, isPanning, handleStagePanEnd
  ]);

  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    // Handle pinch-zoom start or single touch for potential panning start (if dbl tap enables it)
    if (e.evt.touches.length === 2) {
      setIsPanning(false); // Stop panning if pinch zoom starts
      if (stageRef.current) stageRef.current.container().style.cursor = 'default'; // Reset cursor

      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
    // Single touch start does not immediately trigger pan; dblclick/dbltap does.
  }, [stageRef, setIsPanning]);

  const handleTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
    // This is primarily for pinch-zoom. Pan move is handleStagePanMove.
    if (isPanning) { // If panning mode is active from dbl tap, use handleStagePanMove
        handleStagePanMove(e);
        return;
    }

    if (e.evt.touches.length === 2 && lastTouchDistance.current !== null) {
      // ... (pinch zoom logic remains the same)
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const stage = stageRef.current;
      if (!stage) return;

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
  }, [scale, position, setScale, setPosition, stageRef, isPanning, handleStagePanMove]);

  const handleTouchEnd = useCallback((e: KonvaEventObject<TouchEvent>) => {
    // If it was a two-finger touch (pinch zoom), clear lastTouchDistance
    if (e.evt.touches.length < 2) { // Check if it's the end of a multi-touch
        lastTouchDistance.current = null;
    }
    // If panning was active and this is the end of the pan touch, call handleStagePanEnd
    // Note: touchend might not have touches in e.evt.touches.
    // We rely on onMouseUp for mouse, and this for primary touch release.
    // If it's a single touch touchend, it could be the end of a pan.
    if (isPanning && e.evt.changedTouches.length === 1) {
        handleStagePanEnd();
    }
    // The click/tap logic in handleStageClick handles single tap and double tap for reset.
  }, [isPanning, handleStagePanEnd]);

  return {
    startPoint,
    handleStageClick,
    handleWheel,
    handleTouchStart,
    handleTouchMove, // This is mainly for pinch-zoom, pan move is separate
    handleTouchEnd,
    snapEnabled,
    setSnapEnabled,
    // New handlers for dbl-click pan
    handleStageDblClick,
    handleStagePanMove,
    handleStagePanEnd,
    isPanning // Expose isPanning if parent component needs to know (e.g. to change stage draggable prop)
  };
};

export default useTopViewHandlers;
