
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
  
  // Cabinet overlap checker
  checkCabinetOverlap: (cabinet) => {
    const state = useKitchenStore.getState();
    const { cabinets } = state;
    
    // Check if this cabinet overlaps with any existing cabinet
    for (const existingCabinet of cabinets) {
      if (existingCabinet.id === cabinet.id) continue;
      
      // Simple bounding box check
      const isOverlapping = (
        cabinet.position.x < existingCabinet.position.x + existingCabinet.width &&
        cabinet.position.x + cabinet.width > existingCabinet.position.x &&
        cabinet.position.y < existingCabinet.position.y + existingCabinet.depth &&
        cabinet.position.y + cabinet.depth > existingCabinet.position.y
      );
      
      if (isOverlapping) {
        return existingCabinet.position;
      }
    }
    
    return null;
  },
  
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
  },
  
  // Implement missing cabinet methods
  updateCabinet: (cabinetOrId, updates) => {
    const state = useKitchenStore.getState();
    if (typeof cabinetOrId === 'string') {
      state.updateCabinetProperties(cabinetOrId, updates || {});
    } else {
      state.updateCabinetProperties(cabinetOrId.id, updates || {});
    }
  },
  
  removeCabinet: (id) => {
    const state = useKitchenStore.getState();
    state.deleteCabinet(id);
  },
  
  // Cabinet dimension methods
  updateBaseCabinetDimensions: (height, depth) => {
    useKitchenStore.setState({
      baseCabinetHeight: height,
      baseCabinetDepth: depth
    });
  },
  
  updateWallCabinetDimensions: (height, depth) => {
    useKitchenStore.setState({
      wallCabinetHeight: height,
      wallCabinetDepth: depth
    });
  },
  
  updateTallCabinetDimensions: (height, depth) => {
    useKitchenStore.setState({
      tallCabinetHeight: height,
      tallCabinetDepth: depth
    });
  }
}));
