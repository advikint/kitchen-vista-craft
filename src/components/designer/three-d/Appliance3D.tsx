
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Appliance } from "@/store/types";
import { Text } from "@react-three/drei";

interface Appliance3DProps {
  appliance: Appliance;
  isSelected: boolean;
  onClick: (event: any) => void;
}

const Appliance3D = ({ appliance, isSelected, onClick }: Appliance3DProps) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const getApplianceMaterial = () => {
    const materialMap: Record<string, any> = {
      sink: { color: "#e8e8e8", roughness: 0.1, metalness: 0.8 },
      stove: { color: "#2c2c2c", roughness: 0.2, metalness: 0.1 },
      fridge: { color: "#f5f5f5", roughness: 0.3, metalness: 0.1 },
      dishwasher: { color: "#4a4a4a", roughness: 0.2, metalness: 0.2 },
      oven: { color: "#2c2c2c", roughness: 0.2, metalness: 0.1 },
      microwave: { color: "#3a3a3a", roughness: 0.2, metalness: 0.1 },
      hood: { color: "#5a5a5a", roughness: 0.1, metalness: 0.7 }
    };

    const props = materialMap[appliance.type] || materialMap.stove;
    return new THREE.MeshStandardMaterial(props);
  };

  const renderApplianceDetails = () => {
    switch (appliance.type) {
      case 'sink':
        return (
          <group>
            {/* Sink basin */}
            <mesh position={[0, -5, 0]}>
              <boxGeometry args={[appliance.width - 10, 10, appliance.depth - 10]} />
              <meshStandardMaterial color="#d0d0d0" roughness={0.1} metalness={0.9} />
            </mesh>
            {/* Faucet */}
            <mesh position={[0, 10, -appliance.depth / 4]}>
              <cylinderGeometry args={[2, 2, 20]} />
              <meshStandardMaterial color="#c0c0c0" roughness={0.1} metalness={0.9} />
            </mesh>
          </group>
        );
      
      case 'stove':
        return (
          <group>
            {/* Burners */}
            {Array.from({ length: 4 }, (_, i) => (
              <mesh 
                key={i}
                position={[
                  (i % 2 - 0.5) * (appliance.width / 3),
                  appliance.height / 2 + 1,
                  (Math.floor(i / 2) - 0.5) * (appliance.depth / 3)
                ]}
              >
                <cylinderGeometry args={[8, 8, 2]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
              </mesh>
            ))}
          </group>
        );
      
      case 'fridge':
        return (
          <group>
            {/* Door handle */}
            <mesh position={[appliance.width / 2 - 2, 0, appliance.depth / 2 + 1]}>
              <boxGeometry args={[3, appliance.height * 0.6, 2]} />
              <meshStandardMaterial color="#8a8a8a" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Ice dispenser */}
            <mesh position={[-appliance.width / 4, appliance.height / 4, appliance.depth / 2 + 0.5]}>
              <boxGeometry args={[15, 20, 1]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.3} />
            </mesh>
          </group>
        );
      
      default:
        return null;
    }
  };

  return (
    <group 
      ref={meshRef}
      position={[
        appliance.position.x, 
        appliance.height / 2, 
        appliance.position.y
      ]}
      rotation={[0, appliance.rotation * Math.PI / 180, 0]}
      onClick={onClick}
    >
      {/* Main appliance body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[appliance.width, appliance.height, appliance.depth]} />
        <primitive object={getApplianceMaterial()} />
      </mesh>
      
      {renderApplianceDetails()}
      
      {/* Selection indicator */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(appliance.width + 2, appliance.height + 2, appliance.depth + 2)]} />
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </lineSegments>
      )}
      
      {/* Brand label */}
      {isSelected && appliance.brand && (
        <Text
          position={[0, appliance.height / 2 + 10, 0]}
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

export default Appliance3D;
