
import { useCallback } from "react";
import { useKitchenStore } from "@/store/kitchenStore";

export const useTemplateLoader = () => {
  const { currentToolMode } = useKitchenStore();
  
  /**
   * Load template data from localStorage based on type
   */
  const loadTemplate = useCallback((type: string) => {
    // Check if we have a stored template for this type in localStorage
    const storedTemplate = localStorage.getItem(`template_${type}`);
    
    // If we have a stored template, use it
    if (storedTemplate) {
      try {
        const template = JSON.parse(storedTemplate);
        return template;
      } catch (error) {
        console.error(`Error parsing template for ${type}:`, error);
      }
    }
    
    // If no stored template, use defaults based on type
    switch (type) {
      case 'cabinet':
        return {
          type: 'base',
          category: 'standard-base',
          frontType: 'shutter',
          finish: 'laminate',
          width: 60,
          height: 85,
          depth: 60,
          material: 'laminate',
          color: 'white'
        };
        
      case 'door':
        return {
          type: 'standard',
          width: 80,
          height: 200
        };
        
      case 'window':
        return {
          type: 'standard',
          width: 100,
          height: 120,
          sillHeight: 90
        };
        
      case 'appliance':
        return {
          type: 'sink',
          width: 80,
          height: 20,
          depth: 60
        };
        
      default:
        return null;
    }
  }, []);
  
  return { loadTemplate };
};
