
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Cabinet } from "@/store/types";
import { Text } from "@react-three/drei";

interface Cabinet3DProps {
  cabinet: Cabinet;
  isSelected: boolean;
  onClick: (event: any) => void;
}

const Cabinet3D = ({ cabinet, isSelected, onClick }: Cabinet3DProps) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Animate selection
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const cabinetMaterial = useMemo(() => {
    const materialMap: Record<string, any> = {
      laminate: {
        color: cabinet.color,
        roughness: 0.3,
        metalness: 0.1,
      },
      veneer: {
        color: cabinet.color,
        roughness: 0.4,
        metalness: 0.0,
      },
      acrylic: {
        color: cabinet.color,
        roughness: 0.1,
        metalness: 0.8,
      },
      matte: {
        color: cabinet.color,
        roughness: 0.9,
        metalness: 0.0,
      },
      gloss: {
        color: cabinet.color,
        roughness: 0.05,
        metalness: 0.2,
      }
    };

    const props = materialMap[cabinet.finish] || materialMap.laminate;
    return new THREE.MeshStandardMaterial(props);
  }, [cabinet.color, cabinet.finish]);

  const handleMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#8a8a8a",
      roughness: 0.2,
      metalness: 0.8,
    });
  }, []);

  const renderCabinetBody = () => {
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[cabinet.width, cabinet.height, cabinet.depth]} />
        <primitive object={cabinetMaterial} />
      </mesh>
    );
  };

  const renderDoors = () => {
    if (cabinet.frontType === 'open') return null;
    
    const doorThickness = 2;
    const doorWidth = cabinet.frontType === 'drawer' ? cabinet.width - 4 : (cabinet.width - 4) / 2;
    const doorHeight = cabinet.frontType === 'drawer' 
      ? cabinet.height / (cabinet.drawers || 1) - 2 
      : cabinet.height - 4;

    if (cabinet.frontType === 'drawer') {
      return Array.from({ length: cabinet.drawers || 1 }, (_, i) => (
        <group key={i}>
          <mesh 
            position={[0, cabinet.height / 2 - (i + 0.5) * (cabinet.height / (cabinet.drawers || 1)), cabinet.depth / 2 + doorThickness / 2]}
            castShadow
          >
            <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
            <primitive object={cabinetMaterial} />
          </mesh>
          {/* Drawer handle */}
          <mesh 
            position={[0, cabinet.height / 2 - (i + 0.5) * (cabinet.height / (cabinet.drawers || 1)), cabinet.depth / 2 + doorThickness + 1]}
            castShadow
          >
            <cylinderGeometry args={[1, 1, doorWidth * 0.6]} />
            <primitive object={handleMaterial} />
          </mesh>
        </group>
      ));
    }

    // Regular doors
    return (
      <group>
        <mesh 
          position={[-doorWidth / 2 - 1, 0, cabinet.depth / 2 + doorThickness / 2]}
          castShadow
        >
          <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
          <primitive object={cabinetMaterial} />
        </mesh>
        <mesh 
          position={[doorWidth / 2 + 1, 0, cabinet.depth / 2 + doorThickness / 2]}
          castShadow
        >
          <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
          <primitive object={cabinetMaterial} />
        </mesh>
        {/* Door handles */}
        <mesh 
          position={[doorWidth / 4, 0, cabinet.depth / 2 + doorThickness + 1]}
          castShadow
        >
          <cylinderGeometry args={[0.5, 0.5, 8]} />
          <primitive object={handleMaterial} />
        </mesh>
        <mesh 
          position={[-doorWidth / 4, 0, cabinet.depth / 2 + doorThickness + 1]}
          castShadow
        >
          <cylinderGeometry args={[0.5, 0.5, 8]} />
          <primitive object={handleMaterial} />
        </mesh>
      </group>
    );
  };

  const renderCountertop = () => {
    if (cabinet.type !== 'base') return null;
    
    return (
      <mesh 
        position={[0, cabinet.height / 2 + 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[cabinet.width + 5, 4, cabinet.depth + 5]} />
        <meshStandardMaterial 
          color="#2c2c2c" 
          roughness={0.1} 
          metalness={0.1}
        />
      </mesh>
    );
  };

  return (
    <group 
      ref={meshRef}
      position={[
        cabinet.position.x, 
        cabinet.height / 2, 
        cabinet.position.y
      ]}
      rotation={[0, cabinet.rotation * Math.PI / 180, 0]}
      onClick={onClick}
    >
      {renderCabinetBody()}
      {renderDoors()}
      {renderCountertop()}
      
      {/* Selection indicator */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(cabinet.width + 2, cabinet.height + 2, cabinet.depth + 2)]} />
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </lineSegments>
      )}
      
      {/* Dimension labels */}
      {isSelected && (
        <Text
          position={[0, cabinet.height / 2 + 10, 0]}
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

export default Cabinet3D;
