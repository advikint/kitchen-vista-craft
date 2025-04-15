
/**
 * Custom hook for loading template data from local storage
 */
export const useTemplateLoader = () => {
  /**
   * Load template data for a specific item type from localStorage or use default
   */
  const loadTemplate = (type: string) => {
    try {
      const template = localStorage.getItem(`template_${type}`);
      
      if (template) {
        return JSON.parse(template);
      }
      
      // Return defaults if no template found
      return getDefaultTemplate(type);
    } catch (error) {
      console.error(`Error loading template for ${type}:`, error);
      return getDefaultTemplate(type);
    }
  };

  /**
   * Get default template for different item types
   */
  const getDefaultTemplate = (type: string) => {
    switch (type) {
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
      case 'cabinet':
        return { 
          type: 'base', 
          width: 60, 
          height: 85, 
          depth: 60,
          category: 'shutter',
          frontType: 'shutter',
          finish: 'laminate',
          material: 'laminate',
          color: 'white'
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
  };

  return { loadTemplate };
};
