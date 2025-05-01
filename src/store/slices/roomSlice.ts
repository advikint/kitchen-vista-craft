
import { v4 as uuidv4 } from 'uuid';
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
}

export const createRoomSlice: StateCreator<KitchenStore, [], [], RoomSlice> = (set) => ({
  room: { width: 300, height: 400 },
  walls: [],
  currentWallIndex: 0,
  
  setRoom: (room) => set({ room }),
  
  setCurrentWallIndex: (index) => set({ currentWallIndex: index }),
  
  addWall: (wallData) => set((state) => {
    const newWall: Wall = { 
      id: uuidv4(), 
      ...wallData,
      label: wallData.label || '' // Ensure label property is present
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
  
  resetWalls: () => set((state) => {
    const { width, height } = state.room;
    
    // Create four walls for the room
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    const walls: Wall[] = [
      {
        id: uuidv4(),
        start: { x: -halfWidth, y: -halfHeight },
        end: { x: halfWidth, y: -halfHeight },
        height: 250,
        thickness: 15,
        color: '#686868',
        label: 'North Wall'
      },
      {
        id: uuidv4(),
        start: { x: halfWidth, y: -halfHeight },
        end: { x: halfWidth, y: halfHeight },
        height: 250,
        thickness: 15,
        color: '#686868',
        label: 'East Wall'
      },
      {
        id: uuidv4(),
        start: { x: halfWidth, y: halfHeight },
        end: { x: -halfWidth, y: halfHeight },
        height: 250,
        thickness: 15,
        color: '#686868',
        label: 'South Wall'
      },
      {
        id: uuidv4(),
        start: { x: -halfWidth, y: halfHeight },
        end: { x: -halfWidth, y: -halfHeight },
        height: 250,
        thickness: 15,
        color: '#686868',
        label: 'West Wall'
      }
    ];
    
    return { walls, currentWallIndex: 0 };
  })
});
