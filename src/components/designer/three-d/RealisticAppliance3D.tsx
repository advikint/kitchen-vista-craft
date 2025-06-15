
import { useMemo, useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Appliance } from "@/store/types";
import { Text, Box } from "@react-three/drei";
import ModelLoader from "./ModelLoader";

interface RealisticAppliance3DProps {
  appliance: Appliance;
  isSelected: boolean;
  onClick: (event: any) => void;
}

const RealisticAppliance3D = ({ appliance, isSelected, onClick }: RealisticAppliance3DProps) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const getModelUrl = () => {
    // Map appliance types to GLB model URLs
    const modelMap: Record<string, string> = {
      'fridge': '/models/appliances/refrigerator.glb',
      'stove': '/models/appliances/stove.glb',
      'oven': '/models/appliances/oven.glb',
      'dishwasher': '/models/appliances/dishwasher.glb',
      'microwave': '/models/appliances/microwave.glb',
      'sink': '/models/appliances/kitchen-sink.glb',
      'hood': '/models/appliances/range-hood.glb'
    };
    
    return modelMap[appliance.type] || modelMap.stove;
  };

  const modelScale = useMemo(() => {
    // Scale model to match appliance dimensions
    const baseScale = 0.1;
    return [
      (appliance.width / 100) * baseScale,
      (appliance.height / 100) * baseScale,
      (appliance.depth / 100) * baseScale
    ] as [number, number, number];
  }, [appliance.width, appliance.height, appliance.depth]);

  const fallbackAppliance = () => (
    <Box 
      args={[appliance.width, appliance.height, appliance.depth]}
      position={[0, 0, 0]}
      onClick={onClick}
    >
      <meshStandardMaterial 
        color={appliance.color || "#f5f5f5"} 
        roughness={0.3} 
        metalness={0.1} 
      />
    </Box>
  );

  return (
    <group 
      ref={meshRef}
      position={[
        appliance.position.x, 
        appliance.height / 2, 
        appliance.position.y
      ]}
      rotation={[0, appliance.rotation * Math.PI / 180, 0]}
    >
      <Suspense fallback={fallbackAppliance()}>
        <ModelLoader
          url={getModelUrl()}
          position={[0, 0, 0]}
          scale={modelScale}
          isSelected={isSelected}
          onClick={onClick}
        />
      </Suspense>
      
      {/* Brand label */}
      {isSelected && appliance.brand && (
        <Text
          position={[0, appliance.height / 2 + 15, 0]}
          fontSize={6}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {appliance.brand} {appliance.type}
        </Text>
      )}
    </group>
  );
};

export default RealisticAppliance3D;
