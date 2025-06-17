import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import { KitchenStore } from '../types/storeTypes';
import { Cabinet, CabinetDimensions, CabinetProperties, Point, Appliance, Door, Wall } from '../types'; // Added Appliance, Door, Wall for clarity in state usage
import { updateAllCollisions } from '../utils/collisionUtils';

export interface CabinetSlice {
  cabinets: Cabinet[];
  
  addCabinet: (cabinet: Omit<Cabinet, 'id'>) => void;
  updateCabinetPosition: (id: string, position: Point) => void;
  updateCabinetRotation: (id: string, rotation: number) => void;
  updateCabinetDimensions: (id: string, dimensions: CabinetDimensions) => void;
  updateCabinetProperties: (id: string, properties: Partial<Cabinet>) => void; // Changed to Partial<Cabinet> for broader updates
  deleteCabinet: (id: string) => void;
  duplicateCabinet: (id: string) => void;
}

export const createCabinetSlice: StateCreator<KitchenStore, [], [], CabinetSlice> = (set, get) => ({
  cabinets: [],
  
  addCabinet: (cabinetData) => set((state) => {
    let height = cabinetData.height;
    let depth = cabinetData.depth;
    
    if (height === 0 || height === undefined) { // Added undefined check
      switch (cabinetData.type) {
        case 'base': height = 85; break;
        case 'wall': height = 70; break;
        case 'tall': height = 210; break;
        case 'loft': height = 40; break;
        default: height = 85;
      }
    }
    
    if (depth === 0 || depth === undefined) { // Added undefined check
      switch (cabinetData.type) {
        case 'base': depth = 60; break;
        case 'wall': depth = 35; break;
        case 'tall': depth = 60; break;
        case 'loft': depth = 35; break;
        default: depth = 60;
      }
    }
    
    const newCabinet: Cabinet = {
      id: nanoid(),
      ...cabinetData,
      height,
      depth,
      drawers: cabinetData.drawers || (cabinetData.frontType === 'drawer' ? 1 : undefined),
      toeKickHeight: cabinetData.toeKickHeight !== undefined ? cabinetData.toeKickHeight :
                     (cabinetData.type === 'base' ? 10 : undefined),
      toeKickDepth: cabinetData.toeKickDepth !== undefined ? cabinetData.toeKickDepth :
                    (cabinetData.type === 'base' ? 5 : undefined),
      shelfCount: cabinetData.shelfCount !== undefined ? cabinetData.shelfCount :
                  (cabinetData.frontType === 'drawer' ? 0 :
                   cabinetData.type === 'base' ? 1 :
                   cabinetData.type === 'wall' ? 1 :
                   cabinetData.type === 'loft' ? 1 :
                   cabinetData.type === 'tall' ? 3 :
                   0),
      doorStyle: cabinetData.doorStyle || 'slab',
      isColliding: false,
    };
    
    const newCabinetsArray = [...state.cabinets, newCabinet];
    const collisionResult = updateAllCollisions(newCabinetsArray, state.appliances, state.doors, state.walls);
    return {
      cabinets: collisionResult.updatedCabinets,
      appliances: collisionResult.updatedAppliances,
      doors: collisionResult.updatedDoors,
      selectedItemId: newCabinet.id,
      currentToolMode: 'select',
    };
  }),
  
  updateCabinetPosition: (id, position) => set((state) => {
    const updatedCabinetsIntermediate = state.cabinets.map(cab =>
      cab.id === id ? { ...cab, position } : cab
    );
    const collisionResult = updateAllCollisions(updatedCabinetsIntermediate, state.appliances, state.doors, state.walls);
    return {
      cabinets: collisionResult.updatedCabinets,
      appliances: collisionResult.updatedAppliances,
      doors: collisionResult.updatedDoors,
    };
  }),
  
  updateCabinetRotation: (id, rotation) => set((state) => {
    const updatedCabinetsIntermediate = state.cabinets.map(cab =>
      cab.id === id ? { ...cab, rotation } : cab
    );
    const collisionResult = updateAllCollisions(updatedCabinetsIntermediate, state.appliances, state.doors, state.walls);
    return {
      cabinets: collisionResult.updatedCabinets,
      appliances: collisionResult.updatedAppliances,
      doors: collisionResult.updatedDoors,
    };
  }),
  
  updateCabinetDimensions: (id, dimensions) => set((state) => {
    const updatedCabinetsIntermediate = state.cabinets.map(cab =>
      cab.id === id ? { ...cab, ...dimensions } : cab
    );
    const collisionResult = updateAllCollisions(updatedCabinetsIntermediate, state.appliances, state.doors, state.walls);
    return {
      cabinets: collisionResult.updatedCabinets,
      appliances: collisionResult.updatedAppliances,
      doors: collisionResult.updatedDoors,
    };
  }),
  
  updateCabinetProperties: (id, properties) => set((state) => {
    const updatedCabinetsIntermediate = state.cabinets.map(cab =>
      cab.id === id ? { ...cab, ...properties } : cab
    );
    // Check if any collision-relevant properties were changed
    // For cabinets, these are width, height, depth, position, rotation.
    // Position and rotation are handled by their specific updaters.
    // Dimensions (width, height, depth) are handled by updateCabinetDimensions.
    // This function is more for non-geometric properties or those whose geometric impact is complex (e.g. doorStyle).
    // For simplicity now, assume if properties can include dimensions, a check is needed.
    // A more robust way would be to list specific properties that trigger collision.
    let needsCollisionCheck = false;
    const relevantProps: (keyof Cabinet)[] = ['width', 'height', 'depth']; // Add other relevant geometry props if any
    for (const prop of relevantProps) {
        if (properties[prop] !== undefined) {
            needsCollisionCheck = true;
            break;
        }
    }

    if (needsCollisionCheck) {
        const collisionResult = updateAllCollisions(updatedCabinetsIntermediate, state.appliances, state.doors, state.walls);
        return {
          cabinets: collisionResult.updatedCabinets,
          appliances: collisionResult.updatedAppliances,
          doors: collisionResult.updatedDoors,
        };
    } else {
        return { cabinets: updatedCabinetsIntermediate };
    }
  }),
  
  deleteCabinet: (id) => set((state) => {
    const remainingCabinets = state.cabinets.filter(cab => cab.id !== id);
    const collisionResult = updateAllCollisions(remainingCabinets, state.appliances, state.doors, state.walls);
    return {
        cabinets: collisionResult.updatedCabinets,
        appliances: collisionResult.updatedAppliances,
        doors: collisionResult.updatedDoors,
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    };
  }),
  
  duplicateCabinet: (id) => set((state) => {
    const cabinetToDuplicate = state.cabinets.find(cab => cab.id === id);
    if (!cabinetToDuplicate) return state; // Should not happen if UI is correct
    
    const duplicatedCabinet: Cabinet = {
      ...cabinetToDuplicate,
      id: nanoid(),
      position: {
        x: cabinetToDuplicate.position.x + 20, // Offset
        y: cabinetToDuplicate.position.y + 20  // Offset
      },
      isColliding: false, // Initial state for new cabinet
    };
    
    const newCabinetsArray = [...state.cabinets, duplicatedCabinet];
    const collisionResult = updateAllCollisions(newCabinetsArray, state.appliances, state.doors, state.walls);
    return {
      cabinets: collisionResult.updatedCabinets,
      appliances: collisionResult.updatedAppliances,
      doors: collisionResult.updatedDoors,
      selectedItemId: duplicatedCabinet.id, // Select the new duplicated cabinet
      currentToolMode: 'select',
    };
  })
});
