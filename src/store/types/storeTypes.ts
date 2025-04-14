
import { 
  ViewMode, ToolMode, Room, Wall, Door, 
  Window, Cabinet, Appliance, Point 
} from './index';

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
  
  addCabinet: (cabinetOrId: Omit<Cabinet, 'id'> | string, updates?: Partial<Cabinet>) => void;
  updateCabinet: (cabinetOrId: Cabinet | string, updates?: Partial<Cabinet>) => void;
  removeCabinet: (id: string) => void;
  
  // Cabinet global settings
  updateBaseCabinetDimensions: (height: number, depth: number) => void;
  updateWallCabinetDimensions: (height: number, depth: number) => void;
  updateTallCabinetDimensions: (height: number, depth: number) => void;
  
  addAppliance: (applianceOrId: Omit<Appliance, 'id'> | string, updates?: Partial<Appliance>) => void;
  updateAppliance: (applianceOrId: Appliance | string, updates?: Partial<Appliance>) => void;
  removeAppliance: (id: string) => void;
  
  resetProject: () => void;
  generateBOQ: () => any;
  
  // Helper functions
  checkCabinetOverlap: (cabinet: Cabinet) => Point;
  isPointInsideCabinet: (point: Point, cabinet: Cabinet) => boolean;
}
