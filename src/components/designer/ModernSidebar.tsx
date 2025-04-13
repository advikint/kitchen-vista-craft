
import { useState } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarHeader } from "@/components/ui/sidebar";
import { useKitchenStore } from "@/store/kitchenStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DoorOpen, 
  Blinds, 
  Chair, 
  Grid3X3, 
  Sofa, 
  Bed, 
  Bath, 
  Kitchen, 
  Refrigerator, 
  Armchair, 
  ChevronRight, 
  Search, 
  LayoutDashboard, 
  Filter,
  Settings,
  Home,
  CupSoda,
  SofaIcon,
  BookOpen
} from "lucide-react";

// Define cabinet presets
const baseCabinets = [
  { name: "Base Cabinet 60cm", width: 60, height: 85, depth: 60 },
  { name: "Base Cabinet 90cm", width: 90, height: 85, depth: 60 },
  { name: "Base Cabinet 80cm", width: 80, height: 85, depth: 60 },
  { name: "Base Cabinet 100cm", width: 100, height: 85, depth: 60 },
  { name: "Base Cabinet 120cm", width: 120, height: 85, depth: 60 },
  { name: "Corner Base Cabinet", width: 90, height: 85, depth: 90 },
];

const wallCabinets = [
  { name: "Wall Cabinet 60cm", width: 60, height: 70, depth: 35 },
  { name: "Wall Cabinet 80cm", width: 80, height: 70, depth: 35 },
  { name: "Wall Cabinet 90cm", width: 90, height: 70, depth: 35 },
  { name: "Wall Cabinet 100cm", width: 100, height: 70, depth: 35 },
  { name: "Wall Cabinet 120cm", width: 120, height: 70, depth: 35 },
  { name: "Corner Wall Cabinet", width: 60, height: 70, depth: 60 },
];

const tallCabinets = [
  { name: "Tall Cabinet 60cm", width: 60, height: 200, depth: 60 },
  { name: "Pantry Cabinet 60cm", width: 60, height: 210, depth: 60 },
  { name: "Utility Cabinet 80cm", width: 80, height: 200, depth: 60 },
  { name: "Broom Cabinet 40cm", width: 40, height: 210, depth: 60 },
];

const appliances = [
  { name: "Standard Sink", type: "sink", width: 80, height: 20, depth: 60 },
  { name: "Double Sink", type: "sink", width: 100, height: 25, depth: 60 },
  { name: "Gas Hob", type: "stove", width: 60, height: 5, depth: 60 },
  { name: "Induction Hob", type: "stove", width: 80, height: 5, depth: 60 },
  { name: "Refrigerator", type: "fridge", width: 75, height: 180, depth: 65 },
  { name: "Dishwasher", type: "dishwasher", width: 60, height: 85, depth: 60 },
  { name: "Oven", type: "oven", width: 60, height: 60, depth: 60 },
  { name: "Microwave", type: "microwave", width: 50, height: 30, depth: 40 },
];

const doors = [
  { name: "Standard Door", type: "standard", width: 80, height: 200 },
  { name: "Sliding Door", type: "sliding", width: 120, height: 200 },
  { name: "Pocket Door", type: "pocket", width: 80, height: 200 },
  { name: "Folding Door", type: "folding", width: 90, height: 200 },
];

const windows = [
  { name: "Standard Window", type: "standard", width: 100, height: 120, sillHeight: 90 },
  { name: "Sliding Window", type: "sliding", width: 150, height: 120, sillHeight: 90 },
  { name: "Fixed Window", type: "fixed", width: 80, height: 60, sillHeight: 120 },
  { name: "Louvered Window", type: "louvered", width: 60, height: 100, sillHeight: 150 },
];

const ModernSidebarContent = () => {
  const { currentToolMode, setSelectedItemId, setCurrentToolMode } = useKitchenStore();
  const [activeTab, setActiveTab] = useState("cabinets");
  const [searchTerm, setSearchTerm] = useState("");

  const handleItemSelect = (itemType: string, templateData: any) => {
    // Change to the appropriate tool mode
    if (itemType === 'cabinet') {
      setCurrentToolMode('cabinet');
    } else if (itemType === 'appliance') {
      setCurrentToolMode('appliance');
    } else if (itemType === 'door') {
      setCurrentToolMode('door');
    } else if (itemType === 'window') {
      setCurrentToolMode('window');
    }
    
    // Set the selected item template data for the properties panel to use
    setSelectedItemId(`template_${itemType}`);
    localStorage.setItem(`template_${itemType}`, JSON.stringify(templateData));
  };

  const renderCabinetItem = (item: any, type: 'base' | 'wall' | 'tall', color: string = 'white') => {
    return (
      <div 
        key={`${type}-${item.name}`}
        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center rounded-md border mb-2"
        onClick={() => handleItemSelect('cabinet', { 
          ...item, 
          type, 
          category: 'shutter', 
          frontType: 'shutter',
          finish: 'laminate',
          material: 'laminate',
          color
        })}
      >
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-3 overflow-hidden">
          {type === 'base' && <div className="w-12 h-8 bg-white border-2 border-gray-300"></div>}
          {type === 'wall' && <div className="w-10 h-10 bg-white border-2 border-gray-300"></div>}
          {type === 'tall' && <div className="w-8 h-14 bg-white border-2 border-gray-300"></div>}
        </div>
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-gray-500">{item.width} x {item.height} x {item.depth} cm</p>
        </div>
      </div>
    );
  };

  const renderApplianceItem = (item: any) => {
    let icon = <Kitchen className="w-8 h-8 text-gray-600" />;
    
    if (item.type === 'sink') {
      icon = <CupSoda className="w-8 h-8 text-gray-600" />;
    } else if (item.type === 'fridge') {
      icon = <Refrigerator className="w-8 h-8 text-gray-600" />;
    } else if (item.type === 'stove') {
      icon = <Kitchen className="w-8 h-8 text-gray-600" />;
    }
    
    return (
      <div 
        key={item.name}
        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center rounded-md border mb-2"
        onClick={() => handleItemSelect('appliance', item)}
      >
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-3">
          {icon}
        </div>
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-gray-500">{item.width} x {item.height} x {item.depth} cm</p>
        </div>
      </div>
    );
  };

  const renderDoorItem = (item: any) => {
    return (
      <div 
        key={item.name}
        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center rounded-md border mb-2"
        onClick={() => handleItemSelect('door', item)}
      >
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-3">
          <DoorOpen className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-gray-500">{item.width} x {item.height} cm</p>
        </div>
      </div>
    );
  };

  const renderWindowItem = (item: any) => {
    return (
      <div 
        key={item.name}
        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center rounded-md border mb-2"
        onClick={() => handleItemSelect('window', item)}
      >
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-3">
          <Blinds className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-gray-500">
            {item.width} x {item.height} cm
            <br />
            Sill height: {item.sillHeight} cm
          </p>
        </div>
      </div>
    );
  };

  const filterItems = (items: any[], term: string) => {
    if (!term) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase())
    );
  };

  return (
    <div className="h-full w-full p-3">
      <SidebarHeader>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Design Objects</h2>
          <SidebarTrigger className="h-8 w-8" />
        </div>
        <div className="flex items-center mb-2 gap-2">
          <Input
            placeholder="Search objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </div>
      </SidebarHeader>
      
      <Tabs defaultValue="cabinets" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="cabinets">Cabinets</TabsTrigger>
          <TabsTrigger value="appliances">Appliances</TabsTrigger>
          <TabsTrigger value="doors">Doors</TabsTrigger>
          <TabsTrigger value="windows">Windows</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100vh-240px)] pr-3">
          <TabsContent value="cabinets" className="mt-2">
            <div className="mb-3">
              <h3 className="text-md font-medium mb-2">Base Cabinets</h3>
              {filterItems(baseCabinets, searchTerm).map(cabinet => 
                renderCabinetItem(cabinet, 'base')
              )}
            </div>
            
            <div className="mb-3">
              <h3 className="text-md font-medium mb-2">Wall Cabinets</h3>
              {filterItems(wallCabinets, searchTerm).map(cabinet => 
                renderCabinetItem(cabinet, 'wall')
              )}
            </div>
            
            <div className="mb-3">
              <h3 className="text-md font-medium mb-2">Tall Cabinets</h3>
              {filterItems(tallCabinets, searchTerm).map(cabinet => 
                renderCabinetItem(cabinet, 'tall')
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="appliances" className="mt-2">
            {filterItems(appliances, searchTerm).map(appliance => 
              renderApplianceItem(appliance)
            )}
          </TabsContent>
          
          <TabsContent value="doors" className="mt-2">
            {filterItems(doors, searchTerm).map(door => 
              renderDoorItem(door)
            )}
          </TabsContent>
          
          <TabsContent value="windows" className="mt-2">
            {filterItems(windows, searchTerm).map(window => 
              renderWindowItem(window)
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

const ModernSidebar = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="floating" className="pt-3">
        <ModernSidebarContent />
      </Sidebar>
    </SidebarProvider>
  );
};

export default ModernSidebar;
