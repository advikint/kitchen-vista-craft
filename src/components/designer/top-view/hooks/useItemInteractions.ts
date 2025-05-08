
import { useRef, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { Node, NodeConfig } from "konva/lib/Node";
import { useKitchenStore, Point } from "@/store/kitchenStore";
import { toast } from "sonner";

const useItemInteractions = () => {
  const { 
    selectedItemId, 
    setSelectedItemId,
    cabinets,
    appliances,
    walls,
    doors,
    windows,
    updateCabinet,
    updateAppliance,
    updateDoor,
    updateWindow,
    removeCabinet,
    removeAppliance,
    removeDoor,
    removeWindow
  } = useKitchenStore();
  
  const isDragging = useRef(false);
  const [isNearWall, setIsNearWall] = useState(false);
  const [nearestWallId, setNearestWallId] = useState<string | null>(null);

  // Handle selecting an item
  const handleItemSelect = (id: string, e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    setSelectedItemId(id);
  };

  // Check if a point is near a wall
  const checkNearWall = (position: { x: number; y: number }) => {
    const threshold = 25;
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
  const getSnappedPosition = (position: { x: number; y: number }, itemType: string) => {
    const nearWall = checkNearWall(position);
    
    // For regular appliances (except sink), don't snap to wall
    if (itemType === "appliance") {
      const appliance = appliances.find(a => a.id === selectedItemId);
      if (appliance && appliance.type !== "sink") {
        return position;
      }
    }
    
    if (!nearWall) {
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

  // Handle drag start
  const handleDragStart = () => {
    isDragging.current = true;
  };

  // Handle drag move
  const handleDragMove = (id: string, newPosition: { x: number, y: number }, itemType: "cabinet" | "door" | "window" | "appliance" = "cabinet") => {
    // Just check for wall proximity during drag
    checkNearWall(newPosition);
  };

  // Handle finishing a drag operation
  const handleDragEnd = (id: string, newPosition: { x: number, y: number }, itemType: "cabinet" | "door" | "window" | "appliance" = "cabinet") => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const snappedPosition = getSnappedPosition(newPosition, itemType);
    
    switch (itemType) {
      case "cabinet": {
        const cabinet = cabinets.find(c => c.id === id);
        if (cabinet) {
          updateCabinet(id, { position: snappedPosition });
        }
        break;
      }
      case "appliance": {
        const appliance = appliances.find(a => a.id === id);
        if (appliance) {
          updateAppliance(id, { position: snappedPosition });
        }
        break;
      }
      case "door": {
        const door = doors.find(d => d.id === id);
        if (door && nearestWallId) {
          // For doors, calculate position along the wall
          const wall = walls.find(w => w.id === nearestWallId);
          if (wall) {
            const position = calculatePositionAlongWall(wall, snappedPosition);
            updateDoor(id, { wallId: nearestWallId, position });
          }
        }
        break;
      }
      case "window": {
        const window = windows.find(w => w.id === id);
        if (window && nearestWallId) {
          // For windows, calculate position along the wall
          const wall = walls.find(w => w.id === nearestWallId);
          if (wall) {
            const position = calculatePositionAlongWall(wall, snappedPosition);
            updateWindow(id, { wallId: nearestWallId, position });
          }
        }
        break;
      }
    }
  };
  
  // Calculate position along a wall (0-1)
  const calculatePositionAlongWall = (wall: { start: Point; end: Point }, point: Point) => {
    // Calculate vector from start to end
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return 0;
    
    // Calculate vector from start to point
    const px = point.x - wall.start.x;
    const py = point.y - wall.start.y;
    
    // Calculate projection
    const projection = (px * dx + py * dy) / (length * length);
    
    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, projection));
  };

  // Delete the selected item
  const deleteSelectedItem = () => {
    if (!selectedItemId) return;
    
    // Try to find item in different collections
    const cabinet = cabinets.find(c => c.id === selectedItemId);
    if (cabinet) {
      removeCabinet(selectedItemId);
      toast.success("Cabinet deleted");
      setSelectedItemId(null);
      return;
    }
    
    const appliance = appliances.find(a => a.id === selectedItemId);
    if (appliance) {
      removeAppliance(selectedItemId);
      toast.success("Appliance deleted");
      setSelectedItemId(null);
      return;
    }
    
    const door = doors.find(d => d.id === selectedItemId);
    if (door) {
      removeDoor(selectedItemId);
      toast.success("Door deleted");
      setSelectedItemId(null);
      return;
    }
    
    const window = windows.find(w => w.id === selectedItemId);
    if (window) {
      removeWindow(selectedItemId);
      toast.success("Window deleted");
      setSelectedItemId(null);
      return;
    }
  };

  // Rotate cabinet 90 degrees
  const rotateCabinet = (id: string) => {
    const cabinet = cabinets.find(c => c.id === id);
    if (!cabinet) return;
    
    // Calculate new rotation (add 90 degrees)
    const newRotation = (cabinet.rotation + 90) % 360;
    
    // Update cabinet rotation
    updateCabinet(id, { rotation: newRotation });
    
    // Show success message
    toast.success("Cabinet rotated");
  };

  return {
    handleItemSelect,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    deleteSelectedItem,
    rotateCabinet,
    isNearWall,
    nearestWallId
  };
};

export default useItemInteractions;
