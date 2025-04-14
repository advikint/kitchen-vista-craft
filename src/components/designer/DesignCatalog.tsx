
import { useState } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Button,
  Input,
  ScrollArea,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/";
import { 
  Search, 
  Filter, 
  ChevronDown,
  DoorOpen,
  Blinds,
  PackageOpen,
  Box
} from "lucide-react";

const DesignCatalog = () => {
  const { currentToolMode, setSelectedItemId } = useKitchenStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleItemSelect = (itemType: string, templateData: any) => {
    // Set the selected item template data for the properties panel to use
    setSelectedItemId(`template_${itemType}`);
    localStorage.setItem(`template_${itemType}`, JSON.stringify(templateData));
  };

  // Filter items based on search query
  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const renderCatalogContent = () => {
    switch (currentToolMode) {
      case 'cabinet':
        return renderCabinetCatalog();
      case 'door':
        return renderDoorCatalog();
      case 'window':
        return renderWindowCatalog();
      case 'appliance':
        return renderApplianceCatalog();
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search size={24} />
            </div>
            <p className="text-center">
              Select a tool from the sidebar to view available items
            </p>
          </div>
        );
    }
  };

  const renderCabinetCatalog = () => {
    const baseCabinets = [
      { name: "Standard Base 60cm", type: "base", width: 60, height: 85, depth: 60, category: "standard-base" },
      { name: "Sink Base 90cm", type: "base", width: 90, height: 85, depth: 60, category: "sink-base" },
      { name: "Corner Base 90cm", type: "base", width: 90, height: 85, depth: 90, category: "corner-base" },
    ];
    
    const wallCabinets = [
      { name: "Standard Wall 60cm", type: "wall", width: 60, height: 70, depth: 35, category: "standard-wall" },
      { name: "Corner Wall 60cm", type: "wall", width: 60, height: 70, depth: 60, category: "corner-wall" },
    ];
    
    const tallCabinets = [
      { name: "Pantry Cabinet", type: "tall", width: 60, height: 210, depth: 60, category: "pantry-tall" },
      { name: "Broom Cabinet", type: "tall", width: 45, height: 210, depth: 60, category: "broom-tall" },
    ];

    return (
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cabinets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Tabs defaultValue="base">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="wall">Wall</TabsTrigger>
            <TabsTrigger value="tall">Tall</TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="pt-3">
            <div className="space-y-2">
              {filterItems(baseCabinets).map(cabinet => (
                <CatalogItem
                  key={cabinet.name}
                  item={cabinet}
                  icon={<PackageOpen />}
                  onClick={() => handleItemSelect('cabinet', {
                    ...cabinet,
                    frontType: 'shutter',
                    finish: 'laminate',
                    material: 'laminate',
                    color: 'white'
                  })}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="wall" className="pt-3">
            <div className="space-y-2">
              {filterItems(wallCabinets).map(cabinet => (
                <CatalogItem
                  key={cabinet.name}
                  item={cabinet}
                  icon={<PackageOpen />}
                  onClick={() => handleItemSelect('cabinet', {
                    ...cabinet,
                    frontType: 'shutter',
                    finish: 'laminate',
                    material: 'laminate',
                    color: 'white'
                  })}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tall" className="pt-3">
            <div className="space-y-2">
              {filterItems(tallCabinets).map(cabinet => (
                <CatalogItem
                  key={cabinet.name}
                  item={cabinet}
                  icon={<PackageOpen />}
                  onClick={() => handleItemSelect('cabinet', {
                    ...cabinet,
                    frontType: 'shutter',
                    finish: 'laminate',
                    material: 'laminate',
                    color: 'white'
                  })}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  const renderDoorCatalog = () => {
    const doors = [
      { name: "Standard Door", type: "standard", width: 80, height: 200 },
      { name: "Sliding Door", type: "sliding", width: 120, height: 200 },
      { name: "Pocket Door", type: "pocket", width: 80, height: 200 },
      { name: "Folding Door", type: "folding", width: 90, height: 200 },
    ];
    
    return (
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="p-4 mb-4 bg-blue-50 rounded-lg text-center">
          <DoorOpen className="w-10 h-10 text-blue-500 mx-auto mb-2" />
          <p className="font-medium text-blue-700">Add Doors</p>
          <p className="text-sm text-blue-600 mt-1">Click near a wall to place a door</p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-2">
            {filterItems(doors).map(door => (
              <CatalogItem
                key={door.name}
                item={door}
                icon={<DoorOpen />}
                onClick={() => handleItemSelect('door', door)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };
  
  const renderWindowCatalog = () => {
    const windows = [
      { name: "Standard Window", type: "standard", width: 100, height: 120, sillHeight: 90 },
      { name: "Sliding Window", type: "sliding", width: 150, height: 120, sillHeight: 90 },
      { name: "Fixed Window", type: "fixed", width: 80, height: 60, sillHeight: 120 },
      { name: "Louvered Window", type: "louvered", width: 60, height: 100, sillHeight: 150 },
    ];
    
    return (
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search windows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="p-4 mb-4 bg-blue-50 rounded-lg text-center">
          <Blinds className="w-10 h-10 text-blue-500 mx-auto mb-2" />
          <p className="font-medium text-blue-700">Add Windows</p>
          <p className="text-sm text-blue-600 mt-1">Click near a wall to place a window</p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-2">
            {filterItems(windows).map(window => (
              <CatalogItem
                key={window.name}
                item={window}
                icon={<Blinds />}
                onClick={() => handleItemSelect('window', window)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };
  
  const renderApplianceCatalog = () => {
    const appliances = [
      { name: "Standard Sink", type: "sink", width: 80, height: 20, depth: 60 },
      { name: "Gas Hob", type: "stove", width: 60, height: 5, depth: 60 },
      { name: "Refrigerator", type: "fridge", width: 75, height: 180, depth: 65 },
      { name: "Dishwasher", type: "dishwasher", width: 60, height: 85, depth: 60 },
    ];
    
    return (
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appliances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="p-4 mb-4 bg-blue-50 rounded-lg text-center">
          <Box className="w-10 h-10 text-blue-500 mx-auto mb-2" />
          <p className="font-medium text-blue-700">Add Appliances</p>
          <p className="text-sm text-blue-600 mt-1">Click to place an appliance</p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-2">
            {filterItems(appliances).map(appliance => (
              <CatalogItem
                key={appliance.name}
                item={appliance}
                icon={<Box />}
                onClick={() => handleItemSelect('appliance', appliance)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="h-full bg-card">
      {renderCatalogContent()}
    </div>
  );
};

interface CatalogItemProps {
  item: any;
  icon: React.ReactNode;
  onClick: () => void;
}

const CatalogItem = ({ item, icon, onClick }: CatalogItemProps) => (
  <button
    className="w-full flex items-center p-3 hover:bg-muted rounded-md border transition-colors text-left"
    onClick={onClick}
  >
    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mr-3">
      {icon}
    </div>
    <div>
      <p className="font-medium">{item.name}</p>
      <p className="text-xs text-muted-foreground">
        {item.width} x {item.height}{item.depth ? ` x ${item.depth}` : ''} cm
      </p>
    </div>
  </button>
);

export default DesignCatalog;
