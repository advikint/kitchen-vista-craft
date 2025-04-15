
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Line, Text, Rect } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";

interface WallsLayerProps {
  showDimensions: boolean;
}

const WallsLayer = ({ showDimensions }: WallsLayerProps) => {
  const { walls, selectedItemId } = useKitchenStore();
  const { handleItemSelect } = useItemInteractions();
  
  return (
    <>
      {walls.map(wall => {
        const wallLength = Math.sqrt(
          Math.pow(wall.end.x - wall.start.x, 2) + 
          Math.pow(wall.end.y - wall.start.y, 2)
        );
        
        const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
        const midX = (wall.start.x + wall.end.x) / 2;
        const midY = (wall.start.y + wall.end.y) / 2;
        
        // Text offset perpendicular to wall
        const offsetX = Math.sin(angle) * 25;
        const offsetY = -Math.cos(angle) * 25;
        
        return (
          <Group key={wall.id}>
            <Line
              points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
              stroke={selectedItemId === wall.id ? "#3b82f6" : "#424242"}
              strokeWidth={15}
              onClick={(e) => handleItemSelect(wall.id, e)}
              lineCap="round"
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={5}
              shadowOffset={{ x: 2, y: 2 }}
            />
            
            {/* Wall end caps - rounded corners */}
            <Rect
              x={wall.start.x - 7.5}
              y={wall.start.y - 7.5}
              width={15}
              height={15}
              fill={selectedItemId === wall.id ? "#3b82f6" : "#424242"}
              cornerRadius={7.5}
            />
            
            <Rect
              x={wall.end.x - 7.5}
              y={wall.end.y - 7.5}
              width={15}
              height={15}
              fill={selectedItemId === wall.id ? "#3b82f6" : "#424242"}
              cornerRadius={7.5}
            />
            
            {showDimensions && (
              <Text
                x={midX + offsetX}
                y={midY + offsetY}
                text={`${Math.round(wallLength)} cm`}
                fontSize={16}
                fill="#000"
                padding={4}
                background="#f8fafc"
                cornerRadius={3}
                align="center"
              />
            )}
          </Group>
        );
      })}
    </>
  );
};

export default WallsLayer;
