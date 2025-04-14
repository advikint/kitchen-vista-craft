
import { useRef, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { Node, NodeConfig } from "konva/lib/Node";
import { useKitchenStore } from "@/store/kitchenStore";
import { v4 as uuidv4 } from 'uuid';

const useItemInteractions = () => {
  const { 
    selectedItemId, 
    setSelectedItemId,
    updateCabinetPosition,
    updateAppliancePosition,
    cloneCabinet,
    cloneAppliance
  } = useKitchenStore();
  
  const isDragging = useRef(false);
  const [draggedItemPosition, setDraggedItemPosition] = useState({ x: 0, y: 0 });

  // Handle selecting an item
  const handleItemSelect = (id: string, e: KonvaEventObject<MouseEvent, Node<NodeConfig>>) => {
    e.cancelBubble = true;
    setSelectedItemId(id);
  };

  // Handle dragging an item - NEW FUNCTION
  const handleItemDrag = (id: string, newPosition: { x: number, y: number }) => {
    setDraggedItemPosition(newPosition);
    isDragging.current = true;
  };

  // Handle finishing a drag operation
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
    selectedItemId
  };
};

export default useItemInteractions;
