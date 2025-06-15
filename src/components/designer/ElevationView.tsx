
import { useRef, useEffect, useState } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Helper to normalize angle to 0-2PI
const normalizeAngle = (radians: number): number => {
  let angle = radians % (2 * Math.PI);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
};

// Helper to check if two angles are approximately parallel or perpendicular
const areAnglesApproximatelyEqual = (angle1: number, angle2: number, tolerance: number = 0.1): boolean => {
  const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2));
  return diff < tolerance || Math.abs(diff - 2 * Math.PI) < tolerance;
};

const areAnglesPerpendicular = (angle1: number, angle2: number, tolerance: number = 0.1): boolean => {
  const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2));
  return Math.abs(diff - Math.PI / 2) < tolerance || Math.abs(diff - 3 * Math.PI / 2) < tolerance;
};

interface OrientedItem<T> {
  item: T;
  orientation: 'front' | 'side' | 'obscured'; // 'side' for now, left/right can be later
  // distanceToWallLine: number; // For Z-ordering if needed later
  projectionOnWall: number; // For X positioning on canvas
}

const ElevationView = () => {
  const { 
    room, walls, doors, windows, cabinets, appliances,
    currentWallIndex, setCurrentWallIndex,
    showDimensions
  } = useKitchenStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        draw();
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  // Redraw when data changes
  useEffect(() => {
    draw();
  }, [room, walls, doors, windows, cabinets, appliances, currentWallIndex, scale, showDimensions]);
  
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Return early if no walls
    if (walls.length === 0) {
      drawNoWallsMessage(ctx, canvas.width, canvas.height);
      return;
    }
    
    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    
    // Get current wall
    const wall = walls[currentWallIndex];
    if (!wall) {
      ctx.restore();
      return;
    }
    
    // Draw wall elevation
    drawWallElevation(ctx, wall, canvas.width, canvas.height);
    
    // Draw doors on this wall
    const wallDoors = doors.filter(d => d.wallId === wall.id);
    wallDoors.forEach(door => drawDoorElevation(ctx, door, wall));
    
    // Draw windows on this wall
    const wallWindows = windows.filter(w => w.wallId === wall.id);
    wallWindows.forEach(window => drawWindowElevation(ctx, window, wall));
    
    // Draw cabinets that are against this wall
    const relevantCabinets = findCabinetsForWall(wall, cabinets);
    relevantCabinets.forEach(orientedCabinet => drawCabinetElevation(ctx, orientedCabinet, wall));
    
    // Draw appliances that are against this wall
    const relevantAppliances = findAppliancesForWall(wall, appliances); // Pass allAppliances
    relevantAppliances.forEach(orientedAppliance => drawApplianceElevation(ctx, orientedAppliance, wall)); // Pass orientedAppliance
    
    // Draw dimensions if needed
    if (showDimensions) {
      drawDimensionsElevation(ctx, wall);
    }
    
    ctx.restore();
  };
  
  const drawNoWallsMessage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#4b5563";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No walls have been created yet.", width / 2, height / 2 - 20);
    ctx.fillText("Switch to Top View and use the Wall tool to create walls.", width / 2, height / 2 + 20);
  };
  
  const drawWallElevation = (ctx: CanvasRenderingContext2D, wall: any, canvasWidth: number, canvasHeight: number) => {
    // Calculate wall length
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    
    // Wall height
    const wallHeight = wall.height || 240;
    
    // Draw wall
    ctx.fillStyle = "#f3f4f6"; // Light gray background for wall
    ctx.fillRect(-wallLength / 2, -wallHeight / 2, wallLength, wallHeight);
    
    // Wall outline
    ctx.strokeStyle = "#374151"; // Darker gray
    ctx.lineWidth = 3; // Thicker
    ctx.strokeRect(-wallLength / 2, -wallHeight / 2, wallLength, wallHeight);
    
    // Floor line
    ctx.beginPath();
    ctx.moveTo(-wallLength / 2, wallHeight / 2);
    ctx.lineTo(wallLength / 2, wallHeight / 2);
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 3;
    ctx.stroke();
  };
  
  const drawDoorElevation = (ctx: CanvasRenderingContext2D, door: any, wall: any) => {
    // Calculate wall length
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    
    // Wall height
    const wallHeight = wall.height || 240;
    
    // Door position along wall
    const doorPositionX = -wallLength / 2 + door.position * wallLength - door.width / 2;
    
    // Draw door
    ctx.fillStyle = "#bfdbfe";
    ctx.fillRect(doorPositionX, wallHeight / 2 - door.height, door.width, door.height);
    
    // Door outline
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.strokeRect(doorPositionX, wallHeight / 2 - door.height, door.width, door.height);

    // Frame
    const frameInset = 3; // cm
    ctx.strokeStyle = "#9CA3AF"; // Lighter for frame
    ctx.lineWidth = 1.0;
    ctx.strokeRect(
      doorPositionX + frameInset,
      wallHeight / 2 - door.height + frameInset,
      door.width - 2 * frameInset,
      door.height - 2 * frameInset
    );

    // Door Swing Arc (Simple one-direction swing)
    const doorEdgeX = doorPositionX + door.width;
    const doorTopY = wallHeight / 2 - door.height;
    // const doorBottomY = wallHeight / 2; // Unused in current arc logic

    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(doorEdgeX, doorTopY); // Hinge point assumed on the left edge of the door rect (doorPositionX)
    // Corrected arc: Hinges on left (doorPositionX), swings open from right edge (doorEdgeX)
    // The arc should start from the unhinged edge.
    // If hinge is on left: ctx.arc(doorPositionX, doorTopY + door.height/2, door.width, 0, -Math.PI / 4, true);
    // For simplicity, let's draw from the right edge (doorEdgeX) as if hinged on the left.
    // The provided logic seems to hinge it at doorPositionX, doorTopY (top-left of door)
    // and the arc starts from doorEdgeX, doorTopY (top-right of door).
    // Let's assume hinge is on the left side (doorPositionX)
    ctx.arc(doorPositionX, doorTopY + door.height, door.width, -Math.PI/2, -Math.PI/4, false); // Arc from bottom-left around left hinge
    // A more common representation might be:
    // ctx.moveTo(doorPositionX + door.width, doorPositionY + door.height); // Start at bottom-right if hinged on left
    // ctx.arc(doorPositionX, doorPositionY + door.height, door.width, 0, -Math.PI / 4, true);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  
  const drawWindowElevation = (ctx: CanvasRenderingContext2D, window: any, wall: any) => {
    // Calculate wall length
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    
    // Wall height
    const wallHeight = wall.height || 240;
    
    // Window position along wall
    const windowPositionX = -wallLength / 2 + window.position * wallLength - window.width / 2;
    const windowPositionY = wallHeight / 2 - window.sillHeight - window.height;
    
    // Draw window
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(windowPositionX, windowPositionY, window.width, window.height);
    
    // Window outline
    ctx.strokeStyle = "#0ea5e9";
    ctx.lineWidth = 2;
    ctx.strokeRect(windowPositionX, windowPositionY, window.width, window.height);
    
    // Window panes
    ctx.strokeStyle = "#7dd3fc"; // Or a slightly darker shade of it
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(windowPositionX + window.width / 2, windowPositionY);
    ctx.lineTo(windowPositionX + window.width / 2, windowPositionY + window.height);
    ctx.moveTo(windowPositionX, windowPositionY + window.height / 2);
    ctx.lineTo(windowPositionX + window.width, windowPositionY + window.height / 2);
    ctx.stroke();

    // Frame
    const frameInset = 3; // cm
    // ctx.strokeStyle = "#7dd3fc"; // Already set, or choose a frame-specific color
    ctx.lineWidth = 1.0; // Thinner than main outline, but thicker than panes
    ctx.strokeRect(
      windowPositionX + frameInset,
      windowPositionY + frameInset,
      window.width - 2 * frameInset,
      window.height - 2 * frameInset
    );
  };
  
// Update findCabinetsForWall
const findCabinetsForWall = (wall: any, allCabinets: any[]): OrientedItem<any>[] => {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  if (wallLength === 0) return [];
  const wallAngle = Math.atan2(dy, dx); // Angle of the wall line itself

  const relevantItems: OrientedItem<any>[] = [];

  allCabinets.forEach(cabinet => {
    const cabToWallStart = {
      x: cabinet.position.x - wall.start.x,
      y: cabinet.position.y - wall.start.y,
    };

    const normalX = -dy / wallLength;
    const normalY = dx / wallLength;
    
    const distanceToWallLine = Math.abs(
        (cabinet.position.x - wall.start.x) * normalX +
        (cabinet.position.y - wall.start.y) * normalY
    );

    const wallDirX = dx / wallLength;
    const wallDirY = dy / wallLength;
    const projectionOnWall = cabToWallStart.x * wallDirX + cabToWallStart.y * wallDirY;

    if (projectionOnWall >= -cabinet.width / 2 &&
        projectionOnWall <= wallLength + cabinet.width / 2 &&
        distanceToWallLine < (cabinet.depth / 2) + 20) {

      const cabinetGlobalAngle = normalizeAngle((cabinet.rotation || 0) * Math.PI / 180);
      let orientation: 'front' | 'side' | 'obscured' = 'obscured';

      if (areAnglesApproximatelyEqual(cabinetGlobalAngle, wallAngle) || areAnglesApproximatelyEqual(cabinetGlobalAngle, normalizeAngle(wallAngle + Math.PI))) {
        orientation = 'front';
      } else if (areAnglesPerpendicular(cabinetGlobalAngle, wallAngle)) {
        orientation = 'side';
      }

      if (orientation !== 'obscured') {
         relevantItems.push({ item: cabinet, orientation, projectionOnWall });
      }
    }
  });
  return relevantItems;
};

const findAppliancesForWall = (wall: any, allAppliances: any[]): OrientedItem<any>[] => {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  if (wallLength === 0) return [];
  const wallAngle = Math.atan2(dy, dx);

  const relevantItems: OrientedItem<any>[] = [];

  allAppliances.forEach(appliance => {
    const itemToWallStart = {
      x: appliance.position.x - wall.start.x,
      y: appliance.position.y - wall.start.y,
    };

    const normalX = -dy / wallLength;
    const normalY = dx / wallLength;
    
    const distanceToWallLine = Math.abs(
        (appliance.position.x - wall.start.x) * normalX +
        (appliance.position.y - wall.start.y) * normalY
    );

    const wallDirX = dx / wallLength;
    const wallDirY = dy / wallLength;
    const projectionOnWall = itemToWallStart.x * wallDirX + itemToWallStart.y * wallDirY;

    // Check if appliance is within wall segment bounds and close enough
    if (projectionOnWall >= -appliance.width / 2 &&
        projectionOnWall <= wallLength + appliance.width / 2 &&
        distanceToWallLine < (appliance.depth / 2) + 20) {

      const applianceGlobalAngle = normalizeAngle((appliance.rotation || 0) * Math.PI / 180);
      let orientation: 'front' | 'side' | 'obscured' = 'obscured';

      if (areAnglesApproximatelyEqual(applianceGlobalAngle, wallAngle) || areAnglesApproximatelyEqual(applianceGlobalAngle, normalizeAngle(wallAngle + Math.PI))) {
        orientation = 'front';
      } else if (areAnglesPerpendicular(applianceGlobalAngle, wallAngle)) {
        orientation = 'side';
      }

      if (orientation !== 'obscured') {
         relevantItems.push({ item: appliance, orientation, projectionOnWall });
      }
    }
  });
  return relevantItems;
};

const drawCabinetElevation = (ctx: CanvasRenderingContext2D, orientedCabinet: OrientedItem<any>, wall: any) => {
  const cabinet = orientedCabinet.item;
  const orientation = orientedCabinet.orientation;
  const projectionOnWall = orientedCabinet.projectionOnWall; // This is cabinet's center projection

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  const wallHeight = wall.height || 240;

  let cabinetPositionY;
  if (cabinet.type === 'base') {
    cabinetPositionY = wallHeight / 2 - cabinet.height;
  } else if (cabinet.type === 'wall' || cabinet.type === 'loft') {
    cabinetPositionY = wallHeight / 2 - cabinet.height - 150;
  } else if (cabinet.type === 'tall') {
    cabinetPositionY = wallHeight / 2 - cabinet.height;
  } else {
    return;
  }

  let cabinetDisplayX;
  const doorInset = 4; // Inset from cabinet edge for panels
  const innerInset = 2; // For simple bevel effect

  if (orientation === 'front') {
    cabinetDisplayX = -wallLength / 2 + projectionOnWall - cabinet.width / 2;
    
    ctx.fillStyle = cabinet.color || "#f9fafb"; // Use cabinet's color
    ctx.fillRect(cabinetDisplayX, cabinetPositionY, cabinet.width, cabinet.height);
    
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cabinetDisplayX, cabinetPositionY, cabinet.width, cabinet.height); // Main outline after fill

    if (cabinet.type === 'base') {
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(cabinetDisplayX - 2, cabinetPositionY, cabinet.width + 4, 4);
    }
    
    ctx.strokeStyle = "#9CA3AF"; // Lighter for internal lines
    ctx.lineWidth = 1.0;

    if (cabinet.frontType === 'drawer') {
      const drawers = cabinet.drawers || (cabinet.type === 'base' ? 3 : 2);
      const drawerHeight = cabinet.height / drawers;
      for (let i = 0; i < drawers; i++) {
        const drawerPanelX = cabinetDisplayX + doorInset;
        const drawerPanelY = cabinetPositionY + i * drawerHeight + doorInset / 2;
        const drawerPanelWidth = cabinet.width - 2 * doorInset;
        const drawerPanelHeight = drawerHeight - doorInset;

        ctx.strokeRect(drawerPanelX, drawerPanelY, drawerPanelWidth, drawerPanelHeight);
        if (drawerPanelWidth > 2 * innerInset && drawerPanelHeight > 2 * innerInset) {
           ctx.strokeRect(
               drawerPanelX + innerInset,
               drawerPanelY + innerInset,
               drawerPanelWidth - 2 * innerInset,
               drawerPanelHeight - 2 * innerInset
           );
        }
        ctx.fillStyle = "#6B7280"; // Handle color
        ctx.fillRect( // Centered handle
          drawerPanelX + drawerPanelWidth / 2 - 15,
          drawerPanelY + drawerPanelHeight / 2 - 1,
          30,
          2
        );
      }
    } else if (cabinet.frontType === 'shutter') {
      const panelWidth = cabinet.width - 2 * doorInset;
      const panelHeight = cabinet.height - 2 * doorInset;
      ctx.strokeRect(cabinetDisplayX + doorInset, cabinetPositionY + doorInset, panelWidth, panelHeight);

      if (panelWidth > 2 * innerInset && panelHeight > 2 * innerInset) {
         ctx.strokeRect(
             cabinetDisplayX + doorInset + innerInset,
             cabinetPositionY + doorInset + innerInset,
             panelWidth - 2 * innerInset,
             panelHeight - 2 * innerInset
         );
      }
      ctx.fillStyle = "#6B7280";
      if (cabinet.width > 50) {
         ctx.fillRect(cabinetDisplayX + doorInset + panelWidth / 4 - 1, cabinetPositionY + doorInset + panelHeight / 2 - 10, 2, 20);
         ctx.fillRect(cabinetDisplayX + doorInset + panelWidth * 3/4 -1, cabinetPositionY + doorInset + panelHeight / 2 - 10, 2, 20);
      } else {
         ctx.fillRect(cabinetDisplayX + doorInset + panelWidth - 10, cabinetPositionY + doorInset + panelHeight / 2 - 10, 2, 20);
      }
    } else if (cabinet.frontType === 'glass') {
        ctx.strokeRect(cabinetDisplayX + doorInset, cabinetPositionY + doorInset, cabinet.width - 2 * doorInset, cabinet.height - 2 * doorInset); // Frame
        
        const glassMargin = 10;
        ctx.fillStyle = "rgba(173, 216, 230, 0.4)";
        ctx.fillRect(
            cabinetDisplayX + doorInset + glassMargin,
            cabinetPositionY + doorInset + glassMargin,
            cabinet.width - 2 * (doorInset + glassMargin),
            cabinet.height - 2 * (doorInset + glassMargin)
        );
        ctx.strokeStyle = "#A5C0C8";
        ctx.strokeRect(
            cabinetDisplayX + doorInset + glassMargin,
            cabinetPositionY + doorInset + glassMargin,
            cabinet.width - 2 * (doorInset + glassMargin),
            cabinet.height - 2 * (doorInset + glassMargin)
        );
        ctx.fillStyle = "#6B7280";
        ctx.fillRect(cabinetDisplayX + cabinet.width - 2 * doorInset - 10, cabinetPositionY + cabinet.height / 2 - 10, 2, 20);
    }

  } else if (orientation === 'side') {
    cabinetDisplayX = -wallLength / 2 + projectionOnWall - cabinet.depth / 2;

    ctx.fillStyle = cabinet.color || "#f9fafb";
    ctx.fillRect(cabinetDisplayX, cabinetPositionY, cabinet.depth, cabinet.height);
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cabinetDisplayX, cabinetPositionY, cabinet.depth, cabinet.height);

    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 0.75;

    const projectionLength = Math.min(cabinet.width / 4, 20);
    const angle = Math.PI / 4;

    ctx.beginPath();
    ctx.moveTo(cabinetDisplayX + cabinet.depth, cabinetPositionY);
    ctx.lineTo(cabinetDisplayX + cabinet.depth + Math.cos(angle) * projectionLength, cabinetPositionY - Math.sin(angle) * projectionLength);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cabinetDisplayX + cabinet.depth, cabinetPositionY + cabinet.height);
    ctx.lineTo(cabinetDisplayX + cabinet.depth + Math.cos(angle) * projectionLength, cabinetPositionY + cabinet.height - Math.sin(angle) * projectionLength);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cabinetDisplayX + cabinet.depth + Math.cos(angle) * projectionLength, cabinetPositionY - Math.sin(angle) * projectionLength);
    ctx.lineTo(cabinetDisplayX + cabinet.depth + Math.cos(angle) * projectionLength, cabinetPositionY + cabinet.height - Math.sin(angle) * projectionLength);
    ctx.stroke();

    ctx.setLineDash([]);
  }
};
  
const drawApplianceElevation = (ctx: CanvasRenderingContext2D, orientedAppliance: OrientedItem<any>, wall: any) => {
  const appliance = orientedAppliance.item;
  const orientation = orientedAppliance.orientation;
  const projectionOnWall = orientedAppliance.projectionOnWall; // Appliance center projection

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  const wallHeight = wall.height || 240;

  let appliancePositionY = wallHeight / 2 - appliance.height;
  let applianceDisplayX;

  if (orientation === 'front') {
    applianceDisplayX = -wallLength / 2 + projectionOnWall - appliance.width / 2;
    
    ctx.fillStyle = appliance.color || "#e5e7eb"; // Use appliance's color
    ctx.fillRect(applianceDisplayX, appliancePositionY, appliance.width, appliance.height);
    
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(applianceDisplayX, appliancePositionY, appliance.width, appliance.height); // Main outline after fill

    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 1.0;

    if (appliance.type === 'sink') {
      ctx.fillStyle = "#cad1d9";
      ctx.fillRect(applianceDisplayX + 5, appliancePositionY + 5, appliance.width - 10, 20);
      ctx.strokeRect(applianceDisplayX + 5, appliancePositionY + 5, appliance.width - 10, 20);

      ctx.beginPath();
      ctx.moveTo(applianceDisplayX + appliance.width / 2, appliancePositionY + 5);
      ctx.lineTo(applianceDisplayX + appliance.width / 2, appliancePositionY - 15);
      ctx.arc(applianceDisplayX + appliance.width / 2 - 10, appliancePositionY - 15, 10, 0, Math.PI, true);
      ctx.stroke();
    } else if (appliance.type === 'stove') {
      ctx.fillStyle = "#4b5563";
      const burnerRadius = 5;
      for(let i=0; i < 2; i++) {
        for(let j=0; j < 2; j++) {
          ctx.beginPath();
          ctx.arc(applianceDisplayX + appliance.width * (i*0.5 + 0.25) , appliancePositionY + 15 + j*25, burnerRadius,0,Math.PI*2);
          ctx.fill();
        }
      }
      ctx.fillStyle = "#4b5563";
      ctx.fillRect(applianceDisplayX + 10, appliancePositionY + appliance.height - 15, appliance.width - 20, 10);
      ctx.strokeRect(applianceDisplayX + 10, appliancePositionY + appliance.height - 15, appliance.width - 20, 10);
    }

  } else if (orientation === 'side') {
    applianceDisplayX = -wallLength / 2 + projectionOnWall - appliance.depth / 2;

    ctx.fillStyle = appliance.color || "#e5e7eb";
    ctx.fillRect(applianceDisplayX, appliancePositionY, appliance.depth, appliance.height);
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(applianceDisplayX, appliancePositionY, appliance.depth, appliance.height);

    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 0.75;

    const projectionLength = Math.min(appliance.width / 4, 20);
    const angle = Math.PI / 4;

    ctx.beginPath();
    ctx.moveTo(applianceDisplayX + appliance.depth, appliancePositionY);
    ctx.lineTo(applianceDisplayX + appliance.depth + Math.cos(angle) * projectionLength, appliancePositionY - Math.sin(angle) * projectionLength);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(applianceDisplayX + appliance.depth, appliancePositionY + appliance.height);
    ctx.lineTo(applianceDisplayX + appliance.depth + Math.cos(angle) * projectionLength, appliancePositionY + appliance.height - Math.sin(angle) * projectionLength);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(applianceDisplayX + appliance.depth + Math.cos(angle) * projectionLength, appliancePositionY - Math.sin(angle) * projectionLength);
    ctx.lineTo(applianceDisplayX + appliance.depth + Math.cos(angle) * projectionLength, appliancePositionY + appliance.height - Math.sin(angle) * projectionLength);
    ctx.stroke();

    ctx.setLineDash([]);
  }
};
  
  const drawDimensionsElevation = (ctx: CanvasRenderingContext2D, wall: any) => {
    // Calculate wall length
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    
    // Wall height
    const wallHeight = wall.height || 240;
    
    // Draw dimensions
    ctx.strokeStyle = "#9ca3af";
    ctx.fillStyle = "#4b5563";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Width dimension
    ctx.beginPath();
    ctx.moveTo(-wallLength / 2, wallHeight / 2 + 20);
    ctx.lineTo(wallLength / 2, wallHeight / 2 + 20);
    ctx.stroke();
    
    // Width arrows
    drawArrow(ctx, -wallLength / 2, wallHeight / 2 + 20, 0);
    drawArrow(ctx, wallLength / 2, wallHeight / 2 + 20, Math.PI);
    
    // Width text
    ctx.fillText(`${Math.round(wallLength)} cm`, 0, wallHeight / 2 + 35);
    
    // Height dimension
    ctx.beginPath();
    ctx.moveTo(-wallLength / 2 - 20, -wallHeight / 2);
    ctx.lineTo(-wallLength / 2 - 20, wallHeight / 2);
    ctx.stroke();
    
    // Height arrows
    drawArrow(ctx, -wallLength / 2 - 20, -wallHeight / 2, Math.PI / 2);
    drawArrow(ctx, -wallLength / 2 - 20, wallHeight / 2, -Math.PI / 2);
    
    // Height text
    ctx.save();
    ctx.translate(-wallLength / 2 - 35, 0);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${wallHeight} cm`, 0, 0);
    ctx.restore();
    
    ctx.setLineDash([]);
  };
  
  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    const arrowSize = 5;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, -arrowSize);
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, arrowSize);
    ctx.stroke();
    
    ctx.restore();
  };
  
  const nextWall = () => {
    if (walls.length === 0) return;
    setCurrentWallIndex((currentWallIndex + 1) % walls.length);
  };
  
  const prevWall = () => {
    if (walls.length === 0) return;
    setCurrentWallIndex((currentWallIndex - 1 + walls.length) % walls.length);
  };
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Wall navigation controls */}
      {walls.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow-md p-2 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevWall}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-700">
            Wall {currentWallIndex + 1} of {walls.length}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextWall}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md p-2 text-sm flex items-center space-x-2">
        <button 
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => setScale(prev => Math.min(5, prev + 0.1))}
        >
          +
        </button>
        <span className="text-gray-700">{Math.round(scale * 100)}%</span>
        <button 
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
        >
          -
        </button>
        <button 
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => setScale(1)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10L19.5528 5.44721" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 10L4.44721 5.44721" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 14L19.5528 18.5528" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 14L4.44721 18.5528" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ElevationView;
