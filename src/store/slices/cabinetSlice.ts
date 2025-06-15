
import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import { KitchenStore } from '../types/storeTypes';
import { Cabinet, CabinetDimensions, CabinetProperties, Point } from '../types';

export interface CabinetSlice {
  cabinets: Cabinet[];
  
  addCabinet: (cabinet: Omit<Cabinet, 'id'>) => void;
  updateCabinetPosition: (id: string, position: Point) => void;
  updateCabinetRotation: (id: string, rotation: number) => void;
  updateCabinetDimensions: (id: string, dimensions: CabinetDimensions) => void;
  updateCabinetProperties: (id: string, properties: CabinetProperties) => void;
  deleteCabinet: (id: string) => void;
  duplicateCabinet: (id: string) => void;
}

export const createCabinetSlice: StateCreator<KitchenStore, [], [], CabinetSlice> = (set, get) => ({
  cabinets: [],
  
  addCabinet: (cabinetData) => set((state) => {
    // Auto-set height and depth based on cabinet type
    let height = cabinetData.height;
    let depth = cabinetData.depth;
    
    if (height === 0) {
      switch (cabinetData.type) {
        case 'base':
          height = 85;
          break;
        case 'wall':
          height = 70;
          break;
        case 'tall':
          height = 210;
          break;
        case 'loft': // New case
          height = 40; // Default height for loft cabinets
          break;
        default:
          height = 85; // Default to base cabinet height if type is unknown
      }
    }
    
    if (depth === 0) {
      switch (cabinetData.type) {
        case 'base':
          depth = 60;
          break;
        case 'wall':
          depth = 35;
          break;
        case 'tall':
          depth = 60;
          break;
        case 'loft': // New case
          depth = 35; // Default depth for loft cabinets
          break;
        default:
          depth = 60; // Default to base cabinet depth if type is unknown
      }
    }
    
    // Create the cabinet with default values for any missing properties
    const newCabinet: Cabinet = {
      id: nanoid(),
      ...cabinetData,
      height,
      depth,
      drawers: cabinetData.drawers || (cabinetData.frontType === 'drawer' ? 1 : undefined),
    };
    
    return {
      cabinets: [...state.cabinets, newCabinet]
    };
  }),
  
  updateCabinetPosition: (id, position) => set((state) => ({
    cabinets: state.cabinets.map(cab => 
      cab.id === id ? { ...cab, position } : cab
    )
  })),
  
  updateCabinetRotation: (id, rotation) => set((state) => ({
    cabinets: state.cabinets.map(cab => 
      cab.id === id ? { ...cab, rotation } : cab
    )
  })),
  
  updateCabinetDimensions: (id, dimensions) => set((state) => ({
    cabinets: state.cabinets.map(cab => 
      cab.id === id ? { ...cab, ...dimensions } : cab
    )
  })),
  
  updateCabinetProperties: (id, properties) => set((state) => ({
    cabinets: state.cabinets.map(cab => 
      cab.id === id ? { ...cab, ...properties } : cab
    )
  })),
  
  deleteCabinet: (id) => set((state) => ({
    cabinets: state.cabinets.filter(cab => cab.id !== id)
  })),
  
  duplicateCabinet: (id) => set((state) => {
    const cabinetToDuplicate = state.cabinets.find(cab => cab.id === id);
    
    if (!cabinetToDuplicate) return state;
    
    // Create a duplicate with slight position offset
    const duplicatedCabinet: Cabinet = {
      ...cabinetToDuplicate,
      id: nanoid(),
      position: {
        x: cabinetToDuplicate.position.x + 20,
        y: cabinetToDuplicate.position.y + 20
      }
    };
    
    return {
      cabinets: [...state.cabinets, duplicatedCabinet]
    };
  })
});
