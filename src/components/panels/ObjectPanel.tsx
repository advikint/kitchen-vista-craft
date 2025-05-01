
import { useKitchenStore } from "@/store/kitchenStore";
import { CabinetCatalog } from "@/components/designer/catalog/CabinetCatalog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoorOpen, Blinds, PackageOpen, Box, Search, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ObjectPanel = () => {
  const { currentToolMode, setSelectedItemId } = useKitchenStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleItemSelect = (itemType: string, templateData: any) => {
    // Set the selected item data for the properties panel
    setSelectedItemId(`template_${itemType}`);
    // Store the template data in localStorage
    localStorage.setItem(`template_${itemType}`, JSON.stringify(templateData));
  };
  
  // Helper for search input
  const SearchInput = () => (
    <div className="relative mb-4">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        placeholder={`Search ${currentToolMode}s...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8"
      />
    </div>
  );
  
  // Helper component for tool info header
  const ToolInfoHeader = ({ 
    icon, 
    title, 
    description 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
  }) => (
    <div className="text-center p-4 mb-4 bg-blue-50 rounded-lg animate-fade-in">
      <div className="mx-auto mb-2">
        {icon}
      </div>
      <h3 className="font-medium text-blue-700">{title}</h3>
      <p className="text-sm text-blue-600 mt-1">{description}</p>
    </div>
  );
  
  const renderToolContent = () => {
    switch (currentToolMode) {
      case 'cabinet':
        return (
          <div className="p-4">
            <SearchInput />
            <ToolInfoHeader 
              icon={<PackageOpen className="w-10 h-10 text-blue-500" />}
              title="Add Cabinets"
              description="Click on catalog items to add to your design"
            />
            <CabinetCatalog 
              searchTerm={searchTerm}
              onItemSelect={handleItemSelect}
            />
          </div>
        );
        
      case 'door':
        return (
          <div className="p-4">
            <SearchInput />
            <ToolInfoHeader 
              icon={<DoorOpen className="w-10 h-10 text-blue-500" />}
              title="Add Doors"
              description="Click near a wall to place a door"
            />
            <Tabs defaultValue="standard">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="sliding">Sliding</TabsTrigger>
                <TabsTrigger value="special">Special</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-[calc(100vh-280px)]">
                <TabsContent value="standard" className="space-y-2">
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
                    onClick={() => handleItemSelect('door', { type: 'standard', width: 90, height: 200 })}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                      <DoorOpen className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Wide Standard Door</p>
                      <p className="text-xs text-gray-500">90 x 200 cm</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="sliding" className="space-y-2">
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
                    onClick={() => handleItemSelect('door', { type: 'sliding', width: 150, height: 200 })}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                      <DoorOpen className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Wide Sliding Door</p>
                      <p className="text-xs text-gray-500">150 x 200 cm</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="special" className="space-y-2">
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
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        );
        
      case 'window':
        return (
          <div className="p-4">
            <SearchInput />
            <ToolInfoHeader 
              icon={<Blinds className="w-10 h-10 text-blue-500" />}
              title="Add Windows"
              description="Click near a wall to place a window"
            />
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2">
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
          </div>
        );
        
      case 'appliance':
        return (
          <div className="p-4">
            <SearchInput />
            <ToolInfoHeader 
              icon={<Box className="w-10 h-10 text-blue-500" />}
              title="Add Appliances"
              description="Click to place an appliance in your design"
            />
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2">
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
    <div className="h-full overflow-hidden">
      {renderToolContent()}
    </div>
  );
};

export default ObjectPanel;
