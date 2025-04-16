
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
    setWallDialogOpen
  } = useKitchenStore();

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const isDrawingWall = useRef(false);
  const lastTapRef = useRef<number>(0);
  const lastTouchDistance = useRef<number | null>(null);
  const isMobile = useIsMobile();

  // Load template data using the custom hook
  const { loadTemplate } = useTemplateLoader();
  
  // Wall interaction handlers
  const { handleWallClick } = useWallInteractions(startPoint, setStartPoint, isDrawingWall);
  
  // Door and window placement handlers
  const { handleDoorClick, handleWindowClick } = useOpeningPlacement(loadTemplate);
  
  // Cabinet and appliance placement handlers
  const { handleCabinetClick, handleApplianceClick } = useFurniturePlacement(loadTemplate);

  const getPointerPosition = (event?: KonvaEventObject<any>) => {
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
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const oldScale = scale;
    
    const pointer = stageRef.current.getPointerPosition();
    
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    const newPos = {
      x: pointer.x - (pointer.x - position.x) * newScale / oldScale,
      y: pointer.y - (pointer.y - position.y) * newScale / oldScale
    };
    
    setPosition(newPos);
    setScale(newScale);
  };

  // Touch event handlers for pinch-to-zoom on mobile
  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    
    // Handle double-tap to reset zoom
    if (touches.length === 1) {
      const now = Date.now();
      const timeDiff = now - lastTapRef.current;
      if (timeDiff < 300) { // 300ms between taps
        // Reset zoom and position
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
      lastTapRef.current = now;
    }
    
    // Initialize pinch zoom tracking
    if (touches.length === 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    
    // Handle pinch zoom
    if (touches.length === 2 && lastTouchDistance.current !== null) {
      e.evt.preventDefault();
      
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const touchDistance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate center point between two fingers
      const centerX = (touches[0].clientX + touches[1].clientX) / 2;
      const centerY = (touches[0].clientY + touches[1].clientY) / 2;
      
      // Calculate new scale
      const scaleBy = 1.01;
      const oldScale = scale;
      let newScale;
      
      if (touchDistance > lastTouchDistance.current) {
        newScale = oldScale * scaleBy;
      } else {
        newScale = oldScale / scaleBy;
      }
      
      // Limit scale
      newScale = Math.max(0.5, Math.min(5, newScale));
      
      // Calculate new position
      const newPos = {
        x: centerX - (centerX - position.x) * newScale / oldScale,
        y: centerY - (centerY - position.y) * newScale / oldScale
      };
      
      setPosition(newPos);
      setScale(newScale);
      
      lastTouchDistance.current = touchDistance;
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Skip handling during pinch-zoom operations
    if (lastTouchDistance.current !== null) return;
    
    const pos = getPointerPosition(e as any);
    if (!pos) return;

    const clickedOnEmptySpace = e.target === e.currentTarget;
    
    if (clickedOnEmptySpace && currentToolMode === 'select') {
      setSelectedItemId(null);
      return;
    }

    switch (currentToolMode) {
      case 'room':
        setWallDialogOpen(true);
        break;
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

  return {
    startPoint,
    handleStageClick,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

export default useTopViewHandlers;
