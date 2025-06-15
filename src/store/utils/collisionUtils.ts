import * as THREE from 'three';
import { Cabinet, Appliance } from '../types';
import { CollisionItem, has3DOverlap, AABB } from './geometryUtils'; // Assuming AABB might be useful for debugging or future use

// Helper to map store items to CollisionItem format
const mapToCollisionItem = (item: Cabinet | Appliance): CollisionItem => ({
  position: item.position, // This is { x: number, y: number } for ground plane
  width: item.width,
  height: item.height, // This is the actual vertical height of the object
  depth: item.depth,
  rotation: item.rotation || 0,
  // id: item.id // Not needed by has3DOverlap, but good for debugging if necessary
});

interface CollisionUpdateResult {
  updatedCabinets: Cabinet[];
  updatedAppliances: Appliance[];
}

export const updateAllCollisions = (
  cabinets: Cabinet[],
  appliances: Appliance[]
): CollisionUpdateResult => {
  const allItems: (Cabinet | Appliance)[] = [...cabinets, ...appliances];
  const collidingItemIds = new Set<string>();

  for (let i = 0; i < allItems.length; i++) {
    for (let j = i + 1; j < allItems.length; j++) {
      const itemA = allItems[i];
      const itemB = allItems[j];

      // Basic check for necessary properties to avoid runtime errors with incomplete items
      if (!itemA.position || !itemB.position ||
          itemA.width === undefined || itemA.height === undefined || itemA.depth === undefined ||
          itemB.width === undefined || itemB.height === undefined || itemB.depth === undefined) {
        console.warn("Skipping collision check for items with missing properties:", itemA.id, itemB.id);
        continue;
      }

      const collisionItemA = mapToCollisionItem(itemA);
      const collisionItemB = mapToCollisionItem(itemB);

      if (has3DOverlap(collisionItemA, collisionItemB)) {
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

  return { updatedCabinets, updatedAppliances };
};
