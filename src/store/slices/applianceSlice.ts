
import { nanoid } from 'nanoid'; // Changed from uuidv4 for consistency
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Appliance, Point } from '../types'; // Added Point for position update
import { updateAllCollisions } from '../utils/collisionUtils';

export interface ApplianceSlice {
  appliances: Appliance[];
  addAppliance: (applianceData: Omit<Appliance, 'id' | 'isColliding'>) => void; // Simplified signature for this context
  updateAppliancePosition: (id: string, position: Point) => void; // Specific updater for position
  updateAppliance: (id: string, updates: Partial<Omit<Appliance, 'id'>>) => void; // Generic updater
  removeAppliance: (id: string) => void;
}

export const createApplianceSlice: StateCreator<KitchenStore, [], [], ApplianceSlice> = (set, get) => ({
  appliances: [],
  
  addAppliance: (applianceData) => set((state) => {
    const newAppliance: Appliance = {
      id: nanoid(),
      ...applianceData,
      isColliding: false, // Initialize
    };
    const newAppliancesArray = [...state.appliances, newAppliance];
    const { updatedCabinets, updatedAppliances } = updateAllCollisions(state.cabinets, newAppliancesArray);
    return {
        cabinets: updatedCabinets,
        appliances: updatedAppliances,
        selectedItemId: newAppliance.id,
        currentToolMode: 'select',
    };
  }),

  updateAppliancePosition: (id, position) => set((state) => {
    const updatedAppliancesIntermediate = state.appliances.map(app =>
        app.id === id ? { ...app, position } : app
    );
    const { updatedCabinets, updatedAppliances } = updateAllCollisions(state.cabinets, updatedAppliancesIntermediate);
    return { cabinets: updatedCabinets, appliances: updatedAppliances };
  }),
  
  // Generic update function, if position is updated, it should also trigger collision
  // For simplicity, this example assumes major collision-affecting changes go via specific updaters like updateAppliancePosition
  // or a more comprehensive update action.
  updateAppliance: (id, updates) => set((state) => {
    let collisionCheckNeeded = false;
    const updatedAppliancesIntermediate = state.appliances.map(appliance => {
      if (appliance.id === id) {
        if (updates.position || updates.width || updates.height || updates.depth || updates.rotation) {
          collisionCheckNeeded = true;
        }
        return { ...appliance, ...updates };
      }
      return appliance;
    });

    if (collisionCheckNeeded) {
      const { updatedCabinets, updatedAppliances } = updateAllCollisions(state.cabinets, updatedAppliancesIntermediate);
      return { cabinets: updatedCabinets, appliances: updatedAppliances };
    } else {
      return { appliances: updatedAppliancesIntermediate };
    }
  }),
  
  removeAppliance: (id: string) => set((state) => {
    const remainingAppliances = state.appliances.filter(app => app.id !== id);
    const { updatedCabinets, updatedAppliances } = updateAllCollisions(state.cabinets, remainingAppliances);
    return {
        cabinets: updatedCabinets,
        appliances: updatedAppliances,
        selectedItemId: null
    };
  }),
});
