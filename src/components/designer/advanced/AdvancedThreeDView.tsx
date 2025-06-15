import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  Text,
  Html,
  Loader
} from "@react-three/drei";
import { useKitchenStore } from "@/store/kitchenStore";
import * as THREE from "three";
import { Suspense } from "react";
import { CabinetModel, ApplianceModel, CountertopModel, FlooringModel } from "./Realistic3DModels";
import ParametricDoorModel from '../objects/ParametricDoorModel'; // Added import

// Professional lighting setup
const ProfessionalLighting = () => {
  return (
    <>
      {/* Key light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-5, 8, -5]}
        intensity={0.4}
        color="#ffffff"
      />
      
      {/* Ambient light */}
      <ambientLight intensity={0.3} color="#f0f0f0" />
      
      {/* Rim light */}
      <directionalLight
        position={[0, 5, -10]}
        intensity={0.6}
        color="#e6f3ff"
      />
    </>
  );
};

// Enhanced floor with realistic materials - now using FlooringModel
const ProfessionalFloor = ({ width = 400, height = 400 }) => {
  return <FlooringModel room={{ width, height }} />;
};

// Enhanced wall with realistic materials
const ProfessionalWall = ({ wall }: { wall: any }) => {
  const start = new THREE.Vector3(wall.start.x, 0, wall.start.y);
  const end = new THREE.Vector3(wall.end.x, 0, wall.end.y);
  
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  const angle = Math.atan2(direction.z, direction.x);
  const height = wall.height || 240;

  return (
    <mesh 
      position={[center.x, height / 2, center.z]} 
      rotation={[0, angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, wall.thickness || 15]} />
      <meshStandardMaterial 
        color={wall.color || "#f5f5f5"}
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
};

// Enhanced cabinet with realistic materials and hardware - now using CabinetModel
const ProfessionalCabinet = ({ cabinet, selected = false }: { cabinet: any; selected?: boolean }) => {
  return <CabinetModel cabinet={cabinet} selected={selected} />;
};

// Enhanced appliance with realistic materials - now using ApplianceModel
const ProfessionalAppliance = ({ appliance, selected = false }: { appliance: any; selected?: boolean }) => {
  return <ApplianceModel appliance={appliance} selected={selected} />;
};

// Grid helper for professional alignment
const ProfessionalGrid = () => {
  return (
    <gridHelper 
      args={[1000, 50, "#cccccc", "#eeeeee"]} 
      position={[0, 0.1, 0]} 
    />
  );
};

// Main enhanced 3D view component
const AdvancedThreeDView = () => {
  const { room, walls, doors, cabinets, appliances, showDimensions, selectedObject } = useKitchenStore(); // Added doors

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white">
      <Canvas
        shadows
        camera={{ position: [300, 200, 300], fov: 60 }}
        gl={{ 
          antialias: true, 
          shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap },
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Suspense fallback={null}>
          {/* Professional lighting setup */}
          <ProfessionalLighting />
          
          {/* HDRI environment for realistic reflections */}
          <Environment preset="apartment" />
          
          {/* Professional floor */}
          <ProfessionalFloor width={room.width || 400} height={room.height || 400} />
          
          {/* Contact shadows for realism */}
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.4} 
            scale={1000} 
            blur={1} 
            far={400} 
          />
          
          {/* Grid for professional alignment */}
          <ProfessionalGrid />
          
          {/* Enhanced walls */}
          {walls.map((wall) => (
            <ProfessionalWall key={wall.id} wall={wall} />
          ))}
          
          {/* Realistic countertops */}
          <CountertopModel cabinets={cabinets} />
          
          {/* Enhanced cabinets */}
          {cabinets.map((cabinet) => (
            <ProfessionalCabinet 
              key={cabinet.id} 
              cabinet={cabinet} 
              selected={selectedObject?.id === cabinet.id}
            />
          ))}
          
          {/* Enhanced appliances */}
          {appliances.map((appliance) => (
            <ProfessionalAppliance 
              key={appliance.id} 
              appliance={appliance} 
              selected={selectedObject?.id === appliance.id}
            />
          ))}

          {/* Parametric Doors */}
          {doors.map((door) => {
            const wall = walls.find(w => w.id === door.wallId);
            if (!wall) return null;

            const wallDx = wall.end.x - wall.start.x;
            const wallDy = wall.end.y - wall.start.y;
            // const wallLength = Math.sqrt(wallDx * wallDx + wallDy * wallDy); // Not directly needed for position
            const wallAngleRad = Math.atan2(wallDy, wallDx);

            const doorCenterXonWall = wall.start.x + wallDx * door.position;
            const doorCenterZonWall = wall.start.y + wallDy * door.position;

            const doorPosition = new THREE.Vector3(doorCenterXonWall, 0, doorCenterZonWall);
            const doorRotation = new THREE.Euler(0, wallAngleRad, 0);

            return (
              <group
                key={door.id}
                position={doorPosition}
                rotation={doorRotation}
              >
                <ParametricDoorModel door={door} />
              </group>
            );
          })}
          
          {/* Professional camera controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={50}
            maxDistance={1000}
            maxPolarAngle={Math.PI / 2.1}
            target={[0, 0, 0]}
          />
          
          {/* Professional camera */}
          <PerspectiveCamera makeDefault position={[300, 200, 300]} />
        </Suspense>
      </Canvas>
      
      {/* Loading indicator */}
      <Loader />
      
      {/* Professional overlay controls */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold mb-2">Professional 3D View</h3>
        <div className="space-y-2 text-sm">
          <div>• Left click + drag: Rotate</div>
          <div>• Right click + drag: Pan</div>
          <div>• Scroll: Zoom</div>
          <div>• Double click: Focus</div>
          <div className="mt-2 pt-2 border-t">
            <div className="text-xs text-gray-600">
              Realistic materials & lighting
            </div>
          </div>
        </div>
      </div>
      
      {/* Model quality indicator */}
      <div className="absolute bottom-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2 text-white text-sm">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Realistic 3D Models</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedThreeDView;