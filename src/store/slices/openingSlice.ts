
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Door, Window } from '../types';

export interface OpeningSlice {
  doors: Door[];
  windows: Window[];
  addDoor: (door: Omit<Door, 'id'>) => void;
  updateDoor: (id: string, updates: Partial<Door>) => void;
  removeDoor: (id: string) => void;
  addWindow: (window: Omit<Window, 'id'>) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  removeWindow: (id: string) => void;
}

export const createOpeningSlice: StateCreator<KitchenStore, [], [], OpeningSlice> = (set) => ({
  doors: [],
  windows: [],
  
  addDoor: (door) => set((state) => ({ 
    doors: [...state.doors, { ...door, id: uuidv4(), type: door.type || 'standard' }] 
  })),
  
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
