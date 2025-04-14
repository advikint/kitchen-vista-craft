import { useRef, useEffect, useState } from "react";
import { useKitchenStore, Cabinet, CabinetType, CabinetCategory, CabinetFrontType, CabinetFinish, Appliance, ApplianceType, ToolMode } from "@/store/kitchenStore";
import { Stage, Layer, Rect, Line, Circle, Group, Text } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { KonvaEventObject } from "konva/lib/Node";
import { toast } from "sonner";

const TopView = () => {
  const stageRef = useRef<any>(null);
  const {
    room,
    walls,
    doors,
    windows,
    cabinets,
    appliances,
    selectedItemId,
    setSelectedItemId,
    currentToolMode,
    addWall,
    addDoor,
    addWindow,
    addCabinet,
    addAppliance,
    updateCabinet,
    updateAppliance,
    updateDoor,
    updateWindow,
    showDimensions
  } = useKitchenStore();
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  
  const getTemplateData = (type: string) => {
    const data = localStorage.getItem(`template_${type}`);
    return data ? JSON.parse(data) : null;
  };
  
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (isDragging) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    const worldPos = {
      x: (pointerPosition.x - position.x) / scale,
      y: (pointerPosition.y - position.y) / scale
    };
    
    switch (currentToolMode) {
      case 'wall' as ToolMode:
        if (!startPoint) {
          setStartPoint(worldPos);
        } else {
          addWall({
            start: startPoint,
            end: worldPos,
            height: 240
          });
          setStartPoint(null);
        }
        break;
        
      case 'door' as ToolMode:
        const nearestWall = findNearestWall(worldPos);
        if (nearestWall) {
          const doorTemplateData = getTemplateData('door');
          addDoor({
            wallId: nearestWall.id,
            position: calculatePositionOnWall(worldPos, nearestWall),
            width: doorTemplateData?.width || 80,
            height: doorTemplateData?.height || 200,
            type: doorTemplateData?.type || 'standard'
          });
        } else {
          toast.error("Please place doors on walls");
        }
        break;
        
      case 'window' as ToolMode:
        const nearestWallForWindow = findNearestWall(worldPos);
        if (nearestWallForWindow) {
          const windowTemplateData = getTemplateData('window');
          addWindow({
            wallId: nearestWallForWindow.id,
            position: calculatePositionOnWall(worldPos, nearestWallForWindow),
            width: windowTemplateData?.width || 100,
            height: windowTemplateData?.height || 120,
            sillHeight: windowTemplateData?.sillHeight || 90,
            type: windowTemplateData?.type || 'standard'
          });
        } else {
          toast.error("Please place windows on walls");
        }
        break;
        
      case 'cabinet' as ToolMode:
        const cabinetTemplateData = getTemplateData('cabinet');
        addCabinetAtPosition(worldPos, cabinetTemplateData);
        break;
        
      case 'appliance' as ToolMode:
        const applianceTemplateData = getTemplateData('appliance');
        addApplianceAtPosition(worldPos, applianceTemplateData);
        break;
        
      default:
        break;
    }
  };
  
  const addCabinetAtPosition = (position: { x: number; y: number }, templateData: any) => {
    if (!templateData) return;
    
    const newCabinet: Cabinet = {
      type: templateData.type as CabinetType || 'base',
      category: templateData.category as CabinetCategory || 'standard-base',
      frontType: templateData.frontType as CabinetFrontType || 'shutter',
      finish: templateData.finish as CabinetFinish || 'laminate',
      width: templateData.width || 60,
      height: templateData.height || 85,
      depth: templateData.depth || 60,
      material: templateData.material || 'wood',
      color: templateData.color || 'white',
      id: uuidv4(),
      position,
      rotation: 0
    };
    
    addCabinet(newCabinet, {});
  };
  
  const addApplianceAtPosition = (position: { x: number; y: number }, templateData: any) => {
    if (!templateData) return;
    
    const newAppliance: Appliance = {
      type: templateData.type as ApplianceType || 'stove',
      width: templateData.width || 60,
      height: templateData.height || 85,
      depth: templateData.depth || 60,
      model: templateData.model || 'standard',
      id: uuidv4(),
      position,
      rotation: 0
    };
    
    addAppliance(newAppliance, {});
  };
  
  const findNearestWall = (point: { x: number; y: number }) => {
    let nearestWall = null;
    let minDistance = Infinity;
    
    walls.forEach(wall => {
      const distance = distanceToWall(point, wall);
      if (distance < minDistance && distance < 50) {
        minDistance = distance;
        nearestWall = wall;
      }
    });
    
    return nearestWall;
  };
  
  const distanceToWall = (point: { x: number; y: number }, wall: any) => {
    const { start, end } = wall;
    
    const wallVector = {
      x: end.x - start.x,
      y: end.y - start.y
    };
    
    const pointVector = {
      x: point.x - start.x,
      y: point.y - start.y
    };
    
    const wallLengthSq = wallVector.x * wallVector.x + wallVector.y * wallVector.y;
    
    if (wallLengthSq === 0) {
      return Math.sqrt(pointVector.x * pointVector.x + pointVector.y * pointVector.y);
    }
    
    const t = (pointVector.x * wallVector.x + pointVector.y * wallVector.y) / wallLengthSq;
    
    const clampedT = Math.max(0, Math.min(1, t));
    
    const closestPoint = {
      x: start.x + clampedT * wallVector.x,
      y: start.y + clampedT * wallVector.y
    };
    
    return Math.sqrt(
      Math.pow(point.x - closestPoint.x, 2) + 
      Math.pow(point.y - closestPoint.y, 2)
    );
  };
  
  const calculatePositionOnWall = (point: { x: number; y: number }, wall: any) => {
    const { start, end } = wall;
    
    const wallVector = {
      x: end.x - start.x,
      y: end.y - start.y
    };
    
    const pointVector = {
      x: point.x - start.x,
      y: point.y - start.y
    };
    
    const wallLengthSq = wallVector.x * wallVector.x + wallVector.y * wallVector.y;
    
    const t = (pointVector.x * wallVector.x + pointVector.y * wallVector.y) / wallLengthSq;
    
    return Math.max(0, Math.min(1, t));
  };
  
  const handleItemSelect = (id: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelectedItemId(id);
  };
  
  const handleItemDrag = (id: string, type: 'cabinet' | 'appliance' | 'door' | 'window', newPosition: { x: number; y: number }) => {
    if (type === 'cabinet') {
      const cabinet = cabinets.find(c => c.id === id);
      if (cabinet) {
        updateCabinet({
          ...cabinet,
          position: newPosition
        });
      }
    } else if (type === 'appliance') {
      const appliance = appliances.find(a => a.id === id);
      if (appliance) {
        updateAppliance({
          ...appliance,
          position: newPosition
        });
      }
    } else if (type === 'door') {
      const door = doors.find(d => d.id === id);
      const wall = door ? walls.find(w => w.id === door.wallId) : null;
      
      if (door && wall) {
        updateDoor({
          ...door,
          position: calculatePositionOnWall(newPosition, wall)
        });
      }
    } else if (type === 'window') {
      const window = windows.find(w => w.id === id);
      const wall = window ? walls.find(w => w.id === window.wallId) : null;
      
      if (window && wall) {
        updateWindow({
          ...window,
          position: calculatePositionOnWall(newPosition, wall)
        });
      }
    }
  };
  
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    
    const limitedScale = Math.max(0.1, Math.min(5, newScale));
    
    setScale(limitedScale);
    
    setPosition({
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    });
  };
  
  const renderWalls = () => {
    return walls.map(wall => (
      <Group key={wall.id}>
        <Line
          points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
          stroke={selectedItemId === wall.id ? "#3b82f6" : "#000000"}
          strokeWidth={15}
          onClick={(e) => handleItemSelect(wall.id, e)}
        />
        
        {showDimensions && (
          <Text
            x={(wall.start.x + wall.end.x) / 2}
            y={(wall.start.y + wall.end.y) / 2}
            text={`${Math.round(Math.sqrt(
              Math.pow(wall.end.x - wall.start.x, 2) + 
              Math.pow(wall.end.y - wall.start.y, 2)
            ))} cm`}
            fontSize={16}
            fill="#000"
            offsetX={20}
            offsetY={20}
          />
        )}
      </Group>
    ));
  };
  
  const renderDoors = () => {
    return doors.map(door => {
      const wall = walls.find(w => w.id === door.wallId);
      if (!wall) return null;
      
      const wallVector = {
        x: wall.end.x - wall.start.x,
        y: wall.end.y - wall.start.y
      };
      
      const doorPosition = {
        x: wall.start.x + door.position * wallVector.x,
        y: wall.start.y + door.position * wallVector.y
      };
      
      const wallAngle = Math.atan2(wallVector.y, wallVector.x) * 180 / Math.PI;
      
      return (
        <Group 
          key={door.id}
          x={doorPosition.x}
          y={doorPosition.y}
          rotation={wallAngle}
          draggable
          onDragMove={(e) => {
            handleItemDrag(door.id, 'door', {
              x: e.target.x(),
              y: e.target.y()
            });
          }}
          onClick={(e) => handleItemSelect(door.id, e)}
        >
          <Rect
            width={door.width}
            height={15}
            fill={selectedItemId === door.id ? "#3b82f6" : "#a1a1aa"}
            offsetX={door.width / 2}
            offsetY={7.5}
          />
          <Line
            points={[0, 0, door.width * 0.8, door.width * 0.8]}
            stroke={selectedItemId === door.id ? "#3b82f6" : "#a1a1aa"}
            strokeWidth={2}
            offsetX={door.width / 2}
            offsetY={7.5}
          />
          
          {showDimensions && (
            <Text
              text={`${door.width} cm`}
              fontSize={14}
              fill="#000"
              offsetX={-20}
              offsetY={-10}
            />
          )}
        </Group>
      );
    });
  };
  
  const renderWindows = () => {
    return windows.map(window => {
      const wall = walls.find(w => w.id === window.wallId);
      if (!wall) return null;
      
      const wallVector = {
        x: wall.end.x - wall.start.x,
        y: wall.end.y - wall.start.y
      };
      
      const windowPosition = {
        x: wall.start.x + window.position * wallVector.x,
        y: wall.start.y + window.position * wallVector.y
      };
      
      const wallAngle = Math.atan2(wallVector.y, wallVector.x) * 180 / Math.PI;
      
      return (
        <Group 
          key={window.id}
          x={windowPosition.x}
          y={windowPosition.y}
          rotation={wallAngle}
          draggable
          onDragMove={(e) => {
            handleItemDrag(window.id, 'window', {
              x: e.target.x(),
              y: e.target.y()
            });
          }}
          onClick={(e) => handleItemSelect(window.id, e)}
        >
          <Rect
            width={window.width}
            height={15}
            fill={selectedItemId === window.id ? "#3b82f6" : "#bfdbfe"}
            offsetX={window.width / 2}
            offsetY={7.5}
          />
          
          {showDimensions && (
            <Text
              text={`${window.width} cm`}
              fontSize={14}
              fill="#000"
              offsetX={-20}
              offsetY={-10}
            />
          )}
        </Group>
      );
    });
  };
  
  const renderCabinets = () => {
    return cabinets.map(cabinet => (
      <Group
        key={cabinet.id}
        x={cabinet.position.x}
        y={cabinet.position.y}
        rotation={cabinet.rotation}
        draggable
        onDragMove={(e) => {
          handleItemDrag(cabinet.id, 'cabinet', {
            x: e.target.x(),
            y: e.target.y()
          });
        }}
        onClick={(e) => handleItemSelect(cabinet.id, e)}
      >
        <Rect
          width={cabinet.width}
          height={cabinet.depth}
          fill={selectedItemId === cabinet.id ? "#3b82f6" : getCabinetColor(cabinet)}
          stroke="#000"
          strokeWidth={1}
          cornerRadius={2}
          offsetX={cabinet.width / 2}
          offsetY={cabinet.depth / 2}
        />
        
        {cabinet.type === 'base' && (
          <Rect
            width={cabinet.width - 10}
            height={cabinet.depth - 10}
            fill="#fff"
            offsetX={(cabinet.width - 10) / 2}
            offsetY={(cabinet.depth - 10) / 2}
          />
        )}
        
        {cabinet.type === 'wall' && (
          <Circle
            radius={10}
            fill="#fff"
            offsetX={0}
            offsetY={0}
          />
        )}
        
        {cabinet.type === 'tall' && (
          <Line
            points={[
              -cabinet.width / 2 + 10, -cabinet.depth / 2 + 10,
              cabinet.width / 2 - 10, cabinet.depth / 2 - 10
            ]}
            stroke="#fff"
            strokeWidth={3}
          />
        )}
        
        {showDimensions && (
          <>
            <Text
              text={`${cabinet.width} x ${cabinet.depth} cm`}
              fontSize={14}
              fill="#000"
              offsetX={0}
              offsetY={-cabinet.depth / 2 - 10}
              align="center"
            />
            <Text
              text={cabinet.type}
              fontSize={12}
              fill="#000"
              offsetX={0}
              offsetY={cabinet.depth / 2 + 15}
              align="center"
            />
          </>
        )}
      </Group>
    ));
  };
  
  const getCabinetColor = (cabinet: Cabinet) => {
    if (cabinet.color === 'white') return "#f9fafb";
    if (cabinet.color === 'brown') return "#92400e";
    if (cabinet.color === 'black') return "#1f2937";
    if (cabinet.color === 'grey') return "#9ca3af";
    return "#f9fafb";
  };
  
  const renderAppliances = () => {
    return appliances.map(appliance => (
      <Group
        key={appliance.id}
        x={appliance.position.x}
        y={appliance.position.y}
        rotation={appliance.rotation}
        draggable
        onDragMove={(e) => {
          handleItemDrag(appliance.id, 'appliance', {
            x: e.target.x(),
            y: e.target.y()
          });
        }}
        onClick={(e) => handleItemSelect(appliance.id, e)}
      >
        <Rect
          width={appliance.width}
          height={appliance.depth}
          fill={selectedItemId === appliance.id ? "#3b82f6" : getApplianceColor(appliance)}
          stroke="#000"
          strokeWidth={1}
          cornerRadius={2}
          offsetX={appliance.width / 2}
          offsetY={appliance.depth / 2}
        />
        
        {appliance.type === 'sink' && (
          <Circle
            radius={appliance.width / 4}
            fill="#d1d5db"
            offsetX={0}
            offsetY={0}
          />
        )}
        
        {appliance.type === 'stove' && (
          <Group>
            <Circle
              radius={8}
              fill="#1f2937"
              offsetX={-appliance.width / 4}
              offsetY={-appliance.depth / 4}
            />
            <Circle
              radius={8}
              fill="#1f2937"
              offsetX={appliance.width / 4}
              offsetY={-appliance.depth / 4}
            />
            <Circle
              radius={8}
              fill="#1f2937"
              offsetX={-appliance.width / 4}
              offsetY={appliance.depth / 4}
            />
            <Circle
              radius={8}
              fill="#1f2937"
              offsetX={appliance.width / 4}
              offsetY={appliance.depth / 4}
            />
          </Group>
        )}
        
        {appliance.type === 'fridge' && (
          <Rect
            width={appliance.width - 20}
            height={appliance.depth - 20}
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth={1}
            offsetX={(appliance.width - 20) / 2}
            offsetY={(appliance.depth - 20) / 2}
          />
        )}
        
        {showDimensions && (
          <>
            <Text
              text={`${appliance.width} x ${appliance.depth} cm`}
              fontSize={14}
              fill="#000"
              offsetX={0}
              offsetY={-appliance.depth / 2 - 10}
              align="center"
            />
            <Text
              text={appliance.type}
              fontSize={12}
              fill="#000"
              offsetX={0}
              offsetY={appliance.depth / 2 + 15}
              align="center"
            />
          </>
        )}
      </Group>
    ));
  };
  
  const getApplianceColor = (appliance: Appliance) => {
    if (appliance.type === 'sink') return "#e5e7eb";
    if (appliance.type === 'stove') return "#d1d5db";
    if (appliance.type === 'fridge') return "#f3f4f6";
    if (appliance.type === 'dishwasher') return "#e5e7eb";
    if (appliance.type === 'oven') return "#d1d5db";
    if (appliance.type === 'microwave') return "#e5e7eb";
    return "#f3f4f6";
  };
  
  const renderRoom = () => {
    if (!room.width || !room.height) return null;
    
    return (
      <Rect
        x={-room.width / 2}
        y={-room.height / 2}
        width={room.width}
        height={room.height}
        stroke="#d1d5db"
        strokeWidth={1}
        dash={[10, 10]}
        fill="#f9fafb"
      />
    );
  };
  
  const renderGrid = () => {
    const gridSize = 50;
    const gridWidth = room.width > 0 ? room.width * 2 : 2000;
    const gridHeight = room.height > 0 ? room.height * 2 : 2000;
    
    const lines = [];
    
    for (let x = -gridWidth / 2; x <= gridWidth / 2; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, -gridHeight / 2, x, gridHeight / 2]}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    
    for (let y = -gridHeight / 2; y <= gridHeight / 2; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[-gridWidth / 2, y, gridWidth / 2, y]}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    
    lines.push(
      <Line
        key="center-h"
        points={[-gridWidth / 2, 0, gridWidth / 2, 0]}
        stroke="#d1d5db"
        strokeWidth={2}
      />
    );
    
    lines.push(
      <Line
        key="center-v"
        points={[0, -gridHeight / 2, 0, gridHeight / 2]}
        stroke="#d1d5db"
        strokeWidth={2}
      />
    );
    
    return lines;
  };
  
  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      draggable={currentToolMode === 'select' as ToolMode}
      onWheel={handleWheel}
      onClick={handleStageClick}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      scale={{ x: scale, y: scale }}
      position={position}
    >
      <Layer>
        {renderGrid()}
        {renderRoom()}
        {renderWalls()}
        {renderDoors()}
        {renderWindows()}
        {renderCabinets()}
        {renderAppliances()}
        
        {currentToolMode === ('wall' as ToolMode) && startPoint && (
          <Line
            points={[
              startPoint.x,
              startPoint.y,
              stageRef.current?.getPointerPosition().x / scale - position.x / scale,
              stageRef.current?.getPointerPosition().y / scale - position.y / scale
            ]}
            stroke="#3b82f6"
            strokeWidth={3}
            dash={[10, 5]}
          />
        )}
      </Layer>
    </Stage>
  );
};

export default TopView;
