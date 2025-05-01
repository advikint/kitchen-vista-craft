
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { ToolMode, ViewMode } from '../types';

export interface UISlice {
  projectName: string;
  viewMode: ViewMode;
  currentToolMode: ToolMode;
  showDimensions: boolean;
  selectedItemId: string | null;
  gridSize: number;
  isWallDialogOpen: boolean;
  
  setProjectName: (name: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setToolMode: (mode: ToolMode) => void;
  toggleDimensions: () => void;
  setSelectedItemId: (id: string | null) => void;
  setGridSize: (size: number) => void;
  setWallDialogOpen: (isOpen: boolean) => void;
}

export const createUISlice: StateCreator<KitchenStore, [], [], UISlice> = (set) => ({
  projectName: "My Kitchen Project",
  viewMode: '2d-top',
  currentToolMode: 'select',
  showDimensions: true,
  selectedItemId: null,
  gridSize: 10,
  isWallDialogOpen: false,
  
  setProjectName: (name) => set({ projectName: name }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setToolMode: (mode) => set((state) => {
    // Special handling for room tool
    if (mode === 'room') {
      return { 
        currentToolMode: mode,
        isWallDialogOpen: true 
      };
    }
    return { currentToolMode: mode };
  }),
  
  toggleDimensions: () => set((state) => ({ 
    showDimensions: !state.showDimensions 
  })),
  
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  
  setGridSize: (size) => set({ gridSize: size }),

  setWallDialogOpen: (isOpen) => set({ isWallDialogOpen: isOpen }),
});
