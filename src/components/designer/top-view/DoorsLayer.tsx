
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Rect, Line, Text, Arc } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { KonvaEventObject } from "konva/lib/Node";

interface DoorsLayerProps {
  showDimensions: boolean;
}

const DoorsLayer = ({ showDimensions }: DoorsLayerProps) => {
  const { doors, walls, selectedItemId } = useKitchenStore();
  const { 
    handleItemSelect, 
    handleDragStart, 
    handleDragMove, 
    handleDragEnd,
    isNearWall,
    nearestWallId
  } = useItemInteractions();
  
  // Render snap guidelines
  const renderSnapGuides = (doorId: string, wallId: string) => {
    if (!isNearWall || selectedItemId !== doorId) return null;
    
    const wall = walls.find(w => w.id === nearestWallId);
    if (!wall) return null;
    
    return (
      <Line
        points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
        stroke="#3b82f680"
        strokeWidth={3}
        dash={[5, 5]}
        opacity={0.7}
      />
    );
  };

  return (
    <>
      {doors.map(door => {
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
            onClick={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(door.id, e)}
            onTap={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(door.id, e)}
            onDragStart={() => handleDragStart()}
            onDragMove={(e) => handleDragMove(door.id, e.target.position(), "door")}
            onDragEnd={(e) => handleDragEnd(door.id, e.target.position(), "door")}
          >
            {/* Door frame */}
            <Rect
              width={door.width}
              height={15}
              fill={selectedItemId === door.id ? "#3b82f6" : "#a1a1aa"}
              offsetX={door.width / 2}
              offsetY={0}
              stroke="#000"
              strokeWidth={1}
            />
            
            {/* Door opening arc - improved to be an actual arc */}
            <Arc
              x={0}
              y={0}
              innerRadius={0}
              outerRadius={50}
              angle={90}
              fill=""
              stroke={selectedItemId === door.id ? "#3b82f6" : "#a1a1aa"}
              strokeWidth={2}
              dash={[5, 2]}
              rotation={0}
            />
            
            {/* Door panel */}
            <Rect
              width={door.width - 4}
              height={6}
              fill="#fff"
              offsetX={(door.width - 4) / 2}
              offsetY={-3}
              stroke="#000"
              strokeWidth={0.5}
            />
            
            {showDimensions && (
              <Text
                text={`${door.width} cm`}
                fontSize={14}
                fill="#000"
                offsetX={0}
                offsetY={-25}
                background="#ffffff99"
                padding={2}
              />
            )}
            
            {selectedItemId === door.id && (
              <Text
                text={door.type}
                fontSize={10}
                fill="#000"
                background="#ffffff99"
                padding={2}
                offsetX={0}
                offsetY={-45}
              />
            )}
            
            {/* Render snap guides */}
            {renderSnapGuides(door.id, door.wallId)}
          </Group>
        );
      })}
    </>
  );
};

export default DoorsLayer;
