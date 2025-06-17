import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Door, Window, Cabinet, Appliance, Wall } from '../types'; // Added Cabinet, Appliance, Wall
import { updateAllCollisions } from '../utils/collisionUtils'; // Added import

export interface OpeningSlice {
  doors: Door[];
  windows: Window[];
  addDoor: (doorData: Omit<Door, 'id' | 'isColliding'>) => void; // Added isColliding to Omit
  updateDoor: (id: string, updates: Partial<Door>) => void;
  removeDoor: (id: string) => void;
  addWindow: (window: Omit<Window, 'id'>) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  removeWindow: (id: string) => void;
}

export const createOpeningSlice: StateCreator<KitchenStore, [], [], OpeningSlice> = (set, get) => ({
  doors: [],
  windows: [],
  
  addDoor: (doorData) => set((state) => {
    const newDoor: Door = {
      id: nanoid(),
      ...doorData,
      type: doorData.type || 'standard',
      doorThickness: doorData.doorThickness !== undefined ? doorData.doorThickness : 4,
      frameThickness: doorData.frameThickness !== undefined ? doorData.frameThickness : 5,
      frameDepth: doorData.frameDepth !== undefined ? doorData.frameDepth : 12,
      isColliding: false, // Initialize isColliding
    };

    const newDoorsArray = [...state.doors, newDoor];
    const collisionResult = updateAllCollisions(state.cabinets, state.appliances, newDoorsArray, state.walls);

    return {
      cabinets: collisionResult.updatedCabinets,
      appliances: collisionResult.updatedAppliances,
      doors: collisionResult.updatedDoors,
      // selectedItemId: newDoor.id, // Optional: if doors become selectable
      // currentToolMode: 'select',   // Optional: if adding a door changes tool mode
    };
  }),
  
  updateDoor: (id, updates) => set((state) => {
    let needsCollisionCheck = false;
    const relevantProps: (keyof Door)[] = [
        'position', 'width', 'height',
        'doorThickness', 'frameThickness', 'frameDepth'
        // type change could also matter if future 3D models differ significantly
    ];
    for (const prop of relevantProps) {
       if (updates[prop] !== undefined) {
           needsCollisionCheck = true;
           break;
       }
    }

    const updatedDoorsIntermediate = state.doors.map(door =>
      door.id === id ? { ...door, ...updates } : door
    );

    if (needsCollisionCheck) {
      const collisionResult = updateAllCollisions(state.cabinets, state.appliances, updatedDoorsIntermediate, state.walls);
      return {
        cabinets: collisionResult.updatedCabinets,
        appliances: collisionResult.updatedAppliances,
        doors: collisionResult.updatedDoors,
      };
    } else {
      return { doors: updatedDoorsIntermediate };
    }
  }),
  
  removeDoor: (id) => set((state) => {
    const remainingDoors = state.doors.filter(door => door.id !== id);
    const collisionResult = updateAllCollisions(state.cabinets, state.appliances, remainingDoors, state.walls);
    return {
      cabinets: collisionResult.updatedCabinets,
      appliances: collisionResult.updatedAppliances,
      doors: collisionResult.updatedDoors,
      // selectedItemId: state.selectedItemId === id ? null : state.selectedItemId, // If doors can be selected
    };
  }),
  
  addWindow: (windowData) => set((state) => ({ // Renamed param for clarity
    windows: [...state.windows, { 
      ...windowData,
      id: nanoid(), // Changed from uuidv4 to nanoid
      type: windowData.type || 'standard'
    }] 
  })),
  
  updateWindow: (id, updates) => set((state) => ({
    windows: state.windows.map(window => window.id === id ? { ...window, ...updates } : window)
  })),
  
  removeWindow: (id) => set((state) => ({
    windows: state.windows.filter(window => window.id !== id)
  })),
});
