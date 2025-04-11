
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Types
export type ViewMode = '2d-top' | '2d-elevation' | '3d';
export type ToolMode = 'select' | 'room' | 'wall' | 'door' | 'window' | 'cabinet' | 'appliance';

export interface Point {
  x: number;
  y: number;
}

export interface Room {
  width: number;
  height: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  height: number;
}

export interface Door {
  id: string;
  wallId: string;
  position: number; // Position along the wall (0-1)
  width: number;
  height: number;
}

export interface Window {
  id: string;
  wallId: string;
  position: number; // Position along the wall (0-1)
  width: number;
  height: number;
  sillHeight: number;
}

export type CabinetType = 'base' | 'wall' | 'tall' | 'island';
export type CabinetCategory = 'drawer' | 'shutter' | 'open' | 'corner';

export interface Cabinet {
  id: string;
  type: CabinetType;
  category: CabinetCategory;
  position: Point;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  material: string;
  color: string;
}

export type ApplianceType = 'sink' | 'stove' | 'oven' | 'fridge' | 'dishwasher' | 'microwave' | 'hood';

export interface Appliance {
  id: string;
  type: ApplianceType;
  position: Point;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  model: string;
}

export interface KitchenStore {
  // View state
  viewMode: ViewMode;
  currentToolMode: ToolMode;
  selectedItemId: string | null;
  currentWallIndex: number;
  gridSize: number;
  showDimensions: boolean;
  
  // Kitchen data
  projectName: string;
  room: Room;
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  cabinets: Cabinet[];
  appliances: Appliance[];
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setToolMode: (mode: ToolMode) => void;
  setSelectedItemId: (id: string | null) => void;
  setCurrentWallIndex: (index: number) => void;
  setGridSize: (size: number) => void;
  toggleDimensions: () => void;
  
  setProjectName: (name: string) => void;
  setRoom: (room: Room) => void;
  addWall: (wall: Omit<Wall, 'id'>) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;
  
  addDoor: (door: Omit<Door, 'id'>) => void;
  updateDoor: (id: string, updates: Partial<Door>) => void;
  removeDoor: (id: string) => void;
  
  addWindow: (window: Omit<Window, 'id'>) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  removeWindow: (id: string) => void;
  
  addCabinet: (cabinet: Omit<Cabinet, 'id'>) => void;
  updateCabinet: (id: string, updates: Partial<Cabinet>) => void;
  removeCabinet: (id: string) => void;
  
  addAppliance: (appliance: Omit<Appliance, 'id'>) => void;
  updateAppliance: (id: string, updates: Partial<Appliance>) => void;
  removeAppliance: (id: string) => void;
  
  resetProject: () => void;
  generateBOQ: () => any;
}

// Initial state
const createInitialState = () => ({
  viewMode: '2d-top' as ViewMode,
  currentToolMode: 'select' as ToolMode,
  selectedItemId: null,
  currentWallIndex: 0,
  gridSize: 10,
  showDimensions: true,
  
  projectName: 'New Kitchen Design',
  room: { width: 300, height: 400 },
  walls: [],
  doors: [],
  windows: [],
  cabinets: [],
  appliances: [],
});

// Create the store
export const useKitchenStore = create<KitchenStore>((set) => ({
  ...createInitialState(),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  setToolMode: (mode) => set({ currentToolMode: mode }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setCurrentWallIndex: (index) => set({ currentWallIndex: index }),
  setGridSize: (size) => set({ gridSize: size }),
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
  
  setProjectName: (name) => set({ projectName: name }),
  setRoom: (room) => set({ room }),
  
  addWall: (wall) => set((state) => ({ 
    walls: [...state.walls, { ...wall, id: uuidv4() }] 
  })),
  updateWall: (id, updates) => set((state) => ({
    walls: state.walls.map(wall => wall.id === id ? { ...wall, ...updates } : wall)
  })),
  removeWall: (id) => set((state) => ({
    walls: state.walls.filter(wall => wall.id !== id)
  })),
  
  addDoor: (door) => set((state) => ({ 
    doors: [...state.doors, { ...door, id: uuidv4() }] 
  })),
  updateDoor: (id, updates) => set((state) => ({
    doors: state.doors.map(door => door.id === id ? { ...door, ...updates } : door)
  })),
  removeDoor: (id) => set((state) => ({
    doors: state.doors.filter(door => door.id !== id)
  })),
  
  addWindow: (window) => set((state) => ({ 
    windows: [...state.windows, { ...window, id: uuidv4() }] 
  })),
  updateWindow: (id, updates) => set((state) => ({
    windows: state.windows.map(window => window.id === id ? { ...window, ...updates } : window)
  })),
  removeWindow: (id) => set((state) => ({
    windows: state.windows.filter(window => window.id !== id)
  })),
  
  addCabinet: (cabinet) => set((state) => ({ 
    cabinets: [...state.cabinets, { ...cabinet, id: uuidv4() }] 
  })),
  updateCabinet: (id, updates) => set((state) => ({
    cabinets: state.cabinets.map(cabinet => cabinet.id === id ? { ...cabinet, ...updates } : cabinet)
  })),
  removeCabinet: (id) => set((state) => ({
    cabinets: state.cabinets.filter(cabinet => cabinet.id !== id)
  })),
  
  addAppliance: (appliance) => set((state) => ({ 
    appliances: [...state.appliances, { ...appliance, id: uuidv4() }] 
  })),
  updateAppliance: (id, updates) => set((state) => ({
    appliances: state.appliances.map(appliance => 
      appliance.id === id ? { ...appliance, ...updates } : appliance
    )
  })),
  removeAppliance: (id) => set((state) => ({
    appliances: state.appliances.filter(appliance => appliance.id !== id)
  })),
  
  resetProject: () => set(createInitialState()),
  
  generateBOQ: () => {
    const state = useKitchenStore.getState();
    
    // Calculate BOQ items from cabinets
    const cabinetBOQ = state.cabinets.map(cabinet => ({
      id: cabinet.id,
      type: cabinet.type,
      category: cabinet.category,
      dimensions: `${cabinet.width}x${cabinet.height}x${cabinet.depth}`,
      material: cabinet.material,
      color: cabinet.color,
    }));
    
    // Calculate hardware based on cabinets
    const hardwareBOQ = state.cabinets.flatMap(cabinet => {
      const items = [];
      
      // Add handles based on cabinet type
      if (cabinet.category === 'drawer' || cabinet.category === 'shutter') {
        items.push({
          id: uuidv4(),
          cabinetId: cabinet.id,
          type: 'handle',
          quantity: cabinet.category === 'drawer' ? 1 : 2,
          specifications: 'Standard handle'
        });
      }
      
      // Add hinges for shutters
      if (cabinet.category === 'shutter') {
        items.push({
          id: uuidv4(),
          cabinetId: cabinet.id,
          type: 'hinge',
          quantity: 2,
          specifications: 'European hinge'
        });
      }
      
      // Add drawer slides
      if (cabinet.category === 'drawer') {
        items.push({
          id: uuidv4(),
          cabinetId: cabinet.id,
          type: 'drawer_slide',
          quantity: 2,
          specifications: `${cabinet.depth}mm full extension`
        });
      }
      
      return items;
    });
    
    // Shutter BOQ
    const shutterBOQ = state.cabinets
      .filter(cabinet => cabinet.category === 'shutter' || cabinet.category === 'drawer')
      .map(cabinet => ({
        id: uuidv4(),
        cabinetId: cabinet.id,
        material: cabinet.material,
        color: cabinet.color,
        dimensions: cabinet.category === 'drawer' 
          ? `${cabinet.width}x${cabinet.height/3}` 
          : `${cabinet.width}x${cabinet.height}`,
        quantity: cabinet.category === 'drawer' ? 3 : 1,
      }));
    
    return {
      cabinets: cabinetBOQ,
      hardware: hardwareBOQ,
      shutters: shutterBOQ,
      appliances: state.appliances.map(a => ({
        id: a.id,
        type: a.type,
        model: a.model,
        dimensions: `${a.width}x${a.height}x${a.depth}`
      }))
    };
  }
}));
