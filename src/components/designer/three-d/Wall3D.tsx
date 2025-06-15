
import { useMemo } from "react";
import * as THREE from "three";
import { Wall } from "@/store/types";

interface Wall3DProps {
  wall: Wall;
  isSelected: boolean;
  onClick: (event: any) => void;
}

const Wall3D = ({ wall, isSelected, onClick }: Wall3DProps) => {
  const wallGeometry = useMemo(() => {
    const start = new THREE.Vector3(wall.start.x, 0, wall.start.y);
    const end = new THREE.Vector3(wall.end.x, 0, wall.end.y);
    
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    return {
      length,
      center: new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5),
      angle: Math.atan2(direction.z, direction.x)
    };
  }, [wall.start, wall.end]);

  const wallMaterial = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/textures/wall-paint.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(wallGeometry.length / 100, wall.height / 100);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: wall.color,
      roughness: 0.8,
      metalness: 0.0,
    });
  }, [wall.color, wall.height, wallGeometry.length]);

  return (
    <group
      position={[wallGeometry.center.x, wall.height / 2, wallGeometry.center.z]}
      rotation={[0, wallGeometry.angle, 0]}
      onClick={onClick}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[wallGeometry.length, wall.height, wall.thickness]} />
        <primitive object={wallMaterial} />
      </mesh>
      
      {/* Baseboard */}
      <mesh position={[0, -wall.height / 2 + 5, wall.thickness / 2 + 2]}>
        <boxGeometry args={[wallGeometry.length, 10, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      
      {/* Crown molding */}
      <mesh position={[0, wall.height / 2 - 5, wall.thickness / 2 + 2]}>
        <boxGeometry args={[wallGeometry.length, 10, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      
      {/* Selection indicator */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(wallGeometry.length + 2, wall.height + 2, wall.thickness + 2)]} />
          <lineBasicMaterial color="#3b82f6" linewidth={3} />
        </lineSegments>
      )}
    </group>
  );
};

export default Wall3D;
