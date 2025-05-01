
import { useState } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Rect, Text } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { KonvaEventObject } from "konva/lib/Node";

interface CabinetsLayerProps {
  showDimensions: boolean;
}

const CabinetsLayer = ({ showDimensions }: CabinetsLayerProps) => {
  const { cabinets, selectedItemId } = useKitchenStore();
  const { handleItemSelect, handleItemDrag, handleItemDragEnd } = useItemInteractions();
  
  // Determine cabinet fill color based on type and selection state
  const getCabinetFill = (cabinet: any, isSelected: boolean) => {
    if (isSelected) return "#3b82f6";
    
    switch (cabinet.type) {
      case "base":
        return cabinet.frontType === 'drawer' ? "#d4e6f1" : "#aed6f1";
      case "wall":
        return "#d5f5e3";
      case "tall":
        return "#fadbd8";
      default:
        return "#e5e7eb";
    }
  };

  // Render drawer lines if the cabinet is a drawer type
  const renderDrawerLines = (cabinet: any) => {
    if (cabinet.frontType !== 'drawer' || !cabinet.drawers) return null;
    
    const drawerLines = [];
    const drawerHeight = cabinet.height / (cabinet.drawers || 1);
    
    for (let i = 1; i < cabinet.drawers; i++) {
      drawerLines.push(
        <Rect
          key={`drawer-line-${i}`}
          x={0}
          y={i * drawerHeight}
          width={cabinet.width}
          height={1}
          fill="#000"
          opacity={0.3}
        />
      );
    }
    
    return drawerLines;
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
          onClick={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(cabinet.id, e)}
          onTap={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(cabinet.id, e)}
          onDragStart={() => {}}
          onDragMove={(e) => handleItemDrag(cabinet.id, e.target.position())}
          onDragEnd={(e) => handleItemDragEnd(cabinet.id, e.target.position(), "cabinet")}
        >
          <Rect
            width={cabinet.width}
            height={cabinet.depth}
            fill={getCabinetFill(cabinet, selectedItemId === cabinet.id)}
            stroke="#000"
            strokeWidth={1}
            cornerRadius={1}
          />
          
          {/* Render drawer lines if applicable */}
          {renderDrawerLines(cabinet)}
          
          {/* Cabinet label */}
          {cabinet.width > 40 && (
            <Text
              text={`${cabinet.width}×${cabinet.depth}`}
              fontSize={12}
              fill="#000"
              align="center"
              verticalAlign="middle"
              width={cabinet.width}
              height={cabinet.depth}
            />
          )}
          
          {/* Dimensions */}
          {showDimensions && selectedItemId === cabinet.id && (
            <>
              <Text
                text={`${cabinet.width}cm`}
                x={0}
                y={cabinet.depth + 5}
                fontSize={10}
                fill="#000"
                align="center"
                width={cabinet.width}
              />
              <Text
                text={`${cabinet.depth}cm`}
                x={cabinet.width + 5}
                y={0}
                fontSize={10}
                fill="#000"
                align="left"
                height={cabinet.depth}
              />
            </>
          )}
        </Group>
      ))}
    </>
  );
};

export default CabinetsLayer;
