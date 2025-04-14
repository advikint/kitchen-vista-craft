
import { create } from 'zustand';
import { KitchenStore } from './types/storeTypes';
import { createInitialState } from './initialState';
import { generateBOQ } from './utils/boqGenerator';
import { isPointInsideCabinet } from './utils/geometryUtils';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createRoomSlice, RoomSlice } from './slices/roomSlice';
import { createOpeningSlice, OpeningSlice } from './slices/openingSlice';
import { createCabinetSlice, CabinetSlice } from './slices/cabinetSlice';
import { createApplianceSlice, ApplianceSlice } from './slices/applianceSlice';

// Re-export types for convenience
export * from './types';

// Create the store by combining all slices
export const useKitchenStore = create<KitchenStore>()((...a) => ({
  ...createInitialState(),
  ...createUISlice(...a),
  ...createRoomSlice(...a),
  ...createOpeningSlice(...a),
  ...createCabinetSlice(...a),
  ...createApplianceSlice(...a),

  // Point inside cabinet checker
  isPointInsideCabinet,
  
  // Reset project function
  resetProject: () => {
    const state = useKitchenStore.getState();
    state.setViewMode('2d-top');
    state.setToolMode('select');
    state.setSelectedItemId(null);
    state.setCurrentWallIndex(0);
    state.setGridSize(10);
    state.setRoom({ width: 300, height: 400 });
    state.resetWalls();
    // Reset other state
    useKitchenStore.setState(createInitialState());
  },
  
  // Generate BOQ function
  generateBOQ: () => {
    const state = useKitchenStore.getState();
    return generateBOQ(state.cabinets, state.appliances);
  }
}));
