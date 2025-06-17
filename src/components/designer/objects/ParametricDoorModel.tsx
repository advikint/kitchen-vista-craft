// src/components/designer/objects/ParametricDoorModel.tsx
import * as THREE from 'three';
import { useMemo }
import { Door } from '@/store/types'; // DoorType is not explicitly used here, Door is sufficient

// Define these constants if not imported from a shared location
const COLLISION_MATERIAL_COLOR = 0xff0000;
const COLLISION_MATERIAL_OPACITY = 0.5;

interface ParametricDoorModelProps {
  door: Door;
}

const ParametricDoorModel = ({ door }: ParametricDoorModelProps) => {
  const doorGroup = useMemo(() => {
    const group = new THREE.Group();

    const doorMainColor = new THREE.Color(door.color || '#B88A69');

    let doorMaterial: THREE.Material;
    let frameMaterial: THREE.Material;
    let handleMaterial: THREE.Material;

    if (door.isColliding) {
      const collisionMat = new THREE.MeshStandardMaterial({
        color: COLLISION_MATERIAL_COLOR,
        transparent: true,
        opacity: COLLISION_MATERIAL_OPACITY,
        // depthWrite: false, // Optional for transparency, can cause issues if not handled carefully
      });
      doorMaterial = collisionMat;
      frameMaterial = collisionMat.clone(); // Use clone if frame might have slightly different params later, otherwise same instance is fine
      handleMaterial = collisionMat.clone();
      if (handleMaterial instanceof THREE.MeshStandardMaterial) { // Type guard
        handleMaterial.metalness = 0.2; // Less metallic when colliding
        handleMaterial.roughness = 0.6; // More rough when colliding
      }
    } else {
      doorMaterial = new THREE.MeshStandardMaterial({
          color: doorMainColor,
          roughness: 0.7,
          metalness: 0.1
      });
      frameMaterial = new THREE.MeshStandardMaterial({
          color: doorMainColor.clone().multiplyScalar(0.7),
          roughness: 0.7,
          metalness: 0.1
      });
      handleMaterial = new THREE.MeshStandardMaterial({
          color: 0x777777,
          metalness: 0.9,
          roughness: 0.4
      });
    }

    // Dimensions from door object, with defaults
    const dWidth = door.width || 80;
    const dHeight = door.height || 200;
    const dThickness = door.doorThickness || 4;
    const fThickness = door.frameThickness || 5;
    const fDepth = door.frameDepth || 12;

    // --- Door Frame ---
    const jambHeight = dHeight;
    const leftJambGeom = new THREE.BoxGeometry(fThickness, jambHeight, fDepth);
    const leftJambMesh = new THREE.Mesh(leftJambGeom, frameMaterial);
    leftJambMesh.position.set(-dWidth / 2 - fThickness / 2, jambHeight / 2, 0);
    group.add(leftJambMesh);

    // Use clone for geometry if it might be modified, otherwise share (leftJambGeom.clone() or leftJambGeom)
    const rightJambMesh = new THREE.Mesh(leftJambGeom, frameMaterial);
    rightJambMesh.position.set(dWidth / 2 + fThickness / 2, jambHeight / 2, 0);
    group.add(rightJambMesh);

    const topRailWidth = dWidth + 2 * fThickness;
    const topRailGeom = new THREE.BoxGeometry(topRailWidth, fThickness, fDepth);
    const topRailMesh = new THREE.Mesh(topRailGeom, frameMaterial);
    topRailMesh.position.set(0, dHeight + fThickness / 2, 0);
    group.add(topRailMesh);

    // --- Door Slab ---
    if (door.type === 'standard' || door.type === 'sliding' || door.type === 'pocket') {
      const slabGeom = new THREE.BoxGeometry(dWidth, dHeight, dThickness);
      const slabMesh = new THREE.Mesh(slabGeom, doorMaterial);
      slabMesh.position.y = dHeight / 2;
      // Adjust Z position of slab to be slightly inset from front of frame
      // Frame front face is at fDepth / 2. Slab front face should be behind that.
      // Assume door slab is aligned towards the "inside" of the frame depth.
      // If frame center is Z=0, its front is fDepth/2, its back is -fDepth/2.
      // Slab front could be at fDepth/2 - some_inset, or its center could be Z=0 or slightly offset.
      // Let's place slab center slightly back from frame center for a common look.
      slabMesh.position.z = 0; // (fDepth / 2) - (dThickness / 2) - 0.5; // Example: 0.5cm inset from front of frame
      group.add(slabMesh);

      if (door.type === 'standard') {
        const handleRadius = 1.5;
        const handleLength = 10;
        const handleGeom = new THREE.CylinderGeometry(handleRadius, handleRadius, handleLength, 16);
        const handleMesh = new THREE.Mesh(handleGeom, handleMaterial);
        handleMesh.rotation.z = Math.PI / 2;

        const handleXOffset = dWidth / 2 - 8;
        const handleYOffset = 0;
        const handleZOffset = dThickness / 2 + handleRadius / 2 + 0.5; // Small gap from slab

        handleMesh.position.set(handleXOffset, handleYOffset, handleZOffset);
        slabMesh.add(handleMesh);

        // Clone for the other side handle
        const handleMesh2 = new THREE.Mesh(handleGeom, handleMaterial); // Create new mesh with same geom and material instance
        handleMesh2.rotation.z = Math.PI / 2;
        handleMesh2.position.set(handleXOffset, handleYOffset, -handleZOffset); // Position on the other side
        // The prompt's logic for handleMesh2.material was:
        // if(door.isColliding && handleMesh2.material.isMeshStandardMaterial) {
        //    handleMesh2.material = (handleMaterial as THREE.MeshStandardMaterial).clone();
        // }
        // This is only needed if handleMaterial was modified for handleMesh1 specifically after this clone.
        // Since handleMaterial is already the correct conditional material, direct assignment is fine.
        slabMesh.add(handleMesh2);
      }
    } else if (door.type === 'folding') {
      const panelWidth = dWidth / 2;
      const panelGeom = new THREE.BoxGeometry(panelWidth, dHeight, dThickness);

      const panel1Mesh = new THREE.Mesh(panelGeom, doorMaterial);
      panel1Mesh.position.set(-panelWidth / 2, dHeight / 2, 0); // Centered like other slabs for now
      group.add(panel1Mesh);

      const panel2Mesh = new THREE.Mesh(panelGeom, doorMaterial);
      panel2Mesh.position.set(panelWidth / 2, dHeight / 2, 0);
      group.add(panel2Mesh);
    }

    return group;
  }, [door]); // Dependency on the entire door object, including door.isColliding

  return <primitive object={doorGroup} />;
};

export default ParametricDoorModel;
