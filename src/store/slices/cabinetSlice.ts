
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Cabinet } from '../types';
import { isRectangleOverlap } from '../utils/geometryUtils';

export interface CabinetSlice {
  cabinets: Cabinet[];
  baseCabinetHeight: number;
  baseCabinetDepth: number;
  wallCabinetHeight: number;
  wallCabinetDepth: number;
  tallCabinetHeight: number;
  tallCabinetDepth: number;
  addCabinet: (cabinetOrId: Omit<Cabinet, 'id'> | string, updates?: Partial<Cabinet>) => void;
  updateCabinet: (cabinetOrId: Cabinet | string, updates?: Partial<Cabinet>) => void;
  removeCabinet: (id: string) => void;
  updateBaseCabinetDimensions: (height: number, depth: number) => void;
  updateWallCabinetDimensions: (height: number, depth: number) => void;
  updateTallCabinetDimensions: (height: number, depth: number) => void;
  checkCabinetOverlap: (cabinet: Cabinet) => { x: number; y: number };
}

export const createCabinetSlice: StateCreator<KitchenStore, [], [], CabinetSlice> = (set, get) => ({
  cabinets: [],
  baseCabinetHeight: 85,
  baseCabinetDepth: 60,
  wallCabinetHeight: 70,
  wallCabinetDepth: 35,
  tallCabinetHeight: 210,
  tallCabinetDepth: 60,
  
  checkCabinetOverlap: (cabinet) => {
    const { cabinets } = get();
    const cabinetType = cabinet.type;
    
    // New position to return if overlap is detected
    let newPosition = { ...cabinet.position };
    let hasOverlap = false;
    
    // Check against all cabinets of the same type
    for (const existingCabinet of cabinets) {
      // Only check against same type cabinets and ignore self
      if (existingCabinet.id === cabinet.id || existingCabinet.type !== cabinetType) {
        continue;
      }
      
      if (isRectangleOverlap(
        cabinet.position, cabinet.width, cabinet.depth, cabinet.rotation,
        existingCabinet.position, existingCabinet.width, existingCabinet.depth, existingCabinet.rotation
      )) {
        hasOverlap = true;
        
        // Determine which side to move to based on relative positions
        // For simplicity, we'll move horizontally (could be improved to check both directions)
        if (cabinet.position.x < existingCabinet.position.x) {
          // Move left
          newPosition.x = existingCabinet.position.x - (existingCabinet.width / 2) - (cabinet.width / 2);
        } else {
          // Move right
          newPosition.x = existingCabinet.position.x + (existingCabinet.width / 2) + (cabinet.width / 2);
        }
        
        // For wall cabinets, we might want to adjust Y position as well
        if (cabinetType === 'wall' && cabinet.position.y === existingCabinet.position.y) {
          // Maybe adjust vertical position for wall cabinets
        }
        
        break; // Take the first overlap adjustment
      }
    }
    
    return hasOverlap ? newPosition : cabinet.position;
  },
  
  addCabinet: (cabinetOrId, updates) => {
    // If only one parameter is passed and it's an object, treat it as the cabinet
    if (typeof cabinetOrId === 'object') {
      const cabinet = cabinetOrId;
      set((state) => {
        // Apply global size settings based on cabinet type
        let updatedCabinet = { ...cabinet };
        
        if (cabinet.type === 'base') {
          if (!cabinet.height) updatedCabinet.height = state.baseCabinetHeight;
          if (!cabinet.depth) updatedCabinet.depth = state.baseCabinetDepth;
          if (!cabinet.floorHeight) updatedCabinet.floorHeight = 0; // Base cabinets start at floor
        } 
        else if (cabinet.type === 'wall') {
          if (!cabinet.height) updatedCabinet.height = state.wallCabinetHeight;
          if (!cabinet.depth) updatedCabinet.depth = state.wallCabinetDepth;
          if (!cabinet.floorHeight) updatedCabinet.floorHeight = 145; // 145cm from floor is standard
        }
        else if (cabinet.type === 'tall') {
          if (!cabinet.height) updatedCabinet.height = state.tallCabinetHeight;
          if (!cabinet.depth) updatedCabinet.depth = state.tallCabinetDepth;
          if (!cabinet.floorHeight) updatedCabinet.floorHeight = 0; // Tall cabinets start at floor
        }
        
        // Ensure frontType is always set
        if (!updatedCabinet.frontType) {
          updatedCabinet.frontType = 'shutter';
        }
        
        // Ensure finish is always set
        if (!updatedCabinet.finish) {
          updatedCabinet.finish = 'laminate';
        }
        
        const newCabinet = { ...updatedCabinet, id: uuidv4() };
        
        // Check for overlaps with existing cabinets before adding
        const { checkCabinetOverlap } = get();
        newCabinet.position = checkCabinetOverlap(newCabinet);
        
        return { 
          cabinets: [...state.cabinets, newCabinet] 
        };
      });
    }
  },
  
  updateCabinet: (cabinetOrId, updates) => {
    if (typeof cabinetOrId === 'string' && updates) {
      // Two parameter version: updateCabinet(id, updates)
      const id = cabinetOrId;
      set((state) => ({
        cabinets: state.cabinets.map(cabinet => 
          cabinet.id === id ? { ...cabinet, ...updates } : cabinet
        )
      }));
    } else if (typeof cabinetOrId === 'object') {
      // One parameter version: updateCabinet(cabinet)
      const cabinet = cabinetOrId as Cabinet;
      set((state) => {
        const { cabinets, checkCabinetOverlap } = get();
        
        // Find the cabinet that's being updated
        const cabinetIndex = cabinets.findIndex(c => c.id === cabinet.id);
        if (cabinetIndex === -1) return { cabinets };
        
        // Create the updated cabinet
        const oldCabinet = cabinets[cabinetIndex];
        const updatedCabinet = { ...oldCabinet, ...cabinet };
        
        // Check if position update causes overlap and adjust if needed
        if (cabinet.position) {
          updatedCabinet.position = checkCabinetOverlap(updatedCabinet);
        }
        
        // Create new cabinet array with the updated cabinet
        const newCabinets = [...cabinets];
        newCabinets[cabinetIndex] = updatedCabinet;
        
        return { cabinets: newCabinets };
      });
    }
  },
  
  removeCabinet: (id) => set((state) => ({
    cabinets: state.cabinets.filter(cabinet => cabinet.id !== id)
  })),
  
  // Update global cabinet dimensions
  updateBaseCabinetDimensions: (height, depth) => set((state) => {
    // Update all existing base cabinets to match new dimensions
    const updatedCabinets = state.cabinets.map(cabinet => {
      if (cabinet.type === 'base') {
        return { ...cabinet, height, depth };
      }
      return cabinet;
    });
    
    return {
      baseCabinetHeight: height,
      baseCabinetDepth: depth,
      cabinets: updatedCabinets
    };
  }),
  
  updateWallCabinetDimensions: (height, depth) => set((state) => {
    // Update all existing wall cabinets to match new dimensions
    const updatedCabinets = state.cabinets.map(cabinet => {
      if (cabinet.type === 'wall') {
        return { ...cabinet, height, depth };
      }
      return cabinet;
    });
    
    return {
      wallCabinetHeight: height,
      wallCabinetDepth: depth,
      cabinets: updatedCabinets
    };
  }),
  
  updateTallCabinetDimensions: (height, depth) => set((state) => {
    // Update all existing tall cabinets to match new dimensions
    const updatedCabinets = state.cabinets.map(cabinet => {
      if (cabinet.type === 'tall') {
        return { ...cabinet, height, depth };
      }
      return cabinet;
    });
    
    return {
      tallCabinetHeight: height,
      tallCabinetDepth: depth,
      cabinets: updatedCabinets
    };
  }),
});
