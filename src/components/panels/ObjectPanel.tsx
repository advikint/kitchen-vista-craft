
import { useKitchenStore } from "@/store/kitchenStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CabinetCatalog from "./CabinetCatalog";
import { DoorOpen, Blinds, PackageOpen, Box } from "lucide-react";

const ObjectPanel = () => {
  const { currentToolMode } = useKitchenStore();
  
  const renderToolContent = () => {
    switch (currentToolMode) {
      case 'cabinet':
        return <CabinetCatalog />;
      case 'door':
        return (
          <div className="p-4">
            <div className="text-center p-4 mb-4 bg-blue-50 rounded-lg">
              <DoorOpen className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-blue-700">Add Doors</h3>
              <p className="text-sm text-blue-600 mt-1">Click near a wall to place a door</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Standard Door</p>
                <p className="text-xs text-gray-500">80 x 200 cm</p>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Sliding Door</p>
                <p className="text-xs text-gray-500">120 x 200 cm</p>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Pocket Door</p>
                <p className="text-xs text-gray-500">80 x 200 cm</p>
              </div>
            </div>
          </div>
        );
      case 'window':
        return (
          <div className="p-4">
            <div className="text-center p-4 mb-4 bg-blue-50 rounded-lg">
              <Blinds className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-blue-700">Add Windows</h3>
              <p className="text-sm text-blue-600 mt-1">Click near a wall to place a window</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Standard Window</p>
                <p className="text-xs text-gray-500">100 x 120 cm</p>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Sliding Window</p>
                <p className="text-xs text-gray-500">150 x 120 cm</p>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Fixed Window</p>
                <p className="text-xs text-gray-500">80 x 60 cm</p>
              </div>
            </div>
          </div>
        );
      case 'appliance':
        return (
          <div className="p-4">
            <div className="text-center p-4 mb-4 bg-blue-50 rounded-lg">
              <Box className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-blue-700">Add Appliances</h3>
              <p className="text-sm text-blue-600 mt-1">Click to place an appliance</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Sink</p>
                <p className="text-xs text-gray-500">80 x 60 cm</p>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Stove</p>
                <p className="text-xs text-gray-500">60 x 60 cm</p>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Refrigerator</p>
                <p className="text-xs text-gray-500">75 x 180 x 65 cm</p>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Dishwasher</p>
                <p className="text-xs text-gray-500">60 x 85 x 60 cm</p>
              </div>
              <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">Microwave</p>
                <p className="text-xs text-gray-500">50 x 30 x 40 cm</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <span className="text-blue-500 text-2xl">🔍</span>
            </div>
            <p className="text-gray-500 text-sm">
              Select a tool from the toolbar to view available items
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="h-full">
      {renderToolContent()}
    </div>
  );
};

export default ObjectPanel;
