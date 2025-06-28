import { useState } from "react";
import { useKitchenStore, Appliance } from "@/store/kitchenStore";
import { Group, Rect, Circle, Text, Line } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from 'konva/lib/types';

// Handle Style Constants
const HANDLE_SIZE = 8;
const HANDLE_FILL = '#007bff';
const HANDLE_STROKE = '#FFFFFF';
const HANDLE_STROKE_WIDTH = 1;
const MIN_ITEM_DIMENSION = 10; // Standardized constant name

// Types for resizing state
interface ResizingInfo {
  itemId: string;
  handleName: string;
  initialRect: { x: number; y: number; width: number; depth: number; rotation: number };
  startPointerPos: Vector2d;
}

interface PreviewGeo {
    id: string;
    x: number;
    y: number;
    width: number;
    depth: number;
    rotation: number;
}

interface AppliancesLayerProps {
  showDimensions: boolean;
}

const AppliancesLayer = ({ showDimensions }: AppliancesLayerProps) => {
  const { appliances, selectedItemId, walls, updateAppliance, gridSize } = useKitchenStore(); // Added gridSize
  const { 
    handleItemSelect,
    isNearWall,
    nearestWallId
  } = useItemInteractions();

  const [resizingInfo, setResizingInfo] = useState<ResizingInfo | null>(null);
  const [previewGeo, setPreviewGeo] = useState<PreviewGeo | null>(null);
  
  const getApplianceColor = (appliance: Appliance, isSelected: boolean, isPreviewing: boolean) => {
    if (isPreviewing) return 'rgba(0,123,255,0.3)';
    if (appliance.isColliding) return 'rgba(255,0,0,0.5)';
    if (isSelected) return "#3b82f6";
    
    if (appliance.type === 'sink') return "#e5e7eb";
    if (appliance.type === 'stove') return "#d1d5db";
    if (appliance.type === 'fridge') return "#f3f4f6";
    return "#f3f4f6";
  };

  const getResizeCursor = (handleName: string, rotation: number = 0) => {
    if (handleName.includes('top-left') || handleName.includes('bottom-right')) return 'nwse-resize';
    if (handleName.includes('top-right') || handleName.includes('bottom-left')) return 'nesw-resize';
    if (handleName.includes('top') || handleName.includes('bottom')) return 'ns-resize';
    if (handleName.includes('left') || handleName.includes('right')) return 'ew-resize';
    return 'move';
  };

  const handleResizeDragStart = (e: KonvaEventObject<DragEvent>, appliance: Appliance, handleName: string) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition() || { x: 0, y: 0 };
    const currentApplianceState = {
        x: appliance.position.x,
        y: appliance.position.y,
        width: appliance.width,
        depth: appliance.depth,
        rotation: appliance.rotation || 0,
    };

    setResizingInfo({
      itemId: appliance.id,
      handleName,
      initialRect: currentApplianceState,
      startPointerPos: pointerPos,
    });
    setPreviewGeo({id: appliance.id, ...currentApplianceState});
  };

  const handleResizeDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (!resizingInfo) return;
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (!stage) return;

    const { itemId, handleName, initialRect, startPointerPos } = resizingInfo;
    const currentPointerPos = stage.getPointerPosition() || { x: 0, y: 0 };
    
    let newWidth = initialRect.width;
    let newDepth = initialRect.depth;
    let newX = initialRect.x;
    let newY = initialRect.y;

    const deltaX = currentPointerPos.x - startPointerPos.x;
    const deltaY = currentPointerPos.y - startPointerPos.y;
    
    // Logic assumes rotation = 0
    if (handleName.includes('right'))  { newWidth = initialRect.width + deltaX; }
    if (handleName.includes('left'))   { newWidth = initialRect.width - deltaX; }
    if (handleName.includes('bottom')) { newDepth = initialRect.depth + deltaY; }
    if (handleName.includes('top'))    { newDepth = initialRect.depth - deltaY; }

    if (handleName.includes('left') || handleName.includes('right')) {
        newX = initialRect.x + deltaX / 2;
    }
    if (handleName.includes('top') || handleName.includes('bottom')) {
        newY = initialRect.y + deltaY / 2;
    }

    // Apply minimum dimension constraints for live preview
    // For corner handles, both dimensions are affected already by the above logic
    newWidth = Math.max(MIN_ITEM_DIMENSION, newWidth);
    newDepth = Math.max(MIN_ITEM_DIMENSION, newDepth);

    setPreviewGeo({ id: itemId, x: newX, y: newY, width: newWidth, depth: newDepth, rotation: initialRect.rotation });
  };

  const handleResizeDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (!resizingInfo || !previewGeo) return; // Use previewGeo for final values if available
    e.cancelBubble = true;

    const { itemId, handleName, initialRect, startPointerPos } = resizingInfo;
    // Use previewGeo for the dimensions if they were updated, otherwise calculate final based on pointer
    const stage = e.target.getStage();
    if(!stage) { setResizingInfo(null); setPreviewGeo(null); return; }
    const currentPointerPos = stage.getPointerPosition() || startPointerPos;

    let calcWidth = initialRect.width;
    let calcDepth = initialRect.depth;

    const deltaX = currentPointerPos.x - startPointerPos.x;
    const deltaY = currentPointerPos.y - startPointerPos.y;

    if (handleName.includes('right')) { calcWidth = initialRect.width + deltaX; }
    if (handleName.includes('left'))  { calcWidth = initialRect.width - deltaX; }
    if (handleName.includes('bottom')){ calcDepth = initialRect.depth + deltaY; }
    if (handleName.includes('top'))   { calcDepth = initialRect.depth - deltaY; }

    let finalWidth = Math.max(MIN_ITEM_DIMENSION, calcWidth);
    let finalDepth = Math.max(MIN_ITEM_DIMENSION, calcDepth);

    let snappedWidth = Math.max(MIN_ITEM_DIMENSION, Math.round(finalWidth / gridSize) * gridSize);
    let snappedDepth = Math.max(MIN_ITEM_DIMENSION, Math.round(finalDepth / gridSize) * gridSize);

    if (snappedWidth === 0) snappedWidth = Math.max(MIN_ITEM_DIMENSION, gridSize);
    if (snappedDepth === 0) snappedDepth = Math.max(MIN_ITEM_DIMENSION, gridSize);

    let finalX = initialRect.x;
    let finalY = initialRect.y;

    if (handleName.includes('left')) {
        finalX = (initialRect.x + initialRect.width / 2) - snappedWidth / 2;
    } else if (handleName.includes('right')) {
        finalX = (initialRect.x - initialRect.width / 2) + snappedWidth / 2;
    }

    if (handleName.includes('top')) {
        finalY = (initialRect.y + initialRect.depth / 2) - snappedDepth / 2;
    } else if (handleName.includes('bottom')) {
        finalY = (initialRect.y - initialRect.depth / 2) + snappedDepth / 2;
    }

    finalX = Math.round(finalX / gridSize) * gridSize;
    finalY = Math.round(finalY / gridSize) * gridSize;

    const updatePayload: Partial<Appliance> = {
        width: snappedWidth,
        depth: snappedDepth,
    };
    // Only include position in payload if it actually changed
    if (finalX !== initialRect.x || finalY !== initialRect.y) {
        updatePayload.position = { x: finalX, y: finalY };
    }
    // updatePayload.rotation = initialRect.rotation; // if rotation needs to be re-affirmed

    updateAppliance(itemId, updatePayload);

    setResizingInfo(null);
    setPreviewGeo(null);
  };
  
  return (
    <>
      {appliances.map((appliance: Appliance) => {
        const isSelected = selectedItemId === appliance.id;
        const isResizingThis = resizingInfo && resizingInfo.itemId === appliance.id;

        const displayGeo = isResizingThis && previewGeo ? previewGeo : {
            id: appliance.id,
            x: appliance.position.x,
            y: appliance.position.y,
            width: appliance.width,
            depth: appliance.depth,
            rotation: appliance.rotation || 0
        };

        return (
        <Group
          key={appliance.id}
          id={appliance.id}
          x={displayGeo.x}
          y={displayGeo.y}
          rotation={displayGeo.rotation}
          draggable={!isResizingThis}
          offsetX={displayGeo.width / 2}
          offsetY={displayGeo.depth / 2}
          onClick={(evt: KonvaEventObject<MouseEvent>) => {
            if (resizingInfo && resizingInfo.itemId === appliance.id) return;
            evt.cancelBubble = true;
            handleItemSelect(appliance.id, evt);
          }}
          onTap={(evt: KonvaEventObject<MouseEvent>) => {
            if (resizingInfo && resizingInfo.itemId === appliance.id) return;
            evt.cancelBubble = true;
            handleItemSelect(appliance.id, evt);
          }}
          onDragStart={(evt: KonvaEventObject<MouseEvent>) => {
            evt.cancelBubble = true;
            useKitchenStore.getState().handleDragStartForItem(appliance.id, "appliance");
          }}
          onDragMove={(evt) => useKitchenStore.getState().handleDragMoveForItem(appliance.id, evt.target.position(), "appliance")}
          onDragEnd={(evt: KonvaEventObject<MouseEvent>) => {
            evt.cancelBubble = true;
            useKitchenStore.getState().handleDragEndForItem(appliance.id, evt.target.position(), "appliance");
          }}
        >
          <Rect
            x={-displayGeo.width / 2}
            y={-displayGeo.depth / 2}
            width={displayGeo.width}
            height={displayGeo.depth}
            fill={getApplianceColor(appliance, isSelected, !!isResizingThis)}
            stroke="#000"
            strokeWidth={1}
            cornerRadius={2}
            listening={!isResizingThis}
          />
          
          {appliance.type === 'sink' && (
            <Circle radius={Math.min(displayGeo.width, displayGeo.depth) / 4} fill="#d1d5db" listening={false}/>
          )}
          
          {appliance.type === 'stove' && (
            <Group listening={false}>
              {[
                { x: -displayGeo.width / 4, y: -displayGeo.depth / 4 }, { x:  displayGeo.width / 4, y: -displayGeo.depth / 4 },
                { x: -displayGeo.width / 4, y:  displayGeo.depth / 4 }, { x:  displayGeo.width / 4, y:  displayGeo.depth / 4 },
              ].map((pos, i) => (
                <Circle key={`stove-burner-${i}`} radius={Math.min(displayGeo.width, displayGeo.depth) * 0.08} fill="#1f2937" x={pos.x} y={pos.y} />
              ))}
            </Group>
          )}
          
          {appliance.type === 'fridge' && (
            <Rect x={-(displayGeo.width - 10) / 2} y={-(displayGeo.depth - 10) / 2}
              width={displayGeo.width - 10} height={displayGeo.depth - 10}
              fill="#f3f4f6" stroke="#d1d5db" strokeWidth={0.5} listening={false}
            />
          )}
          
          {showDimensions && isSelected && !isResizingThis && (
            <>
              <Text text={`${Math.round(appliance.width)}cm`} x={0} y={displayGeo.depth / 2 + 5} fontSize={10} fill="#000" align="center" offsetX={String(appliance.width).length * 3 } listening={false} />
              <Text text={`${Math.round(appliance.depth)}cm`} x={displayGeo.width / 2 + 5} y={0} fontSize={10} fill="#000" verticalAlign="middle" offsetY={5} listening={false} />
            </>
          )}
          
          {isSelected && !isResizingThis && (
            <Text text={appliance.type} fontSize={10} fill="#333" padding={2} x={0} y={-displayGeo.depth / 2 - 15} align="center" offsetX={(appliance.type.length * 10 * 0.6) / 2} listening={false} />
          )}

          {isSelected && (
            <>
              {[
                { name: 'top-left',     xPos: -displayGeo.width / 2, yPos: -displayGeo.depth / 2 },
                { name: 'top-right',    xPos:  displayGeo.width / 2, yPos: -displayGeo.depth / 2 },
                { name: 'bottom-left',  xPos: -displayGeo.width / 2, yPos:  displayGeo.depth / 2 },
                { name: 'bottom-right', xPos:  displayGeo.width / 2, yPos:  displayGeo.depth / 2 },
                { name: 'top-middle',   xPos:  0,                    yPos: -displayGeo.depth / 2 },
                { name: 'bottom-middle',xPos:  0,                    yPos:  displayGeo.depth / 2 },
                { name: 'middle-left',  xPos: -displayGeo.width / 2, yPos:  0                    },
                { name: 'middle-right', xPos:  displayGeo.width / 2, yPos:  0                    },
              ].map(handle => (
                <Rect
                  key={handle.name} name={handle.name}
                  x={handle.xPos} y={handle.yPos}
                  width={HANDLE_SIZE} height={HANDLE_SIZE}
                  fill={HANDLE_FILL} stroke={HANDLE_STROKE} strokeWidth={HANDLE_STROKE_WIDTH}
                  offsetX={HANDLE_SIZE / 2} offsetY={HANDLE_SIZE / 2}
                  draggable={true}
                  onDragStart={(e) => handleResizeDragStart(e, appliance, handle.name)}
                  onDragMove={handleResizeDragMove}
                  onDragEnd={handleResizeDragEnd}
                  onMouseEnter={(e) => { const stage = e.target.getStage(); if (stage) stage.container().style.cursor = getResizeCursor(handle.name, displayGeo.rotation); }}
                  onMouseLeave={(e) => { const stage = e.target.getStage(); if (stage) stage.container().style.cursor = 'default'; }}
                />
              ))}
            </>
          )}
        </Group>
      ))};
      {appliances.find(app => app.id === selectedItemId && isNearWall && !resizingInfo) && (() => {
          const appliance = appliances.find(app => app.id === selectedItemId);
          if (!appliance || !isNearWall) return null;
          const wall = walls.find(w => w.id === nearestWallId);
          if (!wall) return null;
           return ( <Line points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]} stroke="#3b82f680" strokeWidth={3} dash={[5, 5]} opacity={0.7} listening={false} /> );
      })()}
    </>
  );
};

export default AppliancesLayer;
