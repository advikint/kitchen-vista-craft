
import { useKitchenStore, Appliance } from "@/store/kitchenStore";
import { Group, Rect, Circle, Text, Line } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { KonvaEventObject } from "konva/lib/Node";

interface AppliancesLayerProps {
  showDimensions: boolean;
}

const AppliancesLayer = ({ showDimensions }: AppliancesLayerProps) => {
  const { appliances, selectedItemId, walls } = useKitchenStore();
  const { 
    handleItemSelect, 
    handleDragStart, 
    handleDragMove, 
    handleDragEnd,
    isNearWall,
    nearestWallId
  } = useItemInteractions();
  
  const getApplianceColor = (appliance: Appliance) => {
    if (selectedItemId === appliance.id) return "#3b82f6";
    
    if (appliance.type === 'sink') return "#e5e7eb";
    if (appliance.type === 'stove') return "#d1d5db";
    if (appliance.type === 'fridge') return "#f3f4f6";
    if (appliance.type === 'dishwasher') return "#e5e7eb";
    if (appliance.type === 'oven') return "#d1d5db";
    if (appliance.type === 'microwave') return "#e5e7eb";
    return "#f3f4f6";
  };
  
  // Render snap guidelines for sink appliances
  const renderSnapGuides = (appliance: Appliance) => {
    if (!isNearWall || selectedItemId !== appliance.id || appliance.type !== "sink") return null;
    
    const wall = walls.find(w => w.id === nearestWallId);
    if (!wall) return null;
    
    return (
      <Line
        points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
        stroke="#3b82f680"
        strokeWidth={3}
        dash={[5, 5]}
        opacity={0.7}
        globalCompositeOperation="source-over"
      />
    );
  };
  
  return (
    <>
      {appliances.map(appliance => (
        <Group
          key={appliance.id}
          x={appliance.position.x}
          y={appliance.position.y}
          rotation={appliance.rotation}
          draggable
          onClick={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(appliance.id, e)}
          onTap={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(appliance.id, e)}
          onDragStart={() => handleDragStart()}
          onDragMove={(e) => handleDragMove(appliance.id, e.target.position(), "appliance")}
          onDragEnd={(e) => handleDragEnd(appliance.id, e.target.position(), "appliance")}
        >
          <Rect
            width={appliance.width}
            height={appliance.depth}
            fill={getApplianceColor(appliance)}
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
                background="#ffffff99"
                padding={2}
              />
              <Text
                text={appliance.type}
                fontSize={12}
                fill="#000"
                offsetX={0}
                offsetY={appliance.depth / 2 + 15}
                align="center"
                background="#ffffff99"
                padding={2}
              />
            </>
          )}
          
          {/* Render snap guides for sink appliances */}
          {renderSnapGuides(appliance)}
        </Group>
      ))}
    </>
  );
};

export default AppliancesLayer;
