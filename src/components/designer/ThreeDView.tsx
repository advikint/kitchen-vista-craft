import { useEffect, useRef } from "react";
import { useKitchenStore, Wall, Cabinet, Appliance, Door, Window } from "@/store/kitchenStore";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const ThreeDView = () => {
  const { 
    room, walls, doors, windows, cabinets, appliances 
  } = useKitchenStore();
  
  const { scene, camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    // Clear any existing objects
    while(scene.children.length > 0) { 
      scene.remove(scene.children[0]);
    }
    
    // Create the room
    createRoom();
    
    // Create the walls
    walls.forEach(createWall);
    
    // Create cabinets
    cabinets.forEach(createCabinet);
    
    // Create appliances
    appliances.forEach(createAppliance);
    
    // Create doors
    doors.forEach(createDoor);
    
    // Create windows
    windows.forEach(createWindow);
    
    // Add lighting
    addLighting();
    
    // Set camera position based on room size
    const maxDimension = Math.max(room.width || 300, room.height || 400);
    if (camera && camera.position) {
      camera.position.set(maxDimension, maxDimension, maxDimension);
      camera.lookAt(0, 0, 0);
    }
    
    return () => {
      // Clean up when component unmounts
      while(scene.children.length > 0) { 
        scene.remove(scene.children[0]);
      }
    };
  }, [room, walls, doors, windows, cabinets, appliances, scene, camera]);
  
  const addLighting = () => {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);
    
    // Add hemisphere light for better ambient illumination
    const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.5);
    scene.add(hemisphereLight);
  };
  
  const createRoom = () => {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(room.width, room.height);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf9fafb,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Ceiling (optional)
    const ceilingGeometry = new THREE.PlaneGeometry(room.width, room.height);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.1
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 240, 0); // 240 cm height
    ceiling.receiveShadow = true;
    scene.add(ceiling);
  };
  
  const createWall = (wall: Wall) => {
    const start = new THREE.Vector3(wall.start.x, 0, wall.start.y);
    const end = new THREE.Vector3(wall.end.x, 0, wall.end.y);
    
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();
    
    const wallHeight = wall.height || 240;
    
    // Create wall geometry
    const wallGeometry = new THREE.BoxGeometry(length, wallHeight, 15);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe5e7eb,
      roughness: 0.8
    });
    
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    
    // Calculate position and rotation
    const angle = Math.atan2(direction.z, direction.x);
    wallMesh.position.set(
      start.x + direction.x * length / 2,
      wallHeight / 2,
      start.z + direction.z * length / 2
    );
    
    wallMesh.rotation.y = angle;
    scene.add(wallMesh);
  };
  
  const createDoor = (door: Door) => {
    // Find the wall this door belongs to
    const wall = walls.find(w => w.id === door.wallId);
    if (!wall) return;
    
    const start = new THREE.Vector3(wall.start.x, 0, wall.start.y);
    const end = new THREE.Vector3(wall.end.x, 0, wall.end.y);
    
    const direction = new THREE.Vector3().subVectors(end, start);
    const wallLength = direction.length();
    direction.normalize();
    
    // Door position along the wall
    const doorPos = new THREE.Vector3()
      .copy(start)
      .addScaledVector(direction, door.position * wallLength);
    
    // Door geometry
    const doorGeometry = new THREE.BoxGeometry(door.width, door.height, 2);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xa1a1aa,
      roughness: 0.5,
      metalness: 0.5 
    });
    
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    
    // Calculate the angle perpendicular to the wall
    const angle = Math.atan2(direction.z, direction.x);
    
    // Position the door correctly - the door should be at the wall position,
    // not inside the wall. We'll offset it by the wall thickness.
    const wallThickness = 15; // Same as in createWall
    const perpDirection = new THREE.Vector3(-direction.z, 0, direction.x);
    
    doorMesh.position.set(
      doorPos.x + perpDirection.x * (wallThickness / 2 + 1), 
      door.height / 2, 
      doorPos.z + perpDirection.z * (wallThickness / 2 + 1)
    );
    
    doorMesh.rotation.y = angle;
    scene.add(doorMesh);
    
    // Door frame
    const frameGeometry = new THREE.BoxGeometry(door.width + 10, door.height + 5, 5);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameMesh.position.copy(doorMesh.position);
    frameMesh.rotation.y = angle;
    scene.add(frameMesh);
  };
  
  const createWindow = (window: Window) => {
    // Find the wall this window belongs to
    const wall = walls.find(w => w.id === window.wallId);
    if (!wall) return;
    
    const start = new THREE.Vector3(wall.start.x, 0, wall.start.y);
    const end = new THREE.Vector3(wall.end.x, 0, wall.end.y);
    
    const direction = new THREE.Vector3().subVectors(end, start);
    const wallLength = direction.length();
    direction.normalize();
    
    // Window position along the wall
    const windowPos = new THREE.Vector3()
      .copy(start)
      .addScaledVector(direction, window.position * wallLength);
    
    // Window geometry
    const windowGeometry = new THREE.BoxGeometry(window.width, window.height, 2);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xbfdbfe,
      transparent: true,
      opacity: 0.8,
      metalness: 0.3,
      roughness: 0.2
    });
    
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    
    // Calculate the angle perpendicular to the wall
    const angle = Math.atan2(direction.z, direction.x);
    
    // Position the window correctly - should be aligned with the wall, not inside it
    const wallThickness = 15; // Same as in createWall
    
    windowMesh.position.set(
      windowPos.x, 
      window.sillHeight + window.height / 2, 
      windowPos.z
    );
    
    windowMesh.rotation.y = angle;
    scene.add(windowMesh);
    
    // Window frame
    const frameGeometry = new THREE.BoxGeometry(window.width + 10, window.height + 10, 5);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameMesh.position.copy(windowMesh.position);
    frameMesh.rotation.y = angle;
    scene.add(frameMesh);
  };
  
  const createCabinet = (cabinet: Cabinet) => {
    // Base cabinet
    const cabinetGeometry = new THREE.BoxGeometry(
      cabinet.width, 
      cabinet.height, 
      cabinet.depth
    );
    
    let cabinetColor = 0xffffff; // default white
    if (cabinet.color === 'white') cabinetColor = 0xffffff;
    else if (cabinet.color === 'brown') cabinetColor = 0x8b5a2b;
    else if (cabinet.color === 'black') cabinetColor = 0x1e1e1e;
    else if (cabinet.color === 'grey') cabinetColor = 0x9ca3af;
    
    const cabinetMaterial = new THREE.MeshStandardMaterial({ 
      color: cabinetColor,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const cabinetMesh = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
    cabinetMesh.position.set(
      cabinet.position.x, 
      cabinet.height / 2, 
      cabinet.position.y
    );
    
    // Fix cabinet orientation - place parallel to walls, not perpendicular
    cabinetMesh.rotation.y = cabinet.rotation * Math.PI / 180;
    
    cabinetMesh.castShadow = true;
    cabinetMesh.receiveShadow = true;
    scene.add(cabinetMesh);
    
    // Add countertop for base cabinets
    if (cabinet.type === 'base') {
      const countertopGeometry = new THREE.BoxGeometry(
        cabinet.width + 4, 
        4, 
        cabinet.depth + 4
      );
      const countertopMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x9ca3af,
        roughness: 0.5,
        metalness: 0.3
      });
      const countertopMesh = new THREE.Mesh(countertopGeometry, countertopMaterial);
      countertopMesh.position.set(
        cabinet.position.x, 
        cabinet.height + 2, 
        cabinet.position.y
      );
      countertopMesh.rotation.y = cabinet.rotation * Math.PI / 180;
      countertopMesh.castShadow = true;
      countertopMesh.receiveShadow = true;
      scene.add(countertopMesh);
    }
    
    // Add handles
    if (cabinet.frontType === 'drawer' || cabinet.frontType === 'shutter') {
      const handleGeometry = new THREE.BoxGeometry(20, 2, 2);
      const handleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6b7280,
        metalness: 0.8,
        roughness: 0.2
      });
      
      if (cabinet.frontType === 'drawer') {
        // Add handles for each drawer
        const drawers = 3;
        const drawerHeight = cabinet.height / drawers;
        
        for (let i = 0; i < drawers; i++) {
          const handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
          handleMesh.position.set(
            cabinet.position.x, 
            (i + 0.5) * drawerHeight, 
            cabinet.position.y + cabinet.depth / 2 + 1
          );
          handleMesh.rotation.y = cabinet.rotation * Math.PI / 180;
          scene.add(handleMesh);
        }
      } else {
        // Add handle for shutter
        const handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
        handleMesh.position.set(
          cabinet.position.x + cabinet.width / 2 - 5, 
          cabinet.height / 2, 
          cabinet.position.y + cabinet.depth / 2 + 1
        );
        handleMesh.rotation.y = cabinet.rotation * Math.PI / 180;
        scene.add(handleMesh);
      }
    }
  };
  
  const createAppliance = (appliance: Appliance) => {
    // Basic appliance geometry
    const applianceGeometry = new THREE.BoxGeometry(
      appliance.width, 
      appliance.height, 
      appliance.depth
    );
    
    let applianceColor = 0xd1d5db; // default gray
    
    // Different colors based on appliance type
    if (appliance.type === 'sink') applianceColor = 0xd1d5db;
    else if (appliance.type === 'stove') applianceColor = 0x1e1e1e;
    else if (appliance.type === 'fridge') applianceColor = 0xf3f4f6;
    
    const applianceMaterial = new THREE.MeshStandardMaterial({ 
      color: applianceColor,
      roughness: 0.4,
      metalness: 0.6
    });
    
    const applianceMesh = new THREE.Mesh(applianceGeometry, applianceMaterial);
    applianceMesh.position.set(
      appliance.position.x, 
      appliance.height / 2, 
      appliance.position.y
    );
    
    // Fix appliance orientation - place parallel to walls, not perpendicular  
    applianceMesh.rotation.y = appliance.rotation * Math.PI / 180;
    
    applianceMesh.castShadow = true;
    applianceMesh.receiveShadow = true;
    scene.add(applianceMesh);
    
    // Add specific details based on type
    if (appliance.type === 'sink') {
      // Add sink basin
      const basinGeometry = new THREE.BoxGeometry(
        appliance.width - 10, 
        20, 
        appliance.depth - 10
      );
      const basinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x9ca3af,
        roughness: 0.3,
        metalness: 0.9
      });
      const basinMesh = new THREE.Mesh(basinGeometry, basinMaterial);
      basinMesh.position.set(
        appliance.position.x, 
        appliance.height - 10, 
        appliance.position.y
      );
      basinMesh.rotation.y = appliance.rotation * Math.PI / 180;
      scene.add(basinMesh);
      
      // Add faucet
      const faucetGeometry = new THREE.CylinderGeometry(2, 2, 20);
      const faucetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6b7280,
        metalness: 0.9,
        roughness: 0.1
      });
      const faucetMesh = new THREE.Mesh(faucetGeometry, faucetMaterial);
      faucetMesh.position.set(
        appliance.position.x, 
        appliance.height + 10, 
        appliance.position.y - appliance.depth / 4
      );
      scene.add(faucetMesh);
    } else if (appliance.type === 'stove') {
      // Add burners
      const burnerGeometry = new THREE.CylinderGeometry(8, 8, 2);
      const burnerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4b5563,
        roughness: 0.8
      });
      
      const positions = [
        { x: -appliance.width / 4, z: -appliance.depth / 4 },
        { x: appliance.width / 4, z: -appliance.depth / 4 },
        { x: -appliance.width / 4, z: appliance.depth / 4 },
        { x: appliance.width / 4, z: appliance.depth / 4 }
      ];
      
      positions.forEach(pos => {
        const burnerMesh = new THREE.Mesh(burnerGeometry, burnerMaterial);
        burnerMesh.position.set(
          appliance.position.x + pos.x, 
          appliance.height + 1, 
          appliance.position.y + pos.z
        );
        burnerMesh.rotation.y = appliance.rotation * Math.PI / 180;
        scene.add(burnerMesh);
      });
    }
  };
  
  return null;
};

export default ThreeDView;
