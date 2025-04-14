
import { v4 as uuidv4 } from 'uuid';
import { Cabinet, Appliance } from '../types';

export const generateBOQ = (cabinets: Cabinet[], appliances: Appliance[]) => {
  // Calculate BOQ items from cabinets
  const cabinetBOQ = cabinets.map(cabinet => ({
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
  const hardwareBOQ = cabinets.flatMap(cabinet => {
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
  const shutterBOQ = cabinets
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
    appliances: appliances.map(a => ({
      id: a.id,
      type: a.type,
      model: a.model,
      dimensions: `${a.width}x${a.height}x${a.depth}`
    }))
  };
};
