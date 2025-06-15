
import { nanoid } from 'nanoid'; // Changed from uuidv4
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Door, Window } from '../types'; // Door type is already imported

export interface OpeningSlice {
  doors: Door[];
  windows: Window[];
  addDoor: (doorData: Omit<Door, 'id'>) => void; // Renamed parameter for clarity
  updateDoor: (id: string, updates: Partial<Door>) => void;
  removeDoor: (id: string) => void;
  addWindow: (window: Omit<Window, 'id'>) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  removeWindow: (id: string) => void;
}

export const createOpeningSlice: StateCreator<KitchenStore, [], [], OpeningSlice> = (set) => ({
  doors: [],
  windows: [],
  
  addDoor: (doorData) => set((state) => {
    const newDoor: Door = {
      id: nanoid(),
      ...doorData, // Spread incoming data first
      type: doorData.type || 'standard', // Preserve existing type defaulting

      // Initialize new parametric properties with defaults if not provided
      doorThickness: doorData.doorThickness !== undefined ? doorData.doorThickness : 4, // Default 4cm
      frameThickness: doorData.frameThickness !== undefined ? doorData.frameThickness : 5, // Default 5cm
      frameDepth: doorData.frameDepth !== undefined ? doorData.frameDepth : 12,     // Default 12cm
    };

    return {
      doors: [...state.doors, newDoor]
    };
  }),
  
  updateDoor: (id, updates) => set((state) => ({
    doors: state.doors.map(door => door.id === id ? { ...door, ...updates } : door)
  })),
  
  removeDoor: (id) => set((state) => ({
    doors: state.doors.filter(door => door.id !== id)
  })),
  
  addWindow: (window) => set((state) => ({ 
    windows: [...state.windows, { 
      ...window, 
      id: uuidv4(),
      type: window.type || 'standard'
    }] 
  })),
  
  updateWindow: (id, updates) => set((state) => ({
    windows: state.windows.map(window => window.id === id ? { ...window, ...updates } : window)
  })),
  
  removeWindow: (id) => set((state) => ({
    windows: state.windows.filter(window => window.id !== id)
  })),
});
