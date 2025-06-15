
import { useKitchenStore } from "@/store/kitchenStore";

export interface ModelAsset {
  url: string;
  name: string;
  category: 'cabinet' | 'appliance' | 'fixture';
  type: string;
  subCategory?: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  materials?: string[];
  brand?: string;
  price?: number;
  modelFile?: string;
}

export const useModelManager = () => {
  // Comprehensive cabinet models library
  const cabinetModels: ModelAsset[] = [
    // Base Cabinets
    {
      url: '/models/cabinets/base-standard.glb',
      name: 'Standard Base Cabinet',
      category: 'cabinet',
      type: 'base',
      subCategory: 'standard-base',
      dimensions: { width: 60, height: 85, depth: 60 },
      materials: ['laminate', 'veneer', 'acrylic']
    },
    {
      url: '/models/cabinets/base-sink.glb',
      name: 'Sink Base Cabinet',
      category: 'cabinet',
      type: 'base',
      subCategory: 'sink-base',
      dimensions: { width: 90, height: 85, depth: 60 },
      materials: ['laminate', 'veneer']
    },
    {
      url: '/models/cabinets/base-drawer.glb',
      name: 'Drawer Base Cabinet',
      category: 'cabinet',
      type: 'base',
      subCategory: 'drawer-base',
      dimensions: { width: 60, height: 85, depth: 60 },
      materials: ['laminate', 'veneer', 'acrylic']
    },
    {
      url: '/models/cabinets/base-corner.glb',
      name: 'Corner Base Cabinet',
      category: 'cabinet',
      type: 'base',
      subCategory: 'corner-base',
      dimensions: { width: 90, height: 85, depth: 90 },
      materials: ['laminate', 'veneer']
    },
    
    // Wall Cabinets
    {
      url: '/models/cabinets/wall-standard.glb',
      name: 'Standard Wall Cabinet',
      category: 'cabinet',
      type: 'wall',
      subCategory: 'standard-wall',
      dimensions: { width: 60, height: 70, depth: 35 },
      materials: ['laminate', 'veneer', 'acrylic']
    },
    {
      url: '/models/cabinets/wall-open-shelf.glb',
      name: 'Open Shelf Wall Cabinet',
      category: 'cabinet',
      type: 'wall',
      subCategory: 'open-shelf',
      dimensions: { width: 60, height: 70, depth: 35 },
      materials: ['laminate', 'veneer']
    },
    {
      url: '/models/cabinets/wall-glass.glb',
      name: 'Glass Door Wall Cabinet',
      category: 'cabinet',
      type: 'wall',
      subCategory: 'glass-wall',
      dimensions: { width: 60, height: 70, depth: 35 },
      materials: ['laminate', 'veneer']
    },
    {
      url: '/models/cabinets/wall-corner.glb',
      name: 'Corner Wall Cabinet',
      category: 'cabinet',
      type: 'wall',
      subCategory: 'corner-wall',
      dimensions: { width: 60, height: 70, depth: 60 },
      materials: ['laminate', 'veneer']
    },
    
    // Tall Cabinets
    {
      url: '/models/cabinets/tall-pantry.glb',
      name: 'Pantry Tall Cabinet',
      category: 'cabinet',
      type: 'tall',
      subCategory: 'pantry-tall',
      dimensions: { width: 60, height: 210, depth: 60 },
      materials: ['laminate', 'veneer']
    },
    {
      url: '/models/cabinets/tall-oven.glb',
      name: 'Oven Housing Tall Cabinet',
      category: 'cabinet',
      type: 'tall',
      subCategory: 'oven-tall',
      dimensions: { width: 60, height: 210, depth: 60 },
      materials: ['laminate', 'veneer']
    },
    {
      url: '/models/cabinets/tall-fridge.glb',
      name: 'Fridge Housing Tall Cabinet',
      category: 'cabinet',
      type: 'tall',
      subCategory: 'fridge-tall',
      dimensions: { width: 60, height: 210, depth: 60 },
      materials: ['laminate', 'veneer']
    }
  ];

  // Appliance models library (enhanced)
  const applianceModels: ModelAsset[] = [
    {
      url: '/models/appliances/samsung-refrigerator.glb',
      name: 'Samsung French Door Refrigerator',
      category: 'appliance',
      type: 'fridge',
      dimensions: { width: 90, height: 180, depth: 70 },
      brand: 'Samsung',
      price: 2500
    },
    {
      url: '/models/appliances/bosch-dishwasher.glb',
      name: 'Bosch Built-in Dishwasher',
      category: 'appliance',
      type: 'dishwasher',
      dimensions: { width: 60, height: 85, depth: 55 },
      brand: 'Bosch',
      price: 800
    },
    {
      url: '/models/appliances/ge-range.glb',
      name: 'GE Gas Range',
      category: 'appliance',
      type: 'stove',
      dimensions: { width: 75, height: 95, depth: 70 },
      brand: 'GE',
      price: 1200
    },
    {
      url: '/models/appliances/kitchen-sink.glb',
      name: 'Stainless Steel Kitchen Sink',
      category: 'appliance',
      type: 'sink',
      dimensions: { width: 80, height: 20, depth: 50 },
      brand: 'Kohler',
      price: 400
    }
  ];

  const getModelByType = (category: 'cabinet' | 'appliance', type: string, subCategory?: string): ModelAsset | undefined => {
    const models = category === 'cabinet' ? cabinetModels : applianceModels;
    
    if (subCategory) {
      return models.find(model => model.type === type && model.subCategory === subCategory);
    }
    return models.find(model => model.type === type);
  };

  const getModelsByCategory = (category: 'cabinet' | 'appliance'): ModelAsset[] => {
    return category === 'cabinet' ? cabinetModels : applianceModels;
  };

  const getCabinetModelsByType = (type: string): ModelAsset[] => {
    return cabinetModels.filter(model => model.type === type);
  };

  const getAllModels = (): ModelAsset[] => {
    return [...cabinetModels, ...applianceModels];
  };

  // Generate GLB file structure for download
  const generateModelStructure = () => {
    return {
      cabinets: {
        base: cabinetModels.filter(m => m.type === 'base'),
        wall: cabinetModels.filter(m => m.type === 'wall'),
        tall: cabinetModels.filter(m => m.type === 'tall')
      },
      appliances: applianceModels,
      requiredDirectories: [
        '/public/models/cabinets/',
        '/public/models/appliances/',
        '/public/draco/'
      ]
    };
  };

  return {
    cabinetModels,
    applianceModels,
    getModelByType,
    getModelsByCategory,
    getCabinetModelsByType,
    getAllModels,
    generateModelStructure
  };
};

export default useModelManager;
