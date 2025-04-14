
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Rect, Line, Text } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";

interface DoorsLayerProps {
  showDimensions: boolean;
}

const DoorsLayer = ({ showDimensions }: DoorsLayerProps) => {
  const { doors, walls, selectedItemId } = useKitchenStore();
  const { handleItemSelect, handleItemDrag } = useItemInteractions();
  
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
      })}
    </>
  );
};

export default DoorsLayer;
