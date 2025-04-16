
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Line, Text, Rect } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { useIsMobile } from "@/hooks/use-mobile";

interface WallsLayerProps {
  showDimensions: boolean;
}

const WallsLayer = ({ showDimensions }: WallsLayerProps) => {
  const { walls, selectedItemId } = useKitchenStore();
  const { handleItemSelect } = useItemInteractions();
  const isMobile = useIsMobile();
  
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
        
        // Adjust thickness for mobile
        const wallThickness = isMobile ? 12 : 15;
        const endCapSize = isMobile ? 6 : 7.5;
        const fontSize = isMobile ? 14 : 16;
        const labelFontSize = isMobile ? 12 : 14;
        
        return (
          <Group key={wall.id}>
            <Line
              points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
              stroke={selectedItemId === wall.id ? "#3b82f6" : "#686868"}
              strokeWidth={wallThickness}
              onClick={(e) => handleItemSelect(wall.id, e)}
              onTap={(e) => handleItemSelect(wall.id, e)}
              lineCap="round"
              shadowColor="rgba(0,0,0,0.3)"
              shadowBlur={8}
              shadowOffset={{ x: 2, y: 2 }}
              shadowOpacity={0.5}
            />
            
            {/* Wall end caps - rounded corners */}
            <Rect
              x={wall.start.x - endCapSize}
              y={wall.start.y - endCapSize}
              width={endCapSize * 2}
              height={endCapSize * 2}
              fill={selectedItemId === wall.id ? "#3b82f6" : "#686868"}
              cornerRadius={endCapSize}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={3}
              shadowOffset={{ x: 1, y: 1 }}
            />
            
            <Rect
              x={wall.end.x - endCapSize}
              y={wall.end.y - endCapSize}
              width={endCapSize * 2}
              height={endCapSize * 2}
              fill={selectedItemId === wall.id ? "#3b82f6" : "#686868"}
              cornerRadius={endCapSize}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={3}
              shadowOffset={{ x: 1, y: 1 }}
            />
            
            {showDimensions && (
              <>
                <Text
                  x={midX + offsetX}
                  y={midY + offsetY}
                  text={`${Math.round(wallLength)} cm`}
                  fontSize={fontSize}
                  fill="#000"
                  padding={4}
                  background="#f8fafc"
                  cornerRadius={3}
                  align="center"
                />
                {wall.label && (
                  <Text
                    x={midX}
                    y={midY}
                    text={wall.label}
                    fontSize={labelFontSize}
                    fill="#000"
                    padding={4}
                    background="#f8fafc"
                    cornerRadius={3}
                    align="center"
                    offsetX={0}
                    offsetY={-45}
                  />
                )}
              </>
            )}
          </Group>
        );
      })}
    </>
  );
};

export default WallsLayer;
