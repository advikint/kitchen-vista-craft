
import { useKitchenStore } from "@/store/kitchenStore";
import { KonvaEventObject } from "konva/lib/Node";

const useItemInteractions = () => {
  const {
    walls,
    updateCabinet,
    updateAppliance,
    updateDoor,
    updateWindow,
    setSelectedItemId
  } = useKitchenStore();
  
  const handleItemSelect = (id: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelectedItemId(id);
  };
  
  const handleItemDrag = (id: string, type: 'cabinet' | 'appliance' | 'door' | 'window', newPosition: { x: number; y: number }) => {
    const {
      cabinets,
      appliances,
      doors,
      windows
    } = useKitchenStore.getState();
    
    if (type === 'cabinet') {
      const cabinet = cabinets.find(c => c.id === id);
      if (cabinet) {
        updateCabinet({
          ...cabinet,
          position: newPosition
        });
      }
    } else if (type === 'appliance') {
      const appliance = appliances.find(a => a.id === id);
      if (appliance) {
        updateAppliance({
          ...appliance,
          position: newPosition
        });
      }
    } else if (type === 'door') {
      const door = doors.find(d => d.id === id);
      const wall = door ? walls.find(w => w.id === door.wallId) : null;
      
      if (door && wall) {
        updateDoor({
          ...door,
          position: calculatePositionOnWall(newPosition, wall)
        });
      }
    } else if (type === 'window') {
      const window = windows.find(w => w.id === id);
      const wall = window ? walls.find(w => w.id === window.wallId) : null;
      
      if (window && wall) {
        updateWindow({
          ...window,
          position: calculatePositionOnWall(newPosition, wall)
        });
      }
    }
  };
  
  const calculatePositionOnWall = (point: { x: number; y: number }, wall: any) => {
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
  
  return {
    handleItemSelect,
    handleItemDrag
  };
};

export default useItemInteractions;
