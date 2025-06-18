import { nanoid } from 'nanoid'; // Changed from uuidv4
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Room, Wall } from '../types';

export interface RoomSlice {
  room: Room;
  walls: Wall[];
  currentWallIndex: number;
  
  setRoom: (room: Room) => void;
  setCurrentWallIndex: (index: number) => void;
  
  addWall: (wall: Omit<Wall, 'id'>) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;
  resetWalls: () => void;
  clearWalls: () => void; // New action
}

export const createRoomSlice: StateCreator<KitchenStore, [], [], RoomSlice> = (set) => ({
  room: { width: 300, height: 400 }, // Default room dimensions
  walls: [],
  currentWallIndex: 0,
  
  setRoom: (room) => set({ room }),
  
  setCurrentWallIndex: (index) => set({ currentWallIndex: index }),
  
  addWall: (wallData) => set((state) => {
    const newWall: Wall = { 
      id: nanoid(), // Changed to nanoid
      ...wallData,
      label: wallData.label || `Wall ${state.walls.length + 1}`
    };
    return { walls: [...state.walls, newWall] };
  }),
  
  updateWall: (id, updates) => set((state) => ({
    walls: state.walls.map(wall => 
      wall.id === id 
        ? { ...wall, ...updates } 
        : wall
    )
  })),
  
  removeWall: (id) => set((state) => ({
    walls: state.walls.filter(wall => wall.id !== id)
  })),
  
  resetWalls: () => set((state) => { // This function creates a default set of 4 walls
    const { width, height } = state.room;
    const wallHeight = 240; // Default wall height for reset scenario
    const wallThickness = 10; // Default wall thickness
    
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    const walls: Wall[] = [
      {
        id: nanoid(), // Changed to nanoid
        start: { x: -halfWidth, y: -halfHeight },
        end: { x: halfWidth, y: -halfHeight },
        height: wallHeight,
        thickness: wallThickness,
        color: '#DDDDDD', // Default wall color
        label: 'Wall A'
      },
      {
        id: nanoid(), // Changed to nanoid
        start: { x: halfWidth, y: -halfHeight },
        end: { x: halfWidth, y: halfHeight },
        height: wallHeight,
        thickness: wallThickness,
        color: '#DDDDDD',
        label: 'Wall B'
      },
      {
        id: nanoid(), // Changed to nanoid
        start: { x: halfWidth, y: halfHeight },
        end: { x: -halfWidth, y: halfHeight },
        height: wallHeight,
        thickness: wallThickness,
        color: '#DDDDDD',
        label: 'Wall C'
      },
      {
        id: nanoid(), // Changed to nanoid
        start: { x: -halfWidth, y: halfHeight },
        end: { x: -halfWidth, y: -halfHeight },
        height: wallHeight,
        thickness: wallThickness,
        color: '#DDDDDD',
        label: 'Wall D'
      }
    ];
    
    return { walls, currentWallIndex: 0 };
  }),

  clearWalls: () => set({ walls: [], currentWallIndex: 0 }), // Implementation of new action
});
