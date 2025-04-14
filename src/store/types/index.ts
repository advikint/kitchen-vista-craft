
// Basic types
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

// Cabinet types
export type CabinetType = 'base' | 'wall' | 'tall' | 'corner' | 'island' | 'loft' | 'specialty';

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

export type CabinetFrontType = 'shutter' | 'drawer' | 'open' | 'glass' | 'flap-up' | 'bi-fold';

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
