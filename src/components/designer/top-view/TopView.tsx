
import { useRef, useState, useEffect } from "react";
import { useKitchenStore, ToolMode } from "@/store/kitchenStore";
import { Stage, Layer, Line } from "react-konva";
import RoomGrid from "./RoomGrid";
import RoomOutline from "./RoomOutline";
import WallsLayer from "./WallsLayer";
import DoorsLayer from "./DoorsLayer";
import WindowsLayer from "./WindowsLayer";
import CabinetsLayer from "./CabinetsLayer";
import AppliancesLayer from "./AppliancesLayer";
import useTopViewHandlers from "./hooks/useTopViewHandlers";
import { useIsMobile } from "@/hooks/use-mobile";

const TopView = () => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    currentToolMode,
    setSelectedItemId,
    showDimensions
  } = useKitchenStore();
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const isMobile = useIsMobile();
  
  const {
    startPoint,
    handleStageClick,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useTopViewHandlers(stageRef, scale, position, setScale, setPosition, isDragging);

  // Update stage size when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        draggable={currentToolMode === 'select' as ToolMode}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        scale={{ x: scale, y: scale }}
        position={position}
      >
        <Layer>
          <RoomGrid />
          <RoomOutline />
          <WallsLayer showDimensions={showDimensions} />
          <DoorsLayer showDimensions={showDimensions} />
          <WindowsLayer showDimensions={showDimensions} />
          <CabinetsLayer showDimensions={showDimensions} />
          <AppliancesLayer showDimensions={showDimensions} />
          
          {currentToolMode === 'wall' && startPoint && stageRef.current && (
            <Line
              points={[
                startPoint.x,
                startPoint.y,
                stageRef.current.getPointerPosition()?.x / scale - position.x / scale || startPoint.x,
                stageRef.current.getPointerPosition()?.y / scale - position.y / scale || startPoint.y
              ]}
              stroke="#3b82f6"
              strokeWidth={3}
              dash={[10, 5]}
            />
          )}
        </Layer>
      </Stage>

      {/* Helper messages based on current tool */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-full text-xs shadow-md opacity-80 pointer-events-none">
        {currentToolMode === 'select' && "Click and drag to move objects. Select items to edit properties."}
        {currentToolMode === 'wall' && "Click to start a wall, click again to end."}
        {currentToolMode === 'door' && "Click near a wall to place a door."}
        {currentToolMode === 'window' && "Click near a wall to place a window."}
        {currentToolMode === 'cabinet' && "Click to place a cabinet."}
        {currentToolMode === 'appliance' && "Click to place an appliance."}
        {currentToolMode === 'room' && "Define room dimensions in the dialog."}
      </div>

      {/* Mobile help message */}
      {isMobile && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-full text-xs shadow-md opacity-70 pointer-events-none">
          Pinch to zoom, double-tap to reset
        </div>
      )}
    </div>
  );
};

export default TopView;
