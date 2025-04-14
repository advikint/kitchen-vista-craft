
import { useRef, useState } from "react";
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

const TopView = () => {
  const stageRef = useRef<any>(null);
  const {
    currentToolMode,
    setSelectedItemId,
    showDimensions
  } = useKitchenStore();
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    startPoint,
    handleStageClick,
    handleWheel
  } = useTopViewHandlers(stageRef, scale, position, setScale, setPosition, isDragging);
  
  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      draggable={currentToolMode === 'select' as ToolMode}
      onWheel={handleWheel}
      onClick={handleStageClick}
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
        
        {currentToolMode === ('wall' as ToolMode) && startPoint && (
          <Line
            points={[
              startPoint.x,
              startPoint.y,
              stageRef.current?.getPointerPosition().x / scale - position.x / scale,
              stageRef.current?.getPointerPosition().y / scale - position.y / scale
            ]}
            stroke="#3b82f6"
            strokeWidth={3}
            dash={[10, 5]}
          />
        )}
      </Layer>
    </Stage>
  );
};

export default TopView;
