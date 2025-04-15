
import { ViewMode, ToolMode, Room } from './types';

interface InitialState {
  viewMode: ViewMode;
  currentToolMode: ToolMode;
  selectedItemId: null;
  currentWallIndex: number;
  gridSize: number;
  showDimensions: boolean;
  sidebarCollapsed: boolean;
  isWallDialogOpen: boolean;
  
  projectName: string;
  room: Room;
  walls: [];
  doors: [];
  windows: [];
  cabinets: [];
  appliances: [];
  
  baseCabinetHeight: number;
  baseCabinetDepth: number;
  wallCabinetHeight: number;
  wallCabinetDepth: number;
  tallCabinetHeight: number;
  tallCabinetDepth: number;
}

export const createInitialState = (): InitialState => ({
  viewMode: '2d-top' as ViewMode,
  currentToolMode: 'select' as ToolMode,
  selectedItemId: null,
  currentWallIndex: 0,
  gridSize: 10,
  showDimensions: true,
  sidebarCollapsed: false,
  isWallDialogOpen: false,
  
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
