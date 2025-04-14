
import { KonvaEventObject } from "konva/lib/Node";
import { useKitchenStore } from "@/store/kitchenStore";
import { toast } from "sonner";

const useItemInteractions = () => {
  const { 
    selectedItemId, 
    setSelectedItemId, 
    currentToolMode,
    walls,
    updateWall,
    doors,
    updateDoor,
    windows,
    updateWindow,
    cabinets,
    updateCabinet,
    addCabinet,
    appliances,
    updateAppliance,
    addAppliance,
  } = useKitchenStore();

  const handleItemSelect = (id: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true; // Prevent event bubbling
    setSelectedItemId(id);
  };

  const handleItemDragEnd = (id: string, newPosition: { x: number, y: number }, itemType: 'cabinet' | 'appliance') => {
    if (itemType === 'cabinet') {
      const cabinet = cabinets.find(c => c.id === id);
      if (cabinet) {
        updateCabinet(id, { position: newPosition });
      }
    } else if (itemType === 'appliance') {
      const appliance = appliances.find(a => a.id === id);
      if (appliance) {
        updateAppliance(id, { position: newPosition });
      }
    }
  };

  // Clone an item
  const handleCloneItem = (id: string, itemType: 'cabinet' | 'appliance', offset = 10) => {
    if (itemType === 'cabinet') {
      const cabinet = cabinets.find(c => c.id === id);
      if (cabinet) {
        const newCabinet = { 
          ...cabinet, 
          position: { 
            x: cabinet.position.x + offset, 
            y: cabinet.position.y + offset 
          } 
        };
        delete (newCabinet as any).id;
        addCabinet(newCabinet, {});
        toast.success("Cabinet duplicated");
      }
    } else if (itemType === 'appliance') {
      const appliance = appliances.find(a => a.id === id);
      if (appliance) {
        const newAppliance = { 
          ...appliance, 
          position: { 
            x: appliance.position.x + offset, 
            y: appliance.position.y + offset 
          } 
        };
        delete (newAppliance as any).id;
        addAppliance(newAppliance, {});
        toast.success("Appliance duplicated");
      }
    }
  };

  return {
    handleItemSelect,
    handleItemDragEnd,
    handleCloneItem,
    selectedItemId
  };
};

export default useItemInteractions;
