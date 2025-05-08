
import { toast } from "sonner";
import { useKitchenStore } from "@/store/kitchenStore";

/**
 * Custom hook for placing cabinets and appliances
 */
export const useFurniturePlacement = (loadTemplate: (type: string) => any) => {
  const { addCabinet, addAppliance, walls } = useKitchenStore();

  // Helper function to find nearest wall to a position
  const findNearestWall = (pos: { x: number; y: number }) => {
    if (!walls.length) return null;
    
    const threshold = 40; // Distance threshold for snapping
    let closestWall = null;
    let closestDistance = threshold;
    
    for (const wall of walls) {
      // Calculate distances using point-to-line algorithm
      const A = pos.x - wall.start.x;
      const B = pos.y - wall.start.y;
      const C = wall.end.x - wall.start.x;
      const D = wall.end.y - wall.start.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      
      if (lenSq === 0) continue; // Skip zero-length walls
      
      let param = dot / lenSq;
      param = Math.max(0, Math.min(1, param));
      
      const xx = wall.start.x + param * C;
      const yy = wall.start.y + param * D;
      
      const distance = Math.sqrt((pos.x - xx) * (pos.x - xx) + (pos.y - yy) * (pos.y - yy));
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestWall = { wall, distance, param, point: { x: xx, y: yy } };
      }
    }
    
    return closestWall;
  };

  // Get snapped position for cabinet placement
  const getSnappedCabinetPosition = (pos: { x: number; y: number }, cabinetType: string) => {
    const nearWall = findNearestWall(pos);
    
    if (!nearWall) return { position: pos, rotation: 0 };
    
    const { wall, point } = nearWall;
    const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
    
    // Offset from wall based on cabinet type
    let offset = 0;
    
    if (cabinetType === 'base' || cabinetType === 'tall') {
      offset = 10; // Distance from wall for base and tall cabinets
    } else if (cabinetType === 'wall') {
      offset = 5; // Smaller offset for wall cabinets
    }
    
    // Calculate position with offset perpendicular to the wall
    const snapX = point.x + Math.sin(angle) * offset;
    const snapY = point.y - Math.cos(angle) * offset;
    
    // Adjust rotation based on wall direction
    const rotation = (angle * 180 / Math.PI + 90) % 360;
    
    return { position: { x: snapX, y: snapY }, rotation };
  };

  /**
   * Handle cabinet placement
   */
  const handleCabinetClick = (pos: { x: number, y: number }) => {
    // Get the template cabinet data
    const cabinetTemplate = loadTemplate('cabinet');
    if (!cabinetTemplate) {
      toast.error("Cabinet template not found");
      return;
    }

    // Get snapped position if near a wall
    const snappedData = getSnappedCabinetPosition(pos, cabinetTemplate.type);

    // Create a new cabinet
    addCabinet({
      ...cabinetTemplate,
      position: snappedData.position,
      rotation: snappedData.rotation
    });

    toast.success("Cabinet added");
  };

  /**
   * Handle appliance placement
   */
  const handleApplianceClick = (pos: { x: number, y: number }) => {
    // Get the template appliance data
    const applianceTemplate = loadTemplate('appliance');
    if (!applianceTemplate) {
      toast.error("Appliance template not found");
      return;
    }

    // Special handling for sink type appliances
    let placementData = { position: pos, rotation: 0 };
    
    if (applianceTemplate.type === 'sink') {
      const snappedData = getSnappedCabinetPosition(pos, 'base');
      placementData = snappedData;
    }

    // Create a new appliance
    addAppliance({
      ...applianceTemplate,
      position: placementData.position,
      rotation: placementData.rotation
    });

    toast.success("Appliance added");
  };

  return {
    handleCabinetClick,
    handleApplianceClick,
    findNearestWall
  };
};
