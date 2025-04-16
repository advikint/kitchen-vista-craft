
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Room, Wall } from '../types';

export interface RoomSlice {
  room: Room;
  walls: Wall[];
  currentWallIndex: number;
  setRoom: (room: Room) => void;
  resetWalls: () => void;
  addWall: (wall: Omit<Wall, 'id'>) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;
  setCurrentWallIndex: (index: number) => void;
}

export const createRoomSlice: StateCreator<KitchenStore, [], [], RoomSlice> = (set) => ({
  room: { width: 300, height: 400 },
  walls: [],
  currentWallIndex: 0,
  
  setRoom: (room) => set({ room }),
  
  resetWalls: () => set({ walls: [] }),
  
  addWall: (wall) => set((state) => {
    // Create new wall with required properties
    const newWall = {
      ...wall,
      id: uuidv4(),
      thickness: wall.thickness || 10 // Default 10cm (100mm)
    };

    // If no label is provided, generate one based on wall count
    if (!newWall.label) {
      const wallCount = state.walls.length;
      // Use letters A-Z for the first 26 walls, then Wall 27, Wall 28, etc.
      newWall.label = wallCount < 26 
        ? `Wall ${String.fromCharCode(65 + wallCount)}` 
        : `Wall ${wallCount + 1}`;
    }
    
    return { 
      walls: [...state.walls, newWall] 
    };
  }),
  
  updateWall: (id, updates) => set((state) => ({
    walls: state.walls.map(wall => wall.id === id ? { ...wall, ...updates } : wall)
  })),
  
  removeWall: (id) => set((state) => ({
    walls: state.walls.filter(wall => wall.id !== id),
    // Also ensure selectedItemId is cleared if it was this wall
    selectedItemId: state.selectedItemId === id ? null : state.selectedItemId
  })),
  
  setCurrentWallIndex: (index) => set({ currentWallIndex: index }),
});
