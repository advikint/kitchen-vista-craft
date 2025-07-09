import { useRef, useState, useEffect } from "react";
import { useKitchenStore, ToolMode, Wall, Room } from "@/store/kitchenStore";
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
    showDimensions,
    room,
    walls
  } = useKitchenStore();
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isStageKonvaDragging, setIsStageKonvaDragging] = useState(false); // For Konva's internal stage drag
  const [stageSize, setStageSize] = useState({ width: typeof window !== "undefined" ? window.innerWidth : 800, height: typeof window !== "undefined" ? window.innerHeight : 600 });
  const isMobile = useIsMobile();
  
  const {
    startPoint,
    handleStageClick,
    handleWheel,
    handleTouchStart,
    handleTouchMove, // This is now pan-aware for single touch drag if isPanning is true in hook
    handleTouchEnd,   // This is now pan-aware for single touch end if isPanning is true in hook
    snapEnabled,
    setSnapEnabled,
    // New handlers for dbl-click initiated pan
    handleStageDblClick,
    handleStagePanMove,
    handleStagePanEnd,
    // isPanning // Not directly needed by TopView, hook manages cursor etc.
  } = useTopViewHandlers(
    stageRef,
    scale,
    position,
    setScale,
    setPosition,
    isStageKonvaDragging // Pass Konva's stage drag state to the hook
  );

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
  }, [containerRef]);

  const prevWallsLengthRef = useRef(walls.length);

  useEffect(() => {
    const stage = stageRef.current;
    const container = containerRef.current;

    if (stage && container && walls.length > 0 && prevWallsLengthRef.current === 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      if (walls.length > 0) {
        walls.forEach((wall: Wall) => {
          minX = Math.min(minX, wall.start.x, wall.end.x);
          maxX = Math.max(maxX, wall.start.x, wall.end.x);
          minY = Math.min(minY, wall.start.y, wall.end.y);
          maxY = Math.max(maxY, wall.start.y, wall.end.y);
        });
      } else if (room.width > 0 && room.height > 0) {
        minX = -room.width / 2; maxX = room.width / 2;
        minY = -room.height / 2; maxY = room.height / 2;
      }

      if (minX === Infinity) {
        prevWallsLengthRef.current = walls.length;
        return;
      }

      const bboxWidth = maxX - minX;
      const bboxHeight = maxY - minY;
      const bboxCenterX = minX + bboxWidth / 2;
      const bboxCenterY = minY + bboxHeight / 2;
      const viewWidth = container.clientWidth;
      const viewHeight = container.clientHeight;

      if (bboxWidth === 0 || bboxHeight === 0 || viewWidth === 0 || viewHeight === 0) {
        prevWallsLengthRef.current = walls.length;
        return;
      }

      const PADDING_WORLD_UNITS = 100;
      const scaleX = viewWidth / (bboxWidth + PADDING_WORLD_UNITS);
      const scaleY = viewHeight / (bboxHeight + PADDING_WORLD_UNITS);
      let newScale = Math.min(scaleX, scaleY);
      newScale = Math.max(0.1, Math.min(newScale, 2));

      const newX = viewWidth / 2 - bboxCenterX * newScale;
      const newY = viewHeight / 2 - bboxCenterY * newScale;

      console.log("[TopView AutoFit] New Room/Walls. BBox:", {minX, minY, maxX, maxY, bboxWidth, bboxHeight, bboxCenterX, bboxCenterY});
      console.log("[TopView AutoFit] Viewport:", {viewWidth, viewHeight});
      console.log("[TopView AutoFit] Calc Scale/Pos:", {newScale, newX, newY});

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    }
    prevWallsLengthRef.current = walls.length;
  }, [walls, room, setScale, setPosition, containerRef, stageRef]);


  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        draggable={currentToolMode === 'select' && !useKitchenStore.getState().isPanning} // Allow Konva drag only if select tool and custom pan is NOT active
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}

        onDblClick={handleStageDblClick} // For mouse double-click to initiate pan
        onDblTap={handleStageDblClick}   // For touch double-tap to initiate pan

        onMouseMove={handleStagePanMove} // For mouse-driven pan after dblclick
        onTouchMove={handleTouchMove}  // Existing handler from hook, now pan-aware (delegates to handleStagePanMove if isPanning)

        onMouseUp={handleStagePanEnd}    // End pan on mouse up
        onTouchEnd={handleTouchEnd}    // Existing handler from hook, now pan-aware for release
        onMouseLeave={handleStagePanEnd} // End pan if mouse leaves stage

        onDragStart={() => setIsStageKonvaDragging(true)} // Konva's built-in drag
        onDragEnd={() => setIsStageKonvaDragging(false)}  // Konva's built-in drag
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
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
                (stageRef.current.getPointerPosition()?.x - position.x) / scale || startPoint.x,
                (stageRef.current.getPointerPosition()?.y - position.y) / scale || startPoint.y
              ]}
              stroke="#3b82f6"
              strokeWidth={3}
              dash={[10, 5]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-full text-xs shadow-md opacity-80 pointer-events-none">
        {currentToolMode === 'select' && "Click items to select. Double-click stage & drag to pan."}
        {currentToolMode === 'wall' && (startPoint ? "Click to end wall." : "Click to start a wall.")}
        {currentToolMode === 'door' && "Click on a wall to place a door."}
        {currentToolMode === 'window' && "Click on a wall to place a window."}
        {currentToolMode === 'cabinet' && "Click to place a cabinet. Snaps to grid or walls."}
        {currentToolMode === 'appliance' && "Click to place an appliance. Snaps to grid."}
        {currentToolMode === 'room' && "Define room dimensions in the dialog."}
      </div>

      {isMobile && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-full text-xs shadow-md opacity-70 pointer-events-none">
          Pinch zoom. Double-tap & drag to pan. Double-tap stage to reset.
        </div>
      )}

      <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 opacity-90">
        <label className="flex items-center text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => setSnapEnabled(e.target.checked)}
            className="mr-2"
          />
          Snap to grid/walls
        </label>
      </div>
    </div>
  );
};

export default TopView;
