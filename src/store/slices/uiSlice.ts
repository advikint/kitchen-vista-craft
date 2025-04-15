
import { StateCreator } from 'zustand';
import { KitchenStore } from '../types/storeTypes';
import { ViewMode, ToolMode } from '../types';

export interface UISlice {
  viewMode: ViewMode;
  currentToolMode: ToolMode;
  selectedItemId: string | null;
  gridSize: number;
  showDimensions: boolean;
  sidebarCollapsed: boolean;
  projectName: string;
  setViewMode: (mode: ViewMode) => void;
  setToolMode: (mode: ToolMode) => void;
  setSelectedItemId: (id: string | null) => void;
  setGridSize: (size: number) => void;
  toggleDimensions: () => void;
  toggleSidebar: () => void;
  setProjectName: (name: string) => void;
}

export const createUISlice: StateCreator<KitchenStore, [], [], UISlice> = (set) => ({
  viewMode: '2d-top',
  currentToolMode: 'select',
  selectedItemId: null,
  gridSize: 10,
  showDimensions: true,
  sidebarCollapsed: false,
  projectName: 'New Kitchen Design',
  
  setViewMode: (mode) => set({ viewMode: mode }),
  setToolMode: (mode) => set({ currentToolMode: mode }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setGridSize: (size) => set({ gridSize: size }),
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setProjectName: (name) => set({ projectName: name }),
});
