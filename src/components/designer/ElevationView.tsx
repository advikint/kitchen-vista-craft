import { useRef, useEffect, useState } from "react";
import { useKitchenStore, Door } from "@/store/kitchenStore"; // Ensured Door is imported
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";

// --- STYLING CONSTANTS ---
// General
const DETAIL_LINE_COLOR = "#9CA3AF";
const DETAIL_LINE_WIDTH = 1.0;
const THIN_DETAIL_LINE_WIDTH = 0.75;
const INTERACTION_ELEMENT_COLOR = "#6B7280"; // For handles, arrows, etc.

// Wall
const WALL_FILL_COLOR = "#f3f4f6";
const WALL_OUTLINE_COLOR = "#374151";
const WALL_OUTLINE_WIDTH = 3;
const FLOOR_LINE_COLOR = DETAIL_LINE_COLOR; // Re-using DETAIL_LINE_COLOR
const FLOOR_LINE_WIDTH = 3;

// Door
const DOOR_FRAME_THICKNESS_2D_DEFAULT = 5; // cm (Geometric, not just style)
const DOOR_SLAB_LINE_WEIGHT_CONST = 1.0;
const DOOR_FRAME_LINE_WEIGHT_CONST = 1.0;
const DOOR_DETAIL_LINE_WEIGHT_CONST = THIN_DETAIL_LINE_WIDTH;
const DOOR_SWING_LINE_DASH_CONST = [3, 3];
const POCKET_DOOR_DASH_CONST = [4, 2];
const DOOR_HANDLE_FILL_COLOR_CONST = INTERACTION_ELEMENT_COLOR;
const DOOR_HANDLE_RADIUS = 3;
const DOOR_HANDLE_OFFSET_X = 12; // from latch edge

// Window
const WINDOW_FILL_COLOR = "#e0f2fe";
const WINDOW_OUTLINE_COLOR = "#0ea5e9";
const WINDOW_OUTLINE_WIDTH = 1.5;
const WINDOW_FRAME_COLOR = "#7AB8D4";
const WINDOW_FRAME_LINE_WIDTH_CONST = 1.0;
const WINDOW_PANE_COLOR = "#7dd3fc";
const WINDOW_PANE_LINE_WIDTH_CONST = THIN_DETAIL_LINE_WIDTH;
const WINDOW_FRAME_INSET_CONST = 3;

// Cabinet
const CABINET_DEFAULT_FILL_COLOR = "#f9fafb";
const CABINET_OUTLINE_COLOR = INTERACTION_ELEMENT_COLOR;
const CABINET_OUTLINE_WIDTH = 1.5;
const TOEKICK_OUTLINE_COLOR = "#4A5568";
const TOEKICK_OUTLINE_WIDTH = 1.0;
const COUNTERTOP_FILL_COLOR = DETAIL_LINE_COLOR;
const COUNTERTOP_HEIGHT_2D = 4;
const COUNTERTOP_OVERHANG_2D = 2; // Geometric

const STILE_WIDTH_2D_CONST = 5; // Geometric
const CABINET_FRONT_DETAIL_LINE_STYLE = DETAIL_LINE_COLOR;
const CABINET_FRONT_DETAIL_LINE_WIDTH = DETAIL_LINE_WIDTH;
const CABINET_HANDLE_FILL_STYLE = INTERACTION_ELEMENT_COLOR;
const DRAWER_HANDLE_WIDTH = 30;
const DRAWER_HANDLE_HEIGHT = 2;
const SHUTTER_HANDLE_WIDTH = 2;
const SHUTTER_HANDLE_HEIGHT = 20;
const SHUTTER_HANDLE_OFFSET_FROM_EDGE = 10; // Offset from the edge of the door panel for single handle
const SHUTTER_HANDLE_STILE_CENTER_OFFSET = 1; // Offset from stile center for shaker double handles

const GLASS_PANEL_FILL_COLOR = "rgba(173, 216, 230, 0.4)";
const GLASS_PANEL_STROKE_COLOR = "#A5C0C8"; // Added for completeness

// Shelf
const SHELF_LINE_COLOR_CONST = "#BCC0C4";
const SHELF_LINE_WIDTH_CONST = THIN_DETAIL_LINE_WIDTH;
const SHELF_LINE_DASH_CONST = [2, 2];
// const SHELF_INSET_X_2D = 2; // Keep local if specific and geometric
// const SHELF_THICKNESS_FOR_CALC = 2; // Keep local if specific and geometric

// Appliance
const APPLIANCE_DEFAULT_FILL_COLOR = "#e5e7eb";
const APPLIANCE_OUTLINE_COLOR = INTERACTION_ELEMENT_COLOR;
const APPLIANCE_OUTLINE_WIDTH = 1.5;
const SINK_BASIN_COLOR_CONST = "#cad1d9";
const SINK_FAUCET_COLOR_CONST = INTERACTION_ELEMENT_COLOR;
const SINK_BASIN_BORDER_WIDTH = THIN_DETAIL_LINE_WIDTH;
const SINK_FAUCET_LINE_WIDTH = DETAIL_LINE_WIDTH;
const SINK_BASIN_RECT_HEIGHT = 20; // Example value
const SINK_FAUCET_HEIGHT_ABOVE_BASIN = 15; // Example value
const SINK_FAUCET_ARC_RADIUS = 10; // Example value


const STOVE_DETAIL_COLOR_CONST = "#4b5563";
const STOVE_BURNER_RADIUS_FACTOR = 0.08;
const STOVE_CONTROL_PANEL_HEIGHT = 10; // Example value
const STOVE_CONTROL_PANEL_MARGIN_Y = 5; // Example value (margin from bottom of appliance)


// Dimensions & Arrows
const DIMENSION_LINE_COLOR = DETAIL_LINE_COLOR;
const DIMENSION_TEXT_COLOR = "#4b5563"; // Kept specific as it's darker than INTERACTION_ELEMENT_COLOR
const DIMENSION_FONT = "12px Arial";
const DIMENSION_LINE_DASH = [3, 3];
const ARROW_SIZE = 5;

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

// Helper for drawing a 2D Shaker front
const drawShakerFront2D = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  stileWidth: number, // This is geometric, passed in
  lineStyle: string = CABINET_FRONT_DETAIL_LINE_STYLE, // Use new constant
  lineWidth: number = CABINET_FRONT_DETAIL_LINE_WIDTH  // Use new constant
) => {
  ctx.strokeStyle = lineStyle;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height); // Outer rectangle
  if (width > 2 * stileWidth && height > 2 * stileWidth) {
    ctx.strokeRect(x + stileWidth, y + stileWidth, width - 2 * stileWidth, height - 2 * stileWidth); // Inner panel
  }
};

// Helper for drawing a simple 2D Slab front
const drawSlabFront2D = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  lineStyle: string = CABINET_FRONT_DETAIL_LINE_STYLE, // Use new constant
  lineWidth: number = CABINET_FRONT_DETAIL_LINE_WIDTH  // Use new constant
) => {
  ctx.strokeStyle = lineStyle;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height);
};

// Helper for drawing side view projection lines
const drawSideProjection2D = (
    ctx: CanvasRenderingContext2D,
    visibleSideX: number,
    visibleSideTopY: number,
    visibleSideBottomY: number,
    projectionDistance: number,
    lineStyle: string = DETAIL_LINE_COLOR, // Use new constant
    lineWidth: number = THIN_DETAIL_LINE_WIDTH, // Use new constant
    lineDash: number[] = DIMENSION_LINE_DASH // Use new constant
) => {
    ctx.save();
    ctx.setLineDash(lineDash);
    ctx.strokeStyle = lineStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(visibleSideX, visibleSideTopY);
    ctx.lineTo(visibleSideX + projectionDistance, visibleSideTopY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(visibleSideX, visibleSideBottomY);
    ctx.lineTo(visibleSideX + projectionDistance, visibleSideBottomY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(visibleSideX + projectionDistance, visibleSideTopY);
    ctx.lineTo(visibleSideX + projectionDistance, visibleSideBottomY);
    ctx.stroke();
    ctx.restore();
};

interface OrientedItem<T> {
  item: T;
  orientation: 'front' | 'side' | 'obscured';
  projectionOnWall: number;
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
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  useEffect(() => {
    draw();
  }, [room, walls, doors, windows, cabinets, appliances, currentWallIndex, scale, showDimensions]);
  
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (walls.length === 0) {
      drawNoWallsMessage(ctx, canvas.width, canvas.height);
      return;
    }
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    
    const wall = walls[currentWallIndex];
    if (!wall) { ctx.restore(); return; }
    
    drawWallElevation(ctx, wall);
    
    const wallDoors = doors.filter(d => d.wallId === wall.id);
    wallDoors.forEach(door => drawDoorElevation(ctx, door, wall));
    
    const wallWindows = windows.filter(w => w.wallId === wall.id);
    wallWindows.forEach(window => drawWindowElevation(ctx, window, wall));
    
    const relevantCabinets = findCabinetsForWall(wall, cabinets);
    relevantCabinets.forEach(orientedCabinet => drawCabinetElevation(ctx, orientedCabinet, wall));
    
    const relevantAppliances = findAppliancesForWall(wall, appliances);
    relevantAppliances.forEach(orientedAppliance => drawApplianceElevation(ctx, orientedAppliance, wall));
    
    if (showDimensions) drawDimensionsElevation(ctx, wall);
    ctx.restore();
  };
  
  const drawNoWallsMessage = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    ctx.fillStyle = DIMENSION_TEXT_COLOR; // Using a general text color
    ctx.font = DIMENSION_FONT; // Using dimension font for consistency
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("No walls created yet.", canvasWidth / 2, canvasHeight / 2 - 20);
    ctx.fillText("Use Top View to create walls.", canvasWidth / 2, canvasHeight / 2 + 20);
  };
  
  const drawWallElevation = (ctx: CanvasRenderingContext2D, wall: any) => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    const wallHeight = wall.height || 240; // Default wall height
    ctx.fillStyle = WALL_FILL_COLOR;
    ctx.fillRect(-wallLength / 2, -wallHeight / 2, wallLength, wallHeight);
    ctx.strokeStyle = WALL_OUTLINE_COLOR;
    ctx.lineWidth = WALL_OUTLINE_WIDTH;
    ctx.strokeRect(-wallLength / 2, -wallHeight / 2, wallLength, wallHeight);
    // Floor line
    ctx.beginPath();
    ctx.moveTo(-wallLength / 2, wallHeight / 2);
    ctx.lineTo(wallLength / 2, wallHeight / 2);
    ctx.strokeStyle = FLOOR_LINE_COLOR;
    ctx.lineWidth = FLOOR_LINE_WIDTH;
    ctx.stroke();
  };
  
  const drawDoorElevation = (ctx: CanvasRenderingContext2D, door: Door, wall: any) => {
    const wallLength = Math.sqrt(Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.y - wall.start.y, 2));
    const wallHeight = wall.height || 240;

    const dWidth = door.width || 80;
    const dHeight = door.height || 200;
    const dType = door.type || 'standard';
    const dColorString = door.color || '#B88A69'; // Default door color
    const dColor = new THREE.Color(dColorString);
    const fThickness = door.frameThickness || DOOR_FRAME_THICKNESS_2D_DEFAULT;

    const doorOpeningCenterX = -wallLength / 2 + door.position * wallLength;
    const doorOpeningLeftX = doorOpeningCenterX - dWidth / 2;
    const doorOpeningRightX = doorOpeningCenterX + dWidth / 2;
    const doorOpeningTopY = wallHeight / 2 - dHeight;
    const doorOpeningBottomY = wallHeight / 2;

    ctx.save();

    // Frame
    const frameColorStyle = dColor.clone().multiplyScalar(0.7).getStyle(); // Derived frame color
    ctx.fillStyle = frameColorStyle;
    ctx.strokeStyle = frameColorStyle;
    ctx.lineWidth = DOOR_FRAME_LINE_WEIGHT_CONST;

    const frameOuterLeft = doorOpeningLeftX - fThickness;
    const frameOuterTop = doorOpeningTopY - fThickness;

    ctx.beginPath();
    ctx.rect(frameOuterLeft, frameOuterTop, dWidth + 2 * fThickness, fThickness); // Lintel
    ctx.rect(frameOuterLeft, frameOuterTop + fThickness, fThickness, dHeight); // Left Jamb
    ctx.rect(doorOpeningRightX, frameOuterTop + fThickness, fThickness, dHeight); // Right Jamb
    ctx.fill();
    ctx.stroke();

    // Door Slab
    ctx.fillStyle = dColor.getStyle();
    ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle(); // Slightly darker slab outline
    ctx.lineWidth = DOOR_SLAB_LINE_WEIGHT_CONST;

    if (dType === 'standard') {
      ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);
      ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);

      // Swing Arc
      ctx.setLineDash(DOOR_SWING_LINE_DASH_CONST);
      ctx.lineWidth = DOOR_DETAIL_LINE_WEIGHT_CONST;
      ctx.strokeStyle = INTERACTION_ELEMENT_COLOR;
      ctx.beginPath();
      const hingeX = doorOpeningLeftX;
      const hingeY = doorOpeningBottomY;
      ctx.moveTo(doorOpeningRightX, doorOpeningBottomY);
      ctx.arc(hingeX, hingeY, dWidth, 0, -Math.PI / 2, true);
      ctx.stroke();
      ctx.setLineDash([]);

      // Handle
      ctx.fillStyle = DOOR_HANDLE_FILL_COLOR_CONST;
      ctx.beginPath();
      ctx.arc(doorOpeningLeftX + dWidth - DOOR_HANDLE_OFFSET_X, doorOpeningTopY + dHeight / 2, DOOR_HANDLE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();

    } else if (dType === 'sliding') {
      ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);
      ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);

      // Sliding Arrow
      ctx.lineWidth = DOOR_DETAIL_LINE_WEIGHT_CONST;
      ctx.strokeStyle = INTERACTION_ELEMENT_COLOR;
      ctx.beginPath();
      const arrowY = doorOpeningTopY + 10;
      ctx.moveTo(doorOpeningLeftX + dWidth * 0.2, arrowY);
      ctx.lineTo(doorOpeningLeftX + dWidth * 0.8, arrowY);
      ctx.moveTo(doorOpeningLeftX + dWidth * 0.8 - 8, arrowY - 4); // Arrowhead
      ctx.lineTo(doorOpeningLeftX + dWidth * 0.8, arrowY);
      ctx.lineTo(doorOpeningLeftX + dWidth * 0.8 - 8, arrowY + 4);
      ctx.stroke();

    } else if (dType === 'pocket') {
      const visiblePartWidth = dWidth * 0.3;
      ctx.fillStyle = dColor.getStyle();
      ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, visiblePartWidth, dHeight);
      ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle();
      ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, visiblePartWidth, dHeight);

      // Dashed part in wall
      ctx.setLineDash(POCKET_DOOR_DASH_CONST);
      ctx.strokeStyle = dColor.clone().multiplyScalar(0.7).getStyle(); // Lighter color for hidden part
      ctx.lineWidth = DOOR_SLAB_LINE_WEIGHT_CONST; // Keep same weight as visible slab
      ctx.strokeRect(doorOpeningLeftX + visiblePartWidth, doorOpeningTopY, dWidth - visiblePartWidth, dHeight);
      ctx.setLineDash([]);

    } else if (dType === 'folding') {
      const panelWidth = dWidth / 2;
      ctx.fillStyle = dColor.getStyle();
      ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle();
      ctx.lineWidth = DOOR_SLAB_LINE_WEIGHT_CONST;

      // Panels (simplified representation)
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

      // Hinge line
      ctx.beginPath();
      ctx.moveTo(doorOpeningCenterX, doorOpeningTopY + 10);
      ctx.lineTo(doorOpeningCenterX, doorOpeningBottomY -10);
      ctx.strokeStyle = dColor.clone().multiplyScalar(0.7).getStyle();
      ctx.lineWidth = THIN_DETAIL_LINE_WIDTH; // Thinner line for hinge detail
      ctx.stroke();
    }
    ctx.restore();
  };
  
  const drawWindowElevation = (ctx: CanvasRenderingContext2D, window: any, wall: any) => {
    const dx = wall.end.x - wall.start.x; const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); const wallHeight = wall.height || 240;
    const windowPositionX = -wallLength / 2 + window.position * wallLength - window.width / 2;
    const windowPositionY = wallHeight / 2 - window.sillHeight - window.height;

    // Main window fill and outline
    ctx.fillStyle = WINDOW_FILL_COLOR;
    ctx.fillRect(windowPositionX, windowPositionY, window.width, window.height);
    ctx.strokeStyle = WINDOW_OUTLINE_COLOR;
    ctx.lineWidth = WINDOW_OUTLINE_WIDTH;
    ctx.strokeRect(windowPositionX, windowPositionY, window.width, window.height);
    
    // Pane lines
    ctx.strokeStyle = WINDOW_PANE_COLOR;
    ctx.lineWidth = WINDOW_PANE_LINE_WIDTH_CONST;
    ctx.beginPath();
    ctx.moveTo(windowPositionX + window.width / 2, windowPositionY);
    ctx.lineTo(windowPositionX + window.width / 2, windowPositionY + window.height);
    ctx.moveTo(windowPositionX, windowPositionY + window.height / 2);
    ctx.lineTo(windowPositionX + window.width, windowPositionY + window.height / 2);
    ctx.stroke();

    // Inner frame detail
    ctx.strokeStyle = WINDOW_FRAME_COLOR;
    ctx.lineWidth = WINDOW_FRAME_LINE_WIDTH_CONST;
    ctx.strokeRect(
      windowPositionX + WINDOW_FRAME_INSET_CONST,
      windowPositionY + WINDOW_FRAME_INSET_CONST,
      window.width - 2 * WINDOW_FRAME_INSET_CONST,
      window.height - 2 * WINDOW_FRAME_INSET_CONST
    );
  };
  
  const findCabinetsForWall = (wall: any, allCabinets: any[]): OrientedItem<any>[] => {
    const dx = wall.end.x - wall.start.x; const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); if (wallLength === 0) return [];
    const wallAngle = Math.atan2(dy, dx);
    const relevantItems: OrientedItem<any>[] = [];
    allCabinets.forEach(cabinet => {
      const cabToWallStart = { x: cabinet.position.x - wall.start.x, y: cabinet.position.y - wall.start.y };
      const normalX = -dy / wallLength; const normalY = dx / wallLength;
      const distanceToWallLine = Math.abs((cabinet.position.x - wall.start.x) * normalX + (cabinet.position.y - wall.start.y) * normalY);
      const wallDirX = dx / wallLength; const wallDirY = dy / wallLength;
      const projectionOnWall = cabToWallStart.x * wallDirX + cabToWallStart.y * wallDirY;
      if (projectionOnWall >= -cabinet.width / 2 && projectionOnWall <= wallLength + cabinet.width / 2 && distanceToWallLine < (cabinet.depth / 2) + 20) {
        const cabinetGlobalAngle = normalizeAngle((cabinet.rotation || 0) * Math.PI / 180);
        let orientation: 'front' | 'side' | 'obscured' = 'obscured';
        if (areAnglesApproximatelyEqual(cabinetGlobalAngle, wallAngle) || areAnglesApproximatelyEqual(cabinetGlobalAngle, normalizeAngle(wallAngle + Math.PI))) {
          orientation = 'front';
        } else if (areAnglesPerpendicular(cabinetGlobalAngle, wallAngle)) {
          orientation = 'side';
        }
        if (orientation !== 'obscured') relevantItems.push({ item: cabinet, orientation, projectionOnWall });
      }
    });
    return relevantItems;
  };

  const findAppliancesForWall = (wall: any, allAppliances: any[]): OrientedItem<any>[] => {
    const dx = wall.end.x - wall.start.x; const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); if (wallLength === 0) return [];
    const wallAngle = Math.atan2(dy, dx);
    const relevantItems: OrientedItem<any>[] = [];
    allAppliances.forEach(appliance => {
      const itemToWallStart = { x: appliance.position.x - wall.start.x, y: appliance.position.y - wall.start.y };
      const normalX = -dy / wallLength; const normalY = dx / wallLength;
      const distanceToWallLine = Math.abs((appliance.position.x - wall.start.x) * normalX + (appliance.position.y - wall.start.y) * normalY);
      const wallDirX = dx / wallLength; const wallDirY = dy / wallLength;
      const projectionOnWall = itemToWallStart.x * wallDirX + itemToWallStart.y * wallDirY;
      if (projectionOnWall >= -appliance.width / 2 && projectionOnWall <= wallLength + appliance.width / 2 && distanceToWallLine < (appliance.depth / 2) + 20) {
        const applianceGlobalAngle = normalizeAngle((appliance.rotation || 0) * Math.PI / 180);
        let orientation: 'front' | 'side' | 'obscured' = 'obscured';
        if (areAnglesApproximatelyEqual(applianceGlobalAngle, wallAngle) || areAnglesApproximatelyEqual(applianceGlobalAngle, normalizeAngle(wallAngle + Math.PI))) {
          orientation = 'front';
        } else if (areAnglesPerpendicular(applianceGlobalAngle, wallAngle)) {
          orientation = 'side';
        }
        if (orientation !== 'obscured') relevantItems.push({ item: appliance, orientation, projectionOnWall });
      }
    });
    return relevantItems;
  };
    
  const drawCabinetElevation = (ctx: CanvasRenderingContext2D, orientedCabinet: OrientedItem<any>, wall: any) => {
    const cabinet = orientedCabinet.item;
    const orientation = orientedCabinet.orientation;
    const projectionOnWall = orientedCabinet.projectionOnWall;
    const dx = wall.end.x - wall.start.x; const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); const wallHeight = wall.height || 240;
    const toeKickH = (cabinet.type === 'base' && cabinet.toeKickHeight !== undefined && cabinet.toeKickHeight > 0) ? cabinet.toeKickHeight : 0;
    const toeKickD_inset = (cabinet.type === 'base' && cabinet.toeKickDepth !== undefined && cabinet.toeKickDepth > 0) ? cabinet.toeKickDepth : 0; // Geometric
    const mainBoxEffectiveHeight = cabinet.height - toeKickH;
    let topY_mainBox;
    if (cabinet.type === 'base') topY_mainBox = wallHeight / 2 - cabinet.height + toeKickH;
    else if (cabinet.type === 'tall') topY_mainBox = wallHeight / 2 - cabinet.height;
    else if (cabinet.type === 'wall') { const mountHeight = 150; topY_mainBox = wallHeight / 2 - mountHeight - mainBoxEffectiveHeight; } // mountHeight is geometric
    else if (cabinet.type === 'loft') { const mountHeight = 210; topY_mainBox = wallHeight / 2 - mountHeight - mainBoxEffectiveHeight; } // mountHeight is geometric
    else return;
    const cabinetBaseColor = cabinet.color || CABINET_DEFAULT_FILL_COLOR;
    let cabinetDisplayX;
    const doorInset = 4; // Geometric inset for fronts
    const SHELF_INSET_X_2D = 2; // Geometric local constant
    const SHELF_THICKNESS_FOR_CALC = 2; // Geometric local constant
    const GAP_BETWEEN_DRAWERS = 1; // cm, Geometric

    if (orientation === 'front') {
      cabinetDisplayX = -wallLength / 2 + projectionOnWall - cabinet.width / 2;
      ctx.fillStyle = cabinetBaseColor;
      ctx.fillRect(cabinetDisplayX, topY_mainBox, cabinet.width, mainBoxEffectiveHeight);
      ctx.strokeStyle = CABINET_OUTLINE_COLOR;
      ctx.lineWidth = CABINET_OUTLINE_WIDTH;
      ctx.strokeRect(cabinetDisplayX, topY_mainBox, cabinet.width, mainBoxEffectiveHeight);

      if (toeKickH > 0) {
        ctx.fillStyle = new THREE.Color(cabinetBaseColor).multiplyScalar(0.7).getStyle(); // Derived color
        ctx.fillRect(cabinetDisplayX, topY_mainBox + mainBoxEffectiveHeight, cabinet.width, toeKickH);
        ctx.strokeStyle = TOEKICK_OUTLINE_COLOR;
        ctx.lineWidth = TOEKICK_OUTLINE_WIDTH;
        ctx.strokeRect(cabinetDisplayX, topY_mainBox + mainBoxEffectiveHeight, cabinet.width, toeKickH);
      }
      if (cabinet.type === 'base') { // Countertop representation
        ctx.fillStyle = COUNTERTOP_FILL_COLOR;
        ctx.fillRect(
            cabinetDisplayX - COUNTERTOP_OVERHANG_2D,
            topY_mainBox - COUNTERTOP_HEIGHT_2D,
            cabinet.width + 2 * COUNTERTOP_OVERHANG_2D,
            COUNTERTOP_HEIGHT_2D
        );
      }
      const shelfCount = (cabinet.shelfCount !== undefined && cabinet.shelfCount > 0) ? cabinet.shelfCount : 0;
      if (shelfCount > 0 && (cabinet.frontType==='open' || cabinet.frontType==='glass' || cabinet.frontType==='shutter')) {
        ctx.save();
        ctx.strokeStyle = SHELF_LINE_COLOR_CONST;
        ctx.lineWidth = SHELF_LINE_WIDTH_CONST;
        ctx.setLineDash(SHELF_LINE_DASH_CONST);
        const tst = shelfCount * SHELF_THICKNESS_FOR_CALC;
        const rsg = mainBoxEffectiveHeight - tst;
        if (rsg >= SHELF_LINE_DASH_CONST[0]) {
            const gh = rsg / (shelfCount + 1);
          for (let i=0; i<shelfCount; i++) {
            const sty = topY_mainBox + (gh * (i + 1)) + (SHELF_THICKNESS_FOR_CALC * i);
            const ly = sty; // Shelf line is at the bottom of the calculated position
            ctx.beginPath();
            const sx = cabinetDisplayX + SHELF_INSET_X_2D;
            const ex = cabinetDisplayX + cabinet.width - SHELF_INSET_X_2D;
            if(ex > sx){ ctx.moveTo(sx, ly); ctx.lineTo(ex, ly); }
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      const doorStyle = cabinet.doorStyle || 'slab';
      // Note: `else if` was added in previous step, ensure it's there
      if (cabinet.frontType === 'open') {
        // No front to draw
      } else if (cabinet.frontType === 'drawer') {
        const numDrawers = cabinet.drawers && cabinet.drawers > 0 ? cabinet.drawers : 1;
        if (numDrawers > 0) {
          const availableHeightForDrawersAndInternalGaps = mainBoxEffectiveHeight - (2 * doorInset);
          const totalInternalGapHeight = (numDrawers - 1) * GAP_BETWEEN_DRAWERS;
          if (availableHeightForDrawersAndInternalGaps > totalInternalGapHeight) {
            const singleDrawerFaceHeight = (availableHeightForDrawersAndInternalGaps - totalInternalGapHeight) / numDrawers;
            if (singleDrawerFaceHeight > 0) {
              for (let i = 0; i < numDrawers; i++) {
                const drawerX = cabinetDisplayX + doorInset;
                const drawerY = topY_mainBox + doorInset + i * (singleDrawerFaceHeight + GAP_BETWEEN_DRAWERS);
                const drawerPanelWidth = cabinet.width - 2 * doorInset;
                if (doorStyle === 'shaker') {
                  if (drawerPanelWidth > 2 * STILE_WIDTH_2D_CONST && singleDrawerFaceHeight > 2 * STILE_WIDTH_2D_CONST) {
                    drawShakerFront2D(ctx, drawerX, drawerY, drawerPanelWidth, singleDrawerFaceHeight, STILE_WIDTH_2D_CONST);
                  } else {
                    drawSlabFront2D(ctx, drawerX, drawerY, drawerPanelWidth, singleDrawerFaceHeight);
                  }
                } else { // slab
                  drawSlabFront2D(ctx, drawerX, drawerY, drawerPanelWidth, singleDrawerFaceHeight);
                }
                ctx.fillStyle = CABINET_HANDLE_FILL_STYLE;
                ctx.fillRect(
                  drawerX + drawerPanelWidth / 2 - DRAWER_HANDLE_WIDTH / 2,
                  drawerY + singleDrawerFaceHeight / 2 - DRAWER_HANDLE_HEIGHT / 2,
                  DRAWER_HANDLE_WIDTH,
                  DRAWER_HANDLE_HEIGHT
                );
              }
            }
          }
        }
      } else if (cabinet.frontType === 'shutter') {
        const dX = cabinetDisplayX + doorInset;
        const dY = topY_mainBox + doorInset;
        const dpw = cabinet.width - 2 * doorInset;
        const dph = mainBoxEffectiveHeight - 2 * doorInset;
        if (dpw > 0 && dph > 0) {
            if(doorStyle === 'shaker'){
                drawShakerFront2D(ctx, dX, dY, dpw, dph, STILE_WIDTH_2D_CONST);
            } else {
                drawSlabFront2D(ctx, dX, dY, dpw, dph);
            }
            ctx.fillStyle = CABINET_HANDLE_FILL_STYLE;
            // Simplified handle logic for shutter - assuming one or two vertical bar handles
            if (cabinet.width > 60 && doorStyle === 'shaker') { // Two handles for wider shaker doors
                const stileCenterLeft = dX + STILE_WIDTH_2D_CONST / 2;
                const stileCenterRight = dX + dpw - STILE_WIDTH_2D_CONST / 2;
                ctx.fillRect(stileCenterLeft - SHUTTER_HANDLE_STILE_CENTER_OFFSET, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
                ctx.fillRect(stileCenterRight - SHUTTER_HANDLE_STILE_CENTER_OFFSET, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
            } else if (cabinet.width > 60) { // Two handles for wider slab doors
                 ctx.fillRect(dX + dpw * 0.25 - SHUTTER_HANDLE_WIDTH / 2, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
                 ctx.fillRect(dX + dpw * 0.75 - SHUTTER_HANDLE_WIDTH / 2, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
            } else { // Single handle for narrower doors
                const handleX = dX + dpw - SHUTTER_HANDLE_OFFSET_FROM_EDGE - SHUTTER_HANDLE_WIDTH;
                ctx.fillRect(handleX, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
            }
        }
      } else if (cabinet.frontType === 'glass') {
        const dX = cabinetDisplayX + doorInset;
        const dY = topY_mainBox + doorInset;
        const gdw = cabinet.width - 2 * doorInset;
        const gdh = mainBoxEffectiveHeight - 2 * doorInset;
        const glassMargin = (doorStyle === 'shaker') ? STILE_WIDTH_2D_CONST : 3; // 3 is a local geometric choice for slab glass margin

        if (gdw > 0 && gdh > 0) {
            if(doorStyle === 'shaker'){
                drawShakerFront2D(ctx, dX, dY, gdw, gdh, STILE_WIDTH_2D_CONST);
            } else { // slab
                drawSlabFront2D(ctx, dX, dY, gdw, gdh);
            }
            // Draw glass panel inside
            if (gdw > 2 * glassMargin && gdh > 2 * glassMargin) {
                ctx.fillStyle = GLASS_PANEL_FILL_COLOR;
                ctx.fillRect(dX + glassMargin, dY + glassMargin, gdw - 2 * glassMargin, gdh - 2 * glassMargin);
                // Optional: stroke for glass panel
                ctx.strokeStyle = GLASS_PANEL_STROKE_COLOR;
                ctx.lineWidth = THIN_DETAIL_LINE_WIDTH;
                ctx.strokeRect(dX + glassMargin, dY + glassMargin, gdw - 2 * glassMargin, gdh - 2 * glassMargin);
            }
            ctx.fillStyle = CABINET_HANDLE_FILL_STYLE;
            const handleXg = dX + gdw - SHUTTER_HANDLE_OFFSET_FROM_EDGE - SHUTTER_HANDLE_WIDTH;
            ctx.fillRect(handleXg, dY + gdh / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
        }
      }
    } else if (orientation === 'side') {
      const itemDisplayX_side = -wallLength / 2 + projectionOnWall - cabinet.depth / 2;
      ctx.fillStyle = cabinetBaseColor;
      ctx.fillRect(itemDisplayX_side, topY_mainBox, cabinet.depth, mainBoxEffectiveHeight);
      ctx.strokeStyle = CABINET_OUTLINE_COLOR;
      ctx.lineWidth = CABINET_OUTLINE_WIDTH;
      ctx.strokeRect(itemDisplayX_side, topY_mainBox, cabinet.depth, mainBoxEffectiveHeight);

      if (toeKickH > 0) {
        const tkSideActualDepth = cabinet.depth - toeKickD_inset; // toeKickD_inset is from front, so side view shows this adjusted depth
        ctx.fillStyle = new THREE.Color(cabinetBaseColor).multiplyScalar(0.7).getStyle();
        ctx.fillRect(itemDisplayX_side, topY_mainBox + mainBoxEffectiveHeight, tkSideActualDepth, toeKickH);
        ctx.strokeStyle = TOEKICK_OUTLINE_COLOR;
        ctx.lineWidth = TOEKICK_OUTLINE_WIDTH;
        ctx.strokeRect(itemDisplayX_side, topY_mainBox + mainBoxEffectiveHeight, tkSideActualDepth, toeKickH);
      }

      const shelfCountSide = (cabinet.shelfCount !== undefined && cabinet.shelfCount > 0) ? cabinet.shelfCount : 0;
      if (shelfCountSide > 0 && (cabinet.frontType === 'open' || cabinet.frontType === 'glass' || cabinet.frontType === 'shutter')) { // Assuming shelves visible from side too if open/glass
        ctx.save();
        ctx.strokeStyle = SHELF_LINE_COLOR_CONST;
        ctx.lineWidth = SHELF_LINE_WIDTH_CONST;
        ctx.setLineDash(SHELF_LINE_DASH_CONST);
        const totalShelfThicknessSide = shelfCountSide * SHELF_THICKNESS_FOR_CALC;
        const remainingSpaceForGapsSide = mainBoxEffectiveHeight - totalShelfThicknessSide;
        if (remainingSpaceForGapsSide >= SHELF_LINE_DASH_CONST[0]) {
            const gapHeightSide = remainingSpaceForGapsSide / (shelfCountSide + 1);
          for (let i = 0; i < shelfCountSide; i++) {
            const shelfTopY_side = topY_mainBox + (gapHeightSide * (i + 1)) + (SHELF_THICKNESS_FOR_CALC * i);
            const lineY_side = shelfTopY_side;
            ctx.beginPath();
            const startX_side = itemDisplayX_side + SHELF_INSET_X_2D; // Using SHELF_INSET_X_2D for consistency, though it's depth here
            const endX_side = itemDisplayX_side + cabinet.depth - SHELF_INSET_X_2D;
            if(endX_side > startX_side) { ctx.moveTo(startX_side, lineY_side); ctx.lineTo(endX_side, lineY_side); }
            ctx.stroke();
          }
        }
        ctx.restore();
      }
      // Projection lines for cabinet width
      drawSideProjection2D(ctx, itemDisplayX_side + cabinet.depth, topY_mainBox, topY_mainBox + mainBoxEffectiveHeight, cabinet.width);
    }
};

const drawApplianceElevation = (ctx: CanvasRenderingContext2D, orientedAppliance: OrientedItem<any>, wall: any) => {
  const appliance = orientedAppliance.item;
  const orientation = orientedAppliance.orientation;
  const projectionOnWall = orientedAppliance.projectionOnWall;

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  const wallHeight = wall.height || 240;

  // Default Y position (bottom of appliance on the floor or cabinet top)
  // This might need adjustment if appliances can be wall-mounted or are on legs
  let appliancePositionY = wallHeight / 2 - appliance.height;
  let applianceDisplayX;
  const applianceBaseColor = appliance.color || APPLIANCE_DEFAULT_FILL_COLOR;

  if (orientation === 'front') {
    applianceDisplayX = -wallLength / 2 + projectionOnWall - appliance.width / 2;
    
    ctx.fillStyle = applianceBaseColor;
    ctx.fillRect(applianceDisplayX, appliancePositionY, appliance.width, appliance.height);
    
    ctx.strokeStyle = APPLIANCE_OUTLINE_COLOR;
    ctx.lineWidth = APPLIANCE_OUTLINE_WIDTH;
    ctx.strokeRect(applianceDisplayX, appliancePositionY, appliance.width, appliance.height);

    // Specific details based on appliance type
    if (appliance.type === 'sink') {
      ctx.fillStyle = SINK_BASIN_COLOR_CONST;
      ctx.strokeStyle = DETAIL_LINE_COLOR; // Outline for basin rect
      ctx.lineWidth = SINK_BASIN_BORDER_WIDTH;
      const basinX = applianceDisplayX + 5; // Example inset
      const basinY = appliancePositionY + 5; // Example inset
      const basinWidth = appliance.width - 10; // Example inset
      ctx.fillRect(basinX, basinY, basinWidth, SINK_BASIN_RECT_HEIGHT);
      ctx.strokeRect(basinX, basinY, basinWidth, SINK_BASIN_RECT_HEIGHT);

      // Faucet
      ctx.strokeStyle = SINK_FAUCET_COLOR_CONST;
      ctx.lineWidth = SINK_FAUCET_LINE_WIDTH;
      ctx.beginPath();
      const faucetCenterX = applianceDisplayX + appliance.width / 2;
      const faucetBaseY = basinY; // Faucet base on the basin top edge
      ctx.moveTo(faucetCenterX, faucetBaseY);
      ctx.lineTo(faucetCenterX, faucetBaseY - SINK_FAUCET_HEIGHT_ABOVE_BASIN);
      // Simplified arc for faucet head
      ctx.arc(
          faucetCenterX - SINK_FAUCET_ARC_RADIUS,
          faucetBaseY - SINK_FAUCET_HEIGHT_ABOVE_BASIN,
          SINK_FAUCET_ARC_RADIUS, 0, Math.PI, true
      );
      ctx.stroke();

    } else if (appliance.type === 'stove') {
      ctx.fillStyle = STOVE_DETAIL_COLOR_CONST;
      ctx.strokeStyle = STOVE_DETAIL_COLOR_CONST; // Burners and controls share color
      ctx.lineWidth = THIN_DETAIL_LINE_WIDTH; // Thinner lines for burner details

      const burnerRadius = appliance.width * STOVE_BURNER_RADIUS_FACTOR;
      const burnerOffsetY = appliance.height * 0.25; // Position burners on top part
      const burnerSpacingX = appliance.width * 0.25;
      const burnerSpacingY = appliance.height * 0.15;

      for(let i=0; i < 2; i++) {
        for(let j=0; j < 2; j++) {
          ctx.beginPath();
          ctx.arc(
            applianceDisplayX + appliance.width / 2 - burnerSpacingX/2 + i * burnerSpacingX,
            appliancePositionY + burnerOffsetY - burnerSpacingY/2 + j * burnerSpacingY,
            burnerRadius, 0, Math.PI * 2
          );
          ctx.fill(); // Fill burners
        }
      }
      // Control Panel / Oven Door Handle area (simplified)
      ctx.fillStyle = STOVE_DETAIL_COLOR_CONST;
      const controlPanelY = appliancePositionY + appliance.height - STOVE_CONTROL_PANEL_HEIGHT - STOVE_CONTROL_PANEL_MARGIN_Y;
      ctx.fillRect(
          applianceDisplayX + 10, // Example inset
          controlPanelY,
          appliance.width - 20, // Example inset
          STOVE_CONTROL_PANEL_HEIGHT
      );
      // No separate stroke for this, assuming fill is enough or it's part of main outline
    }

  } else if (orientation === 'side') {
    applianceDisplayX = -wallLength / 2 + projectionOnWall - appliance.depth / 2;

    ctx.fillStyle = applianceBaseColor;
    ctx.fillRect(applianceDisplayX, appliancePositionY, appliance.depth, appliance.height);
    ctx.strokeStyle = APPLIANCE_OUTLINE_COLOR;
    ctx.lineWidth = APPLIANCE_OUTLINE_WIDTH;
    ctx.strokeRect(applianceDisplayX, appliancePositionY, appliance.depth, appliance.height);

    // Using drawSideProjection2D for appliance width projection
    drawSideProjection2D(
        ctx,
        applianceDisplayX + appliance.depth,
        appliancePositionY,
        appliancePositionY + appliance.height,
        appliance.width
    );
  }
};
  
  const drawDimensionsElevation = (ctx: CanvasRenderingContext2D, wall: any) => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    const wallHeight = wall.height || 240;
    
    ctx.strokeStyle = DIMENSION_LINE_COLOR;
    ctx.fillStyle = DIMENSION_TEXT_COLOR;
    ctx.font = DIMENSION_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = DETAIL_LINE_WIDTH; // General detail line width for dimension lines
    ctx.setLineDash(DIMENSION_LINE_DASH);
    
    // Width dimension
    ctx.beginPath();
    ctx.moveTo(-wallLength / 2, wallHeight / 2 + 20); // Offset from wall
    ctx.lineTo(wallLength / 2, wallHeight / 2 + 20);
    ctx.stroke();
    drawArrow(ctx, -wallLength / 2, wallHeight / 2 + 20, 0); // Arrow pointing right
    drawArrow(ctx, wallLength / 2, wallHeight / 2 + 20, Math.PI); // Arrow pointing left
    ctx.fillText(`${Math.round(wallLength)} cm`, 0, wallHeight / 2 + 35); // Text below line
    
    // Height dimension
    ctx.beginPath();
    ctx.moveTo(-wallLength / 2 - 20, -wallHeight / 2); // Offset from wall
    ctx.lineTo(-wallLength / 2 - 20, wallHeight / 2);
    ctx.stroke();
    drawArrow(ctx, -wallLength / 2 - 20, -wallHeight / 2, Math.PI / 2); // Arrow pointing up
    drawArrow(ctx, -wallLength / 2 - 20, wallHeight / 2, -Math.PI / 2); // Arrow pointing down
    
    ctx.save();
    ctx.translate(-wallLength / 2 - 35, 0); // Position for vertical text
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${wallHeight} cm`, 0, 0);
    ctx.restore();
    
    ctx.setLineDash([]);
  };
  
  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    // Arrow lines will use the current strokeStyle (DIMENSION_LINE_COLOR) and lineWidth
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-ARROW_SIZE, -ARROW_SIZE / 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-ARROW_SIZE, ARROW_SIZE / 2);
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
      
      {walls.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow-md p-2 flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={prevWall} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700">
            Wall {currentWallIndex + 1} of {walls.length}
          </span>
          <Button variant="ghost" size="icon" onClick={nextWall} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
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
