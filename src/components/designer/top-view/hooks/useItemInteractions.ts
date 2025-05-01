
import { useRef, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { Node, NodeConfig } from "konva/lib/Node";
import { useKitchenStore } from "@/store/kitchenStore";
import { v4 as uuidv4 } from 'uuid';

const useItemInteractions = () => {
  const { 
    selectedItemId, 
    setSelectedItemId,
    updateCabinet,
    updateAppliance,
    addCabinet,
    addAppliance
  } = useKitchenStore();
  
  const isDragging = useRef(false);
  const [draggedItemPosition, setDraggedItemPosition] = useState({ x: 0, y: 0 });

  // Handle selecting an item
  const handleItemSelect = (id: string, e: KonvaEventObject<MouseEvent, Node<NodeConfig>>) => {
    e.cancelBubble = true;
    setSelectedItemId(id);
  };

  // Handle dragging an item
  const handleItemDrag = (id: string, newPosition: { x: number, y: number }) => {
    setDraggedItemPosition(newPosition);
    isDragging.current = true;
  };

  // Handle finishing a drag operation - we're fixing this to maintain position
  const handleItemDragEnd = (id: string, newPosition: { x: number, y: number }, itemType: "cabinet" | "appliance") => {
    if (isDragging.current) {
      if (itemType === "cabinet") {
        updateCabinetPosition(id, newPosition);
      } else if (itemType === "appliance") {
        updateAppliancePosition(id, newPosition);
      }
      isDragging.current = false;
    }
  };

  // Update cabinet position - fixing to maintain position after drag
  const updateCabinetPosition = (id: string, position: { x: number, y: number }) => {
    updateCabinet(id, { position });
  };

  // Update appliance position
  const updateAppliancePosition = (id: string, position: { x: number, y: number }) => {
    updateAppliance(id, { position });
  };

  // Rotate cabinet by 90 degrees
  const rotateCabinet = (id: string) => {
    const cabinets = useKitchenStore.getState().cabinets;
    const cabinet = cabinets.find(c => c.id === id);
    if (cabinet) {
      const newRotation = (cabinet.rotation + 90) % 360;
      updateCabinet(id, { rotation: newRotation });
    }
  };

  // Clone a cabinet
  const cloneCabinet = (id: string, newId: string, offset: { x: number, y: number }) => {
    const cabinets = useKitchenStore.getState().cabinets;
    const original = cabinets.find(c => c.id === id);
    
    if (original) {
      const clone = { 
        ...original, 
        id: newId,
        position: { 
          x: original.position.x + offset.x, 
          y: original.position.y + offset.y 
        } 
      };
      addCabinet(clone);
    }
    
    return newId;
  };

  // Clone an appliance
  const cloneAppliance = (id: string, newId: string, offset: { x: number, y: number }) => {
    const appliances = useKitchenStore.getState().appliances;
    const original = appliances.find(a => a.id === id);
    
    if (original) {
      const clone = { 
        ...original, 
        id: newId,
        position: { 
          x: original.position.x + offset.x, 
          y: original.position.y + offset.y 
        } 
      };
      addAppliance(clone);
    }
    
    return newId;
  };

  // Clone an item
  const handleCloneItem = (id: string, itemType: "cabinet" | "appliance", offset: number = 20) => {
    const newId = uuidv4();
    if (itemType === "cabinet") {
      cloneCabinet(id, newId, { x: offset, y: offset });
    } else if (itemType === "appliance") {
      cloneAppliance(id, newId, { x: offset, y: offset });
    }
    return newId;
  };

  return {
    handleItemSelect,
    handleItemDrag,
    handleItemDragEnd,
    handleCloneItem,
    updateCabinetPosition,
    updateAppliancePosition,
    cloneCabinet,
    cloneAppliance,
    rotateCabinet,
    selectedItemId
  };
};

export default useItemInteractions;
