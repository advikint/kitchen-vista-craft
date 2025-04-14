
import { useState, RefObject } from "react";
import { useKitchenStore, ToolMode } from "@/store/kitchenStore";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { findNearestWall, calculatePositionOnWall } from "../utils/wallUtils";

const useTopViewHandlers = (
  stageRef: RefObject<any>,
  scale: number,
  position: { x: number; y: number },
  setScale: (scale: number) => void,
  setPosition: (position: { x: number; y: number }) => void,
  isDragging: boolean
) => {
  const {
    walls,
    currentToolMode,
    addWall,
    addDoor,
    addWindow,
    addCabinet,
    addAppliance,
  } = useKitchenStore();
  
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  
  const getTemplateData = (type: string) => {
    const data = localStorage.getItem(`template_${type}`);
    return data ? JSON.parse(data) : null;
  };
  
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (isDragging) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    const worldPos = {
      x: (pointerPosition.x - position.x) / scale,
      y: (pointerPosition.y - position.y) / scale
    };
    
    switch (currentToolMode) {
      case 'wall' as ToolMode:
        if (!startPoint) {
          setStartPoint(worldPos);
        } else {
          addWall({
            start: startPoint,
            end: worldPos,
            height: 240
          });
          setStartPoint(null);
        }
        break;
        
      case 'door' as ToolMode:
        const nearestWall = findNearestWall(worldPos, walls);
        if (nearestWall) {
          const doorTemplateData = getTemplateData('door');
          addDoor({
            wallId: nearestWall.id,
            position: calculatePositionOnWall(worldPos, nearestWall),
            width: doorTemplateData?.width || 80,
            height: doorTemplateData?.height || 200,
            type: doorTemplateData?.type || 'standard'
          }, {});
        } else {
          toast.error("Please place doors on walls");
        }
        break;
        
      case 'window' as ToolMode:
        const nearestWallForWindow = findNearestWall(worldPos, walls);
        if (nearestWallForWindow) {
          const windowTemplateData = getTemplateData('window');
          addWindow({
            wallId: nearestWallForWindow.id,
            position: calculatePositionOnWall(worldPos, nearestWallForWindow),
            width: windowTemplateData?.width || 100,
            height: windowTemplateData?.height || 120,
            sillHeight: windowTemplateData?.sillHeight || 90,
            type: windowTemplateData?.type || 'standard'
          }, {});
        } else {
          toast.error("Please place windows on walls");
        }
        break;
        
      case 'cabinet' as ToolMode:
        const cabinetTemplateData = getTemplateData('cabinet');
        if (cabinetTemplateData) {
          addCabinet({
            type: cabinetTemplateData.type || 'base',
            category: cabinetTemplateData.category || 'standard-base',
            frontType: cabinetTemplateData.frontType || 'shutter',
            finish: cabinetTemplateData.finish || 'laminate',
            width: cabinetTemplateData.width || 60,
            height: cabinetTemplateData.height || 85,
            depth: cabinetTemplateData.depth || 60,
            material: cabinetTemplateData.material || 'wood',
            color: cabinetTemplateData.color || 'white',
            position: worldPos,
            rotation: 0
          }, {});
        }
        break;
        
      case 'appliance' as ToolMode:
        const applianceTemplateData = getTemplateData('appliance');
        if (applianceTemplateData) {
          addAppliance({
            type: applianceTemplateData.type || 'stove',
            width: applianceTemplateData.width || 60,
            height: applianceTemplateData.height || 85,
            depth: applianceTemplateData.depth || 60,
            model: applianceTemplateData.model || 'standard',
            position: worldPos,
            rotation: 0
          }, {});
        }
        break;
        
      default:
        break;
    }
  };
  
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    
    const limitedScale = Math.max(0.1, Math.min(5, newScale));
    
    setScale(limitedScale);
    
    setPosition({
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    });
  };
  
  return {
    startPoint,
    handleStageClick,
    handleWheel
  };
};

export default useTopViewHandlers;
