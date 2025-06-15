
import { useEffect, useRef } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense } from "react";
import { Environment, ContactShadows, SoftShadows } from "@react-three/drei";
import Room3D from "./Room3D";
import Cabinet3D from "./Cabinet3D";
import Appliance3D from "./Appliance3D";
import Wall3D from "./Wall3D";
import Door3D from "./Door3D";
import Window3D from "./Window3D";
import Lighting3D from "./Lighting3D";

const Advanced3DScene = () => {
  const { 
    room, walls, doors, windows, cabinets, appliances,
    selectedItemId, setSelectedItemId
  } = useKitchenStore();
  
  const { scene, camera, gl } = useThree();
  const sceneRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    // Configure renderer for high quality
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Set camera for architectural visualization
    if (camera) {
      camera.position.set(
        room.width * 0.8, 
        room.height * 0.6, 
        room.width * 0.8
      );
      camera.lookAt(room.width / 2, 0, room.height / 2);
    }
  }, [gl, camera, room]);

  const handleObjectClick = (event: any, objectId: string) => {
    event.stopPropagation();
    setSelectedItemId(objectId);
  };

  const handleSceneClick = () => {
    setSelectedItemId(null);
  };

  return (
    <Suspense fallback={null}>
      <group ref={sceneRef} onClick={handleSceneClick}>
        {/* Advanced Lighting Setup */}
        <Lighting3D />
        
        {/* Environment for realistic reflections */}
        <Environment preset="apartment" background={false} />
        
        {/* Soft shadows for realism */}
        <ContactShadows
          position={[0, -0.1, 0]}
          opacity={0.4}
          scale={Math.max(room.width, room.height) * 2}
          blur={2}
          far={Math.max(room.width, room.height)}
        />
        
        {/* Room structure */}
        <Room3D room={room} />
        
        {/* Walls with realistic materials */}
        {walls.map((wall) => (
          <Wall3D 
            key={wall.id} 
            wall={wall} 
            isSelected={selectedItemId === wall.id}
            onClick={(e) => handleObjectClick(e, wall.id)}
          />
        ))}
        
        {/* Doors with realistic hardware */}
        {doors.map((door) => {
          const wall = walls.find(w => w.id === door.wallId);
          if (!wall) return null;
          
          return (
            <Door3D 
              key={door.id} 
              door={door} 
              wall={wall}
              isSelected={selectedItemId === door.id}
              onClick={(e) => handleObjectClick(e, door.id)}
            />
          );
        })}
        
        {/* Windows with glass materials */}
        {windows.map((window) => {
          const wall = walls.find(w => w.id === window.wallId);
          if (!wall) return null;
          
          return (
            <Window3D 
              key={window.id} 
              window={window} 
              wall={wall}
              isSelected={selectedItemId === window.id}
              onClick={(e) => handleObjectClick(e, window.id)}
            />
          );
        })}
        
        {/* Cabinets with detailed models */}
        {cabinets.map((cabinet) => (
          <Cabinet3D 
            key={cabinet.id} 
            cabinet={cabinet}
            isSelected={selectedItemId === cabinet.id}
            onClick={(e) => handleObjectClick(e, cabinet.id)}
          />
        ))}
        
        {/* Appliances with brand-specific models */}
        {appliances.map((appliance) => (
          <Appliance3D 
            key={appliance.id} 
            appliance={appliance}
            isSelected={selectedItemId === appliance.id}
            onClick={(e) => handleObjectClick(e, appliance.id)}
          />
        ))}
      </group>
    </Suspense>
  );
};

export default Advanced3DScene;
