
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
    const wallCount = state.walls.length;
    const wallLabels = ['Wall A', 'Wall B', 'Wall C', 'Wall D'];
    const label = wallCount < 4 ? wallLabels[wallCount] : `Wall ${wallCount + 1}`;
    
    return { 
      walls: [...state.walls, { 
        ...wall, 
        id: uuidv4(),
        label,
        thickness: wall.thickness || 10 // Default 10cm (100mm)
      }] 
    };
  }),
  
  updateWall: (id, updates) => set((state) => ({
    walls: state.walls.map(wall => wall.id === id ? { ...wall, ...updates } : wall)
  })),
  
  removeWall: (id) => set((state) => ({
    walls: state.walls.filter(wall => wall.id !== id)
  })),
  
  setCurrentWallIndex: (index) => set({ currentWallIndex: index }),
});
