
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CabinetCatalog from "@/components/panels/CabinetCatalog";
import { WindowCatalog } from "./catalog/WindowCatalog";
import { DoorCatalog } from "./catalog/DoorCatalog";
import { ApplianceCatalog } from "./catalog/ApplianceCatalog";
import { useKitchenStore, ToolMode } from "@/store/kitchenStore";

const DesignCatalog = () => {
  const { currentToolMode, setToolMode, setSelectedItemId } = useKitchenStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("cabinets");
  
  const handleItemSelect = (itemType: string, templateData: any) => {
    if (itemType === 'cabinet') {
      setToolMode('cabinet' as ToolMode);
    } else if (itemType === 'appliance') {
      setToolMode('appliance' as ToolMode);
    } else if (itemType === 'door') {
      setToolMode('door' as ToolMode);
    } else if (itemType === 'window') {
      setToolMode('window' as ToolMode);
    }
    
    setSelectedItemId(`template_${itemType}`);
    localStorage.setItem(`template_${itemType}`, JSON.stringify(templateData));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Design Objects</h2>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <Tabs 
        defaultValue="cabinets" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 overflow-hidden"
      >
        <TabsList className="grid w-full grid-cols-4 px-4 pt-2">
          <TabsTrigger value="cabinets">Cabinets</TabsTrigger>
          <TabsTrigger value="appliances">Appliances</TabsTrigger>
          <TabsTrigger value="doors">Doors</TabsTrigger>
          <TabsTrigger value="windows">Windows</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="cabinets" className="h-full">
            <CabinetCatalog />
          </TabsContent>
          
          <TabsContent value="appliances" className="h-full">
            <ApplianceCatalog searchTerm={searchTerm} onItemSelect={handleItemSelect} />
          </TabsContent>
          
          <TabsContent value="doors" className="h-full">
            <DoorCatalog searchTerm={searchTerm} onItemSelect={handleItemSelect} />
          </TabsContent>
          
          <TabsContent value="windows" className="h-full">
            <WindowCatalog searchTerm={searchTerm} onItemSelect={handleItemSelect} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DesignCatalog;
