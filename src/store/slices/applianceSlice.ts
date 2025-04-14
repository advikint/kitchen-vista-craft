
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Appliance } from '../types';

export interface ApplianceSlice {
  appliances: Appliance[];
  addAppliance: (applianceOrId: Omit<Appliance, 'id'> | string, updates?: Partial<Appliance>) => void;
  updateAppliance: (applianceOrId: Appliance | string, updates?: Partial<Appliance>) => void;
  removeAppliance: (id: string) => void;
}

export const createApplianceSlice: StateCreator<KitchenStore, [], [], ApplianceSlice> = (set) => ({
  appliances: [],
  
  addAppliance: (applianceOrId, updates) => {
    // If only one parameter is passed and it's an object, treat it as the appliance
    if (typeof applianceOrId === 'object') {
      const appliance = applianceOrId;
      set((state) => ({ 
        appliances: [...state.appliances, { ...appliance, id: uuidv4() }] 
      }));
    }
  },
  
  updateAppliance: (applianceOrId, updates) => {
    if (typeof applianceOrId === 'string' && updates) {
      // Two parameter version: updateAppliance(id, updates)
      const id = applianceOrId;
      set((state) => ({
        appliances: state.appliances.map(appliance => 
          appliance.id === id ? { ...appliance, ...updates } : appliance
        )
      }));
    } else if (typeof applianceOrId === 'object') {
      // One parameter version: updateAppliance(appliance)
      const appliance = applianceOrId as Appliance;
      set((state) => ({
        appliances: state.appliances.map(a => 
          a.id === appliance.id ? { ...a, ...appliance } : a
        )
      }));
    }
  },
  
  removeAppliance: (id) => set((state) => ({
    appliances: state.appliances.filter(appliance => appliance.id !== id)
  })),
});
