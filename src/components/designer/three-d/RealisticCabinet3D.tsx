
import { useMemo, useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Cabinet } from "@/store/types";
import { Text, Box } from "@react-three/drei";
import ModelLoader from "./ModelLoader";

interface RealisticCabinet3DProps {
  cabinet: Cabinet;
  isSelected: boolean;
  onClick: (event: any) => void;
}

const RealisticCabinet3D = ({ cabinet, isSelected, onClick }: RealisticCabinet3DProps) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Animate selection
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const getModelUrl = () => {
    // Map cabinet types to GLB model URLs
    const modelMap: Record<string, string> = {
      'base': '/models/cabinets/base-cabinet.glb',
      'wall': '/models/cabinets/wall-cabinet.glb',
      'tall': '/models/cabinets/tall-cabinet.glb',
      'corner': '/models/cabinets/corner-cabinet.glb'
    };
    
    return modelMap[cabinet.type] || modelMap.base;
  };

  const modelScale = useMemo(() => {
    // Scale model to match cabinet dimensions
    const baseScale = 0.1; // Adjust based on your model size
    return [
      (cabinet.width / 100) * baseScale,
      (cabinet.height / 100) * baseScale,
      (cabinet.depth / 100) * baseScale
    ] as [number, number, number];
  }, [cabinet.width, cabinet.height, cabinet.depth]);

  const fallbackCabinet = () => (
    <group>
      {/* Fallback basic cabinet when model fails to load */}
      <Box 
        args={[cabinet.width, cabinet.height, cabinet.depth]}
        position={[0, 0, 0]}
        onClick={onClick}
      >
        <meshStandardMaterial 
          color={cabinet.color} 
          roughness={0.4} 
          metalness={0.1} 
        />
      </Box>
      
      {/* Door handles */}
      <Box 
        args={[2, 8, 3]}
        position={[cabinet.width / 2 - 5, 0, cabinet.depth / 2 + 2]}
      >
        <meshStandardMaterial 
          color="#8a8a8a" 
          roughness={0.2} 
          metalness={0.8} 
        />
      </Box>
    </group>
  );

  return (
    <group 
      ref={meshRef}
      position={[
        cabinet.position.x, 
        cabinet.height / 2, 
        cabinet.position.y
      ]}
      rotation={[0, cabinet.rotation * Math.PI / 180, 0]}
    >
      <Suspense fallback={fallbackCabinet()}>
        <ModelLoader
          url={getModelUrl()}
          position={[0, 0, 0]}
          scale={modelScale}
          isSelected={isSelected}
          onClick={onClick}
        />
      </Suspense>
      
      {/* Dimension labels */}
      {isSelected && (
        <Text
          position={[0, cabinet.height / 2 + 20, 0]}
          fontSize={8}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {`${cabinet.width}×${cabinet.height}×${cabinet.depth}cm`}
        </Text>
      )}
    </group>
  );
};

export default RealisticCabinet3D;
