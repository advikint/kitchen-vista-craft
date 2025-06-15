
import { useKitchenStore } from "@/store/kitchenStore";

export interface ModelAsset {
  url: string;
  name: string;
  category: 'cabinet' | 'appliance' | 'fixture';
  type: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  materials?: string[];
  brand?: string;
  price?: number;
}

export const useModelManager = () => {
  // Cabinet models library
  const cabinetModels: ModelAsset[] = [
    {
      url: '/models/cabinets/modern-base-cabinet.glb',
      name: 'Modern Base Cabinet',
      category: 'cabinet',
      type: 'base',
      dimensions: { width: 60, height: 85, depth: 60 },
      materials: ['oak', 'maple', 'white']
    },
    {
      url: '/models/cabinets/shaker-wall-cabinet.glb',
      name: 'Shaker Wall Cabinet',
      category: 'cabinet',
      type: 'wall',
      dimensions: { width: 60, height: 70, depth: 35 },
      materials: ['oak', 'cherry', 'white']
    },
    {
      url: '/models/cabinets/tall-pantry-cabinet.glb',
      name: 'Tall Pantry Cabinet',
      category: 'cabinet',
      type: 'tall',
      dimensions: { width: 60, height: 220, depth: 60 },
      materials: ['oak', 'maple', 'walnut']
    }
  ];

  // Appliance models library
  const applianceModels: ModelAsset[] = [
    {
      url: '/models/appliances/samsung-refrigerator.glb',
      name: 'Samsung French Door Refrigerator',
      category: 'appliance',
      type: 'fridge',
      dimensions: { width: 90, height: 180, depth: 70 },
      brand: 'Samsung'
    },
    {
      url: '/models/appliances/bosch-dishwasher.glb',
      name: 'Bosch Built-in Dishwasher',
      category: 'appliance',
      type: 'dishwasher',
      dimensions: { width: 60, height: 85, depth: 55 },
      brand: 'Bosch'
    },
    {
      url: '/models/appliances/ge-range.glb',
      name: 'GE Gas Range',
      category: 'appliance',
      type: 'stove',
      dimensions: { width: 75, height: 95, depth: 70 },
      brand: 'GE'
    }
  ];

  const getModelByType = (category: 'cabinet' | 'appliance', type: string): ModelAsset | undefined => {
    const models = category === 'cabinet' ? cabinetModels : applianceModels;
    return models.find(model => model.type === type);
  };

  const getModelsByCategory = (category: 'cabinet' | 'appliance'): ModelAsset[] => {
    return category === 'cabinet' ? cabinetModels : applianceModels;
  };

  const getAllModels = (): ModelAsset[] => {
    return [...cabinetModels, ...applianceModels];
  };

  return {
    cabinetModels,
    applianceModels,
    getModelByType,
    getModelsByCategory,
    getAllModels
  };
};

export default useModelManager;
