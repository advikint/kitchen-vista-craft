
import { useMemo, useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Cabinet } from "@/store/types";
import { Text } from "@react-three/drei";
import ModelLoader from "./ModelLoader";
import CabinetModelGenerator from "./CabinetModelGenerator";

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
    // Map cabinet types and categories to GLB model URLs
    const modelMap: Record<string, string> = {
      'base-standard-base': '/models/cabinets/base-standard.glb',
      'base-sink-base': '/models/cabinets/base-sink.glb',
      'base-drawer-base': '/models/cabinets/base-drawer.glb',
      'base-corner-base': '/models/cabinets/base-corner.glb',
      'base-cooktop-base': '/models/cabinets/base-cooktop.glb',
      'wall-standard-wall': '/models/cabinets/wall-standard.glb',
      'wall-open-shelf': '/models/cabinets/wall-open-shelf.glb',
      'wall-microwave-wall': '/models/cabinets/wall-microwave.glb',
      'wall-corner-wall': '/models/cabinets/wall-corner.glb',
      'wall-glass-wall': '/models/cabinets/wall-glass.glb',
      'tall-pantry-tall': '/models/cabinets/tall-pantry.glb',
      'tall-oven-tall': '/models/cabinets/tall-oven.glb',
      'tall-fridge-tall': '/models/cabinets/tall-fridge.glb',
      'tall-broom-tall': '/models/cabinets/tall-broom.glb'
    };
    
    const key = `${cabinet.type}-${cabinet.category}`;
    return modelMap[key] || modelMap[`${cabinet.type}-standard-${cabinet.type}`];
  };

  const modelScale = useMemo(() => {
    // Scale model to match cabinet dimensions
    const baseScale = 0.01; // Adjust based on your model size
    return [
      (cabinet.width / 100) * baseScale,
      (cabinet.height / 100) * baseScale,
      (cabinet.depth / 100) * baseScale
    ] as [number, number, number];
  }, [cabinet.width, cabinet.height, cabinet.depth]);

  // Use procedural cabinet as fallback
  const fallbackCabinet = () => (
    <CabinetModelGenerator 
      cabinet={cabinet}
      isSelected={isSelected}
      onClick={onClick}
    />
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
