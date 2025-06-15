
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Stats } from "@react-three/drei";
import { useKitchenStore } from "@/store/kitchenStore";
import { toast } from "sonner";
import TopView from "./top-view";
import ThreeDView from "./ThreeDView";
import ElevationView from "./ElevationView";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { RotateCw, ZoomIn, ZoomOut, Home, Eye, Settings } from "lucide-react";

const RoomDesigner = () => {
  const { viewMode, room, walls, currentToolMode, setSelectedItemId } = useKitchenStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high'>('high');
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isInitialized) {
      if (walls.length === 0) {
        toast.info("Click on 'Room' to start by defining your room dimensions.");
      }
      setIsInitialized(true);
    }
  }, [isInitialized, walls]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setSelectedItemId(null);
    }
  };
  
  const maxRoomDimension = Math.max(room.width || 300, room.height || 400);
  const cameraDistance = maxRoomDimension * (isMobile ? 2 : 1.5);
  
  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const qualitySettings = {
    low: { dpr: [0.5, 1] as [number, number], antialias: false, shadows: false },
    medium: { dpr: [1, 1.5] as [number, number], antialias: true, shadows: true },
    high: { dpr: [1, 2] as [number, number], antialias: true, shadows: true }
  };

  const currentQuality = qualitySettings[renderQuality];
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative" 
      onClick={handleCanvasClick}
    >
      {viewMode === '2d-top' && <TopView />}
      {viewMode === '2d-elevation' && <ElevationView />}
      
      {viewMode === '3d' && (
        <>
          <Canvas 
            shadows={currentQuality.shadows} 
            gl={{ 
              antialias: currentQuality.antialias, 
              alpha: false, 
              powerPreference: 'high-performance'
            }}
            dpr={currentQuality.dpr}
            camera={{ 
              position: [cameraDistance, cameraDistance * 0.8, cameraDistance], 
              fov: isMobile ? 60 : 50 
            }}
            style={{ background: '#f0f4f8' }}
            performance={{ min: 0.8 }}
          >
            <color attach="background" args={['#f0f4f8']} />
            
            <PerspectiveCamera 
              makeDefault 
              position={[cameraDistance, cameraDistance * 0.8, cameraDistance]} 
              fov={isMobile ? 60 : 50}
              near={0.1}
              far={cameraDistance * 5}
            />
            
            <OrbitControls 
              ref={controlsRef}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2.2}
              target={[room.width / 2, 0, room.height / 2]}
              maxDistance={cameraDistance * 2.5}
              minDistance={50}
              zoomSpeed={1.2}
              rotateSpeed={0.8}
              panSpeed={1.0}
              enableDamping={true}
              dampingFactor={0.05}
            />
            
            <Environment preset="studio" background={false} />
            
            <ThreeDView />
            
            {showStats && <Stats />}
          </Canvas>

          {/* 3D Controls Panel */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetCamera}
                className="flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                {!isMobile && "Reset View"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setWireframe(!wireframe)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                {!isMobile && (wireframe ? "Solid" : "Wireframe")}
              </Button>
            </div>
            
            {!isMobile && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Quality:</span>
                <select 
                  value={renderQuality} 
                  onChange={(e) => setRenderQuality(e.target.value as any)}
                  className="text-xs border rounded px-1 py-0.5"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-1 w-full"
            >
              <Settings className="h-4 w-4" />
              {!isMobile && (showStats ? "Hide Stats" : "Show Stats")}
            </Button>
          </div>

          {/* Camera Info */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
            3D View - Drag to rotate, scroll to zoom
          </div>
        </>
      )}

      {/* Tool mode helper message */}
      {viewMode !== '3d' && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-full text-xs shadow-md opacity-80 pointer-events-none">
          {currentToolMode === 'select' && "Click and drag to move objects. Select items to edit properties."}
          {currentToolMode === 'wall' && "Click to start a wall, click again to end."}
          {currentToolMode === 'door' && "Click near a wall to place a door."}
          {currentToolMode === 'window' && "Click near a wall to place a window."}
          {currentToolMode === 'cabinet' && "Click to place a cabinet."}
          {currentToolMode === 'appliance' && "Click to place an appliance."}
          {currentToolMode === 'room' && "Define room dimensions in the dialog."}
        </div>
      )}
    </div>
  );
};

export default RoomDesigner;
