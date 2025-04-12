
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useKitchenStore } from "@/store/kitchenStore";
import { toast } from "sonner";
import TopView from "./TopView";
import ThreeDView from "./ThreeDView";
import ElevationView from "./ElevationView";

const RoomDesigner = () => {
  const { viewMode, room, walls, setSelectedItemId } = useKitchenStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
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
        <Canvas shadows>
          <color attach="background" args={['#f8fafc']} />
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={0.8} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048}
          />
          <PerspectiveCamera makeDefault position={[150, 150, 150]} fov={50} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />
          <ThreeDView />
        </Canvas>
      )}
    </div>
  );
};

export default RoomDesigner;
