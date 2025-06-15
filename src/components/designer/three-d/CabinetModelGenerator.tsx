
import { useMemo } from "react";
import * as THREE from "three";
import { Cabinet } from "@/store/types";

interface CabinetModelGeneratorProps {
  cabinet: Cabinet;
  isSelected: boolean;
  onClick: (event: any) => void;
}

const CabinetModelGenerator = ({ cabinet, isSelected, onClick }: CabinetModelGeneratorProps) => {
  const cabinetGroup = useMemo(() => {
    const group = new THREE.Group();
    
    // Material definitions based on cabinet finish
    const getMaterial = (finish: string, color: string) => {
      const baseColor = new THREE.Color(color);
      
      switch (finish) {
        case 'laminate':
          return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.3,
            metalness: 0.1,
            map: createLaminateTexture()
          });
        case 'veneer':
          return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.4,
            metalness: 0.0,
            map: createWoodTexture()
          });
        case 'acrylic':
          return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.1,
            metalness: 0.8,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
          });
        case 'matte':
          return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.9,
            metalness: 0.0
          });
        case 'gloss':
          return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.05,
            metalness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0
          });
        default:
          return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.3,
            metalness: 0.1
          });
      }
    };

    // Create cabinet body
    const bodyGeometry = new THREE.BoxGeometry(cabinet.width, cabinet.height, cabinet.depth);
    const bodyMaterial = getMaterial(cabinet.finish, cabinet.color);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Create doors based on front type
    if (cabinet.frontType !== 'open') {
      const doorMaterial = getMaterial(cabinet.finish, cabinet.color);
      const doorThickness = 2;
      
      if (cabinet.frontType === 'drawer') {
        // Create drawers
        const drawerCount = cabinet.drawers || 1;
        const drawerHeight = (cabinet.height - 4) / drawerCount;
        
        for (let i = 0; i < drawerCount; i++) {
          const drawerGeometry = new THREE.BoxGeometry(
            cabinet.width - 4, 
            drawerHeight - 2, 
            doorThickness
          );
          const drawer = new THREE.Mesh(drawerGeometry, doorMaterial);
          drawer.position.set(
            0, 
            cabinet.height / 2 - (i + 0.5) * drawerHeight - 2, 
            cabinet.depth / 2 + doorThickness / 2
          );
          drawer.castShadow = true;
          group.add(drawer);

          // Add drawer handle
          const handleGeometry = new THREE.CylinderGeometry(0.8, 0.8, cabinet.width * 0.6);
          const handleMaterial = new THREE.MeshStandardMaterial({
            color: "#8a8a8a",
            roughness: 0.2,
            metalness: 0.8
          });
          const handle = new THREE.Mesh(handleGeometry, handleMaterial);
          handle.rotation.z = Math.PI / 2;
          handle.position.set(
            0,
            cabinet.height / 2 - (i + 0.5) * drawerHeight - 2,
            cabinet.depth / 2 + doorThickness + 1
          );
          handle.castShadow = true;
          group.add(handle);
        }
      } else {
        // Create regular doors
        const doorWidth = (cabinet.width - 4) / 2;
        const doorHeight = cabinet.height - 4;
        
        // Left door
        const leftDoorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
        const leftDoor = new THREE.Mesh(leftDoorGeometry, doorMaterial);
        leftDoor.position.set(-doorWidth / 2 - 1, 0, cabinet.depth / 2 + doorThickness / 2);
        leftDoor.castShadow = true;
        group.add(leftDoor);

        // Right door
        const rightDoor = new THREE.Mesh(leftDoorGeometry, doorMaterial);
        rightDoor.position.set(doorWidth / 2 + 1, 0, cabinet.depth / 2 + doorThickness / 2);
        rightDoor.castShadow = true;
        group.add(rightDoor);

        // Door handles
        const handleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({
          color: "#8a8a8a",
          roughness: 0.2,
          metalness: 0.8
        });

        const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        leftHandle.position.set(-doorWidth / 4, 0, cabinet.depth / 2 + doorThickness + 1);
        leftHandle.castShadow = true;
        group.add(leftHandle);

        const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        rightHandle.position.set(doorWidth / 4, 0, cabinet.depth / 2 + doorThickness + 1);
        rightHandle.castShadow = true;
        group.add(rightHandle);
      }
    }

    // Add countertop for base cabinets
    if (cabinet.type === 'base') {
      const countertopGeometry = new THREE.BoxGeometry(
        cabinet.width + 5, 
        4, 
        cabinet.depth + 5
      );
      const countertopMaterial = new THREE.MeshStandardMaterial({
        color: "#2c2c2c",
        roughness: 0.1,
        metalness: 0.1,
        map: createCountertopTexture()
      });
      const countertop = new THREE.Mesh(countertopGeometry, countertopMaterial);
      countertop.position.set(0, cabinet.height / 2 + 2, 0);
      countertop.castShadow = true;
      countertop.receiveShadow = true;
      group.add(countertop);
    }

    // Add shelves for wall and tall cabinets
    if (cabinet.type === 'wall' || cabinet.type === 'tall') {
      const shelfCount = cabinet.type === 'tall' ? 4 : 2;
      const shelfSpacing = (cabinet.height - 8) / (shelfCount + 1);
      
      for (let i = 1; i <= shelfCount; i++) {
        const shelfGeometry = new THREE.BoxGeometry(
          cabinet.width - 8, 
          2, 
          cabinet.depth - 8
        );
        const shelfMaterial = getMaterial(cabinet.finish, cabinet.color);
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(
          0, 
          cabinet.height / 2 - 4 - i * shelfSpacing, 
          0
        );
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        group.add(shelf);
      }
    }

    return group;
  }, [cabinet]);

  // Texture creation functions
  const createWoodTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create wood grain pattern
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#8B4513');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add wood grain lines
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 25 + Math.random() * 10);
      ctx.lineTo(512, i * 25 + Math.random() * 10);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  const createLaminateTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add subtle pattern
    ctx.fillStyle = '#f0f0f0';
    for (let i = 0; i < 256; i += 4) {
      for (let j = 0; j < 256; j += 4) {
        if ((i + j) % 8 === 0) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const createCountertopTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create granite-like pattern
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add speckles
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 3;
      const brightness = Math.random() * 100 + 100;
      
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  return (
    <primitive 
      object={cabinetGroup} 
      position={[
        cabinet.position.x, 
        cabinet.height / 2, 
        cabinet.position.y
      ]}
      rotation={[0, cabinet.rotation * Math.PI / 180, 0]}
      onClick={onClick}
    />
  );
};

export default CabinetModelGenerator;
