
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

interface ModelLoaderProps {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  isSelected?: boolean;
  onClick?: (event: any) => void;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

const ModelLoader = ({ 
  url, 
  position, 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1],
  isSelected = false,
  onClick,
  castShadow = true,
  receiveShadow = true
}: ModelLoaderProps) => {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
  });
  
  const modelRef = useRef<THREE.Group>(null);

  // Configure shadows and materials
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = castShadow;
          child.receiveShadow = receiveShadow;
          
          // Enhance materials for realism
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.envMapIntensity = 1;
                  mat.needsUpdate = true;
                }
              });
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.envMapIntensity = 1;
              child.material.needsUpdate = true;
            }
          }
        }
      });
    }
  }, [gltf, castShadow, receiveShadow]);

  const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  return (
    <group 
      ref={modelRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
    >
      <primitive object={clonedScene} />
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[100, 100, 100]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.1} 
            wireframe 
          />
        </mesh>
      )}
    </group>
  );
};

export default ModelLoader;
