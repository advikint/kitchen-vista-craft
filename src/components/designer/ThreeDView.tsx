
import { useEffect } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const ThreeDView = () => {
  const { 
    room, walls, doors, windows, cabinets, appliances 
  } = useKitchenStore();
  
  const { scene, camera } = useThree();
  
  useEffect(() => {
    // Clear any existing objects
    while(scene.children.length > 0) { 
      scene.remove(scene.children[0]);
    }
    
    // Add basic lighting (simplified for performance)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 15);
    scene.add(directionalLight);
    
    // Create the room (floor only for better performance)
    const floorGeometry = new THREE.PlaneGeometry(room.width || 300, room.height || 400);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xf9fafb });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    scene.add(floor);
    
    // Create basic walls
    walls.forEach(wall => {
      const start = new THREE.Vector3(wall.start.x, 0, wall.start.y);
      const end = new THREE.Vector3(wall.end.x, 0, wall.end.y);
      
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      direction.normalize();
      
      const wallHeight = wall.height || 240;
      
      // Create wall geometry
      const wallGeometry = new THREE.BoxGeometry(length, wallHeight, 15);
      const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe5e7eb });
      
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      
      // Calculate position and rotation
      const angle = Math.atan2(direction.z, direction.x);
      wallMesh.position.set(
        start.x + direction.x * length / 2,
        wallHeight / 2,
        start.z + direction.z * length / 2
      );
      
      wallMesh.rotation.y = angle;
      scene.add(wallMesh);
    });
    
    // Basic cabinets (simplified)
    cabinets.forEach(cabinet => {
      const cabinetGeometry = new THREE.BoxGeometry(
        cabinet.width, 
        cabinet.height, 
        cabinet.depth
      );
      
      const cabinetMaterial = new THREE.MeshStandardMaterial({ 
        color: cabinet.color === 'white' ? 0xffffff : 
               cabinet.color === 'brown' ? 0x8b5a2b : 
               cabinet.color === 'black' ? 0x1e1e1e : 0x9ca3af
      });
      
      const cabinetMesh = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
      cabinetMesh.position.set(
        cabinet.position.x, 
        cabinet.height / 2, 
        cabinet.position.y
      );
      
      cabinetMesh.rotation.y = cabinet.rotation * Math.PI / 180;
      scene.add(cabinetMesh);
    });
    
    // Add doors (simplified)
    doors.forEach(door => {
      const wall = walls.find(w => w.id === door.wallId);
      if (!wall) return;
      
      const doorGeometry = new THREE.BoxGeometry(door.width, door.height, 5);
      const doorMaterial = new THREE.MeshStandardMaterial({ color: 0xa1a1aa });
      const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
      
      const wallVector = {
        x: wall.end.x - wall.start.x,
        y: wall.end.y - wall.start.y
      };
      
      const doorPosition = {
        x: wall.start.x + door.position * wallVector.x,
        y: wall.start.y + door.position * wallVector.y
      };
      
      doorMesh.position.set(doorPosition.x, door.height / 2, doorPosition.y);
      
      const angle = Math.atan2(wallVector.y, wallVector.x);
      doorMesh.rotation.y = angle;
      
      scene.add(doorMesh);
    });
    
    // Add windows (simplified)
    windows.forEach(window => {
      const wall = walls.find(w => w.id === window.wallId);
      if (!wall) return;
      
      const windowGeometry = new THREE.BoxGeometry(window.width, window.height, 5);
      const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xbfdbfe,
        transparent: true,
        opacity: 0.7
      });
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      
      const wallVector = {
        x: wall.end.x - wall.start.x,
        y: wall.end.y - wall.start.y
      };
      
      const windowPosition = {
        x: wall.start.x + window.position * wallVector.x,
        y: wall.start.y + window.position * wallVector.y
      };
      
      windowMesh.position.set(
        windowPosition.x, 
        window.sillHeight + window.height / 2, 
        windowPosition.y
      );
      
      const angle = Math.atan2(wallVector.y, wallVector.x);
      windowMesh.rotation.y = angle;
      
      scene.add(windowMesh);
    });
    
    // Set camera position based on room size
    const maxDimension = Math.max(room.width || 300, room.height || 400);
    if (camera && camera.position) {
      camera.position.set(maxDimension * 0.8, maxDimension * 0.8, maxDimension * 0.8);
      camera.lookAt(0, 0, 0);
    }
    
  }, [room, walls, doors, windows, cabinets, appliances, scene, camera]);
  
  return null;
};

export default ThreeDView;
