
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Rect, Line, Text, Arc } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { KonvaEventObject } from "konva/lib/Node";

interface DoorsLayerProps {
  showDimensions: boolean;
}

const DoorsLayer = ({ showDimensions }: DoorsLayerProps) => {
  const { doors, walls, selectedItemId } = useKitchenStore();
  const { handleItemSelect } = useItemInteractions();
  
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
            onClick={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(door.id, e)}
            onTap={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(door.id, e)}
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
              />
            )}
          </Group>
        );
      })}
    </>
  );
};

export default DoorsLayer;
