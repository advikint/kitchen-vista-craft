export type ViewMode = '2d-top' | '3d' | '2d-elevation';

export type ToolMode = 'select' | 'room' | 'wall' | 'door' | 'window' | 'cabinet' | 'appliance';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
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
  thickness: number;
  color: string;
  label?: string; // Added label property
}

export type DoorType = 'standard' | 'sliding' | 'pocket' | 'folding';

export interface Door {
  id: string;
  wallId: string;
  position: number; // Position along the wall (0-1)
  width: number;
  height: number;
  type: DoorType;
  color: string;
}

export type WindowType = 'standard' | 'sliding' | 'fixed' | 'louvered';

export interface Window {
  id: string;
  wallId: string;
  position: number; // Position along the wall (0-1)
  width: number;
  height: number;
  sillHeight: number;
  type: WindowType;
}

export type CabinetType = 'base' | 'wall' | 'tall' | 'specialty';

export type CabinetCategory = 
  | 'standard-base' | 'sink-base' | 'drawer-base' | 'corner-base' | 'cooktop-base' | 'blind-corner-base' | 'appliance-base'
  | 'standard-wall' | 'open-shelf' | 'microwave-wall' | 'corner-wall' | 'glass-wall' | 'blind-corner-wall'
  | 'pantry-tall' | 'oven-tall' | 'fridge-tall' | 'broom-tall' | 'appliance-tall'
  | 'magic-corner' | 'pullout' | 'carousel' | 'wine-rack';

export type CabinetFrontType = 'shutter' | 'drawer' | 'glass' | 'open';

export type CabinetFinish = 'laminate' | 'veneer' | 'acrylic' | 'matte' | 'gloss';

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
  drawers?: number;  // Number of drawers (for drawer cabinets)
  special?: string;  // Special drawer type (mixed, file, deep, etc.)
}

export type ApplianceType = 'sink' | 'stove' | 'fridge' | 'dishwasher' | 'oven' | 'microwave' | 'hood';

export interface Appliance {
  id: string;
  type: ApplianceType;
  position: Point;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  brand?: string;
  model?: string;
  color?: string;
}

// Utility types for better type safety in functions
export interface CabinetDimensions {
  width?: number;
  height?: number;
  depth?: number;
}

export interface CabinetProperties {
  type?: CabinetType;
  category?: CabinetCategory;
  frontType?: CabinetFrontType;
  finish?: CabinetFinish;
  material?: string;
  color?: string;
  drawers?: number;
  special?: string;
}
