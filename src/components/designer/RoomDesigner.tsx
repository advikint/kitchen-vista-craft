import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, SoftShadows, ContactShadows } from "@react-three/drei";
import { useKitchenStore } from "@/store/kitchenStore";
import { toast } from "sonner";
import TopView from "./top-view";
import ThreeDView from "./ThreeDView";
import ElevationView from "./ElevationView";
import { useIsMobile } from "@/hooks/use-mobile";

const RoomDesigner = () => {
  const { viewMode, room, walls, setSelectedItemId } = useKitchenStore();
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
          shadows={false} // Disable shadows for better performance
          gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
          dpr={[0.5, isMobile ? 1 : 1.5]} // Reduce DPR for better performance
          camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: isMobile ? 60 : 50 }}
          style={{ background: '#f8fafc' }}
          onCreated={({ gl }) => {
            // Optimize WebGL renderer
            gl.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
            gl.setClearColor('#f8fafc', 1);
          }}
          performance={{ min: 0.5 }} // Performance optimization
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
    </div>
  );
};

export default RoomDesigner;
