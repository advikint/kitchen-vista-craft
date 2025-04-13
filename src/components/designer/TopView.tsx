import { useRef, useEffect, useState } from "react";
import { useKitchenStore, Cabinet, Appliance, Wall, Door, Window, CabinetType, ApplianceType } from "@/store/kitchenStore";
import { toast } from "sonner";

const TopView = () => {
  const { 
    room, walls, doors, windows, cabinets, appliances,
    currentToolMode, selectedItemId, setSelectedItemId,
    addWall, addDoor, addWindow, addCabinet, addAppliance,
    showDimensions, updateCabinet, updateAppliance
  } = useKitchenStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [snapEnabled, setSnapEnabled] = useState(true);
  
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
  
  useEffect(() => {
    draw();
  }, [room, walls, doors, windows, cabinets, appliances, scale, offset, showDimensions, selectedItemId, snapEnabled]);
  
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
    ctx.scale(scale, scale);
    
    drawGrid(ctx, canvas.width, canvas.height);
    
    drawRoom(ctx);
    
    walls.forEach(wall => drawWall(ctx, wall));
    
    cabinets.forEach(cabinet => drawCabinet(ctx, cabinet));
    appliances.forEach(appliance => drawAppliance(ctx, appliance));
    
    doors.forEach(door => drawDoor(ctx, door));
    windows.forEach(window => drawWindow(ctx, window));
    
    if (showDimensions) {
      drawDimensions(ctx);
    }
    
    ctx.restore();
  };
  
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    const numLinesX = Math.ceil(width / gridSize / scale) * 2;
    const numLinesY = Math.ceil(height / gridSize / scale) * 2;
    
    ctx.beginPath();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    
    for (let i = -numLinesX / 2; i <= numLinesX / 2; i++) {
      const x = i * gridSize;
      ctx.moveTo(x, -height / scale);
      ctx.lineTo(x, height / scale);
    }
    
    for (let i = -numLinesY / 2; i <= numLinesY / 2; i++) {
      const y = i * gridSize;
      ctx.moveTo(-width / scale, y);
      ctx.lineTo(width / scale, y);
    }
    
    ctx.stroke();
    ctx.closePath();
  };
  
  const drawRoom = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = room;
    
    ctx.beginPath();
    ctx.strokeStyle = selectedItemId === "room" ? "#3b82f6" : "#1f2937";
    ctx.lineWidth = 2;
    ctx.rect(-width / 2, -height / 2, width, height);
    ctx.stroke();
    ctx.closePath();
    
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(-width / 2, -height / 2, width, height);
  };
  
  const drawWall = (ctx: CanvasRenderingContext2D, wall: Wall) => {
    ctx.beginPath();
    ctx.strokeStyle = selectedItemId === wall.id ? "#3b82f6" : "#4b5563";
    ctx.lineWidth = 6;
    ctx.moveTo(wall.start.x, wall.start.y);
    ctx.lineTo(wall.end.x, wall.end.y);
    ctx.stroke();
    ctx.closePath();
  };
  
  const drawDoor = (ctx: CanvasRenderingContext2D, door: Door) => {
    const wall = walls.find(w => w.id === door.wallId);
    if (!wall) return;
    
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    const doorPos = {
      x: wall.start.x + dx * door.position,
      y: wall.start.y + dy * door.position
    };
    
    ctx.save();
    ctx.translate(doorPos.x, doorPos.y);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.strokeStyle = selectedItemId === door.id ? "#3b82f6" : "#93c5fd";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#dbeafe";
    
    ctx.beginPath();
    ctx.arc(0, 0, door.width / 2, 0, Math.PI, false);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.fillStyle = "#bfdbfe";
    ctx.fillRect(-door.width / 2, -3, door.width, 6);
    ctx.strokeStyle = selectedItemId === door.id ? "#3b82f6" : "#60a5fa";
    ctx.strokeRect(-door.width / 2, -3, door.width, 6);
    
    ctx.restore();
  };
  
  const drawWindow = (ctx: CanvasRenderingContext2D, window: Window) => {
    const wall = walls.find(w => w.id === window.wallId);
    if (!wall) return;
    
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    const windowPos = {
      x: wall.start.x + dx * window.position,
      y: wall.start.y + dy * window.position
    };
    
    ctx.save();
    ctx.translate(windowPos.x, windowPos.y);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(-window.width / 2, -3, window.width, 6);
    ctx.strokeStyle = selectedItemId === window.id ? "#3b82f6" : "#7dd3fc";
    ctx.lineWidth = 2;
    ctx.strokeRect(-window.width / 2, -3, window.width, 6);
    
    ctx.beginPath();
    ctx.strokeStyle = "#bae6fd";
    ctx.moveTo(-window.width / 2 + window.width / 3, -3);
    ctx.lineTo(-window.width / 2 + window.width / 3, 3);
    ctx.moveTo(-window.width / 2 + (window.width / 3) * 2, -3);
    ctx.lineTo(-window.width / 2 + (window.width / 3) * 2, 3);
    ctx.stroke();
    
    ctx.restore();
  };
  
  const drawCabinet = (ctx: CanvasRenderingContext2D, cabinet: Cabinet) => {
    ctx.save();
    ctx.translate(cabinet.position.x, cabinet.position.y);
    ctx.rotate(cabinet.rotation * Math.PI / 180);
    
    ctx.beginPath();
    ctx.strokeStyle = selectedItemId === cabinet.id ? "#3b82f6" : "#6b7280";
    ctx.lineWidth = 1;
    ctx.fillStyle = selectedItemId === cabinet.id ? "#dbeafe" : "#f3f4f6";
    ctx.fillRect(-cabinet.width / 2, -cabinet.depth / 2, cabinet.width, cabinet.depth);
    ctx.strokeRect(-cabinet.width / 2, -cabinet.depth / 2, cabinet.width, cabinet.depth);
    
    if (cabinet.type === 'base') {
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(-cabinet.width / 2 - 2, -cabinet.depth / 2 - 2, cabinet.width + 4, cabinet.depth + 4);
      ctx.strokeRect(-cabinet.width / 2 - 2, -cabinet.depth / 2 - 2, cabinet.width + 4, cabinet.depth + 4);
    }
    
    if (cabinet.category === 'drawer') {
      const drawers = 3;
      const drawerHeight = cabinet.depth / drawers;
      
      for (let i = 0; i < drawers; i++) {
        ctx.strokeRect(
          -cabinet.width / 2 + 2, 
          -cabinet.depth / 2 + 2 + i * drawerHeight, 
          cabinet.width - 4, 
          drawerHeight - 4
        );
        
        ctx.beginPath();
        ctx.fillStyle = "#9ca3af";
        ctx.fillRect(0 - 10, -cabinet.depth / 2 + i * drawerHeight + drawerHeight / 2, 20, 2);
        ctx.fill();
      }
    } else if (cabinet.category === 'shutter') {
      ctx.strokeRect(-cabinet.width / 2 + 2, -cabinet.depth / 2 + 2, cabinet.width - 4, cabinet.depth - 4);
      
      ctx.beginPath();
      ctx.fillStyle = "#9ca3af";
      const handleX = cabinet.width / 2 - 5;
      ctx.fillRect(handleX - 2, 0 - 10, 2, 20);
      ctx.fill();
    }
    
    ctx.fillStyle = "#4b5563";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "8px Arial";
    ctx.fillText(cabinet.type.charAt(0).toUpperCase(), 0, 0);
    
    ctx.restore();
  };
  
  const drawAppliance = (ctx: CanvasRenderingContext2D, appliance: Appliance) => {
    ctx.save();
    ctx.translate(appliance.position.x, appliance.position.y);
    ctx.rotate(appliance.rotation * Math.PI / 180);
    
    ctx.beginPath();
    ctx.strokeStyle = selectedItemId === appliance.id ? "#3b82f6" : "#6b7280";
    ctx.lineWidth = 1;
    ctx.fillStyle = selectedItemId === appliance.id ? "#dbeafe" : "#e5e7eb";
    ctx.fillRect(-appliance.width / 2, -appliance.depth / 2, appliance.width, appliance.depth);
    ctx.strokeRect(-appliance.width / 2, -appliance.depth / 2, appliance.width, appliance.depth);
    
    ctx.fillStyle = "#4b5563";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "9px Arial";
    
    let label = "?";
    switch (appliance.type) {
      case "sink": label = "S"; break;
      case "stove": label = "C"; break;
      case "oven": label = "O"; break;
      case "fridge": label = "F"; break;
      case "dishwasher": label = "D"; break;
      case "microwave": label = "M"; break;
      case "hood": label = "H"; break;
    }
    
    ctx.fillText(label, 0, 0);
    
    if (appliance.type === "sink") {
      ctx.beginPath();
      ctx.strokeStyle = "#9ca3af";
      ctx.ellipse(0, 0, appliance.width / 3, appliance.depth / 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (appliance.type === "stove") {
      const radius = Math.min(appliance.width, appliance.depth) / 6;
      const positions = [
        { x: -appliance.width / 4, y: -appliance.depth / 4 },
        { x: appliance.width / 4, y: -appliance.depth / 4 },
        { x: -appliance.width / 4, y: appliance.depth / 4 },
        { x: appliance.width / 4, y: appliance.depth / 4 }
      ];
      
      ctx.beginPath();
      ctx.strokeStyle = "#9ca3af";
      positions.forEach(pos => {
        ctx.moveTo(pos.x + radius, pos.y);
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      });
      ctx.stroke();
    }
    
    ctx.restore();
  };
  
  const drawDimensions = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = room;
    const margin = 20;
    
    ctx.save();
    
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    ctx.fillStyle = "#4b5563";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 2 - margin);
    ctx.lineTo(width / 2, -height / 2 - margin);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-width / 2 - margin, -height / 2);
    ctx.lineTo(-width / 2 - margin, height / 2);
    ctx.stroke();
    
    ctx.save();
    ctx.translate(-width / 2 - margin - 10, 0);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${height} cm`, 0, 0);
    ctx.restore();
    
    ctx.fillText(`${width} cm`, 0, -height / 2 - margin - 10);
    
    ctx.setLineDash([]);
    
    ctx.restore();
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
  
  const screenToWorld = (screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const worldX = (screenX - canvas.width / 2 - offset.x) / scale;
    const worldY = (screenY - canvas.height / 2 - offset.y) / scale;
    
    return { x: worldX, y: worldY };
  };
  
  const findNearestWall = (point: { x: number, y: number }) => {
    let nearestWall = null;
    let minDistance = Number.MAX_VALUE;
    let position = 0;
    
    walls.forEach(wall => {
      const { distance, t } = pointToLineDistance(
        point, 
        { x: wall.start.x, y: wall.start.y },
        { x: wall.end.x, y: wall.end.y }
      );
      
      if (distance < minDistance && t >= 0 && t <= 1) {
        minDistance = distance;
        nearestWall = wall;
        position = t;
      }
    });
    
    return { wall: nearestWall, distance: minDistance, position };
  };
  
  const pointToLineDistance = (
    point: { x: number, y: number },
    lineStart: { x: number, y: number },
    lineEnd: { x: number, y: number }
  ) => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const l2 = dx * dx + dy * dy;
    
    if (l2 === 0) {
      return {
        distance: Math.sqrt(
          (point.x - lineStart.x) * (point.x - lineStart.x) +
          (point.y - lineStart.y) * (point.y - lineStart.y)
        ),
        t: 0
      };
    }
    
    const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / l2));
    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;
    
    const distance = Math.sqrt(
      (point.x - projX) * (point.x - projX) +
      (point.y - projY) * (point.y - projY)
    );
    
    return { distance, t };
  };
  
  const isPointInItem = (point: { x: number, y: number }, item: Cabinet | Appliance) => {
    const dx = point.x - item.position.x;
    const dy = point.y - item.position.y;
    
    const angle = -item.rotation * Math.PI / 180;
    const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
    const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
    
    return (
      rx >= -item.width / 2 &&
      rx <= item.width / 2 &&
      ry >= -item.depth / 2 &&
      ry <= item.depth / 2
    );
  };
  
  const areCabinetsOverlapping = (cabinet1: Cabinet, cabinet2: Cabinet) => {
    const xDist = Math.abs(cabinet1.position.x - cabinet2.position.x);
    const yDist = Math.abs(cabinet1.position.y - cabinet2.position.y);
    
    const maxWidth = Math.max(cabinet1.width, cabinet2.width);
    const maxDepth = Math.max(cabinet1.depth, cabinet2.depth);
    
    if (xDist > maxWidth || yDist > maxDepth) {
      return false;
    }
    
    if (Math.abs(cabinet1.rotation - cabinet2.rotation) % 180 === 0) {
      const cab1Left = cabinet1.position.x - cabinet1.width / 2;
      const cab1Right = cabinet1.position.x + cabinet1.width / 2;
      const cab1Top = cabinet1.position.y - cabinet1.depth / 2;
      const cab1Bottom = cabinet1.position.y + cabinet1.depth / 2;
      
      const cab2Left = cabinet2.position.x - cabinet2.width / 2;
      const cab2Right = cabinet2.position.x + cabinet2.width / 2;
      const cab2Top = cabinet2.position.y - cabinet2.depth / 2;
      const cab2Bottom = cabinet2.position.y + cabinet2.depth / 2;
      
      return !(
        cab1Right < cab2Left || 
        cab1Left > cab2Right || 
        cab1Bottom < cab2Top || 
        cab1Top > cab2Bottom
      );
    }
    
    return (xDist < (cabinet1.width + cabinet2.width) / 3) && 
           (yDist < (cabinet1.depth + cabinet2.depth) / 3);
  };
  
  const areSameTypeOfCabinet = (cabinet1: Cabinet, cabinet2: Cabinet) => {
    return cabinet1.type === cabinet2.type;
  };
  
  const adjustCabinetPosition = (newCabinet: Cabinet) => {
    let adjustedCabinet = {...newCabinet};
    
    for (const existingCabinet of cabinets) {
      if (existingCabinet.id === newCabinet.id) {
        continue;
      }
      
      if (areSameTypeOfCabinet(adjustedCabinet, existingCabinet) && 
          areCabinetsOverlapping(adjustedCabinet, existingCabinet)) {
        
        const isHorizontalAlignment = Math.abs(adjustedCabinet.rotation) % 180 === 90;
        
        if (isHorizontalAlignment) {
          const moveDirection = adjustedCabinet.position.y > existingCabinet.position.y ? 1 : -1;
          adjustedCabinet.position.y = existingCabinet.position.y + 
            moveDirection * (existingCabinet.depth/2 + adjustedCabinet.depth/2 + 1);
        } else {
          const moveDirection = adjustedCabinet.position.x > existingCabinet.position.x ? 1 : -1;
          adjustedCabinet.position.x = existingCabinet.position.x + 
            moveDirection * (existingCabinet.width/2 + adjustedCabinet.width/2 + 1);
        }
      }
    }
    
    return adjustedCabinet;
  };
  
  const findItemAtPosition = (worldPoint: { x: number, y: number }) => {
    const { width, height } = room;
    if (
      worldPoint.x >= -width / 2 && worldPoint.x <= width / 2 &&
      worldPoint.y >= -height / 2 && worldPoint.y <= height / 2
    ) {
      for (const appliance of appliances) {
        if (isPointInItem(worldPoint, appliance)) {
          return { id: appliance.id, type: 'appliance' };
        }
      }
      
      for (const cabinet of cabinets) {
        if (isPointInItem(worldPoint, cabinet)) {
          return { id: cabinet.id, type: 'cabinet' };
        }
      }
      
      for (const door of doors) {
        const wall = walls.find(w => w.id === door.wallId);
        if (!wall) continue;
        
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const doorPos = {
          x: wall.start.x + dx * door.position,
          y: wall.start.y + dy * door.position
        };
        
        const doorDx = worldPoint.x - doorPos.x;
        const doorDy = worldPoint.y - doorPos.y;
        const doorDistance = Math.sqrt(doorDx * doorDx + doorDy * doorDy);
        
        if (doorDistance <= door.width / 2) {
          return { id: door.id, type: 'door' };
        }
      }
      
      for (const window of windows) {
        const wall = walls.find(w => w.id === window.wallId);
        if (!wall) continue;
        
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const windowPos = {
          x: wall.start.x + dx * window.position,
          y: wall.start.y + dy * window.position
        };
        
        const windowDx = worldPoint.x - windowPos.x;
        const windowDy = worldPoint.y - windowPos.y;
        const windowDistance = Math.sqrt(windowDx * windowDx + windowDy * windowDy);
        
        if (windowDistance <= window.width / 2) {
          return { id: window.id, type: 'window' };
        }
      }
      
      for (const wall of walls) {
        const { distance } = pointToLineDistance(
          worldPoint, 
          { x: wall.start.x, y: wall.start.y },
          { x: wall.end.x, y: wall.end.y }
        );
        
        if (distance <= 10) {
          return { id: wall.id, type: 'wall' };
        }
      }
      
      return { id: 'room', type: 'room' };
    }
    
    return null;
  };
  
  const findNearestCabinet = (worldPoint: { x: number, y: number }) => {
    let nearestCabinet = null;
    let minDistance = Number.MAX_VALUE;
    
    cabinets.forEach(cabinet => {
      const dx = worldPoint.x - cabinet.position.x;
      const dy = worldPoint.y - cabinet.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCabinet = cabinet;
      }
    });
    
    return { cabinet: nearestCabinet, distance: minDistance };
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setStartPos({ x, y });
    
    const worldPoint = screenToWorld(x, y);
    
    if (currentToolMode === 'select') {
      const item = findItemAtPosition(worldPoint);
      if (item) {
        setSelectedItemId(item.id);
      } else {
        setSelectedItemId(null);
      }
    } else if (currentToolMode === 'door') {
      if (walls.length === 0) {
        toast.warning("Add walls before placing doors");
        return;
      }
      
      const { wall, distance, position } = findNearestWall(worldPoint);
      
      if (wall && distance < 20) {
        addDoor({
          wallId: wall.id,
          position: position,
          width: 80,
          height: 200
        });
        toast.success("Door added");
      } else {
        toast.warning("Click near a wall to place a door");
      }
    } else if (currentToolMode === 'window') {
      if (walls.length === 0) {
        toast.warning("Add walls before placing windows");
        return;
      }
      
      const { wall, distance, position } = findNearestWall(worldPoint);
      
      if (wall && distance < 20) {
        addWindow({
          wallId: wall.id,
          position: position,
          width: 100,
          height: 120,
          sillHeight: 90
        });
        toast.success("Window added");
      } else {
        toast.warning("Click near a wall to place a window");
      }
    } else if (currentToolMode === 'cabinet') {
      const { wall, distance, position } = findNearestWall(worldPoint);
      let cabinetPosition = { x: worldPoint.x, y: worldPoint.y };
      let rotation = 0;
      
      if (snapEnabled && wall && distance < 40) {
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const wallLength = Math.sqrt(dx * dx + dy * dy);
        const wallAngle = Math.atan2(dy, dx);
        
        const cabinetPos = {
          x: wall.start.x + dx * position,
          y: wall.start.y + dy * position
        };
        
        const perpAngle = wallAngle + Math.PI / 2;
        const placementDistance = 7.5 + 30;
        
        cabinetPosition = {
          x: cabinetPos.x + Math.cos(perpAngle) * placementDistance,
          y: cabinetPos.y + Math.sin(perpAngle) * placementDistance
        };
        
        rotation = (wallAngle * 180 / Math.PI + 90) % 360;
      } else {
        const { cabinet: nearestCabinet } = findNearestCabinet(worldPoint);
        if (snapEnabled && nearestCabinet) {
          cabinetPosition = {
            x: nearestCabinet.position.x + nearestCabinet.width/2 + 60/2 + 1,
            y: nearestCabinet.position.y
          };
          rotation = nearestCabinet.rotation;
        }
      }
      
      let templateData: {
        type: CabinetType;
        category: string;
        frontType: string;
        finish: string;
        width: number;
        height: number;
        depth: number;
        material: string;
        color: string;
      } = {
        type: 'base',
        category: 'shutter',
        frontType: 'shutter',
        finish: 'laminate',
        width: 60,
        height: 85,
        depth: 60,
        material: 'laminate',
        color: 'white'
      };
      
      const storedTemplate = localStorage.getItem('template_cabinet');
      if (storedTemplate) {
        try {
          const parsedTemplate = JSON.parse(storedTemplate);
          templateData = { ...templateData, ...parsedTemplate };
        } catch (e) {
          console.error("Error parsing cabinet template", e);
        }
      }
      
      const newCabinet: Cabinet = {
        id: `cabinet-${Date.now()}`,
        position: cabinetPosition,
        rotation: rotation,
        ...templateData
      };
      
      const adjustedCabinet = adjustCabinetPosition(newCabinet);
      
      addCabinet(adjustedCabinet);
      toast.success("Cabinet added");
    } else if (currentToolMode === 'appliance') {
      const { wall, distance, position } = findNearestWall(worldPoint);
      let appliancePosition = { x: worldPoint.x, y: worldPoint.y };
      let rotation = 0;
      
      if (snapEnabled && wall && distance < 40) {
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const wallAngle = Math.atan2(dy, dx);
        
        const appliancePos = {
          x: wall.start.x + dx * position,
          y: wall.start.y + dy * position
        };
        
        const perpAngle = wallAngle + Math.PI / 2;
        const placementDistance = 7.5 + 30;
        
        appliancePosition = {
          x: appliancePos.x + Math.cos(perpAngle) * placementDistance,
          y: appliancePos.y + Math.sin(perpAngle) * placementDistance
        };
        
        rotation = (wallAngle * 180 / Math.PI + 90) % 360;
      }
      
      let templateData: {
        type: ApplianceType;
        width: number;
        height: number;
        depth: number;
        model: string;
      } = {
        type: 'sink',
        width: 80,
        height: 40,
        depth: 60,
        model: 'Standard Sink'
      };
      
      const storedTemplate = localStorage.getItem('template_appliance');
      if (storedTemplate) {
        try {
          const parsedTemplate = JSON.parse(storedTemplate);
          templateData = { ...templateData, ...parsedTemplate };
        } catch (e) {
          console.error("Error parsing appliance template", e);
        }
      }
      
      const newAppliance: Appliance = {
        id: `appliance-${Date.now()}`,
        position: appliancePosition,
        rotation: rotation,
        ...templateData
      };
      
      addAppliance(newAppliance);
      toast.success(`${templateData.type.charAt(0).toUpperCase() + templateData.type.slice(1)} added`);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentToolMode === 'select') {
      setOffset(prev => ({
        x: prev.x + (x - startPos.x),
        y: prev.y + (y - startPos.y)
      }));
    }
    
    setStartPos({ x, y });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = -e.deltaY * 0.01;
    const newScale = Math.max(0.1, Math.min(5, scale + delta));
    setScale(newScale);
  };
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
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
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10L19.5528 5.44721" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 10L4.44721 5.44721" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 14L19.5528 18.5528" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 14L4.44721 18.5528" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          className={`ml-2 px-2 py-1 rounded ${snapEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setSnapEnabled(!snapEnabled)}
          title="Toggle snapping"
        >
          Snap: {snapEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
};

export default TopView;
