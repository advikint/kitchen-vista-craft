
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Rect, Line, Text } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { KonvaEventObject } from "konva/lib/Node";

interface WindowsLayerProps {
  showDimensions: boolean;
}

const WindowsLayer = ({ showDimensions }: WindowsLayerProps) => {
  const { windows, walls, selectedItemId } = useKitchenStore();
  const { 
    handleItemSelect, 
    handleDragStart, 
    handleDragMove, 
    handleDragEnd,
    isNearWall,
    nearestWallId
  } = useItemInteractions();
  
  // Render snap guidelines
  const renderSnapGuides = (windowId: string, wallId: string) => {
    if (!isNearWall || selectedItemId !== windowId) return null;
    
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
      {windows.map(window => {
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
            onClick={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(window.id, e)}
            onTap={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(window.id, e)}
            onDragStart={() => handleDragStart()}
            onDragMove={(e) => handleDragMove(window.id, e.target.position(), "window")}
            onDragEnd={(e) => handleDragEnd(window.id, e.target.position(), "window")}
          >
            {/* Window frame */}
            <Rect
              width={window.width}
              height={15}
              fill={selectedItemId === window.id ? "#3b82f6" : "#bfdbfe"}
              offsetX={window.width / 2}
              offsetY={0}
              stroke="#000"
              strokeWidth={1}
            />
            
            {/* Window glass */}
            <Rect
              width={window.width - 6}
              height={9}
              fill="#e0f2fe"
              stroke="#fff"
              strokeWidth={1}
              offsetX={(window.width - 6) / 2}
              offsetY={0}
            />
            
            {/* Window panes */}
            <Line
              points={[
                -window.width / 2 + window.width * 0.33, -7.5,
                -window.width / 2 + window.width * 0.33, 7.5
              ]}
              stroke="#fff"
              strokeWidth={1}
            />
            
            <Line
              points={[
                -window.width / 2 + window.width * 0.66, -7.5,
                -window.width / 2 + window.width * 0.66, 7.5
              ]}
              stroke="#fff"
              strokeWidth={1}
            />
            
            {showDimensions && (
              <Text
                text={`${window.width} cm`}
                fontSize={14}
                fill="#000"
                offsetX={0}
                offsetY={-25}
                background="#ffffff99"
                padding={2}
              />
            )}
            
            {selectedItemId === window.id && (
              <Text
                text={`${window.type} (${window.sillHeight}cm sill)`}
                fontSize={10}
                fill="#000"
                background="#ffffff99"
                padding={2}
                offsetX={0}
                offsetY={-45}
              />
            )}
            
            {/* Render snap guides */}
            {renderSnapGuides(window.id, window.wallId)}
          </Group>
        );
      })}
    </>
  );
};

export default WindowsLayer;
