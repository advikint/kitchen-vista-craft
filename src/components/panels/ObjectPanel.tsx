
import { useKitchenStore } from "@/store/kitchenStore";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import CabinetCatalog from "./CabinetCatalog";

const ObjectPanel = () => {
  const { currentToolMode } = useKitchenStore();
  
  return (
    <div className="h-full">
      {currentToolMode === 'cabinet' ? (
        <CabinetCatalog />
      ) : (
        <div className="text-center text-gray-500 mt-4">
          Select the Cabinet tool to view the cabinet catalog
        </div>
      )}
    </div>
  );
};

export default ObjectPanel;
