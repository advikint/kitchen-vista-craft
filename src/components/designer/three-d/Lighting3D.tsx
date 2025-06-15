
import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useKitchenStore } from "@/store/kitchenStore";

const Lighting3D = () => {
  const { room } = useKitchenStore();
  const { scene } = useThree();
  const lightsRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!lightsRef.current) return;

    // Clear existing lights
    lightsRef.current.clear();

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    lightsRef.current.add(ambientLight);

    // Main directional light (sunlight)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(room.width, room.height * 2, room.height);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.setScalar(2048);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = room.width + room.height;
    sunLight.shadow.camera.left = -room.width;
    sunLight.shadow.camera.right = room.width;
    sunLight.shadow.camera.top = room.height;
    sunLight.shadow.camera.bottom = -room.height;
    lightsRef.current.add(sunLight);

    // Ceiling lights for even kitchen illumination
    const numLights = Math.ceil(Math.max(room.width, room.height) / 150);
    for (let i = 0; i < numLights; i++) {
      for (let j = 0; j < numLights; j++) {
        const ceilingLight = new THREE.PointLight(0xffffff, 0.6, 200);
        ceilingLight.position.set(
          (room.width / (numLights + 1)) * (i + 1),
          220,
          (room.height / (numLights + 1)) * (j + 1)
        );
        ceilingLight.castShadow = true;
        ceilingLight.shadow.mapSize.setScalar(1024);
        lightsRef.current.add(ceilingLight);
      }
    }

    // Under-cabinet lighting simulation
    const underCabinetLight = new THREE.SpotLight(0xfff8e1, 0.5, 150, Math.PI / 6, 0.2);
    underCabinetLight.position.set(room.width / 2, 85, room.height / 4);
    underCabinetLight.target.position.set(room.width / 2, 0, room.height / 4);
    underCabinetLight.castShadow = true;
    lightsRef.current.add(underCabinetLight);
    lightsRef.current.add(underCabinetLight.target);

  }, [room, scene]);

  return <group ref={lightsRef} />;
};

export default Lighting3D;
