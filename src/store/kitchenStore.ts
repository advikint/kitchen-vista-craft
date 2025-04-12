import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Types
export type ViewMode = '2d-top' | '2d-elevation' | '3d';
export type ToolMode = 'select' | 'room' | 'door' | 'window' | 'cabinet' | 'appliance';

export interface Point {
  x: number;
  y: number;
}

export interface Room {
  width: number;
  height: number;
  roomHeight?: number; // Height of the room in cm
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  height: number;
  label?: string; // Wall label (e.g., "Wall A")
  thickness?: number; // Wall thickness in cm, default 10cm (100mm)
}

export interface Door {
  id: string;
  wallId: string;
  position: number; // Position along the wall (0-1)
  width: number;
  height: number;
  type?: 'standard' | 'sliding' | 'folding' | 'pocket';
}

export interface Window {
  id: string;
  wallId: string;
  position: number; // Position along the wall (0-1)
  width: number;
  height: number;
  sillHeight: number;
  type?: 'standard' | 'sliding' | 'louvered' | 'fixed';
}

// Base cabinet types inspired by Livspace and Homelane
export type CabinetType = 'base' | 'wall' | 'tall' | 'corner' | 'island' | 'loft' | 'specialty';

// Cabinet categories (subtypes) - Added "drawer" and "shutter" to fix type errors
export type CabinetCategory = 
  // Base cabinets
  'drawer-base' | 'sink-base' | 'corner-base' | 'blind-corner-base' | 'cooktop-base' | 'appliance-base' | 'standard-base' |
  // Wall cabinets
  'standard-wall' | 'open-shelf' | 'microwave-wall' | 'corner-wall' | 'blind-corner-wall' | 'glass-wall' | 
  // Tall cabinets
  'pantry-tall' | 'oven-tall' | 'fridge-tall' | 'broom-tall' | 'appliance-tall' |
  // Specialty cabinets
  'magic-corner' | 'pullout' | 'carousel' | 'open' | 'wine-rack' |
  // Added these to fix type errors
  'drawer' | 'shutter';

// Cabinet door/drawer types
export type CabinetFrontType = 'shutter' | 'drawer' | 'open' | 'glass' | 'flap-up' | 'bi-fold';

// Cabinet finish types
export type CabinetFinish = 'matte' | 'gloss' | 'textured' | 'woodgrain' | 'membrane' | 'pvc' | 'acrylic' | 'laminate' | 'veneer' | 'solid';

export interface Cabinet {
  id: string;
  type: CabinetType;
  category: CabinetCategory;
  frontType: CabinetFrontType;
  finish: CabinetFinish;
  position: Point;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  material: string;
  color: string;
  wallId?: string; // If attached to a wall
  floorHeight?: number; // Height from floor in cm (for wall cabinets)
}

export type ApplianceType = 
  'sink' | 'stove' | 'hob' | 'oven' | 'microwave' | 'fridge' | 'dishwasher' | 
  'hood' | 'chimney' | 'mixer-grinder' | 'water-purifier' | 'washing-machine';

export interface Appliance {
  id: string;
  type: ApplianceType;
  position: Point;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  model: string;
  brand?: string;
  color?: string;
  wallId?: string; // If attached to a wall
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
  
  // Global cabinet settings (for consistent sizing)
  baseCabinetHeight: number;
  baseCabinetDepth: number;
  wallCabinetHeight: number;
  wallCabinetDepth: number;
  tallCabinetHeight: number;
  tallCabinetDepth: number;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setToolMode: (mode: ToolMode) => void;
  setSelectedItemId: (id: string | null) => void;
  setCurrentWallIndex: (index: number) => void;
  setGridSize: (size: number) => void;
  toggleDimensions: () => void;
  
  setProjectName: (name: string) => void;
  setRoom: (room: Room) => void;
  resetWalls: () => void;
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
  
  // Cabinet global settings
  updateBaseCabinetDimensions: (height: number, depth: number) => void;
  updateWallCabinetDimensions: (height: number, depth: number) => void;
  updateTallCabinetDimensions: (height: number, depth: number) => void;
  
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
  
  // Standard dimensions in cm (converted from mm)
  baseCabinetHeight: 85, // 850mm
  baseCabinetDepth: 60,  // 600mm
  wallCabinetHeight: 70, // 700mm
  wallCabinetDepth: 35,  // 350mm
  tallCabinetHeight: 210, // 2100mm
  tallCabinetDepth: 60,   // 600mm
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
  
  resetWalls: () => set({ walls: [] }),
  
  addWall: (wall) => set((state) => {
    const wallCount = state.walls.length;
    const wallLabels = ['Wall A', 'Wall B', 'Wall C', 'Wall D'];
    const label = wallCount < 4 ? wallLabels[wallCount] : `Wall ${wallCount + 1}`;
    
    return { 
      walls: [...state.walls, { 
        ...wall, 
        id: uuidv4(),
        label,
        thickness: wall.thickness || 10 // Default 10cm (100mm)
      }] 
    };
  }),
  
  updateWall: (id, updates) => set((state) => ({
    walls: state.walls.map(wall => wall.id === id ? { ...wall, ...updates } : wall)
  })),
  
  removeWall: (id) => set((state) => ({
    walls: state.walls.filter(wall => wall.id !== id)
  })),
  
  addDoor: (door) => set((state) => ({ 
    doors: [...state.doors, { ...door, id: uuidv4(), type: door.type || 'standard' }] 
  })),
  
  updateDoor: (id, updates) => set((state) => ({
    doors: state.doors.map(door => door.id === id ? { ...door, ...updates } : door)
  })),
  
  removeDoor: (id) => set((state) => ({
    doors: state.doors.filter(door => door.id !== id)
  })),
  
  addWindow: (window) => set((state) => ({ 
    windows: [...state.windows, { 
      ...window, 
      id: uuidv4(),
      type: window.type || 'standard'
    }] 
  })),
  
  updateWindow: (id, updates) => set((state) => ({
    windows: state.windows.map(window => window.id === id ? { ...window, ...updates } : window)
  })),
  
  removeWindow: (id) => set((state) => ({
    windows: state.windows.filter(window => window.id !== id)
  })),
  
  addCabinet: (cabinet) => set((state) => {
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
    
    return { 
      cabinets: [...state.cabinets, { ...updatedCabinet, id: uuidv4() }] 
    };
  }),
  
  updateCabinet: (id, updates) => set((state) => ({
    cabinets: state.cabinets.map(cabinet => cabinet.id === id ? { ...cabinet, ...updates } : cabinet)
  })),
  
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
      frontType: cabinet.frontType,
      finish: cabinet.finish,
      dimensions: `${cabinet.width}x${cabinet.height}x${cabinet.depth}`,
      material: cabinet.material,
      color: cabinet.color,
    }));
    
    // Calculate hardware based on cabinets
    const hardwareBOQ = state.cabinets.flatMap(cabinet => {
      const items = [];
      
      // Add handles based on cabinet type
      if (cabinet.frontType === 'drawer' || cabinet.frontType === 'shutter') {
        items.push({
          id: uuidv4(),
          cabinetId: cabinet.id,
          type: 'handle',
          quantity: cabinet.frontType === 'drawer' ? 1 : 2,
          specifications: 'Standard handle'
        });
      }
      
      // Add hinges for shutters
      if (cabinet.frontType === 'shutter') {
        items.push({
          id: uuidv4(),
          cabinetId: cabinet.id,
          type: 'hinge',
          quantity: 2,
          specifications: 'European hinge'
        });
      }
      
      // Add drawer slides
      if (cabinet.frontType === 'drawer') {
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
      .filter(cabinet => cabinet.frontType === 'shutter' || cabinet.frontType === 'drawer')
      .map(cabinet => ({
        id: uuidv4(),
        cabinetId: cabinet.id,
        material: cabinet.material,
        finish: cabinet.finish,
        color: cabinet.color,
        dimensions: cabinet.frontType === 'drawer' 
          ? `${cabinet.width}x${cabinet.height/3}` 
          : `${cabinet.width}x${cabinet.height}`,
        quantity: cabinet.frontType === 'drawer' ? 3 : 1,
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
