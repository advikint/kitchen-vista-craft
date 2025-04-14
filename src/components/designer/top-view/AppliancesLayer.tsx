import { useKitchenStore, Appliance } from "@/store/kitchenStore";
import { Group, Rect, Circle, Text } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";

interface AppliancesLayerProps {
  showDimensions: boolean;
}

const AppliancesLayer = ({ showDimensions }: AppliancesLayerProps) => {
  const { appliances, selectedItemId } = useKitchenStore();
  const { handleItemSelect, handleItemDrag } = useItemInteractions();
  
  const getApplianceColor = (appliance: Appliance) => {
    if (appliance.type === 'sink') return "#e5e7eb";
    if (appliance.type === 'stove') return "#d1d5db";
    if (appliance.type === 'fridge') return "#f3f4f6";
    if (appliance.type === 'dishwasher') return "#e5e7eb";
    if (appliance.type === 'oven') return "#d1d5db";
    if (appliance.type === 'microwave') return "#e5e7eb";
    return "#f3f4f6";
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
          onDragMove={(e) => {
            handleItemDrag(appliance.id, {
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
      ))}
    </>
  );
};

export default AppliancesLayer;
