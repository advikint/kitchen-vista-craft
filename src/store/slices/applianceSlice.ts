import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { Appliance, Point, Cabinet, Door, Wall } from '../types'; // Added Cabinet, Door, Wall for clarity
import { updateAllCollisions } from '../utils/collisionUtils';

export interface ApplianceSlice {
  appliances: Appliance[];
  addAppliance: (applianceData: Omit<Appliance, 'id' | 'isColliding'>) => void;
  updateAppliancePosition: (id: string, position: Point) => void;
  updateAppliance: (id: string, updates: Partial<Omit<Appliance, 'id'>>) => void;
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
    const collisionResult = updateAllCollisions(state.cabinets, newAppliancesArray, state.doors, state.walls);
    return {
        cabinets: collisionResult.updatedCabinets,
        appliances: collisionResult.updatedAppliances,
        doors: collisionResult.updatedDoors,
        selectedItemId: newAppliance.id,
        currentToolMode: 'select',
    };
  }),

  updateAppliancePosition: (id, position) => set((state) => {
    const updatedAppliancesIntermediate = state.appliances.map(app =>
        app.id === id ? { ...app, position } : app
    );
    const collisionResult = updateAllCollisions(state.cabinets, updatedAppliancesIntermediate, state.doors, state.walls);
    return {
        cabinets: collisionResult.updatedCabinets,
        appliances: collisionResult.updatedAppliances,
        doors: collisionResult.updatedDoors,
    };
  }),
  
  updateAppliance: (id, updates) => set((state) => {
    let collisionCheckNeeded = false;
    // Define which properties of Appliance, if changed, necessitate a collision check
    const relevantCollisionProps: (keyof Appliance)[] = ['position', 'width', 'height', 'depth', 'rotation'];

    for (const prop of relevantCollisionProps) {
      if (updates[prop] !== undefined) {
        collisionCheckNeeded = true;
        break;
      }
    }

    const updatedAppliancesIntermediate = state.appliances.map(appliance => {
      if (appliance.id === id) {
        return { ...appliance, ...updates };
      }
      return appliance;
    });

    if (collisionCheckNeeded) {
      const collisionResult = updateAllCollisions(state.cabinets, updatedAppliancesIntermediate, state.doors, state.walls);
      return {
          cabinets: collisionResult.updatedCabinets,
          appliances: collisionResult.updatedAppliances,
          doors: collisionResult.updatedDoors,
      };
    } else {
      return { appliances: updatedAppliancesIntermediate };
    }
  }),
  
  removeAppliance: (id: string) => set((state) => {
    const remainingAppliances = state.appliances.filter(app => app.id !== id);
    const collisionResult = updateAllCollisions(state.cabinets, remainingAppliances, state.doors, state.walls);
    return {
        cabinets: collisionResult.updatedCabinets,
        appliances: collisionResult.updatedAppliances,
        doors: collisionResult.updatedDoors,
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    };
  }),
});
