import { useState } from "react";
import { useKitchenStore, Cabinet } from "@/store/kitchenStore";
import { Group, Rect, Text, Line } from "react-konva";
import useItemInteractions from "./hooks/useItemInteractions";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from 'konva/lib/types';

// Handle Style Constants
const HANDLE_SIZE = 8;
const HANDLE_FILL = '#007bff';
const HANDLE_STROKE = '#FFFFFF';
const HANDLE_STROKE_WIDTH = 1;
const MIN_ITEM_DIMENSION = 10; // Renamed from MIN_DIM

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

interface CabinetsLayerProps {
  showDimensions: boolean;
}

const CabinetsLayer = ({ showDimensions }: CabinetsLayerProps) => {
  const { cabinets, selectedItemId, walls, updateCabinetDimensions, updateCabinetPosition, gridSize } = useKitchenStore(); // Added gridSize
  const { 
    handleItemSelect, 
    isNearWall,
    nearestWallId
  } = useItemInteractions();

  const [resizingInfo, setResizingInfo] = useState<ResizingInfo | null>(null);
  const [previewGeo, setPreviewGeo] = useState<PreviewGeo | null>(null);


  const getCabinetFill = (cabinet: Cabinet, isSelected: boolean) => {
    if (previewGeo && previewGeo.id === cabinet.id && resizingInfo) return 'rgba(0,123,255,0.3)';
    if (cabinet.isColliding) return 'rgba(255,0,0,0.5)';
    if (isSelected) return "#3b82f6";
    
    switch (cabinet.type) {
      case "base": return cabinet.frontType === 'drawer' ? "#d4e6f1" : "#aed6f1";
      case "wall": return "#d5f5e3";
      case "tall": return "#fadbd8";
      default: return "#e5e7eb";
    }
  };

  const renderDrawerLines = (currentGeo: {width: number, depth: number, frontType?: string, drawers?: number}) => {
    if (currentGeo.frontType !== 'drawer' || !currentGeo.drawers) return null;
    const adjustedDrawerLines = [];
    const singleDrawerVisibleDepth = currentGeo.depth / (currentGeo.drawers || 1);
    for (let i = 1; i < currentGeo.drawers; i++) {
        adjustedDrawerLines.push(
          <Rect
            key={`adj-drawer-line-${i}`}
            x={-currentGeo.width / 2}
            y={-currentGeo.depth / 2 + i * singleDrawerVisibleDepth}
            width={currentGeo.width}
            height={1}
            fill="#000"
            opacity={0.3}
            listening={false}
          />
        );
      }
    return adjustedDrawerLines;
  };

  const getResizeCursor = (handleName: string, rotation: number = 0) => {
    // Simplified: Does not account for rotation yet
    if (handleName.includes('top-left') || handleName.includes('bottom-right')) return 'nwse-resize';
    if (handleName.includes('top-right') || handleName.includes('bottom-left')) return 'nesw-resize';
    if (handleName.includes('top') || handleName.includes('bottom')) return 'ns-resize';
    if (handleName.includes('left') || handleName.includes('right')) return 'ew-resize';
    return 'move';
  };

  const handleResizeDragStart = (e: KonvaEventObject<DragEvent>, cabinet: Cabinet, handleName: string) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition() || { x: 0, y: 0 };
    const currentCabinetState = {
        x: cabinet.position.x,
        y: cabinet.position.y,
        width: cabinet.width,
        depth: cabinet.depth,
        rotation: cabinet.rotation || 0,
    };

    setResizingInfo({
      itemId: cabinet.id,
      handleName,
      initialRect: currentCabinetState,
      startPointerPos: pointerPos,
    });
    setPreviewGeo({id: cabinet.id, ...currentCabinetState});
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

    // Adjust position based on which edge is moving (to keep opposite edge fixed)
    if (handleName.includes('left'))   { newX = initialRect.x + deltaX / 2; }
    else if (handleName.includes('right')) { newX = initialRect.x + deltaX / 2; }

    if (handleName.includes('top'))    { newY = initialRect.y + deltaY / 2; }
    else if (handleName.includes('bottom')) { newY = initialRect.y + deltaY / 2; }
    
    // Apply minimum dimension constraints for live preview
    if (handleName.includes('left') || handleName.includes('right') || handleName.includes('top') || handleName.includes('bottom')) {
        newWidth = Math.max(MIN_ITEM_DIMENSION, newWidth);
        newDepth = Math.max(MIN_ITEM_DIMENSION, newDepth);
    }

    setPreviewGeo({ id: itemId, x: newX, y: newY, width: newWidth, depth: newDepth, rotation: initialRect.rotation });
  };

  const handleResizeDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (!resizingInfo || !previewGeo) return;
    e.cancelBubble = true;

    const { itemId, handleName, initialRect, startPointerPos } = resizingInfo;
    const stage = e.target.getStage();
    if(!stage) { setResizingInfo(null); setPreviewGeo(null); return; }
    const currentPointerPos = stage.getPointerPosition() || startPointerPos; // Use start if somehow null

    let tempWidth = initialRect.width;
    let tempDepth = initialRect.depth;

    const deltaX = currentPointerPos.x - startPointerPos.x;
    const deltaY = currentPointerPos.y - startPointerPos.y;

    // Calculate new dimensions based on delta and handle (still assumes rotation 0)
    if (handleName.includes('right')) { tempWidth = initialRect.width + deltaX; }
    if (handleName.includes('left'))  { tempWidth = initialRect.width - deltaX; }
    if (handleName.includes('bottom')){ tempDepth = initialRect.depth + deltaY; }
    if (handleName.includes('top'))   { tempDepth = initialRect.depth - deltaY; }

    // Apply final minimum dimension constraints
    let finalWidth = Math.max(MIN_ITEM_DIMENSION, tempWidth);
    let finalDepth = Math.max(MIN_ITEM_DIMENSION, tempDepth);

    // Snap dimensions to grid
    let snappedWidth = Math.max(MIN_ITEM_DIMENSION, Math.round(finalWidth / gridSize) * gridSize);
    let snappedDepth = Math.max(MIN_ITEM_DIMENSION, Math.round(finalDepth / gridSize) * gridSize);

    if (snappedWidth === 0) snappedWidth = Math.max(MIN_ITEM_DIMENSION, gridSize);
    if (snappedDepth === 0) snappedDepth = Math.max(MIN_ITEM_DIMENSION, gridSize);

    // Recalculate position (center) based on snapped dimensions to keep the correct edge/corner anchored.
    let finalX = initialRect.x;
    let finalY = initialRect.y;

    // Anchor logic (item's position is its center)
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
    
    // Snap final position to grid
    finalX = Math.round(finalX / gridSize) * gridSize;
    finalY = Math.round(finalY / gridSize) * gridSize;
    
    updateCabinetDimensions(itemId, { width: snappedWidth, depth: snappedDepth });
    if (finalX !== initialRect.x || finalY !== initialRect.y) {
      updateCabinetPosition(itemId, { x: finalX, y: finalY });
    }

    setResizingInfo(null);
    setPreviewGeo(null);
  };

  return (
    <>
      {cabinets.map((cabinet: Cabinet) => {
        const isSelected = selectedItemId === cabinet.id;
        const isResizingThis = resizingInfo && resizingInfo.itemId === cabinet.id && previewGeo;

        const displayGeo = isResizingThis && previewGeo ? previewGeo : {
            id: cabinet.id,
            x: cabinet.position.x,
            y: cabinet.position.y,
            width: cabinet.width,
            depth: cabinet.depth,
            rotation: cabinet.rotation || 0
        };

        return (
        <Group
          key={cabinet.id}
          id={cabinet.id}
          x={displayGeo.x}
          y={displayGeo.y}
          rotation={displayGeo.rotation}
          draggable={!isResizingThis}
          offsetX={displayGeo.width / 2}
          offsetY={displayGeo.depth / 2}
          onClick={(evt: KonvaEventObject<MouseEvent>) => {
            if (resizingInfo && resizingInfo.itemId === cabinet.id) return;
            evt.cancelBubble = true;
            handleItemSelect(cabinet.id, evt);
          }}
          onTap={(evt: KonvaEventObject<MouseEvent>) => {
            if (resizingInfo && resizingInfo.itemId === cabinet.id) return;
            evt.cancelBubble = true;
            handleItemSelect(cabinet.id, evt);
          }}
          onDragStart={(evt) => {
            evt.cancelBubble = true;
            // Using the specific drag handlers from useKitchenStore for main item drag
            useKitchenStore.getState().handleDragStartForItem(cabinet.id, "cabinet");
          }}
          onDragMove={(evt) => useKitchenStore.getState().handleDragMoveForItem(cabinet.id, evt.target.position(), "cabinet")}
          onDragEnd={(evt) => {
            evt.cancelBubble = true;
            useKitchenStore.getState().handleDragEndForItem(cabinet.id, evt.target.position(), "cabinet");
          }}
        >
          <Rect
            x={-displayGeo.width / 2}
            y={-displayGeo.depth / 2}
            width={displayGeo.width}
            height={displayGeo.depth}
            fill={getCabinetFill(cabinet, isSelected && !isResizingThis)}
            stroke="#000"
            strokeWidth={1}
            cornerRadius={1}
            listening={!isResizingThis} // Disable listening on main rect if resizing to prevent interference
          />
          
          {renderDrawerLines(displayGeo)}
          
          {displayGeo.width > 40 && (
            <Text
              text={`${Math.round(displayGeo.width)}×${Math.round(displayGeo.depth)}`}
              fontSize={10} fill="#000" align="center" verticalAlign="middle"
              width={displayGeo.width} height={displayGeo.depth} listening={false}
            />
          )}
          
          {showDimensions && isSelected && !isResizingThis && (
            <>
              <Text text={`${Math.round(cabinet.width)}cm`} x={0} y={displayGeo.depth / 2 + 5} fontSize={10} fill="#000" align="center" offsetX={String(cabinet.width).length * 3 } listening={false} />
              <Text text={`${Math.round(cabinet.depth)}cm`} x={displayGeo.width / 2 + 5} y={0} fontSize={10} fill="#000" verticalAlign="middle" offsetY={5} listening={false} />
            </>
          )}
          
          {isSelected && !isResizingThis && (
            <Text text={cabinet.type} fontSize={10} fill="#333" padding={2} x={0} y={-displayGeo.depth / 2 - 15} align="center" offsetX={(cabinet.type.length * 10 * 0.6) / 2} listening={false} />
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
                  onDragStart={(e) => handleResizeDragStart(e, cabinet, handle.name)}
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
      {cabinets.find(c => c.id === selectedItemId && isNearWall && !resizingInfo) && (() => {
          const cabinet = cabinets.find(c => c.id === selectedItemId);
          if (!cabinet) return null;
          const wall = walls.find(w => w.id === nearestWallId);
          if (!wall) return null;
           return ( <Line points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]} stroke="#3b82f680" strokeWidth={3} dash={[5, 5]} opacity={0.7} listening={false} /> );
      })()}
    </>
  );
};

export default CabinetsLayer;
