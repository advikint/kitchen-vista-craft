
import { useRef, useState, useCallback } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "sonner";
import { useKitchenStore, Point, ToolMode } from "@/store/kitchenStore";
import { v4 as uuidv4 } from 'uuid';
import { useTemplateLoader } from "./useTemplateLoader";
import { useWallInteractions } from "./useWallInteractions";
import { useOpeningPlacement } from "./useOpeningPlacement";
import { useFurniturePlacement } from "./useFurniturePlacement";

/**
 * Custom hook for handling interactions in the top view
 */
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
  } = useKitchenStore();

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const isDrawingWall = useRef(false);

  // Load template data using the custom hook
  const { loadTemplate } = useTemplateLoader();
  
  // Wall interaction handlers
  const { handleWallClick } = useWallInteractions(startPoint, setStartPoint, isDrawingWall);
  
  // Door and window placement handlers
  const { 
    handleDoorClick, 
    handleWindowClick
  } = useOpeningPlacement(loadTemplate);
  
  // Cabinet and appliance placement handlers
  const { handleCabinetClick, handleApplianceClick } = useFurniturePlacement(loadTemplate);

  /**
   * Get the current pointer position adjusted for stage scale and position
   */
  const getPointerPosition = () => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return null;

    // Adjust position based on stage scaling and position
    return {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale
    };
  };

  /**
   * Handle wheel events for zooming in/out
   */
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

  /**
   * Handle clicks on the stage based on the current tool mode
   */
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

  return {
    startPoint,
    handleStageClick,
    handleWheel
  };
};

export default useTopViewHandlers;
