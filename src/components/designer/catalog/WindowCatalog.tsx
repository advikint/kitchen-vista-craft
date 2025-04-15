
import { ScrollArea } from "@/components/ui/scroll-area";
import { Blinds } from "lucide-react";
import { CatalogItem } from "./CatalogItem";

interface WindowCatalogProps {
  searchTerm: string;
  onItemSelect: (itemType: string, templateData: any) => void;
}

export const WindowCatalog = ({ searchTerm, onItemSelect }: WindowCatalogProps) => {
  const windows = [
    { name: "Standard Window", type: "standard", width: 100, height: 120, sillHeight: 90 },
    { name: "Sliding Window", type: "sliding", width: 150, height: 120, sillHeight: 90 },
    { name: "Fixed Window", type: "fixed", width: 80, height: 60, sillHeight: 120 },
    { name: "Louvered Window", type: "louvered", width: 60, height: 100, sillHeight: 150 },
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
              onClick={() => onItemSelect('window', window)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
