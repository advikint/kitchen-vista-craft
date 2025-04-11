
import { useRef, useEffect, useState } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    const relevantCabinets = findCabinetsForWall(wall);
    relevantCabinets.forEach(cabinet => drawCabinetElevation(ctx, cabinet, wall));
    
    // Draw appliances that are against this wall
    const relevantAppliances = findAppliancesForWall(wall);
    relevantAppliances.forEach(appliance => drawApplianceElevation(ctx, appliance, wall));
    
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
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(-wallLength / 2, -wallHeight / 2, wallLength, wallHeight);
    
    // Wall outline
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
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
    ctx.beginPath();
    ctx.moveTo(windowPositionX + window.width / 2, windowPositionY);
    ctx.lineTo(windowPositionX + window.width / 2, windowPositionY + window.height);
    ctx.moveTo(windowPositionX, windowPositionY + window.height / 2);
    ctx.lineTo(windowPositionX + window.width, windowPositionY + window.height / 2);
    ctx.strokeStyle = "#7dd3fc";
    ctx.stroke();
  };
  
  const findCabinetsForWall = (wall: any) => {
    // Simple implementation - find cabinets close to the wall
    // A more robust implementation would consider rotation and exact positioning
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallAngle = Math.atan2(dy, dx);
    const wallNormal = { x: -Math.sin(wallAngle), y: Math.cos(wallAngle) };
    
    return cabinets.filter(cabinet => {
      // Check if cabinet is close to the wall line
      const cabToWallStart = {
        x: cabinet.position.x - wall.start.x,
        y: cabinet.position.y - wall.start.y
      };
      
      // Project cabinet position onto wall normal
      const distanceToWall = Math.abs(
        cabToWallStart.x * wallNormal.x + cabToWallStart.y * wallNormal.y
      );
      
      // Project cabinet position onto wall direction
      const wallDir = { x: Math.cos(wallAngle), y: Math.sin(wallAngle) };
      const projectionOnWall = 
        cabToWallStart.x * wallDir.x + cabToWallStart.y * wallDir.y;
      
      // Calculate wall length
      const wallLength = Math.sqrt(dx * dx + dy * dy);
      
      // Cabinet is close to wall and within wall length
      return distanceToWall < cabinet.depth + 10 && 
             projectionOnWall >= 0 && 
             projectionOnWall <= wallLength;
    });
  };
  
  const findAppliancesForWall = (wall: any) => {
    // Similar to findCabinetsForWall
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallAngle = Math.atan2(dy, dx);
    const wallNormal = { x: -Math.sin(wallAngle), y: Math.cos(wallAngle) };
    
    return appliances.filter(appliance => {
      const appToWallStart = {
        x: appliance.position.x - wall.start.x,
        y: appliance.position.y - wall.start.y
      };
      
      const distanceToWall = Math.abs(
        appToWallStart.x * wallNormal.x + appToWallStart.y * wallNormal.y
      );
      
      const wallDir = { x: Math.cos(wallAngle), y: Math.sin(wallAngle) };
      const projectionOnWall = 
        appToWallStart.x * wallDir.x + appToWallStart.y * wallDir.y;
      
      const wallLength = Math.sqrt(dx * dx + dy * dy);
      
      return distanceToWall < appliance.depth + 10 && 
             projectionOnWall >= 0 && 
             projectionOnWall <= wallLength;
    });
  };
  
  const drawCabinetElevation = (ctx: CanvasRenderingContext2D, cabinet: any, wall: any) => {
    // Calculate wall length
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    
    // Wall height
    const wallHeight = wall.height || 240;
    
    // Determine cabinet position along the wall
    // This is a simplification - actual position would need more complex calculations
    const wallAngle = Math.atan2(dy, dx);
    const wallDir = { x: Math.cos(wallAngle), y: Math.sin(wallAngle) };
    
    const cabToWallStart = {
      x: cabinet.position.x - wall.start.x,
      y: cabinet.position.y - wall.start.y
    };
    
    const projectionOnWall = 
      cabToWallStart.x * wallDir.x + cabToWallStart.y * wallDir.y;
    
    const cabinetPositionX = -wallLength / 2 + projectionOnWall - cabinet.width / 2;
    
    // Base cabinets sit on the floor, wall cabinets are elevated
    let cabinetPositionY;
    if (cabinet.type === 'base') {
      cabinetPositionY = wallHeight / 2 - cabinet.height;
    } else if (cabinet.type === 'wall') {
      cabinetPositionY = wallHeight / 2 - cabinet.height - 150; // 150cm from floor
    } else if (cabinet.type === 'tall') {
      cabinetPositionY = wallHeight / 2 - cabinet.height;
    } else {
      // Island cabinets won't show in elevation
      return;
    }
    
    // Draw cabinet
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(cabinetPositionX, cabinetPositionY, cabinet.width, cabinet.height);
    
    // Cabinet outline
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 1;
    ctx.strokeRect(cabinetPositionX, cabinetPositionY, cabinet.width, cabinet.height);
    
    // Draw countertop for base cabinets
    if (cabinet.type === 'base') {
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(
        cabinetPositionX - 2, 
        cabinetPositionY, 
        cabinet.width + 4, 
        4
      );
    }
    
    // Draw interior details based on cabinet category
    if (cabinet.category === 'drawer') {
      const drawers = 3;
      const drawerHeight = cabinet.height / drawers;
      
      for (let i = 0; i < drawers; i++) {
        ctx.strokeRect(
          cabinetPositionX + 2, 
          cabinetPositionY + i * drawerHeight + 2, 
          cabinet.width - 4, 
          drawerHeight - 4
        );
        
        // Drawer handles
        ctx.fillStyle = "#6b7280";
        ctx.fillRect(
          cabinetPositionX + cabinet.width / 2 - 10, 
          cabinetPositionY + i * drawerHeight + drawerHeight / 2, 
          20, 
          2
        );
      }
    } else if (cabinet.category === 'shutter') {
      // Door outline
      ctx.strokeRect(
        cabinetPositionX + 2, 
        cabinetPositionY + 2, 
        cabinet.width - 4, 
        cabinet.height - 4
      );
      
      // Door handle
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(
        cabinetPositionX + cabinet.width - 10, 
        cabinetPositionY + cabinet.height / 2 - 10, 
        2, 
        20
      );
    }
  };
  
  const drawApplianceElevation = (ctx: CanvasRenderingContext2D, appliance: any, wall: any) => {
    // Calculate wall length
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    
    // Wall height
    const wallHeight = wall.height || 240;
    
    // Determine appliance position along the wall
    const wallAngle = Math.atan2(dy, dx);
    const wallDir = { x: Math.cos(wallAngle), y: Math.sin(wallAngle) };
    
    const appToWallStart = {
      x: appliance.position.x - wall.start.x,
      y: appliance.position.y - wall.start.y
    };
    
    const projectionOnWall = 
      appToWallStart.x * wallDir.x + appToWallStart.y * wallDir.y;
    
    const appliancePositionX = -wallLength / 2 + projectionOnWall - appliance.width / 2;
    const appliancePositionY = wallHeight / 2 - appliance.height;
    
    // Draw appliance
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(appliancePositionX, appliancePositionY, appliance.width, appliance.height);
    
    // Appliance outline
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 1;
    ctx.strokeRect(appliancePositionX, appliancePositionY, appliance.width, appliance.height);
    
    // Draw appliance details based on type
    if (appliance.type === 'sink') {
      // Sink basin
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(
        appliancePositionX + 5, 
        appliancePositionY + 5, 
        appliance.width - 10, 
        20
      );
      
      // Faucet
      ctx.beginPath();
      ctx.moveTo(appliancePositionX + appliance.width / 2, appliancePositionY + 5);
      ctx.lineTo(appliancePositionX + appliance.width / 2, appliancePositionY - 15);
      ctx.arc(
        appliancePositionX + appliance.width / 2 - 10, 
        appliancePositionY - 15, 
        10, 
        0, 
        Math.PI, 
        true
      );
      ctx.strokeStyle = "#6b7280";
      ctx.stroke();
    } else if (appliance.type === 'stove') {
      // Burners
      ctx.fillStyle = "#4b5563";
      const burnerRadius = 5;
      ctx.beginPath();
      ctx.arc(
        appliancePositionX + appliance.width / 4, 
        appliancePositionY + 15, 
        burnerRadius, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(
        appliancePositionX + appliance.width * 3 / 4, 
        appliancePositionY + 15, 
        burnerRadius, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(
        appliancePositionX + appliance.width / 4, 
        appliancePositionY + 40, 
        burnerRadius, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(
        appliancePositionX + appliance.width * 3 / 4, 
        appliancePositionY + 40, 
        burnerRadius, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      // Controls
      ctx.fillRect(
        appliancePositionX + 10, 
        appliancePositionY + appliance.height - 15, 
        appliance.width - 20, 
        10
      );
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
