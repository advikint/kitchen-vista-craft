
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Rect, Line, Text } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";

interface WindowsLayerProps {
  showDimensions: boolean;
}

const WindowsLayer = ({ showDimensions }: WindowsLayerProps) => {
  const { windows, walls, selectedItemId } = useKitchenStore();
  const { handleItemSelect, handleItemDrag } = useItemInteractions();
  
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
            onDragMove={(e) => {
              handleItemDrag(window.id, {
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
              stroke="#000"
              strokeWidth={1}
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

export default WindowsLayer;
