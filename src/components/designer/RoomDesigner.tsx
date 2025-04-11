
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useKitchenStore } from "@/store/kitchenStore";
import { toast } from "sonner";
import TopView from "./TopView";
import ThreeDView from "./ThreeDView";
import ElevationView from "./ElevationView";

const RoomDesigner = () => {
  const { viewMode, room } = useKitchenStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      toast.info("Designer loaded. Start by defining your room dimensions.");
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
  return (
    <div ref={containerRef} className="w-full h-full">
      {viewMode === '2d-top' && (
        <TopView />
      )}
      
      {viewMode === '2d-elevation' && (
        <ElevationView />
      )}
      
      {viewMode === '3d' && (
        <Canvas shadows>
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048}
          />
          <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
          />
          <ThreeDView />
        </Canvas>
      )}
    </div>
  );
};

export default RoomDesigner;
