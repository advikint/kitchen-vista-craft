
import { useKitchenStore, Cabinet } from "@/store/kitchenStore";
import { Group, Rect, Line, Circle, Text } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";

interface CabinetsLayerProps {
  showDimensions: boolean;
}

const CabinetsLayer = ({ showDimensions }: CabinetsLayerProps) => {
  const { cabinets, selectedItemId } = useKitchenStore();
  const { handleItemSelect, handleItemDrag } = useItemInteractions();
  
  const getCabinetColor = (cabinet: Cabinet) => {
    if (cabinet.color === 'white') return "#f9fafb";
    if (cabinet.color === 'brown') return "#92400e";
    if (cabinet.color === 'black') return "#1f2937";
    if (cabinet.color === 'grey') return "#9ca3af";
    return "#f9fafb";
  };
  
  return (
    <>
      {cabinets.map(cabinet => (
        <Group
          key={cabinet.id}
          x={cabinet.position.x}
          y={cabinet.position.y}
          rotation={cabinet.rotation}
          draggable
          onDragMove={(e) => {
            handleItemDrag(cabinet.id, 'cabinet', {
              x: e.target.x(),
              y: e.target.y()
            });
          }}
          onClick={(e) => handleItemSelect(cabinet.id, e)}
        >
          <Rect
            width={cabinet.width}
            height={cabinet.depth}
            fill={selectedItemId === cabinet.id ? "#3b82f6" : getCabinetColor(cabinet)}
            stroke="#000"
            strokeWidth={1}
            cornerRadius={2}
            offsetX={cabinet.width / 2}
            offsetY={cabinet.depth / 2}
          />
          
          {cabinet.type === 'base' && (
            <Rect
              width={cabinet.width - 10}
              height={cabinet.depth - 10}
              fill="#fff"
              offsetX={(cabinet.width - 10) / 2}
              offsetY={(cabinet.depth - 10) / 2}
            />
          )}
          
          {cabinet.type === 'wall' && (
            <Circle
              radius={10}
              fill="#fff"
              offsetX={0}
              offsetY={0}
            />
          )}
          
          {cabinet.type === 'tall' && (
            <Line
              points={[
                -cabinet.width / 2 + 10, -cabinet.depth / 2 + 10,
                cabinet.width / 2 - 10, cabinet.depth / 2 - 10
              ]}
              stroke="#fff"
              strokeWidth={3}
            />
          )}
          
          {showDimensions && (
            <>
              <Text
                text={`${cabinet.width} x ${cabinet.depth} cm`}
                fontSize={14}
                fill="#000"
                offsetX={0}
                offsetY={-cabinet.depth / 2 - 10}
                align="center"
              />
              <Text
                text={cabinet.type}
                fontSize={12}
                fill="#000"
                offsetX={0}
                offsetY={cabinet.depth / 2 + 15}
                align="center"
              />
            </>
          )}
        </Group>
      ))}
    </>
  );
};

export default CabinetsLayer;
