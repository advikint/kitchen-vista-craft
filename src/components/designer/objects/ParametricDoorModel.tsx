// src/components/designer/objects/ParametricDoorModel.tsx
import * as THREE from 'three';
import { useMemo } from 'react';
import { Door, DoorType } from '@/store/types';

interface ParametricDoorModelProps {
  door: Door;
}

const ParametricDoorModel = ({ door }: ParametricDoorModelProps) => {
  const doorGroup = useMemo(() => {
    const group = new THREE.Group();

    // Materials
    const doorMainColor = new THREE.Color(door.color || '#B88A69'); // Default brownish wood color
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: doorMainColor,
        roughness: 0.7,
        metalness: 0.1
    });
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: doorMainColor.clone().multiplyScalar(0.7), // Darker frame
        roughness: 0.7,
        metalness: 0.1
    });
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.4
    });

    // Dimensions from door object, with defaults
    const dWidth = door.width || 80;
    const dHeight = door.height || 200;
    const dThickness = door.doorThickness || 4;
    const fThickness = door.frameThickness || 5;
    const fDepth = door.frameDepth || 12;

    // --- Door Frame ---
    const jambHeight = dHeight; // Jambs run full height of the door opening itself
    const leftJambGeom = new THREE.BoxGeometry(fThickness, jambHeight, fDepth);
    const leftJambMesh = new THREE.Mesh(leftJambGeom, frameMaterial);
    // Position relative to door group's origin (center of door width, base on floor, center of frame depth)
    leftJambMesh.position.set(-dWidth / 2 - fThickness / 2, jambHeight / 2, 0);
    group.add(leftJambMesh);

    const rightJambMesh = new THREE.Mesh(leftJambGeom.clone(), frameMaterial);
    rightJambMesh.position.set(dWidth / 2 + fThickness / 2, jambHeight / 2, 0);
    group.add(rightJambMesh);

    // Top Rail/Lintel - spans over the jambs
    const topRailWidth = dWidth + 2 * fThickness;
    const topRailGeom = new THREE.BoxGeometry(topRailWidth, fThickness, fDepth);
    const topRailMesh = new THREE.Mesh(topRailGeom, frameMaterial);
    // Positioned above the door opening, centered
    topRailMesh.position.set(0, dHeight + fThickness / 2, 0);
    group.add(topRailMesh);

    // --- Door Slab ---
    let slabMesh: THREE.Mesh | null = null;
    if (door.type === 'standard' || door.type === 'sliding' || door.type === 'pocket') {
      const slabGeom = new THREE.BoxGeometry(dWidth, dHeight, dThickness);
      slabMesh = new THREE.Mesh(slabGeom, doorMaterial);
      slabMesh.position.y = dHeight / 2;
      // Centering slab within frame depth for now. Can be adjusted.
      // If frame center is Z=0, slab center is also Z=0.
      slabMesh.position.z = 0;
      group.add(slabMesh);

      if (door.type === 'standard') {
        const handleRadius = 1.5;
        const handleLength = 10;
        const handleGeom = new THREE.CylinderGeometry(handleRadius, handleRadius, handleLength, 16);
        const handleMesh = new THREE.Mesh(handleGeom, handleMaterial);
        handleMesh.rotation.z = Math.PI / 2;

        const handleXOffset = dWidth / 2 - 8;
        const handleYOffset = 0; // Vertically centered on slab's local Y
        const handleZOffset = dThickness / 2 + handleRadius; // Protruding from slab face

        handleMesh.position.set(handleXOffset, handleYOffset, handleZOffset);
        slabMesh.add(handleMesh);

        const handleMesh2 = handleMesh.clone();
        handleMesh2.position.z = -handleZOffset;
        slabMesh.add(handleMesh2);
      }
    } else if (door.type === 'folding') {
      const panelWidth = dWidth / 2;
      const panelGeom = new THREE.BoxGeometry(panelWidth, dHeight, dThickness);

      const panel1Mesh = new THREE.Mesh(panelGeom, doorMaterial);
      // Position panels so their outer edges are where a normal slab's edges would be
      panel1Mesh.position.set(-panelWidth / 2, dHeight / 2, 0);
      group.add(panel1Mesh);

      const panel2Mesh = new THREE.Mesh(panelGeom, doorMaterial);
      panel2Mesh.position.set(panelWidth / 2, dHeight / 2, 0);
      group.add(panel2Mesh);
      // Hinges and animation would be more complex
    }

    // Adjust group position so its base is at Y=0
    // The internal elements were positioned assuming Y=0 is the floor.
    // The group itself doesn't need adjustment if its children are positioned correctly relative to its origin.

    return group;
  }, [door]);

  return <primitive object={doorGroup} />;
};

export default ParametricDoorModel;
