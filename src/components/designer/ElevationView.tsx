
import { useRef, useEffect, useState } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";

// Door drawing constants
const DOOR_FRAME_THICKNESS_2D_DEFAULT = 5; // cm, if door.frameThickness is undefined
const DOOR_SLAB_LINE_WEIGHT = 1.5;
const DOOR_FRAME_LINE_WEIGHT = 1;
const DOOR_DETAIL_LINE_WEIGHT = 0.75;
const DOOR_SWING_LINE_DASH = [3, 3];

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
  
  const drawDoorElevation = (ctx: CanvasRenderingContext2D, door: Door, wall: any) => {
  const wallLength = Math.sqrt(Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.y - wall.start.y, 2));
  const wallHeight = wall.height || 240;

  const dWidth = door.width || 80;
  const dHeight = door.height || 200;
  const dType = door.type || 'standard';
  const dColorString = door.color || '#B88A69';
  const dColor = new THREE.Color(dColorString);
  const fThickness = door.frameThickness || DOOR_FRAME_THICKNESS_2D_DEFAULT;

  const doorOpeningCenterX = -wallLength / 2 + door.position * wallLength;
  const doorOpeningLeftX = doorOpeningCenterX - dWidth / 2;
  const doorOpeningRightX = doorOpeningCenterX + dWidth / 2;
  const doorOpeningTopY = wallHeight / 2 - dHeight;
  const doorOpeningBottomY = wallHeight / 2;

  ctx.save();

  // 1. Draw Door Frame
  const frameColorStyle = dColor.clone().multiplyScalar(0.7).getStyle();
  ctx.fillStyle = frameColorStyle;
  ctx.strokeStyle = frameColorStyle;
  ctx.lineWidth = DOOR_FRAME_LINE_WEIGHT;

  const frameOuterLeft = doorOpeningLeftX - fThickness;
  const frameOuterTop = doorOpeningTopY - fThickness;

  ctx.beginPath();
  ctx.rect(frameOuterLeft, frameOuterTop, dWidth + 2 * fThickness, fThickness); // Lintel
  ctx.rect(frameOuterLeft, frameOuterTop + fThickness, fThickness, dHeight); // Left Jamb
  ctx.rect(doorOpeningRightX, frameOuterTop + fThickness, fThickness, dHeight); // Right Jamb
  ctx.fill(); // Fill all frame parts at once
  ctx.stroke(); // Stroke all frame parts

  // 2. Draw Door Slab / Specific Type Details
  ctx.fillStyle = dColor.getStyle();
  ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle();
  ctx.lineWidth = DOOR_SLAB_LINE_WEIGHT;

  if (dType === 'standard') {
    ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);
    ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);

    ctx.setLineDash(DOOR_SWING_LINE_DASH);
    ctx.lineWidth = DOOR_DETAIL_LINE_WEIGHT;
    ctx.strokeStyle = "#6B7280";
    ctx.beginPath();
    const hingeX = doorOpeningLeftX;
    const hingeY = doorOpeningBottomY;
    ctx.moveTo(doorOpeningRightX, doorOpeningBottomY);
    ctx.arc(hingeX, hingeY, dWidth, 0, -Math.PI / 2, true);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#6B7280";
    ctx.beginPath();
    ctx.arc(doorOpeningLeftX + dWidth - 12, doorOpeningTopY + dHeight / 2, 3, 0, 2 * Math.PI);
    ctx.fill();

  } else if (dType === 'sliding') {
    ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);
    ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);

    ctx.lineWidth = DOOR_DETAIL_LINE_WEIGHT;
    ctx.strokeStyle = "#6B7280";
    ctx.beginPath();
    const arrowY = doorOpeningTopY + 10;
    ctx.moveTo(doorOpeningLeftX + dWidth * 0.2, arrowY);
    ctx.lineTo(doorOpeningLeftX + dWidth * 0.8, arrowY);
    ctx.moveTo(doorOpeningLeftX + dWidth * 0.8 - 8, arrowY - 4);
    ctx.lineTo(doorOpeningLeftX + dWidth * 0.8, arrowY);
    ctx.lineTo(doorOpeningLeftX + dWidth * 0.8 - 8, arrowY + 4);
    ctx.stroke();

  } else if (dType === 'pocket') {
    const visiblePartWidth = dWidth * 0.3;
    ctx.fillStyle = dColor.getStyle();
    ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, visiblePartWidth, dHeight);
    ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle();
    ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, visiblePartWidth, dHeight);

    ctx.setLineDash([4,2]);
    ctx.strokeStyle = dColor.clone().multiplyScalar(0.7).getStyle();
    ctx.strokeRect(doorOpeningLeftX + visiblePartWidth, doorOpeningTopY, dWidth - visiblePartWidth, dHeight);
    ctx.setLineDash([]);

  } else if (dType === 'folding') {
    const panelWidth = dWidth / 2;
    ctx.fillStyle = dColor.getStyle();
    ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle();

    ctx.beginPath();
    ctx.moveTo(doorOpeningLeftX, doorOpeningBottomY);
    ctx.lineTo(doorOpeningLeftX, doorOpeningTopY);
    ctx.lineTo(doorOpeningLeftX + panelWidth - 5, doorOpeningTopY + 10);
    ctx.lineTo(doorOpeningLeftX + panelWidth - 5, doorOpeningBottomY - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(doorOpeningRightX, doorOpeningBottomY);
    ctx.lineTo(doorOpeningRightX, doorOpeningTopY);
    ctx.lineTo(doorOpeningRightX - panelWidth + 5, doorOpeningTopY + 10);
    ctx.lineTo(doorOpeningRightX - panelWidth + 5, doorOpeningBottomY - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(doorOpeningCenterX, doorOpeningTopY + 10);
    ctx.lineTo(doorOpeningCenterX, doorOpeningBottomY -10);
    ctx.strokeStyle = dColor.clone().multiplyScalar(0.7).getStyle();
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  ctx.restore();
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
    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(windowPositionX + window.width / 2, windowPositionY);
    ctx.lineTo(windowPositionX + window.width / 2, windowPositionY + window.height);
    ctx.moveTo(windowPositionX, windowPositionY + window.height / 2);
    ctx.lineTo(windowPositionX + window.width, windowPositionY + window.height / 2);
    ctx.stroke();

    // Frame
    const frameInset = 3;
    ctx.strokeStyle = "#7AB8D4";
    ctx.lineWidth = 1.0;
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
  const projectionOnWall = orientedCabinet.projectionOnWall;

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  const wallHeight = wall.height || 240;

  const toeKickH = (cabinet.type === 'base' && cabinet.toeKickHeight !== undefined && cabinet.toeKickHeight > 0) ? cabinet.toeKickHeight : 0;
  const toeKickD_inset = (cabinet.type === 'base' && cabinet.toeKickDepth !== undefined && cabinet.toeKickDepth > 0) ? cabinet.toeKickDepth : 0;
  const mainBoxEffectiveHeight = cabinet.height - toeKickH;

  let topY_mainBox; // Y-coordinate for the TOP of the main cabinet box (excluding countertop)

  if (cabinet.type === 'base') {
    topY_mainBox = wallHeight / 2 - cabinet.height + toeKickH;
  } else if (cabinet.type === 'tall') {
    topY_mainBox = wallHeight / 2 - cabinet.height;
  } else if (cabinet.type === 'wall') {
    const wallCabinetBottomMountHeight = 150;
    topY_mainBox = wallHeight / 2 - wallCabinetBottomMountHeight - mainBoxEffectiveHeight;
  } else if (cabinet.type === 'loft') {
    const loftBottomMountHeight = 210;
    topY_mainBox = wallHeight / 2 - loftBottomMountHeight - mainBoxEffectiveHeight;
  } else {
    return;
  }

  const cabinetBaseColor = cabinet.color || "#f9fafb";
  let cabinetDisplayX;
  const doorInset = 4;
  const innerInset = 2;
  const STILE_WIDTH_2D = 5; // Visual stile width for 2D Shaker representation


  // Shelf Style Constants
  const SHELF_LINE_COLOR = "#BCC0C4";
  const SHELF_LINE_WIDTH = 0.75;
  const SHELF_LINE_DASH = [2, 2];
  const SHELF_INSET_X_2D = 2;
  const SHELF_THICKNESS_FOR_CALC = 2;

  if (orientation === 'front') {
    cabinetDisplayX = -wallLength / 2 + projectionOnWall - cabinet.width / 2;

    // Draw Main Cabinet Box
    ctx.fillStyle = cabinetBaseColor;
    ctx.fillRect(cabinetDisplayX, topY_mainBox, cabinet.width, mainBoxEffectiveHeight);
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cabinetDisplayX, topY_mainBox, cabinet.width, mainBoxEffectiveHeight);

    // Draw Toe Kick
    if (toeKickH > 0) {
      ctx.fillStyle = new THREE.Color(cabinetBaseColor).multiplyScalar(0.7).getStyle();
      ctx.fillRect(cabinetDisplayX, topY_mainBox + mainBoxEffectiveHeight, cabinet.width, toeKickH);
      ctx.strokeStyle = "#4A5568";
      ctx.lineWidth = 1.0;
      ctx.strokeRect(cabinetDisplayX, topY_mainBox + mainBoxEffectiveHeight, cabinet.width, toeKickH);
    }
    
    // Draw countertop for base cabinets
    if (cabinet.type === 'base') {
        ctx.fillStyle = "#9ca3af";
        const countertopHeight = 4;
        ctx.fillRect(
            cabinetDisplayX - 2,
            topY_mainBox - countertopHeight,
            cabinet.width + 4,
            countertopHeight
        );
    }

    // Draw Shelves (Front View)
    const shelfCount = (cabinet.shelfCount !== undefined && cabinet.shelfCount > 0) ? cabinet.shelfCount : 0;
    if (shelfCount > 0 && (cabinet.frontType === 'open' || cabinet.frontType === 'glass' || cabinet.frontType === 'shutter')) {
      ctx.save();
      ctx.strokeStyle = SHELF_LINE_COLOR;
      ctx.lineWidth = SHELF_LINE_WIDTH;
      ctx.setLineDash(SHELF_LINE_DASH);
      const totalShelfPhysicalThickness = shelfCount * SHELF_THICKNESS_FOR_CALC;
      const remainingSpaceForGaps = mainBoxEffectiveHeight - totalShelfPhysicalThickness;
      if (remainingSpaceForGaps >= SHELF_LINE_DASH[0]) {
        const gapHeight = remainingSpaceForGaps / (shelfCount + 1);
        for (let i = 0; i < shelfCount; i++) {
          const shelfTopSurfaceY = topY_mainBox + (gapHeight * (i + 1)) + (SHELF_THICKNESS_FOR_CALC * i);
          // To draw the line representing the shelf (not its thickness center):
          const lineY = shelfTopSurfaceY; // if line is top of shelf

          ctx.beginPath();
          const startX = cabinetDisplayX + SHELF_INSET_X_2D;
          const endX = cabinetDisplayX + cabinet.width - SHELF_INSET_X_2D;
          if (endX > startX) {
            ctx.moveTo(startX, lineY);
            ctx.lineTo(endX, lineY);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Front details (doors, drawers, glass) - Y positions relative to topY_mainBox
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 1.0;
    const doorStyle = cabinet.doorStyle || 'slab';

    if (cabinet.frontType === 'drawer') {
      const numDrawers = cabinet.drawers && cabinet.drawers > 0 ? cabinet.drawers : 1;
      const singleDrawerSlotHeight = mainBoxEffectiveHeight / numDrawers; // Height of the slot for one drawer

      for (let i = 0; i < numDrawers; i++) {
        const drawerX = cabinetDisplayX + doorInset;
        // Y position of the top of this drawer slot
        const drawerSlotTopY = topY_mainBox + i * singleDrawerSlotHeight;
        const drawerActualWidth = cabinet.width - 2 * doorInset;
        // Height of the drawer front, slightly smaller than the slot to leave gaps
        const drawerActualHeight = singleDrawerSlotHeight - ( (i < numDrawers -1) ? doorInset/2 : 0 ) - (i > 0 ? doorInset/2 : 0) ;
        // Y position of the top of the drawer front itself
        const drawerY = drawerSlotTopY + ( (i===0) ? 0 : doorInset/4 );


        ctx.strokeRect(drawerX, drawerY, drawerActualWidth, drawerActualHeight);

        if (doorStyle === 'shaker' && drawerActualWidth > 2 * STILE_WIDTH_2D && drawerActualHeight > 2 * STILE_WIDTH_2D) {
          ctx.strokeRect(
            drawerX + STILE_WIDTH_2D,
            drawerY + STILE_WIDTH_2D,
            drawerActualWidth - 2 * STILE_WIDTH_2D,
            drawerActualHeight - 2 * STILE_WIDTH_2D
          );
        }
        ctx.fillStyle = "#6B7280";
        ctx.fillRect(
          drawerX + drawerActualWidth / 2 - 15,
          drawerY + drawerActualHeight / 2 - 1,
          30, 2
        );
      }
    } else if (cabinet.frontType === 'shutter') {
      const doorX = cabinetDisplayX + doorInset;
      const doorY = topY_mainBox + doorInset;
      const singleDoorWidth = cabinet.width - 2 * doorInset;
      const doorActualHeight = mainBoxEffectiveHeight - 2 * doorInset;

      ctx.strokeRect(doorX, doorY, singleDoorWidth, doorActualHeight);

      if (doorStyle === 'shaker' && singleDoorWidth > 2 * STILE_WIDTH_2D && doorActualHeight > 2 * STILE_WIDTH_2D) {
        ctx.strokeRect(
          doorX + STILE_WIDTH_2D,
          doorY + STILE_WIDTH_2D,
          singleDoorWidth - 2 * STILE_WIDTH_2D,
          doorActualHeight - 2 * STILE_WIDTH_2D
        );
      }
      ctx.fillStyle = "#6B7280";
      ctx.fillRect(doorX + singleDoorWidth - 10 - (doorStyle === 'shaker' ? STILE_WIDTH_2D / 2 : 0), doorY + doorActualHeight / 2 - 10, 2, 20);

    } else if (cabinet.frontType === 'glass') {
      const glassDoorX = cabinetDisplayX + doorInset;
      const glassDoorY = topY_mainBox + doorInset;
      const glassDoorWidth = cabinet.width - 2 * doorInset;
      const glassDoorHeight = mainBoxEffectiveHeight - 2 * doorInset;

      ctx.strokeRect(glassDoorX, glassDoorY, glassDoorWidth, glassDoorHeight); // Frame

      const glassMargin = (doorStyle === 'shaker') ? STILE_WIDTH_2D : 3;

      if (glassDoorWidth > 2 * glassMargin && glassDoorHeight > 2 * glassMargin) {
         ctx.fillStyle = "rgba(173, 216, 230, 0.4)";
         ctx.fillRect(
             glassDoorX + glassMargin,
             glassDoorY + glassMargin,
             glassDoorWidth - 2 * glassMargin,
             glassDoorHeight - 2 * glassMargin
         );
         ctx.strokeStyle = "#A5C0C8";
         ctx.strokeRect(
             glassDoorX + glassMargin,
             glassDoorY + glassMargin,
             glassDoorWidth - 2 * glassMargin,
             glassDoorHeight - 2 * glassMargin
         );
      }
      ctx.fillStyle = "#6B7280";
      ctx.fillRect(glassDoorX + glassDoorWidth - 10 - (doorStyle === 'shaker' ? STILE_WIDTH_2D / 2 : 0), glassDoorY + glassDoorHeight / 2 - 10, 2, 20);
    }

  } else if (orientation === 'side') {
    const itemDisplayX_side = -wallLength / 2 + projectionOnWall - cabinet.depth / 2;

    ctx.fillStyle = cabinetBaseColor;
    ctx.fillRect(itemDisplayX_side, topY_mainBox, cabinet.depth, mainBoxEffectiveHeight);
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(itemDisplayX_side, topY_mainBox, cabinet.depth, mainBoxEffectiveHeight);

    if (toeKickH > 0) {
      const toeKickSideActualDepth = cabinet.depth - toeKickD_inset;
      ctx.fillStyle = new THREE.Color(cabinetBaseColor).multiplyScalar(0.7).getStyle();
      ctx.fillRect(itemDisplayX_side, topY_mainBox + mainBoxEffectiveHeight, toeKickSideActualDepth, toeKickH);
      ctx.strokeStyle = "#4A5568";
      ctx.lineWidth = 1.0;
      ctx.strokeRect(itemDisplayX_side, topY_mainBox + mainBoxEffectiveHeight, toeKickSideActualDepth, toeKickH);
    }

    const SHELF_LINE_COLOR_SIDE = "#BCC0C4";
    const SHELF_LINE_WIDTH_SIDE = 0.75;
    const SHELF_LINE_DASH_SIDE = [2, 2];
    const SHELF_INSET_SIDE_2D = 2;
    const SHELF_THICKNESS_FOR_CALC_SIDE = 2;
    const shelfCountSide = (cabinet.shelfCount !== undefined && cabinet.shelfCount > 0) ? cabinet.shelfCount : 0;

    if (shelfCountSide > 0 && (cabinet.frontType === 'open' || cabinet.frontType === 'glass' || cabinet.frontType === 'shutter')) {
      ctx.save();
      ctx.strokeStyle = SHELF_LINE_COLOR_SIDE;
      ctx.lineWidth = SHELF_LINE_WIDTH_SIDE;
      ctx.setLineDash(SHELF_LINE_DASH_SIDE);

      const totalShelfPhysicalThicknessSide = shelfCountSide * SHELF_THICKNESS_FOR_CALC_SIDE;
      const remainingSpaceForGapsSide = mainBoxEffectiveHeight - totalShelfPhysicalThicknessSide;

      if (remainingSpaceForGapsSide >= SHELF_LINE_DASH_SIDE[0]) {
        const gapHeightSide = remainingSpaceForGapsSide / (shelfCountSide + 1);
        for (let i = 0; i < shelfCountSide; i++) {
          const shelfTopSurfaceYSide = topY_mainBox + (gapHeightSide * (i + 1)) + (SHELF_THICKNESS_FOR_CALC_SIDE * i);
          const lineYSide = shelfTopSurfaceYSide;

          ctx.beginPath();
          const startX_side_shelf = itemDisplayX_side + SHELF_INSET_SIDE_2D;
          const endX_side_shelf = itemDisplayX_side + cabinet.depth - SHELF_INSET_SIDE_2D;
          if (endX_side_shelf > startX_side_shelf) {
            ctx.moveTo(startX_side_shelf, lineYSide);
            ctx.lineTo(endX_side_shelf, lineYSide);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 0.75;

    const projectedWidth = cabinet.width;
    const x1_s = itemDisplayX_side;
    const y1_s = topY_mainBox; // Use topY_mainBox
    const x2_s = itemDisplayX_side + cabinet.depth;
    const y2_s = topY_mainBox; // Use topY_mainBox
    const y3_s = topY_mainBox + mainBoxEffectiveHeight; // Use topY_mainBox

    ctx.beginPath();
    ctx.moveTo(x2_s, y2_s);
    ctx.lineTo(x2_s + projectedWidth, y2_s);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2_s, y3_s);
    ctx.lineTo(x2_s + projectedWidth, y3_s);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2_s + projectedWidth, y2_s);
    ctx.lineTo(x2_s + projectedWidth, y3_s);
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
    
    ctx.fillStyle = appliance.color || "#e5e7eb";
    ctx.fillRect(applianceDisplayX, appliancePositionY, appliance.width, appliance.height); // Fill first
    
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(applianceDisplayX, appliancePositionY, appliance.width, appliance.height); // Then outline

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
