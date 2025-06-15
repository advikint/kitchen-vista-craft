
import { useMemo } from "react";
import * as THREE from "three";
import { Door, Wall } from "@/store/types";

interface Door3DProps {
  door: Door;
  wall: Wall;
  isSelected: boolean;
  onClick: (event: any) => void;
}

const Door3D = ({ door, wall, isSelected, onClick }: Door3DProps) => {
  const doorPosition = useMemo(() => {
    const wallVector = {
      x: wall.end.x - wall.start.x,
      y: wall.end.y - wall.start.y
    };
    
    return {
      x: wall.start.x + door.position * wallVector.x,
      y: wall.start.y + door.position * wallVector.y,
      angle: Math.atan2(wallVector.y, wallVector.x)
    };
  }, [door.position, wall]);

  const doorMaterial = useMemo(() => {
    const materialMap: Record<string, any> = {
      standard: { color: "#8B4513", roughness: 0.7 },
      sliding: { color: "#D2B48C", roughness: 0.5 },
      pocket: { color: "#F5DEB3", roughness: 0.6 },
      folding: { color: "#DEB887", roughness: 0.6 }
    };

    const props = materialMap[door.type] || materialMap.standard;
    return new THREE.MeshStandardMaterial(props);
  }, [door.type]);

  return (
    <group
      position={[doorPosition.x, door.height / 2, doorPosition.y]}
      rotation={[0, doorPosition.angle, 0]}
      onClick={onClick}
    >
      {/* Door frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[door.width + 10, door.height + 10, wall.thickness + 5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      
      {/* Door opening */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[door.width, door.height, wall.thickness + 6]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      
      {/* Door panel */}
      <mesh position={[door.width / 4, 0, wall.thickness / 2 + 2]}>
        <boxGeometry args={[door.width - 10, door.height - 10, 3]} />
        <primitive object={doorMaterial} />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[door.width / 2 - 15, 0, wall.thickness / 2 + 4]}>
        <sphereGeometry args={[2]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.1} metalness={0.9} />
      </mesh>
      
      {/* Selection indicator */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(door.width + 12, door.height + 12, wall.thickness + 7)]} />
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};

export default Door3D;
