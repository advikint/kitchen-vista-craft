
import { ScrollArea } from "@/components/ui/index";
import { Box } from "lucide-react";
import { CatalogItem } from "./CatalogItem";

interface ApplianceCatalogProps {
  searchTerm: string;
  onItemSelect: (itemType: string, templateData: any) => void;
}

export const ApplianceCatalog = ({ searchTerm, onItemSelect }: ApplianceCatalogProps) => {
  const appliances = [
    { name: "Standard Sink", type: "sink", width: 80, height: 20, depth: 60 },
    { name: "Gas Hob", type: "stove", width: 60, height: 5, depth: 60 },
    { name: "Refrigerator", type: "fridge", width: 75, height: 180, depth: 65 },
    { name: "Dishwasher", type: "dishwasher", width: 60, height: 85, depth: 60 },
  ];
  
  // Filter items based on search query
  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  return (
    <div className="p-4">
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
              onClick={() => onItemSelect('appliance', appliance)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
