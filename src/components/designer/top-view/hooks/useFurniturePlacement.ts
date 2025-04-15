
import { toast } from "sonner";
import { useKitchenStore } from "@/store/kitchenStore";

/**
 * Custom hook for placing cabinets and appliances
 */
export const useFurniturePlacement = (loadTemplate: (type: string) => any) => {
  const { addCabinet, addAppliance } = useKitchenStore();

  /**
   * Handle cabinet placement
   */
  const handleCabinetClick = (pos: { x: number, y: number }) => {
    // Get the template cabinet data
    const cabinetTemplate = loadTemplate('cabinet');
    if (!cabinetTemplate) {
      toast.error("Cabinet template not found");
      return;
    }

    // Create a new cabinet
    addCabinet({
      ...cabinetTemplate,
      position: pos,
      rotation: 0
    }, {});

    toast.success("Cabinet added");
  };

  /**
   * Handle appliance placement
   */
  const handleApplianceClick = (pos: { x: number, y: number }) => {
    // Get the template appliance data
    const applianceTemplate = loadTemplate('appliance');
    if (!applianceTemplate) {
      toast.error("Appliance template not found");
      return;
    }

    // Create a new appliance
    addAppliance({
      ...applianceTemplate,
      position: pos,
      rotation: 0
    }, {});

    toast.success("Appliance added");
  };

  return {
    handleCabinetClick,
    handleApplianceClick
  };
};
