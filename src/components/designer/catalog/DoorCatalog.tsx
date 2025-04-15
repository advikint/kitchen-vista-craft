
import { ScrollArea } from "@/components/ui/scroll-area";
import { DoorOpen } from "lucide-react";
import { CatalogItem } from "./CatalogItem";

interface DoorCatalogProps {
  searchTerm: string;
  onItemSelect: (itemType: string, templateData: any) => void;
}

export const DoorCatalog = ({ searchTerm, onItemSelect }: DoorCatalogProps) => {
  const doors = [
    { name: "Standard Door", type: "standard", width: 80, height: 200 },
    { name: "Sliding Door", type: "sliding", width: 120, height: 200 },
    { name: "Pocket Door", type: "pocket", width: 80, height: 200 },
    { name: "Folding Door", type: "folding", width: 90, height: 200 },
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
              onClick={() => onItemSelect('door', door)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
