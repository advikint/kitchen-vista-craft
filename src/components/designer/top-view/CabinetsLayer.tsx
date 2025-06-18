
import { useState } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { Group, Rect, Text, Line } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { KonvaEventObject } from "konva/lib/Node";

interface CabinetsLayerProps {
  showDimensions: boolean;
}

const CabinetsLayer = ({ showDimensions }: CabinetsLayerProps) => {
  const { cabinets, selectedItemId, walls } = useKitchenStore();
  const { 
    handleItemSelect, 
    handleDragStart, 
    handleDragMove, 
    handleDragEnd, 
    isNearWall,
    nearestWallId
  } = useItemInteractions();
  
  // Determine cabinet fill color based on type, selection, and collision state
  const getCabinetFill = (cabinet: any, isSelected: boolean) => {
    if (cabinet.isColliding) return 'rgba(255,0,0,0.5)'; // Collision indication
    if (isSelected) return "#3b82f6"; // Blue for selected
    
    // Default colors based on type if not colliding and not selected
    switch (cabinet.type) {
      case "base":
        return cabinet.frontType === 'drawer' ? "#d4e6f1" : "#aed6f1"; // Light blue shades
      case "wall":
        return "#d5f5e3"; // Light green
      case "tall":
        return "#fadbd8"; // Light red/pink
      default:
        return "#e5e7eb"; // Light grey
    }
  };

  // Render drawer lines if the cabinet is a drawer type
  const renderDrawerLines = (cabinet: any) => {
    if (cabinet.frontType !== 'drawer' || !cabinet.drawers) return null;
    
    const drawerLines = [];
    const drawerHeight = cabinet.depth / (cabinet.drawers || 1);
    
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

  // Render snap guidelines if the cabinet is being dragged near a wall
  const renderSnapGuides = (cabinet: any) => {
    if (!isNearWall || selectedItemId !== cabinet.id) return null;
    
    const wall = walls.find(w => w.id === nearestWallId);
    if (!wall) return null;
    
    return (
      <Line
        points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
        stroke="#3b82f680"
        strokeWidth={3}
        dash={[5, 5]}
        opacity={0.7}
      />
    );
  };

  return (
    <>
      {cabinets.map(cabinet => (
        <Group
          key={cabinet.id}
          x={cabinet.position.x}
          y={cabinet.position.y}
          rotation={cabinet.rotation || 0} // Ensure rotation is defined
          draggable={true} // Explicitly true
          offsetX={cabinet.width / 2} // Set offsetX for center-based positioning
          offsetY={cabinet.depth / 2} // Set offsetY for center-based positioning (depth is height in 2D top view)
          onClick={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(cabinet.id, e)}
          onTap={(e: KonvaEventObject<MouseEvent>) => handleItemSelect(cabinet.id, e)}
          onDragStart={() => handleDragStart()}
          onDragMove={(e) => handleDragMove(cabinet.id, e.target.position(), "cabinet")}
          onDragEnd={(e) => handleDragEnd(cabinet.id, e.target.position(), "cabinet")}
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
          
          {/* Type indicator for selected cabinet */}
          {selectedItemId === cabinet.id && (
            <Text
              text={cabinet.type}
              fontSize={10}
              fill="#000"
              background="#ffffff99"
              padding={2}
              x={cabinet.width / 2}
              y={-15}
              offsetX={cabinet.type.length * 2}
            />
          )}
          
          {/* Render snap guides if needed */}
          {renderSnapGuides(cabinet)}
        </Group>
      ))}
    </>
  );
};

export default CabinetsLayer;
