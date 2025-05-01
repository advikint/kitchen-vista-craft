
import { useRef, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { Node, NodeConfig } from "konva/lib/Node";
import { useKitchenStore } from "@/store/kitchenStore";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

const useItemInteractions = () => {
  const { 
    selectedItemId, 
    setSelectedItemId,
    cabinets,
    appliances,
    walls,
    updateCabinet,
    updateAppliance,
    addCabinet,
    addAppliance,
    removeCabinet,
    removeAppliance
  } = useKitchenStore();
  
  const isDragging = useRef(false);
  const [draggedItemPosition, setDraggedItemPosition] = useState({ x: 0, y: 0 });
  const [isNearWall, setIsNearWall] = useState(false);
  const [nearestWallId, setNearestWallId] = useState<string | null>(null);

  // Handle selecting an item
  const handleItemSelect = (id: string, e: KonvaEventObject<MouseEvent, Node<NodeConfig>>) => {
    e.cancelBubble = true;
    setSelectedItemId(id);
  };

  // Check if a point is near a wall
  const checkNearWall = (position: { x: number; y: number }) => {
    const threshold = 25; // Distance threshold for snapping
    let closestWall = null;
    let closestDistance = threshold;
    
    for (const wall of walls) {
      const A = position.x - wall.start.x;
      const B = position.y - wall.start.y;
      const C = wall.end.x - wall.start.x;
      const D = wall.end.y - wall.start.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      
      if (lenSq === 0) continue;
      
      let param = dot / lenSq;
      param = Math.max(0, Math.min(1, param));
      
      const xx = wall.start.x + param * C;
      const yy = wall.start.y + param * D;
      
      const distance = Math.sqrt((position.x - xx) * (position.x - xx) + (position.y - yy) * (position.y - yy));
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestWall = wall;
      }
    }
    
    setIsNearWall(closestWall !== null);
    setNearestWallId(closestWall?.id || null);
    return closestWall;
  };

  // Calculate snapped position to wall
  const getSnappedPosition = (position: { x: number; y: number }, itemType: "cabinet" | "door" | "window" | "appliance") => {
    const nearWall = checkNearWall(position);
    
    if (!nearWall || (itemType === "appliance" && itemType !== "sink")) {
      return position;
    }
    
    const A = position.x - nearWall.start.x;
    const B = position.y - nearWall.start.y;
    const C = nearWall.end.x - nearWall.start.x;
    const D = nearWall.end.y - nearWall.start.y;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return position;
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    // Calculate perpendicular distance
    const xx = nearWall.start.x + param * C;
    const yy = nearWall.start.y + param * D;
    
    // For doors and windows, snap directly to wall
    if (itemType === "door" || itemType === "window") {
      return { x: xx, y: yy };
    }
    
    // For cabinets, snap near wall with an offset
    const angle = Math.atan2(D, C);
    const offset = 10; // Distance from wall
    
    // Calculate position with offset perpendicular to the wall
    const snapX = xx + Math.sin(angle) * offset;
    const snapY = yy - Math.cos(angle) * offset;
    
    return { x: snapX, y: snapY };
  };

  // Handle dragging an item
  const handleItemDrag = (id: string, newPosition: { x: number, y: number }, itemType: "cabinet" | "door" | "window" | "appliance" = "cabinet") => {
    const snappedPosition = getSnappedPosition(newPosition, itemType);
    setDraggedItemPosition(snappedPosition);
    isDragging.current = true;
  };

  // Handle drag start
  const handleDragStart = () => {
    isDragging.current = true;
  };

  // Handle drag move
  const handleDragMove = (id: string, newPosition: { x: number, y: number }, itemType: "cabinet" | "door" | "window" | "appliance" = "cabinet") => {
    handleItemDrag(id, newPosition, itemType);
  };

  // Handle finishing a drag operation
  const handleDragEnd = (id: string, newPosition: { x: number, y: number }, itemType: "cabinet" | "door" | "window" | "appliance" = "cabinet") => {
    if (isDragging.current) {
      const snappedPosition = getSnappedPosition(newPosition, itemType);
      
      if (itemType === "cabinet") {
        updateCabinetPosition(id, snappedPosition);
      } else if (itemType === "appliance") {
        updateAppliancePosition(id, snappedPosition);
      }
      
      // Show feedback for successful placement
      if (isNearWall) {
        toast.success(`${itemType} snapped to wall`);
      }
      
      isDragging.current = false;
      setIsNearWall(false);
      setNearestWallId(null);
    }
  };

  // Update cabinet position
  const updateCabinetPosition = (id: string, position: { x: number, y: number }) => {
    updateCabinet(id, { position });
  };

  // Update appliance position
  const updateAppliancePosition = (id: string, position: { x: number, y: number }) => {
    updateAppliance(id, { position });
  };

  // Rotate cabinet by 90 degrees
  const rotateCabinet = (id: string) => {
    const cabinet = cabinets.find(c => c.id === id);
    if (cabinet) {
      const newRotation = (cabinet.rotation + 90) % 360;
      updateCabinet(id, { rotation: newRotation });
    }
  };

  // Clone a cabinet
  const cloneCabinet = (id: string, newId: string, offset: { x: number, y: number }) => {
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
  
  // Delete an item
  const handleDeleteItem = (id: string, itemType: "cabinet" | "appliance") => {
    if (itemType === "cabinet") {
      removeCabinet(id);
    } else if (itemType === "appliance") {
      removeAppliance(id);
    }
    setSelectedItemId(null);
  };

  return {
    handleItemSelect,
    handleItemDrag,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleCloneItem,
    handleDeleteItem,
    updateCabinetPosition,
    updateAppliancePosition,
    cloneCabinet,
    cloneAppliance,
    rotateCabinet,
    selectedItemId,
    isNearWall,
    nearestWallId,
    getSnappedPosition
  };
};

export default useItemInteractions;
