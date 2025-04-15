
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
} from "@/components/ui/index";
import { Search } from "lucide-react";
import { CabinetCatalog } from "./catalog/CabinetCatalog";
import { DoorCatalog } from "./catalog/DoorCatalog";
import { WindowCatalog } from "./catalog/WindowCatalog";
import { ApplianceCatalog } from "./catalog/ApplianceCatalog";
import { CatalogItem } from "./catalog/CatalogItem";

const DesignCatalog = () => {
  const { currentToolMode, setSelectedItemId } = useKitchenStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleItemSelect = (itemType: string, templateData: any) => {
    // Set the selected item template data for the properties panel to use
    setSelectedItemId(`template_${itemType}`);
    localStorage.setItem(`template_${itemType}`, JSON.stringify(templateData));
  };

  const renderCatalogContent = () => {
    switch (currentToolMode) {
      case 'cabinet':
        return <CabinetCatalog searchTerm={searchTerm} onItemSelect={handleItemSelect} />;
      case 'door':
        return <DoorCatalog searchTerm={searchTerm} onItemSelect={handleItemSelect} />;
      case 'window':
        return <WindowCatalog searchTerm={searchTerm} onItemSelect={handleItemSelect} />;
      case 'appliance':
        return <ApplianceCatalog searchTerm={searchTerm} onItemSelect={handleItemSelect} />;
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

  return (
    <div className="h-full bg-card">
      {currentToolMode !== 'select' && currentToolMode !== 'room' && (
        <div className="relative p-4">
          <Search className="absolute left-6 top-7 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${currentToolMode}s...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      )}
      {renderCatalogContent()}
    </div>
  );
};

export default DesignCatalog;
