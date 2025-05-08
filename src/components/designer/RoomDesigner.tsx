
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { useKitchenStore } from "@/store/kitchenStore";
import { toast } from "sonner";
import TopView from "./top-view";
import ThreeDView from "./ThreeDView";
import ElevationView from "./ElevationView";
import { useIsMobile } from "@/hooks/use-mobile";

const RoomDesigner = () => {
  const { viewMode, room, walls, currentToolMode, setSelectedItemId } = useKitchenStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isInitialized) {
      if (walls.length === 0) {
        toast.info("Click on 'Room' to start by defining your room dimensions.");
      }
      setIsInitialized(true);
    }
  }, [isInitialized, walls]);

  // Clear selected item when clicking on empty space
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only clear if clicking directly on the canvas background
    if (e.target === containerRef.current) {
      setSelectedItemId(null);
    }
  };
  
  // Calculate max room dimension for camera positioning
  const maxRoomDimension = Math.max(room.width || 300, room.height || 400);
  const cameraDistance = maxRoomDimension * (isMobile ? 2 : 1.5);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full" 
      onClick={handleCanvasClick}
    >
      {viewMode === '2d-top' && (
        <TopView />
      )}
      
      {viewMode === '2d-elevation' && (
        <ElevationView />
      )}
      
      {viewMode === '3d' && (
        <Canvas 
          shadows={false} 
          gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
          dpr={[0.5, isMobile ? 1 : 1.5]}
          camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: isMobile ? 60 : 50 }}
          style={{ background: '#f8fafc' }}
          performance={{ min: 0.5 }}
        >
          <color attach="background" args={['#f8fafc']} />
          
          <ambientLight intensity={0.8} />
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1.0} 
          />
          
          <PerspectiveCamera 
            makeDefault 
            position={[cameraDistance, cameraDistance, cameraDistance]} 
            fov={isMobile ? 60 : 50} 
          />
          <OrbitControls 
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
            maxDistance={cameraDistance * 3}
            minDistance={20}
            zoomSpeed={1.5}
          />
          
          <ThreeDView />
        </Canvas>
      )}

      {/* Tool mode helper message */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-full text-xs shadow-md opacity-80 pointer-events-none">
        {currentToolMode === 'select' && "Click and drag to move objects. Select items to edit properties."}
        {currentToolMode === 'wall' && "Click to start a wall, click again to end."}
        {currentToolMode === 'door' && "Click near a wall to place a door."}
        {currentToolMode === 'window' && "Click near a wall to place a window."}
        {currentToolMode === 'cabinet' && "Click to place a cabinet."}
        {currentToolMode === 'appliance' && "Click to place an appliance."}
        {currentToolMode === 'room' && "Define room dimensions in the dialog."}
      </div>
    </div>
  );
};

export default RoomDesigner;
