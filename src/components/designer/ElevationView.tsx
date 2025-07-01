import { useRef, useEffect, useState } from "react";
import { useKitchenStore, Door } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";

// --- STYLING CONSTANTS ---
// This section defines all styling parameters for the 2D elevation view,
// ensuring a consistent look and feel across different drawn elements.

// General
const DETAIL_LINE_COLOR = "#9CA3AF"; // Standard color for subtle details, lines.
const DETAIL_LINE_WIDTH = 1.0;      // Standard line width for details.
const THIN_DETAIL_LINE_WIDTH = 0.75;// Thinner line for finer details.
const INTERACTION_ELEMENT_COLOR = "#6B7280"; // Color for interactive elements like handles, arrows.

// Wall
const WALL_FILL_COLOR = "#f3f4f6";       // Fill color for walls.
const WALL_OUTLINE_COLOR = "#374151";    // Outline color for walls.
const WALL_OUTLINE_WIDTH = 3;            // Outline width for walls.
const FLOOR_LINE_COLOR = DETAIL_LINE_COLOR; // Color for the line representing the floor.
const FLOOR_LINE_WIDTH = 3;                 // Width of the floor line.

// Door
const DEFAULT_DOOR_COLOR_CONST = "#B88A69";      // Default color for doors if not specified.
const POCKET_DOOR_HIDDEN_OPACITY_CONST = 0.5; // Opacity for the hidden part of pocket doors.
const DOOR_FRAME_THICKNESS_2D_DEFAULT = 5;    // Default 2D thickness for door frames (geometric).
const DOOR_SLAB_LINE_WEIGHT_CONST = 1.0;      // Line weight for door slabs.
const DOOR_FRAME_LINE_WEIGHT_CONST = 1.0;     // Line weight for door frames.
const DOOR_DETAIL_LINE_WEIGHT_CONST = THIN_DETAIL_LINE_WIDTH; // Line weight for door details (e.g., swing arc).
const DOOR_SWING_LINE_DASH_CONST = [3, 3];    // Dash pattern for door swing arcs.
const POCKET_DOOR_DASH_CONST = [4, 2];        // Dash pattern for the hidden part of pocket doors.
const DOOR_HANDLE_FILL_COLOR_CONST = INTERACTION_ELEMENT_COLOR; // Fill color for door handles.
const DOOR_HANDLE_RADIUS = 3;                 // Radius for standard circular door handles.
const DOOR_HANDLE_OFFSET_X = 12;              // Offset from the latch edge for standard door handles.
const POCKET_DOOR_HANDLE_WIDTH = 4;           // Width of a pocket door edge pull.
const POCKET_DOOR_HANDLE_HEIGHT = 20;         // Height of a pocket door edge pull.
const POCKET_DOOR_HANDLE_EDGE_OFFSET = 8;     // Offset from the visible edge for pocket door pulls.

// Window
const WINDOW_FILL_COLOR = "#e0f2fe";             // Fill color for windows.
const WINDOW_OUTLINE_COLOR = "#0ea5e9";          // Outline color for windows.
const WINDOW_OUTLINE_WIDTH = 1.5;                // Outline width for windows.
const WINDOW_FRAME_COLOR = "#7AB8D4";            // Color for the inner window frame.
const WINDOW_FRAME_LINE_WIDTH_CONST = 1.0;       // Line width for the inner window frame.
const WINDOW_PANE_COLOR = "#7dd3fc";             // Color for window pane lines (mullions/ muntins).
const WINDOW_PANE_LINE_WIDTH_CONST = THIN_DETAIL_LINE_WIDTH; // Line width for pane lines.
const WINDOW_FRAME_INSET_CONST = 3;              // Inset for the inner window frame.

// Cabinet
const CABINET_DEFAULT_FILL_COLOR = "#f9fafb";    // Default fill color for cabinets.
const CABINET_OUTLINE_COLOR = INTERACTION_ELEMENT_COLOR; // Outline color for cabinets.
const CABINET_OUTLINE_WIDTH = 1.5;               // Outline width for cabinets.
const TOEKICK_OUTLINE_COLOR = "#4A5568";         // Outline color for toe kicks.
const TOEKICK_OUTLINE_WIDTH = 1.0;               // Outline width for toe kicks.
const COUNTERTOP_FILL_COLOR = DETAIL_LINE_COLOR; // Fill color for countertops.
const COUNTERTOP_HEIGHT_2D = 4;                  // Height of countertops in 2D elevation.
const COUNTERTOP_OVERHANG_2D = 2;                // Overhang of countertops (geometric).

const STILE_WIDTH_2D_CONST = 5;                  // Stile width for Shaker style fronts (geometric).
const CABINET_FRONT_DETAIL_LINE_STYLE = DETAIL_LINE_COLOR; // Default line style for cabinet front details.
const CABINET_FRONT_DETAIL_LINE_WIDTH = DETAIL_LINE_WIDTH; // Default line width for cabinet front details.
const CABINET_HANDLE_FILL_STYLE = INTERACTION_ELEMENT_COLOR; // Fill style for cabinet handles.
const DRAWER_HANDLE_WIDTH = 30;                  // Width of drawer handles.
const DRAWER_HANDLE_HEIGHT = 2;                  // Height of drawer handles.
const SHUTTER_HANDLE_WIDTH = 2;                  // Width of shutter door handles.
const SHUTTER_HANDLE_HEIGHT = 20;                 // Height of shutter door handles.
const SHUTTER_HANDLE_OFFSET_FROM_EDGE = 10;      // Offset from edge for single shutter handles.
const SHUTTER_HANDLE_STILE_CENTER_OFFSET = 1;    // Offset from stile center for Shaker double handles.

const GLASS_PANEL_FILL_COLOR = "rgba(173, 216, 230, 0.4)"; // Fill color for glass panels.
const GLASS_PANEL_STROKE_COLOR = "#A5C0C8";      // Stroke color for glass panel outlines.

// Shelf
const SHELF_LINE_COLOR_CONST = "#BCC0C4";        // Color for shelf lines.
const SHELF_LINE_WIDTH_CONST = THIN_DETAIL_LINE_WIDTH; // Line width for shelves.
const SHELF_LINE_DASH_CONST = [2, 2];            // Dash pattern for shelf lines.

// Appliance
const APPLIANCE_DEFAULT_FILL_COLOR = "#e5e7eb"; // Default fill color for appliances.
const APPLIANCE_OUTLINE_COLOR = INTERACTION_ELEMENT_COLOR; // Outline color for appliances.
const APPLIANCE_OUTLINE_WIDTH = 1.5;             // Outline width for appliances.
const SINK_BASIN_COLOR_CONST = "#cad1d9";        // Fill color for sink basins.
const SINK_FAUCET_COLOR_CONST = INTERACTION_ELEMENT_COLOR; // Color for sink faucets.
const SINK_BASIN_BORDER_WIDTH = THIN_DETAIL_LINE_WIDTH; // Border width for sink basins.
const SINK_FAUCET_LINE_WIDTH = DETAIL_LINE_WIDTH;     // Line width for faucets.
const SINK_BASIN_RECT_HEIGHT = 20;               // Height of the rectangle representing the sink basin top.
const SINK_FAUCET_HEIGHT_ABOVE_BASIN = 15;       // Height of the faucet stem above the basin.
const SINK_FAUCET_ARC_RADIUS = 10;               // Radius for the faucet arc.

const STOVE_DETAIL_COLOR_CONST = "#4b5563";      // Color for stove details (burners, controls).
const STOVE_BURNER_RADIUS_FACTOR = 0.08;         // Factor of appliance width for burner radius.
const STOVE_CONTROL_PANEL_HEIGHT = 10;           // Height of the stove control panel representation.
const STOVE_CONTROL_PANEL_MARGIN_Y = 5;          // Margin from bottom for stove control panel.

// Dimensions & Arrows
const DIMENSION_LINE_COLOR = DETAIL_LINE_COLOR;
const DIMENSION_TEXT_COLOR = "#4b5563";
const DIMENSION_FONT = "12px Arial";
const DIMENSION_LINE_DASH = [3, 3];
const ARROW_SIZE = 5;

/**
 * Normalizes an angle in radians to the range [0, 2PI).
 * @param radians The angle in radians.
 * @returns The normalized angle.
 */
const normalizeAngle = (radians: number): number => {
  let angle = radians % (2 * Math.PI);
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
};

/**
 * Checks if two angles (in radians) are approximately equal within a given tolerance.
 * Accounts for angle wrapping (e.g., 0 and 2PI are equal).
 * @param angle1 First angle in radians.
 * @param angle2 Second angle in radians.
 * @param tolerance The maximum allowed difference.
 * @returns True if angles are approximately equal.
 */
const areAnglesApproximatelyEqual = (angle1: number, angle2: number, tolerance: number = 0.1): boolean => {
  const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2));
  return diff < tolerance || Math.abs(diff - 2 * Math.PI) < tolerance;
};

/**
 * Checks if two angles (in radians) are approximately perpendicular (90 or 270 degrees apart)
 * within a given tolerance.
 * @param angle1 First angle in radians.
 * @param angle2 Second angle in radians.
 * @param tolerance The maximum allowed difference from a perpendicular angle.
 * @returns True if angles are approximately perpendicular.
 */
const areAnglesPerpendicular = (angle1: number, angle2: number, tolerance: number = 0.1): boolean => {
  const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2));
  return Math.abs(diff - Math.PI / 2) < tolerance || Math.abs(diff - 3 * Math.PI / 2) < tolerance;
};

/**
 * Helper function to draw a 2D Shaker-style cabinet front.
 * Assumes x,y is the top-left corner of the front panel area.
 * @param ctx Canvas 2D rendering context.
 * @param x X-coordinate of the top-left corner.
 * @param y Y-coordinate of the top-left corner.
 * @param width Width of the front panel.
 * @param height Height of the front panel.
 * @param stileWidth Width of the stiles/rails of the Shaker frame.
 * @param lineStyle Stroke style for the lines.
 * @param lineWidth Line width for the strokes.
 */
const drawShakerFront2D = (
  ctx: CanvasRenderingContext2D, x: number, y: number,
  width: number, height: number, stileWidth: number,
  lineStyle: string = CABINET_FRONT_DETAIL_LINE_STYLE,
  lineWidth: number = CABINET_FRONT_DETAIL_LINE_WIDTH
) => {
  ctx.strokeStyle = lineStyle;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height); // Outer rectangle of the front
  // Inner panel, if dimensions allow for stiles
  if (width > 2 * stileWidth && height > 2 * stileWidth) {
    ctx.strokeRect(x + stileWidth, y + stileWidth, width - 2 * stileWidth, height - 2 * stileWidth);
  }
};

/**
 * Helper function to draw a 2D slab-style cabinet front (a simple rectangle).
 * Assumes x,y is the top-left corner of the front panel area.
 * @param ctx Canvas 2D rendering context.
 * @param x X-coordinate of the top-left corner.
 * @param y Y-coordinate of the top-left corner.
 * @param width Width of the front panel.
 * @param height Height of the front panel.
 * @param lineStyle Stroke style for the lines.
 * @param lineWidth Line width for the strokes.
 */
const drawSlabFront2D = (
  ctx: CanvasRenderingContext2D, x: number, y: number,
  width: number, height: number,
  lineStyle: string = CABINET_FRONT_DETAIL_LINE_STYLE,
  lineWidth: number = CABINET_FRONT_DETAIL_LINE_WIDTH
) => {
  ctx.strokeStyle = lineStyle;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height);
};

/**
 * Helper function to draw projection lines for the side view of an item.
 * Indicates the hidden dimension (e.g., width of a cabinet when viewed from the side).
 * @param ctx Canvas 2D rendering context.
 * @param visibleSideX X-coordinate of the edge of the visible side from which projection starts.
 * @param visibleSideTopY Y-coordinate of the top of the visible side.
 * @param visibleSideBottomY Y-coordinate of the bottom of the visible side.
 * @param projectionDistance How far the projection lines should extend (representing the hidden dimension).
 * @param lineStyle Stroke style for the projection lines.
 * @param lineWidth Line width for the projection lines.
 * @param lineDash Dash pattern for the projection lines.
 */
const drawSideProjection2D = (
    ctx: CanvasRenderingContext2D, visibleSideX: number, visibleSideTopY: number,
    visibleSideBottomY: number, projectionDistance: number,
    lineStyle: string = DETAIL_LINE_COLOR,
    lineWidth: number = THIN_DETAIL_LINE_WIDTH,
    lineDash: number[] = DIMENSION_LINE_DASH
) => {
    ctx.save();
    ctx.setLineDash(lineDash);
    ctx.strokeStyle = lineStyle;
    ctx.lineWidth = lineWidth;
    // Top projection line
    ctx.beginPath();
    ctx.moveTo(visibleSideX, visibleSideTopY);
    ctx.lineTo(visibleSideX + projectionDistance, visibleSideTopY);
    ctx.stroke();
    // Bottom projection line
    ctx.beginPath();
    ctx.moveTo(visibleSideX, visibleSideBottomY);
    ctx.lineTo(visibleSideX + projectionDistance, visibleSideBottomY);
    ctx.stroke();
    // Connecting vertical line for the projection
    ctx.beginPath();
    ctx.moveTo(visibleSideX + projectionDistance, visibleSideTopY);
    ctx.lineTo(visibleSideX + projectionDistance, visibleSideBottomY);
    ctx.stroke();
    ctx.restore();
};

// Defines an item that has been oriented relative to a wall for elevation drawing.
interface OrientedItem<T> {
  item: T; // The original item data (e.g., Cabinet, Appliance).
  orientation: 'front' | 'side' | 'obscured'; // How the item is viewed relative to the wall.
  projectionOnWall: number; // The item's center projected onto the wall's axis, relative to wall start.
}

/**
 * ElevationView component: Renders a 2D elevation of a single selected wall from the kitchen layout.
 * It displays the wall itself, along with doors, windows, cabinets, and appliances
 * that are associated with or positioned against that wall.
 * The view is centered on the canvas, and items are drawn relative to this center.
 * Y-coordinates are typically calculated with 0 at the center of the wall's height,
 * positive Y downwards, and negative Y upwards. Floor is at positive Y.
 */
const ElevationView = () => {
  const { 
    room, walls, doors, windows, cabinets, appliances,
    currentWallIndex, setCurrentWallIndex,
    showDimensions
  } = useKitchenStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1); // Zoom scale of the canvas.
  
  // Effect to handle canvas resizing.
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        draw(); // Redraw on resize.
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial draw.
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount.
  
  // Effect to redraw when relevant state changes.
  useEffect(() => {
    draw();
  }, [room, walls, doors, windows, cabinets, appliances, currentWallIndex, scale, showDimensions]);
  
  /**
   * Main drawing function, orchestrates all rendering on the canvas.
   */
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas before drawing.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (walls.length === 0) {
      drawNoWallsMessage(ctx, canvas.width, canvas.height);
      return;
    }
    
    ctx.save();
    // Translate origin to canvas center for easier calculations.
    // All subsequent drawing operations are relative to this new origin.
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // Apply zoom scale.
    ctx.scale(scale, scale);
    
    const wall = walls[currentWallIndex];
    if (!wall) { ctx.restore(); return; } // Should not happen if walls.length > 0
    
    // --- Rendering Order ---
    // 1. Wall itself (background).
    drawWallElevation(ctx, wall);
    
    // 2. Openings on the wall.
    const wallDoors = doors.filter(d => d.wallId === wall.id);
    wallDoors.forEach(door => drawDoorElevation(ctx, door, wall));
    
    const wallWindows = windows.filter(w => w.wallId === wall.id);
    wallWindows.forEach(window => drawWindowElevation(ctx, window, wall));
    
    // 3. Cabinets and Appliances against the wall.
    const relevantCabinets = findCabinetsForWall(wall, cabinets);
    relevantCabinets.forEach(orientedCabinet => drawCabinetElevation(ctx, orientedCabinet, wall));
    
    const relevantAppliances = findAppliancesForWall(wall, appliances);
    relevantAppliances.forEach(orientedAppliance => drawApplianceElevation(ctx, orientedAppliance, wall));
    
    // 4. Dimensions (if enabled).
    if (showDimensions) drawDimensionsElevation(ctx, wall);

    ctx.restore(); // Restore canvas state (transformations).
  };
  
  // Displays a message if no walls are present.
  const drawNoWallsMessage = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    ctx.fillStyle = DIMENSION_TEXT_COLOR;
    ctx.font = DIMENSION_FONT;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("No walls created yet.", canvasWidth / 2, canvasHeight / 2 - 20);
    ctx.fillText("Use Top View to create walls.", canvasWidth / 2, canvasHeight / 2 + 20);
  };
  
  /**
   * Draws the main wall as a rectangle.
   * Assumes canvas origin is at the center of the wall to be drawn.
   */
  const drawWallElevation = (ctx: CanvasRenderingContext2D, wall: any) => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); // Length of the wall.
    const wallHeight = wall.height || 240;          // Height of the wall.

    // Fill for the wall.
    ctx.fillStyle = WALL_FILL_COLOR;
    // Draw wall centered around (0,0) local origin due to canvas translation.
    ctx.fillRect(-wallLength / 2, -wallHeight / 2, wallLength, wallHeight);

    // Outline for the wall.
    ctx.strokeStyle = WALL_OUTLINE_COLOR;
    ctx.lineWidth = WALL_OUTLINE_WIDTH;
    ctx.strokeRect(-wallLength / 2, -wallHeight / 2, wallLength, wallHeight);

    // Line representing the floor.
    ctx.beginPath();
    ctx.moveTo(-wallLength / 2, wallHeight / 2); // Bottom edge of the wall.
    ctx.lineTo(wallLength / 2, wallHeight / 2);
    ctx.strokeStyle = FLOOR_LINE_COLOR;
    ctx.lineWidth = FLOOR_LINE_WIDTH;
    ctx.stroke();
  };
  
  /**
   * Draws a single door on the wall.
   * Includes frame and type-specific representations (standard, sliding, pocket, folding).
   */
  const drawDoorElevation = (ctx: CanvasRenderingContext2D, door: Door, wall: any) => {
    const wallLength = Math.sqrt(Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.y - wall.start.y, 2));
    const wallHeight = wall.height || 240; // Assumed overall scene wall height for Y calculations.

    const dWidth = door.width || 80;
    const dHeight = door.height || 200;
    const dType = door.type || 'standard';
    const dColorString = door.color || DEFAULT_DOOR_COLOR_CONST;
    const dColor = new THREE.Color(dColorString);
    const fThickness = door.frameThickness || DOOR_FRAME_THICKNESS_2D_DEFAULT;

    // Calculate door opening coordinates relative to the wall's local center (0,0).
    // door.position is a normalized value (0-1) along the wall's length.
    const doorOpeningCenterX = -wallLength / 2 + door.position * wallLength;
    // Top-left corner of the door slab opening.
    const doorOpeningLeftX = doorOpeningCenterX - dWidth / 2;
    const doorOpeningRightX = doorOpeningCenterX + dWidth / 2;
    // Y-coordinate for the top of the door slab, measured from the wall's vertical center.
    // Positive Y is downwards, so floor is at wallHeight / 2.
    const doorOpeningTopY = wallHeight / 2 - dHeight;
    const doorOpeningBottomY = wallHeight / 2; // Floor level for door bottom.

    ctx.save();

    // --- Door Frame ---
    // Frame is drawn around the door opening.
    const frameColorStyle = dColor.clone().multiplyScalar(0.7).getStyle(); // Darker shade for frame.
    ctx.fillStyle = frameColorStyle;
    ctx.strokeStyle = frameColorStyle;
    ctx.lineWidth = DOOR_FRAME_LINE_WEIGHT_CONST;

    const frameOuterLeft = doorOpeningLeftX - fThickness; // Outer edge of left jamb.
    const frameOuterTop = doorOpeningTopY - fThickness;   // Outer edge of lintel.

    ctx.beginPath();
    ctx.rect(frameOuterLeft, frameOuterTop, dWidth + 2 * fThickness, fThickness); // Lintel (top piece).
    ctx.rect(frameOuterLeft, frameOuterTop + fThickness, fThickness, dHeight);     // Left Jamb.
    ctx.rect(doorOpeningRightX, frameOuterTop + fThickness, fThickness, dHeight);  // Right Jamb.
    ctx.fill();
    ctx.stroke();

    // --- Door Slab and Type-Specific Details ---
    ctx.fillStyle = dColor.getStyle(); // Main color for door slab.
    ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle(); // Slightly darker outline for slab.
    ctx.lineWidth = DOOR_SLAB_LINE_WEIGHT_CONST;

    if (dType === 'standard') {
      // Standard door: draw slab, swing arc, and handle.
      ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);
      ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);

      // Swing Arc: Indicates opening direction.
      ctx.setLineDash(DOOR_SWING_LINE_DASH_CONST);
      ctx.lineWidth = DOOR_DETAIL_LINE_WEIGHT_CONST;
      ctx.strokeStyle = INTERACTION_ELEMENT_COLOR;
      ctx.beginPath();
      const hingeX = doorOpeningLeftX; // Assuming hinge on the left for this arc.
      const hingeY = doorOpeningBottomY;
      ctx.moveTo(doorOpeningRightX, doorOpeningBottomY);
      ctx.arc(hingeX, hingeY, dWidth, 0, -Math.PI / 2, true); // 90-degree arc.
      ctx.stroke();
      ctx.setLineDash([]);

      // Handle.
      ctx.fillStyle = DOOR_HANDLE_FILL_COLOR_CONST;
      ctx.beginPath();
      ctx.arc(doorOpeningLeftX + dWidth - DOOR_HANDLE_OFFSET_X, doorOpeningTopY + dHeight / 2, DOOR_HANDLE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();

    } else if (dType === 'sliding') {
      // Sliding door: draw slab and an arrow indicating sliding direction.
      ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);
      ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, dWidth, dHeight);

      ctx.lineWidth = DOOR_DETAIL_LINE_WEIGHT_CONST;
      ctx.strokeStyle = INTERACTION_ELEMENT_COLOR;
      ctx.beginPath();
      const arrowY = doorOpeningTopY + 10; // Position arrow near top of door.
      ctx.moveTo(doorOpeningLeftX + dWidth * 0.2, arrowY);
      ctx.lineTo(doorOpeningLeftX + dWidth * 0.8, arrowY);
      // Arrowhead.
      ctx.moveTo(doorOpeningLeftX + dWidth * 0.8 - 8, arrowY - 4);
      ctx.lineTo(doorOpeningLeftX + dWidth * 0.8, arrowY);
      ctx.lineTo(doorOpeningLeftX + dWidth * 0.8 - 8, arrowY + 4);
      ctx.stroke();

    } else if (dType === 'pocket') {
      // Pocket door: show a partially visible slab and indicate hidden portion.
      ctx.fillStyle = dColor.getStyle();
      ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle();
      ctx.lineWidth = DOOR_SLAB_LINE_WEIGHT_CONST;

      const visiblePartWidth = dWidth / 4; // Show 1/4 of the door as visible.
      const hiddenPartX = doorOpeningLeftX + visiblePartWidth;

      // Draw visible part as solid.
      ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, visiblePartWidth, dHeight);
      ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, visiblePartWidth, dHeight);

      // Indicate edge of hidden part with dashed line.
      ctx.setLineDash(POCKET_DOOR_DASH_CONST);
      ctx.lineWidth = DOOR_DETAIL_LINE_WEIGHT_CONST;
      const hiddenLineColor = new THREE.Color(dColorString);
      hiddenLineColor.multiplyScalar(0.8);
      ctx.strokeStyle = `rgba(${hiddenLineColor.r * 255}, ${hiddenLineColor.g * 255}, ${hiddenLineColor.b * 255}, ${POCKET_DOOR_HIDDEN_OPACITY_CONST})`;

      ctx.beginPath();
      ctx.moveTo(hiddenPartX, doorOpeningTopY);
      ctx.lineTo(hiddenPartX, doorOpeningTopY + dHeight);
      ctx.stroke();

      ctx.setLineDash([]);

      // Small edge pull handle on the visible part.
      ctx.fillStyle = DOOR_HANDLE_FILL_COLOR_CONST;
      ctx.fillRect(
        doorOpeningLeftX + visiblePartWidth - POCKET_DOOR_HANDLE_EDGE_OFFSET - POCKET_DOOR_HANDLE_WIDTH,
        doorOpeningTopY + dHeight / 2 - POCKET_DOOR_HANDLE_HEIGHT / 2,
        POCKET_DOOR_HANDLE_WIDTH,
        POCKET_DOOR_HANDLE_HEIGHT
      );

    } else if (dType === 'folding') {
      // Folding door: draw two panels with a central hinge line and handles.
      ctx.fillStyle = dColor.getStyle();
      ctx.strokeStyle = dColor.clone().multiplyScalar(0.85).getStyle();
      ctx.lineWidth = DOOR_SLAB_LINE_WEIGHT_CONST;

      const panelWidth = dWidth / 2; // Bi-fold door assumed.

      // Panel 1 (left panel).
      ctx.fillRect(doorOpeningLeftX, doorOpeningTopY, panelWidth, dHeight);
      ctx.strokeRect(doorOpeningLeftX, doorOpeningTopY, panelWidth, dHeight);

      // Panel 2 (right panel).
      ctx.fillRect(doorOpeningLeftX + panelWidth, doorOpeningTopY, panelWidth, dHeight);
      ctx.strokeRect(doorOpeningLeftX + panelWidth, doorOpeningTopY, panelWidth, dHeight);

      // Central hinge line.
      ctx.beginPath();
      ctx.moveTo(doorOpeningLeftX + panelWidth, doorOpeningTopY);
      ctx.lineTo(doorOpeningLeftX + panelWidth, doorOpeningTopY + dHeight);
      const hingeLineColor = new THREE.Color(dColorString);
      hingeLineColor.multiplyScalar(0.6); // Darker hinge line.
      ctx.strokeStyle = hingeLineColor.getStyle();
      ctx.lineWidth = THIN_DETAIL_LINE_WIDTH;
      ctx.stroke();

      // Add handles to each panel.
      ctx.fillStyle = DOOR_HANDLE_FILL_COLOR_CONST;
      ctx.beginPath();
      ctx.arc(doorOpeningLeftX + panelWidth / 2, doorOpeningTopY + dHeight / 2, DOOR_HANDLE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(doorOpeningLeftX + panelWidth + panelWidth / 2, doorOpeningTopY + dHeight / 2, DOOR_HANDLE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  };

/**
 * Draws a single window on the wall.
 * Includes main frame, pane lines, and inner frame detail.
 */
const drawWindowElevation = (ctx: CanvasRenderingContext2D, window: any, wall: any) => {
    const dx = wall.end.x - wall.start.x; const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); const wallHeight = wall.height || 240;

    // Calculate top-left canvas coordinates for the window unit.
    // window.position is normalized (0-1) center along wall.
    // window.sillHeight is from floor (positive Y direction from wall center).
    const windowPositionX = -wallLength / 2 + window.position * wallLength - window.width / 2;
    const windowPositionY = wallHeight / 2 - window.sillHeight - window.height; // Top of window.

    // Main window fill and outline.
    ctx.fillStyle = WINDOW_FILL_COLOR;
    ctx.fillRect(windowPositionX, windowPositionY, window.width, window.height);
    ctx.strokeStyle = WINDOW_OUTLINE_COLOR;
    ctx.lineWidth = WINDOW_OUTLINE_WIDTH;
    ctx.strokeRect(windowPositionX, windowPositionY, window.width, window.height);
    
    // Pane lines (simple cross for now).
    ctx.strokeStyle = WINDOW_PANE_COLOR;
    ctx.lineWidth = WINDOW_PANE_LINE_WIDTH_CONST;
    ctx.beginPath();
    ctx.moveTo(windowPositionX + window.width / 2, windowPositionY);
    ctx.lineTo(windowPositionX + window.width / 2, windowPositionY + window.height);
    ctx.moveTo(windowPositionX, windowPositionY + window.height / 2);
    ctx.lineTo(windowPositionX + window.width, windowPositionY + window.height / 2);
    ctx.stroke();

    // Inner frame detail.
    ctx.strokeStyle = WINDOW_FRAME_COLOR;
    ctx.lineWidth = WINDOW_FRAME_LINE_WIDTH_CONST;
    ctx.strokeRect(
      windowPositionX + WINDOW_FRAME_INSET_CONST,
      windowPositionY + WINDOW_FRAME_INSET_CONST,
      window.width - 2 * WINDOW_FRAME_INSET_CONST,
      window.height - 2 * WINDOW_FRAME_INSET_CONST
    );
  };
  
/**
 * Finds and orients cabinets relevant to the current wall.
 * @param wall The current wall object.
 * @param allCabinets Array of all cabinets in the scene.
 * @returns Array of OrientedItem<Cabinet>.
 */
const findCabinetsForWall = (wall: any, allCabinets: any[]): OrientedItem<any>[] => {
    const dx = wall.end.x - wall.start.x; const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); if (wallLength === 0) return [];
    const wallAngle = Math.atan2(dy, dx); // Angle of the wall vector.
    const relevantItems: OrientedItem<any>[] = [];

    allCabinets.forEach(cabinet => {
      // Vector from wall start to cabinet center.
      const cabToWallStart = { x: cabinet.position.x - wall.start.x, y: cabinet.position.y - wall.start.y };
      // Normal vector to the wall line.
      const normalX = -dy / wallLength; const normalY = dx / wallLength;
      // Perpendicular distance from cabinet's center to the wall's infinite line.
      const distanceToWallLine = Math.abs(cabToWallStart.x * normalX + cabToWallStart.y * normalY);

      // Unit vector along the wall.
      const wallDirX = dx / wallLength; const wallDirY = dy / wallLength;
      // Cabinet's center projected onto wall's axis, distance from wall start.
      const projectionOnWall = cabToWallStart.x * wallDirX + cabToWallStart.y * wallDirY;

      // Item considered relevant if its center is projected within wall bounds (with tolerance for half item width)
      // and it's close enough to the wall line (tolerance for half item depth + buffer).
      const projectionTolerance = cabinet.width / 2; // How much of the cabinet can be "off" the wall ends.
      const distanceTolerance = (cabinet.depth / 2) + 20; // How far from the wall line it can be.

      if (projectionOnWall >= -projectionTolerance &&
          projectionOnWall <= wallLength + projectionTolerance &&
          distanceToWallLine < distanceTolerance) {

        const cabinetGlobalAngle = normalizeAngle(THREE.MathUtils.degToRad(cabinet.rotation || 0));
        let orientation: 'front' | 'side' | 'obscured' = 'obscured';

        // Determine if item front or side is parallel/perpendicular to wall.
        // Front view: cabinet rotation matches wall angle or is opposite (180 deg diff).
        if (areAnglesApproximatelyEqual(cabinetGlobalAngle, wallAngle) ||
            areAnglesApproximatelyEqual(cabinetGlobalAngle, normalizeAngle(wallAngle + Math.PI))) {
          orientation = 'front';
        }
        // Side view: cabinet rotation is perpendicular to wall angle.
        else if (areAnglesPerpendicular(cabinetGlobalAngle, wallAngle)) {
          orientation = 'side';
        }

        if (orientation !== 'obscured') {
          relevantItems.push({ item: cabinet, orientation, projectionOnWall });
        }
      }
    });
    return relevantItems;
  };

/**
 * Finds and orients appliances relevant to the current wall. (Similar logic to findCabinetsForWall)
 * @param wall The current wall object.
 * @param allAppliances Array of all appliances in the scene.
 * @returns Array of OrientedItem<Appliance>.
 */
const findAppliancesForWall = (wall: any, allAppliances: any[]): OrientedItem<any>[] => {
    const dx = wall.end.x - wall.start.x; const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); if (wallLength === 0) return [];
    const wallAngle = Math.atan2(dy, dx);
    const relevantItems: OrientedItem<any>[] = [];

    allAppliances.forEach(appliance => {
      const itemToWallStart = { x: appliance.position.x - wall.start.x, y: appliance.position.y - wall.start.y };
      const normalX = -dy / wallLength; const normalY = dx / wallLength;
      const distanceToWallLine = Math.abs(itemToWallStart.x * normalX + itemToWallStart.y * normalY);
      const wallDirX = dx / wallLength; const wallDirY = dy / wallLength;
      const projectionOnWall = itemToWallStart.x * wallDirX + itemToWallStart.y * wallDirY;

      const projectionTolerance = appliance.width / 2;
      const distanceTolerance = (appliance.depth / 2) + 20;

      if (projectionOnWall >= -projectionTolerance &&
          projectionOnWall <= wallLength + projectionTolerance &&
          distanceToWallLine < distanceTolerance) {

        const applianceGlobalAngle = normalizeAngle(THREE.MathUtils.degToRad(appliance.rotation || 0));
        let orientation: 'front' | 'side' | 'obscured' = 'obscured';
        if (areAnglesApproximatelyEqual(applianceGlobalAngle, wallAngle) ||
            areAnglesApproximatelyEqual(applianceGlobalAngle, normalizeAngle(wallAngle + Math.PI))) {
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
    
/**
 * Draws a single cabinet in elevation view, either front or side.
 */
const drawCabinetElevation = (ctx: CanvasRenderingContext2D, orientedCabinet: OrientedItem<any>, wall: any) => {
    const cabinet = orientedCabinet.item;
    const orientation = orientedCabinet.orientation;
    const projectionOnWall = orientedCabinet.projectionOnWall; // Center of cabinet projected on wall line.

    const dx = wall.end.x - wall.start.x; const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy); const wallHeight = wall.height || 240;

    // Calculate toe kick height and depth (inset from front).
    const toeKickH = (cabinet.type === 'base' && cabinet.toeKickHeight !== undefined && cabinet.toeKickHeight > 0) ? cabinet.toeKickHeight : 0;
    const toeKickD_inset = (cabinet.type === 'base' && cabinet.toeKickDepth !== undefined && cabinet.toeKickDepth > 0) ? cabinet.toeKickDepth : 0;
    // Actual height available for doors/drawers, excluding toe kick.
    const mainBoxEffectiveHeight = cabinet.height - toeKickH;

    // Y-coordinate for the top edge of the main cabinet box (area for fronts), above toe kick.
    // Calculated from wall's vertical center (0), positive Y is down.
    let topY_mainBox;
    if (cabinet.type === 'base') { // Base cabinets sit on the floor (toe kick part).
      topY_mainBox = wallHeight / 2 - cabinet.height + toeKickH;
    } else if (cabinet.type === 'tall') { // Tall cabinets sit on the floor.
      topY_mainBox = wallHeight / 2 - cabinet.height;
    } else if (cabinet.type === 'wall') { // Wall cabinets are mounted above base cabinets.
      const mountHeight = 150; // Standard mounting height from floor to bottom of wall cabinet.
      topY_mainBox = wallHeight / 2 - mountHeight - mainBoxEffectiveHeight;
    } else if (cabinet.type === 'loft') { // Loft cabinets are mounted above tall cabinets or other wall cabinets.
      const mountHeight = 210; // Example mounting height for lofts.
      topY_mainBox = wallHeight / 2 - mountHeight - mainBoxEffectiveHeight;
    } else return; // Unknown cabinet type.

    const cabinetBaseColor = cabinet.color || CABINET_DEFAULT_FILL_COLOR;
    let cabinetDisplayX; // Canvas X-coordinate for the left edge of the item's front/side view.

    // Geometric constants for drawing details.
    const doorInset = 4;
    const SHELF_INSET_X_2D = 2;
    const SHELF_THICKNESS_FOR_CALC = 2;
    const GAP_BETWEEN_DRAWERS = 1;

    if (orientation === 'front') {
      // Canvas X-coordinate for the left edge of the cabinet's front view.
      cabinetDisplayX = -wallLength / 2 + projectionOnWall - cabinet.width / 2;

      // Main cabinet box.
      ctx.fillStyle = cabinetBaseColor;
      ctx.fillRect(cabinetDisplayX, topY_mainBox, cabinet.width, mainBoxEffectiveHeight);
      ctx.strokeStyle = CABINET_OUTLINE_COLOR;
      ctx.lineWidth = CABINET_OUTLINE_WIDTH;
      ctx.strokeRect(cabinetDisplayX, topY_mainBox, cabinet.width, mainBoxEffectiveHeight);

      // Toe kick for base cabinets.
      if (toeKickH > 0) {
        ctx.fillStyle = new THREE.Color(cabinetBaseColor).multiplyScalar(0.7).getStyle();
        ctx.fillRect(cabinetDisplayX, topY_mainBox + mainBoxEffectiveHeight, cabinet.width, toeKickH);
        ctx.strokeStyle = TOEKICK_OUTLINE_COLOR;
        ctx.lineWidth = TOEKICK_OUTLINE_WIDTH;
        ctx.strokeRect(cabinetDisplayX, topY_mainBox + mainBoxEffectiveHeight, cabinet.width, toeKickH);
      }
      // Countertop for base cabinets.
      if (cabinet.type === 'base') {
        ctx.fillStyle = COUNTERTOP_FILL_COLOR;
        ctx.fillRect(
            cabinetDisplayX - COUNTERTOP_OVERHANG_2D,
            topY_mainBox - COUNTERTOP_HEIGHT_2D,
            cabinet.width + 2 * COUNTERTOP_OVERHANG_2D,
            COUNTERTOP_HEIGHT_2D
        );
      }
      // Shelves.
      // Distribute `shelfCount` shelves evenly within `mainBoxEffectiveHeight`.
      const shelfCount = (cabinet.shelfCount !== undefined && cabinet.shelfCount > 0) ? cabinet.shelfCount : 0;
      if (shelfCount > 0 && (cabinet.frontType==='open' || cabinet.frontType==='glass' || cabinet.frontType==='shutter')) {
        ctx.save();
        ctx.strokeStyle = SHELF_LINE_COLOR_CONST;
        ctx.lineWidth = SHELF_LINE_WIDTH_CONST;
        ctx.setLineDash(SHELF_LINE_DASH_CONST);
        const totalShelfThickness = shelfCount * SHELF_THICKNESS_FOR_CALC;
        const remainingSpaceForGaps = mainBoxEffectiveHeight - totalShelfThickness;
        if (remainingSpaceForGaps >= SHELF_LINE_DASH_CONST[0]) {
            const gapHeight = remainingSpaceForGaps / (shelfCount + 1);
          for (let i=0; i<shelfCount; i++) {
            // Y-position for the top of the shelf.
            const shelfTopY = topY_mainBox + (gapHeight * (i + 1)) + (SHELF_THICKNESS_FOR_CALC * i);
            // Draw line at the shelf's top surface for simplicity.
            const lineY = shelfTopY;
            ctx.beginPath();
            const startX = cabinetDisplayX + SHELF_INSET_X_2D;
            const endX = cabinetDisplayX + cabinet.width - SHELF_INSET_X_2D;
            if(endX > startX){ ctx.moveTo(startX, lineY); ctx.lineTo(endX, lineY); }
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Cabinet Fronts (Doors/Drawers). Fronts are drawn relative to `cabinetDisplayX` and `topY_mainBox`.
      const doorStyle = cabinet.doorStyle || 'slab';
      if (cabinet.frontType === 'open') {
        // No front to draw for open cabinets.
      } else if (cabinet.frontType === 'drawer') {
        // Distribute `numDrawers` evenly, accounting for `doorInset` and `GAP_BETWEEN_DRAWERS`.
        const numDrawers = cabinet.drawers && cabinet.drawers > 0 ? cabinet.drawers : 1;
        if (numDrawers > 0) {
          const availableHeightForDrawerStack = mainBoxEffectiveHeight - (2 * doorInset);
          const totalInternalGapHeight = (numDrawers - 1) * GAP_BETWEEN_DRAWERS;
          if (availableHeightForDrawerStack > totalInternalGapHeight) {
            const singleDrawerFaceHeight = (availableHeightForDrawerStack - totalInternalGapHeight) / numDrawers;
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
                } else {
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
        // Standard shutter door(s).
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
            if (cabinet.width > 60 && doorStyle === 'shaker') {
                const stileCenterLeft = dX + STILE_WIDTH_2D_CONST / 2;
                const stileCenterRight = dX + dpw - STILE_WIDTH_2D_CONST / 2;
                ctx.fillRect(stileCenterLeft - SHUTTER_HANDLE_STILE_CENTER_OFFSET, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
                ctx.fillRect(stileCenterRight - SHUTTER_HANDLE_STILE_CENTER_OFFSET, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
            } else if (cabinet.width > 60) {
                 ctx.fillRect(dX + dpw * 0.25 - SHUTTER_HANDLE_WIDTH / 2, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
                 ctx.fillRect(dX + dpw * 0.75 - SHUTTER_HANDLE_WIDTH / 2, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
            } else {
                const handleX = dX + dpw - SHUTTER_HANDLE_OFFSET_FROM_EDGE - SHUTTER_HANDLE_WIDTH;
                ctx.fillRect(handleX, dY + dph / 2 - SHUTTER_HANDLE_HEIGHT / 2, SHUTTER_HANDLE_WIDTH, SHUTTER_HANDLE_HEIGHT);
            }
        }
      } else if (cabinet.frontType === 'glass') {
        // Glass door.
        const dX = cabinetDisplayX + doorInset;
        const dY = topY_mainBox + doorInset;
        const gdw = cabinet.width - 2 * doorInset;
        const gdh = mainBoxEffectiveHeight - 2 * doorInset;
        const glassMargin = (doorStyle === 'shaker') ? STILE_WIDTH_2D_CONST : 3;

        if (gdw > 0 && gdh > 0) {
            if(doorStyle === 'shaker'){
                drawShakerFront2D(ctx, dX, dY, gdw, gdh, STILE_WIDTH_2D_CONST);
            } else {
                drawSlabFront2D(ctx, dX, dY, gdw, gdh);
            }
            if (gdw > 2 * glassMargin && gdh > 2 * glassMargin) {
                ctx.fillStyle = GLASS_PANEL_FILL_COLOR;
                ctx.fillRect(dX + glassMargin, dY + glassMargin, gdw - 2 * glassMargin, gdh - 2 * glassMargin);
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
      // Canvas X-coordinate for the 'closest' (leftmost on canvas) edge of the cabinet's side profile.
      // ProjectionOnWall is center of item, so subtract half of depth.
      const itemDisplayX_side = -wallLength / 2 + projectionOnWall - cabinet.depth / 2;

      // Main box for side view.
      ctx.fillStyle = cabinetBaseColor;
      ctx.fillRect(itemDisplayX_side, topY_mainBox, cabinet.depth, mainBoxEffectiveHeight);
      ctx.strokeStyle = CABINET_OUTLINE_COLOR;
      ctx.lineWidth = CABINET_OUTLINE_WIDTH;
      ctx.strokeRect(itemDisplayX_side, topY_mainBox, cabinet.depth, mainBoxEffectiveHeight);

      // Toe kick for side view.
      if (toeKickH > 0) {
        // Toe kick is inset from front by `toeKickD_inset`.
        // In side view, this means the visible depth of the toe kick is `cabinet.depth - toeKickD_inset`.
        const tkSideActualDepth = cabinet.depth - toeKickD_inset;
        ctx.fillStyle = new THREE.Color(cabinetBaseColor).multiplyScalar(0.7).getStyle();
        // Toe kick is drawn starting from the same X as main box side (closest edge).
        ctx.fillRect(itemDisplayX_side, topY_mainBox + mainBoxEffectiveHeight, tkSideActualDepth, toeKickH);
        ctx.strokeStyle = TOEKICK_OUTLINE_COLOR;
        ctx.lineWidth = TOEKICK_OUTLINE_WIDTH;
        ctx.strokeRect(itemDisplayX_side, topY_mainBox + mainBoxEffectiveHeight, tkSideActualDepth, toeKickH);
      }
      // Shelves (side view - only if front is open/glass).
      const shelfCountSide = (cabinet.shelfCount !== undefined && cabinet.shelfCount > 0) ? cabinet.shelfCount : 0;
      if (shelfCountSide > 0 && (cabinet.frontType === 'open' || cabinet.frontType === 'glass' || cabinet.frontType === 'shutter')) {
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
            // SHELF_INSET_X_2D used as a generic side inset for shelves.
            const startX_side = itemDisplayX_side + SHELF_INSET_X_2D;
            const endX_side = itemDisplayX_side + cabinet.depth - SHELF_INSET_X_2D;
            if(endX_side > startX_side) { ctx.moveTo(startX_side, lineY_side); ctx.lineTo(endX_side, lineY_side); }
            ctx.stroke();
          }
        }
        ctx.restore();
      }
      // Draw projection of the cabinet's width.
      drawSideProjection2D(ctx, itemDisplayX_side + cabinet.depth, topY_mainBox, topY_mainBox + mainBoxEffectiveHeight, cabinet.width);
    }
};

/**
 * Draws a single appliance in elevation view, either front or side.
 */
const drawApplianceElevation = (ctx: CanvasRenderingContext2D, orientedAppliance: OrientedItem<any>, wall: any) => {
  const appliance = orientedAppliance.item;
  const orientation = orientedAppliance.orientation;
  const projectionOnWall = orientedAppliance.projectionOnWall; // Center of appliance projected on wall line.

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  const wallHeight = wall.height || 240; // Assumed scene wall height.

  // Default Y position: appliance bottom on floor (wallHeight / 2).
  // TODO: This needs refinement if appliances can be counter-height, wall-mounted, etc.
  let appliancePositionY = wallHeight / 2 - appliance.height;
  let applianceDisplayX; // Left edge for front view, or closest edge for side view.
  const applianceBaseColor = appliance.color || APPLIANCE_DEFAULT_FILL_COLOR;

  if (orientation === 'front') {
    applianceDisplayX = -wallLength / 2 + projectionOnWall - appliance.width / 2;
    
    ctx.fillStyle = applianceBaseColor;
    ctx.fillRect(applianceDisplayX, appliancePositionY, appliance.width, appliance.height);
    
    ctx.strokeStyle = APPLIANCE_OUTLINE_COLOR;
    ctx.lineWidth = APPLIANCE_OUTLINE_WIDTH;
    ctx.strokeRect(applianceDisplayX, appliancePositionY, appliance.width, appliance.height);

    // --- Appliance Type-Specific Details (Front View) ---
    if (appliance.type === 'sink') {
      // Simplified sink representation: basin rectangle and faucet outline.
      ctx.fillStyle = SINK_BASIN_COLOR_CONST;
      ctx.strokeStyle = DETAIL_LINE_COLOR;
      ctx.lineWidth = SINK_BASIN_BORDER_WIDTH;
      // Example basin positioning and size (relative to appliance box).
      const basinX = applianceDisplayX + 5;
      const basinY = appliancePositionY + 5;
      const basinWidth = appliance.width - 10;
      ctx.fillRect(basinX, basinY, basinWidth, SINK_BASIN_RECT_HEIGHT);
      ctx.strokeRect(basinX, basinY, basinWidth, SINK_BASIN_RECT_HEIGHT);

      // Faucet.
      ctx.strokeStyle = SINK_FAUCET_COLOR_CONST;
      ctx.lineWidth = SINK_FAUCET_LINE_WIDTH;
      ctx.beginPath();
      const faucetCenterX = applianceDisplayX + appliance.width / 2;
      const faucetBaseY = basinY; // Faucet base on the basin top edge.
      ctx.moveTo(faucetCenterX, faucetBaseY);
      ctx.lineTo(faucetCenterX, faucetBaseY - SINK_FAUCET_HEIGHT_ABOVE_BASIN); // Stem.
      // Simplified arc for faucet head.
      ctx.arc(
          faucetCenterX - SINK_FAUCET_ARC_RADIUS,
          faucetBaseY - SINK_FAUCET_HEIGHT_ABOVE_BASIN,
          SINK_FAUCET_ARC_RADIUS, 0, Math.PI, true // Semi-circle.
      );
      ctx.stroke();

    } else if (appliance.type === 'stove') {
      // Simplified stove representation: burners and a control panel area.
      ctx.fillStyle = STOVE_DETAIL_COLOR_CONST;
      ctx.strokeStyle = STOVE_DETAIL_COLOR_CONST;
      ctx.lineWidth = THIN_DETAIL_LINE_WIDTH;

      const burnerRadius = appliance.width * STOVE_BURNER_RADIUS_FACTOR;
      // Example positioning for burners.
      const burnerOffsetY = appliance.height * 0.25;
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
          ctx.fill();
        }
      }
      // Control Panel / Oven Door Handle area.
      ctx.fillStyle = STOVE_DETAIL_COLOR_CONST;
      const controlPanelY = appliancePositionY + appliance.height - STOVE_CONTROL_PANEL_HEIGHT - STOVE_CONTROL_PANEL_MARGIN_Y;
      ctx.fillRect(
          applianceDisplayX + 10, // Example inset.
          controlPanelY,
          appliance.width - 20, // Example inset.
          STOVE_CONTROL_PANEL_HEIGHT
      );
    }
    // Add more appliance types here...

  } else if (orientation === 'side') {
    // Canvas X-coordinate for the 'closest' (leftmost on canvas) edge of the appliance's side profile.
    // projectionOnWall is center of item, so subtract half of depth.
    const visibleSideX = -wallLength / 2 + projectionOnWall - appliance.depth / 2;

    // Main box for the side view (depth of appliance is width in this view).
    ctx.fillStyle = applianceBaseColor;
    ctx.fillRect(visibleSideX, appliancePositionY, appliance.depth, appliance.height);
    ctx.strokeStyle = APPLIANCE_OUTLINE_COLOR;
    ctx.lineWidth = APPLIANCE_OUTLINE_WIDTH;
    ctx.strokeRect(visibleSideX, appliancePositionY, appliance.depth, appliance.height);

    // Use drawSideProjection2D for the appliance's width projection.
    // Start projection from the far edge of the appliance's visible depth.
    drawSideProjection2D(
        ctx,
        visibleSideX + appliance.depth,
        appliancePositionY,
        appliancePositionY + appliance.height,
        appliance.width // Project out by the appliance's actual width.
    );
  }
};
  
/**
 * Draws dimension lines for the current wall.
 */
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
    ctx.lineWidth = DETAIL_LINE_WIDTH;
    ctx.setLineDash(DIMENSION_LINE_DASH);
    
    // Width dimension line (below wall).
    const widthDimY = wallHeight / 2 + 20;
    ctx.beginPath();
    ctx.moveTo(-wallLength / 2, widthDimY);
    ctx.lineTo(wallLength / 2, widthDimY);
    ctx.stroke();
    drawArrow(ctx, -wallLength / 2, widthDimY, 0); // Arrow pointing right.
    drawArrow(ctx, wallLength / 2, widthDimY, Math.PI); // Arrow pointing left.
    ctx.fillText(`${Math.round(wallLength)} cm`, 0, widthDimY + 15); // Text below line.
    
    // Height dimension line (left of wall).
    const heightDimX = -wallLength / 2 - 20;
    ctx.beginPath();
    ctx.moveTo(heightDimX, -wallHeight / 2);
    ctx.lineTo(heightDimX, wallHeight / 2);
    ctx.stroke();
    drawArrow(ctx, heightDimX, -wallHeight / 2, Math.PI / 2); // Arrow pointing up.
    drawArrow(ctx, heightDimX, wallHeight / 2, -Math.PI / 2); // Arrow pointing down.
    
    ctx.save();
    ctx.translate(heightDimX - 15, 0); // Position for vertical text.
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${wallHeight} cm`, 0, 0);
    ctx.restore();
    
    ctx.setLineDash([]);
  };
  
/**
 * Draws an arrow head at a given point and angle.
 * Used for dimension lines.
 */
const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-ARROW_SIZE, -ARROW_SIZE / 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-ARROW_SIZE, ARROW_SIZE / 2);
    ctx.strokeStyle = DIMENSION_LINE_COLOR; // Ensure arrow uses dimension line color.
    ctx.lineWidth = DETAIL_LINE_WIDTH;    // Ensure arrow uses consistent line width.
    ctx.stroke();
    ctx.restore();
  };
  
  // Navigation functions for cycling through walls.
  const nextWall = () => { setCurrentWallIndex((currentWallIndex + 1) % (walls.length || 1)); };
  const prevWall = () => { setCurrentWallIndex((currentWallIndex - 1 + (walls.length || 1)) % (walls.length || 1)); };
  
  // --- Component Return ---
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative" // Main container for the canvas and UI controls.
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full" // Canvas takes full space of its parent.
      />
      
      {/* Wall navigation UI elements */}
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
      
      {/* Zoom control UI elements */}
      <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md p-2 text-sm flex items-center space-x-2">
        <button 
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => setScale(prev => Math.min(5, prev + 0.1))}
          title="Zoom In"
        >
          +
        </button>
        <span className="text-gray-700 tabular-nums">{Math.round(scale * 100)}%</span>
        <button 
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
          title="Zoom Out"
        >
          -
        </button>
        <button 
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          onClick={() => setScale(1)}
          title="Reset Zoom"
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

[end of src/components/designer/ElevationView.tsx]
