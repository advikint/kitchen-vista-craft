
/**
 * Custom hook for loading template data from local storage
 */
export const useTemplateLoader = () => {
  /**
   * Load template data for a specific item type from localStorage
   */
  const loadTemplate = (type: string) => {
    try {
      const template = localStorage.getItem(`template_${type}`);
      return template ? JSON.parse(template) : null;
    } catch (error) {
      console.error(`Error loading template for ${type}:`, error);
      return null;
    }
  };

  return { loadTemplate };
};
