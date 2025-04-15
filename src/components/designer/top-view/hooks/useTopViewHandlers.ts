
import { useRef, useState, useCallback } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "sonner";
import { useKitchenStore, Point } from "@/store/kitchenStore";
import { useTemplateLoader } from "./useTemplateLoader";
import { useWallInteractions } from "./useWallInteractions";
import { useOpeningPlacement } from "./useOpeningPlacement";
import { useFurniturePlacement } from "./useFurniturePlacement";

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

  // Load template data using the custom hook
  const { loadTemplate } = useTemplateLoader();
  
  // Wall interaction handlers
  const { handleWallClick } = useWallInteractions(startPoint, setStartPoint, isDrawingWall);
  
  // Door and window placement handlers
  const { handleDoorClick, handleWindowClick } = useOpeningPlacement(loadTemplate);
  
  // Cabinet and appliance placement handlers
  const { handleCabinetClick, handleApplianceClick } = useFurniturePlacement(loadTemplate);

  const getPointerPosition = () => {
    const pos = stageRef.current?.getPointerPosition();
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

  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const pos = getPointerPosition();
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
    handleWheel
  };
};

export default useTopViewHandlers;
