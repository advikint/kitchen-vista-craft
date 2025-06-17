import * as THREE from 'three';
import { Cabinet, Appliance, Door, Wall } from '../types';
import { CollisionItem as GeometryCollisionItem, has3DOverlap } from './geometryUtils';

// Temporary structure to hold items with their original IDs and types for collision processing
interface ProcessableItem extends GeometryCollisionItem {
  id: string;
  originalType: 'cabinet' | 'appliance' | 'door';
}

// Helper to map store items to ProcessableItem format
const mapCabinetToProcessableItem = (item: Cabinet): ProcessableItem => ({
  id: item.id,
  originalType: 'cabinet',
  position: item.position, // Ground plane {x, y} from store
  width: item.width,
  height: item.height,     // Actual vertical height
  depth: item.depth,
  rotation: item.rotation || 0,
});

const mapApplianceToProcessableItem = (item: Appliance): ProcessableItem => ({
  id: item.id,
  originalType: 'appliance',
  position: item.position, // Ground plane {x, y} from store
  width: item.width,
  height: item.height,     // Actual vertical height
  depth: item.depth,
  rotation: item.rotation || 0,
});

const mapDoorToProcessableItem = (door: Door, parentWall: Wall): ProcessableItem | null => {
  if (!parentWall) return null;

  const wallDx = parentWall.end.x - parentWall.start.x;
  const wallDy = parentWall.end.y - parentWall.start.y;

  // Door's center X,Z on ground plane, calculated from wall and door.position (0-1 along wall length)
  const doorCenterX = parentWall.start.x + wallDx * door.position;
  const doorCenterZ = parentWall.start.y + wallDy * door.position; // Store's Y (wall's y) is 3D Z

  const wallAngleRad = Math.atan2(wallDy, wallDx);
  // Door's rotation should align with the wall's orientation.
  // The door mesh itself might be oriented along its local X or Z axis.
  // Assuming door model's "front" is along its local Z+ axis when rotation is 0.
  // A wall's angle is its direction in XY (our XZ). A door on it needs this angle.
  const doorRotationDegrees = wallAngleRad * (180 / Math.PI);

  return {
    id: door.id,
    originalType: 'door',
    position: { x: doorCenterX, y: doorCenterZ }, // Ground plane center {x, z}
    width: door.width,                           // Width of the door opening (becomes X dimension)
    height: door.height,                         // Height of the door (becomes Y dimension)
    depth: door.frameDepth || 12,                // Effective depth for collision (becomes Z dimension)
    rotation: doorRotationDegrees,
  };
};

export interface CollisionUpdateResult {
  updatedCabinets: Cabinet[];
  updatedAppliances: Appliance[];
  updatedDoors: Door[]; // Added doors
}

export const updateAllCollisions = (
  cabinets: Cabinet[],
  appliances: Appliance[],
  doors: Door[],         // Added doors
  walls: Wall[]          // Added walls
): CollisionUpdateResult => {
  const processableItems: ProcessableItem[] = [];

  cabinets.forEach(cab => {
    if (cab.position && cab.width !== undefined && cab.height !== undefined && cab.depth !== undefined) {
      processableItems.push(mapCabinetToProcessableItem(cab));
    } else {
      console.warn("Skipping cabinet with missing properties for collision detection:", cab.id);
    }
  });
  appliances.forEach(app => {
    if (app.position && app.width !== undefined && app.height !== undefined && app.depth !== undefined) {
      processableItems.push(mapApplianceToProcessableItem(app));
    } else {
      console.warn("Skipping appliance with missing properties for collision detection:", app.id);
    }
  });
  doors.forEach(door => {
    const parentWall = walls.find(w => w.id === door.wallId);
    if (parentWall) {
      const mappedDoor = mapDoorToProcessableItem(door, parentWall);
      if (mappedDoor) { // mappedDoor will be null if parentWall is somehow missing (should not happen if data is consistent)
         if (mappedDoor.position && mappedDoor.width !== undefined && mappedDoor.height !== undefined && mappedDoor.depth !== undefined) {
            processableItems.push(mappedDoor);
         } else {
            console.warn("Skipping door with missing properties after mapping for collision detection:", door.id);
         }
      }
    } else {
        console.warn("Skipping door with no parent wall found for collision detection:", door.id, "wallId:", door.wallId);
    }
  });

  const collidingItemIds = new Set<string>();

  for (let i = 0; i < processableItems.length; i++) {
    for (let j = i + 1; j < processableItems.length; j++) {
      const itemA = processableItems[i];
      const itemB = processableItems[j];

      // has3DOverlap expects items matching GeometryCollisionItem (which ProcessableItem extends)
      if (has3DOverlap(itemA, itemB)) {
        collidingItemIds.add(itemA.id);
        collidingItemIds.add(itemB.id);
      }
    }
  }

  const updatedCabinets = cabinets.map(cab => ({
    ...cab,
    isColliding: collidingItemIds.has(cab.id),
  }));

  const updatedAppliances = appliances.map(app => ({
    ...app,
    isColliding: collidingItemIds.has(app.id),
  }));

  const updatedDoors = doors.map(door => ({
    ...door,
    isColliding: collidingItemIds.has(door.id),
  }));

  return { updatedCabinets, updatedAppliances, updatedDoors };
};
