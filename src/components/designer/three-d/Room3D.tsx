
import { useMemo } from "react";
import * as THREE from "three";
import { Room } from "@/store/types";

interface Room3DProps {
  room: Room;
}

const Room3D = ({ room }: Room3DProps) => {
  const floorTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/textures/floor-tile.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(room.width / 50, room.height / 50);
    return texture;
  }, [room.width, room.height]);

  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.1,
      metalness: 0.1,
    });
  }, [floorTexture]);

  return (
    <group>
      {/* Floor */}
      <mesh 
        position={[room.width / 2, 0, room.height / 2]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[room.width, room.height]} />
        <primitive object={floorMaterial} />
      </mesh>
      
      {/* Ceiling */}
      <mesh 
        position={[room.width / 2, 240, room.height / 2]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[room.width, room.height]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.8} />
      </mesh>
    </group>
  );
};

export default Room3D;
