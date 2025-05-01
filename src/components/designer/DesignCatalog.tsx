import { useState, useEffect } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PackageOpen, DoorOpen, Blinds, Refrigerator } from "lucide-react";
import { CabinetCatalog } from "./catalog/CabinetCatalog";
import { ScrollArea } from "@/components/ui/scroll-area";

const DesignCatalog = () => {
  const { currentToolMode, setToolMode } = useKitchenStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("cabinets");
  
  // Sync the active tab with the current tool mode
  useEffect(() => {
    switch (currentToolMode) {
      case 'cabinet':
        setActiveTab('cabinets');
        break;
      case 'appliance':
        setActiveTab('appliances');
        break;
      case 'door':
        setActiveTab('doors');
        break;
      case 'window':
        setActiveTab('windows');
        break;
      default:
        // Keep current tab if tool mode doesn't match any tab
        break;
    }
  }, [currentToolMode]);
  
  // Sync the tool mode with the active tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update tool mode based on tab
    switch (value) {
      case 'cabinets':
        setToolMode('cabinet');
        break;
      case 'appliances':
        setToolMode('appliance');
        break;
      case 'doors':
        setToolMode('door');
        break;
      case 'windows':
        setToolMode('window');
        break;
      default:
        break;
    }
  };
  
  // Handle item selection (passed to catalogs)
  const handleItemSelect = (itemType: string, templateData: any) => {
    const { setSelectedItemId } = useKitchenStore.getState();
    setSelectedItemId(`template_${itemType}`);
    localStorage.setItem(`template_${itemType}`, JSON.stringify(templateData));
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h3 className="font-semibold mb-3">Design Catalog</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="px-4 grid w-full grid-cols-4">
          <TabsTrigger value="cabinets" className="flex flex-col items-center py-2">
            <PackageOpen className="h-4 w-4 mb-1" />
            <span className="text-xs">Cabinets</span>
          </TabsTrigger>
          <TabsTrigger value="appliances" className="flex flex-col items-center py-2">
            <Refrigerator className="h-4 w-4 mb-1" />
            <span className="text-xs">Appliances</span>
          </TabsTrigger>
          <TabsTrigger value="doors" className="flex flex-col items-center py-2">
            <DoorOpen className="h-4 w-4 mb-1" />
            <span className="text-xs">Doors</span>
          </TabsTrigger>
          <TabsTrigger value="windows" className="flex flex-col items-center py-2">
            <Blinds className="h-4 w-4 mb-1" />
            <span className="text-xs">Windows</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="cabinets" className="h-full m-0 pt-2">
            <CabinetCatalog searchTerm={searchTerm} onItemSelect={handleItemSelect} />
          </TabsContent>
          
          <TabsContent value="appliances" className="h-full m-0 pt-2">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                <div className="text-center p-4 mb-2 bg-blue-50 rounded-lg">
                  <Refrigerator className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium text-blue-700">Kitchen Appliances</h3>
                  <p className="text-sm text-blue-600 mt-1">Click to place or drag to position</p>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'sink', width: 80, height: 20, depth: 60 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Refrigerator className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sink</p>
                    <p className="text-xs text-gray-500">80 x 20 x 60 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'stove', width: 60, height: 5, depth: 60 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Refrigerator className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Stove</p>
                    <p className="text-xs text-gray-500">60 x 5 x 60 cm</p>
                  </div>
                </div>
                
                <div 
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handleItemSelect('appliance', { type: 'fridge', width: 75, height: 180, depth: 65 })}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <Refrigerator className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Refrigerator</p>
                    <p className="text-xs text-gray-500">75 x 180 x 65 cm</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="doors" className="h-full m-0 pt-2">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                <div className="text-center p-4 mb-2 bg-blue-50 rounded-lg">
                  <DoorOpen className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium text-blue-700">Doors</h3>
                  <p className="text-sm text-blue-600 mt-1">Click near a wall to place a door</p>
                </div>
                
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
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="windows" className="h-full m-0 pt-2">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                <div className="text-center p-4 mb-2 bg-blue-50 rounded-lg">
                  <Blinds className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium text-blue-700">Windows</h3>
                  <p className="text-sm text-blue-600 mt-1">Click near a wall to place a window</p>
                </div>
                
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
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DesignCatalog;
