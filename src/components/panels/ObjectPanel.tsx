
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
        <div className="text-center p-8 flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <span className="text-blue-500 text-2xl">🔍</span>
          </div>
          <p className="text-gray-500 text-sm">
            Select the Cabinet tool to view the catalog
          </p>
        </div>
      )}
    </div>
  );
};

export default ObjectPanel;
