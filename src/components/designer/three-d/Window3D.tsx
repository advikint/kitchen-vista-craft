
import { useMemo } from "react";
import * as THREE from "three";
import { Window, Wall } from "@/store/types";

interface Window3DProps {
  window: Window;
  wall: Wall;
  isSelected: boolean;
  onClick: (event: any) => void;
}

const Window3D = ({ window, wall, isSelected, onClick }: Window3DProps) => {
  const windowPosition = useMemo(() => {
    const wallVector = {
      x: wall.end.x - wall.start.x,
      y: wall.end.y - wall.start.y
    };
    
    return {
      x: wall.start.x + window.position * wallVector.x,
      y: wall.start.y + window.position * wallVector.y,
      angle: Math.atan2(wallVector.y, wallVector.x)
    };
  }, [window.position, wall]);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#87CEEB",
      transparent: true,
      opacity: 0.3,
      transmission: 0.8,
      roughness: 0.1,
      metalness: 0.0,
      ior: 1.5
    });
  }, []);

  return (
    <group
      position={[windowPosition.x, window.sillHeight + window.height / 2, windowPosition.y]}
      rotation={[0, windowPosition.angle, 0]}
      onClick={onClick}
    >
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[window.width + 10, window.height + 10, wall.thickness + 5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      
      {/* Window opening */}
      <mesh>
        <boxGeometry args={[window.width, window.height, wall.thickness + 6]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      
      {/* Glass panes */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[window.width - 5, window.height - 5, 2]} />
        <primitive object={glassMaterial} />
      </mesh>
      
      {/* Window mullions */}
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[2, window.height - 5, 3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[window.width - 5, 2, 3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      
      {/* Window sill */}
      <mesh position={[0, -window.height / 2 - 5, wall.thickness / 2]}>
        <boxGeometry args={[window.width + 20, 5, 15]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
      </mesh>
      
      {/* Selection indicator */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(window.width + 12, window.height + 12, wall.thickness + 7)]} />
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};

export default Window3D;
