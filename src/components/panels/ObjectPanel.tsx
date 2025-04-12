
import { useKitchenStore } from "@/store/kitchenStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CabinetCatalog from "./CabinetCatalog";
import { DoorOpen, Blinds, PackageOpen, Box, Search, Filter, ArrowDownUp } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ObjectPanel = () => {
  const { currentToolMode, setSelectedItemId } = useKitchenStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const handleItemSelect = (itemType: string, templateData: any) => {
    // Set the selected item data for the properties panel to use as template
    setSelectedItemId(`template_${itemType}`);
    
    // We'll need to implement this in the kitchenStore
    // The idea is to set a template object in the store that the properties panel can use
    // when we drag and drop the item
  };
  
  const renderToolContent = () => {
    switch (currentToolMode) {
      case 'cabinet':
        return <CabinetCatalog />;
      case 'door':
        return (
          <div className="p-4">
            <div className="flex items-center mb-4 space-x-2">
              <Input
                placeholder="Search doors"
                className="h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search className="h-3.5 w-3.5 text-gray-500" />}
              />
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ArrowDownUp className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="text-center p-4 mb-4 bg-blue-50 rounded-lg">
              <DoorOpen className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-blue-700">Add Doors</h3>
              <p className="text-sm text-blue-600 mt-1">Click near a wall to place a door</p>
            </div>
            
            <ScrollArea className="h-[calc(100%-160px)]">
              <div className="grid grid-cols-1 gap-3 pb-4">
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('door', { type: 'standard', width: 80, height: 200 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <DoorOpen className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Standard Door</p>
                    <p className="text-xs text-gray-500">80 x 200 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('door', { type: 'sliding', width: 120, height: 200 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <DoorOpen className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sliding Door</p>
                    <p className="text-xs text-gray-500">120 x 200 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('door', { type: 'pocket', width: 80, height: 200 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <DoorOpen className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pocket Door</p>
                    <p className="text-xs text-gray-500">80 x 200 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('door', { type: 'folding', width: 90, height: 200 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <DoorOpen className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Folding Door</p>
                    <p className="text-xs text-gray-500">90 x 200 cm</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        );
      case 'window':
        return (
          <div className="p-4">
            <div className="flex items-center mb-4 space-x-2">
              <Input
                placeholder="Search windows"
                className="h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search className="h-3.5 w-3.5 text-gray-500" />}
              />
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ArrowDownUp className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="text-center p-4 mb-4 bg-blue-50 rounded-lg">
              <Blinds className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-blue-700">Add Windows</h3>
              <p className="text-sm text-blue-600 mt-1">Click near a wall to place a window</p>
            </div>
            
            <ScrollArea className="h-[calc(100%-160px)]">
              <div className="grid grid-cols-1 gap-3 pb-4">
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('window', { type: 'standard', width: 100, height: 120, sillHeight: 90 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Blinds className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Standard Window</p>
                    <p className="text-xs text-gray-500">100 x 120 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('window', { type: 'sliding', width: 150, height: 120, sillHeight: 90 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Blinds className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sliding Window</p>
                    <p className="text-xs text-gray-500">150 x 120 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('window', { type: 'fixed', width: 80, height: 60, sillHeight: 120 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Blinds className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Fixed Window</p>
                    <p className="text-xs text-gray-500">80 x 60 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('window', { type: 'louvered', width: 60, height: 100, sillHeight: 150 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Blinds className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Louvered Window</p>
                    <p className="text-xs text-gray-500">60 x 100 cm</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        );
      case 'appliance':
        return (
          <div className="p-4">
            <div className="flex items-center mb-4 space-x-2">
              <Input
                placeholder="Search appliances"
                className="h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search className="h-3.5 w-3.5 text-gray-500" />}
              />
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ArrowDownUp className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="text-center p-4 mb-4 bg-blue-50 rounded-lg">
              <Box className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-blue-700">Add Appliances</h3>
              <p className="text-sm text-blue-600 mt-1">Click to place an appliance</p>
            </div>
            
            <ScrollArea className="h-[calc(100%-160px)]">
              <div className="grid grid-cols-1 gap-3 pb-4">
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'sink', width: 80, height: 20, depth: 60 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Box className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sink</p>
                    <p className="text-xs text-gray-500">80 x 60 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'stove', width: 60, height: 5, depth: 60 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Box className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Stove</p>
                    <p className="text-xs text-gray-500">60 x 60 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'fridge', width: 75, height: 180, depth: 65 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Box className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Refrigerator</p>
                    <p className="text-xs text-gray-500">75 x 180 x 65 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'dishwasher', width: 60, height: 85, depth: 60 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Box className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Dishwasher</p>
                    <p className="text-xs text-gray-500">60 x 85 x 60 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'microwave', width: 50, height: 30, depth: 40 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Box className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Microwave</p>
                    <p className="text-xs text-gray-500">50 x 30 x 40 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'oven', width: 60, height: 60, depth: 60 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Box className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Oven</p>
                    <p className="text-xs text-gray-500">60 x 60 x 60 cm</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
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
