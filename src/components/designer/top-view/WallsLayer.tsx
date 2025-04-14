
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Line, Text } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";

interface WallsLayerProps {
  showDimensions: boolean;
}

const WallsLayer = ({ showDimensions }: WallsLayerProps) => {
  const { walls, selectedItemId } = useKitchenStore();
  const { handleItemSelect } = useItemInteractions();
  
  return (
    <>
      {walls.map(wall => (
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
      ))}
    </>
  );
};

export default WallsLayer;
