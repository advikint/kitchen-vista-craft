import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
} from "@/components/ui/tabs";
import { PackageOpen } from "lucide-react";
import { CatalogItem } from "./CatalogItem";
import CabinetDrawerTypes from "./CabinetDrawerTypes";

export interface CabinetCatalogProps {
  searchTerm: string;
  onItemSelect: (itemType: string, templateData: any) => void;
}

export const CabinetCatalog = ({ searchTerm, onItemSelect }: CabinetCatalogProps) => {
  const [activeTab, setActiveTab] = useState('base');
  
  const baseCabinets = [
    { name: "Standard Base 60cm", type: "base", width: 60, height: 85, depth: 60, category: "standard-base" },
    { name: "Standard Base 45cm", type: "base", width: 45, height: 85, depth: 60, category: "standard-base" },
    { name: "Standard Base 30cm", type: "base", width: 30, height: 85, depth: 60, category: "standard-base" },
    { name: "Sink Base 90cm", type: "base", width: 90, height: 85, depth: 60, category: "sink-base" },
    { name: "Sink Base 60cm", type: "base", width: 60, height: 85, depth: 60, category: "sink-base" },
    { name: "Corner Base 90cm", type: "base", width: 90, height: 85, depth: 90, category: "corner-base" },
    { name: "Corner Base L-Shape", type: "base", width: 105, height: 85, depth: 105, category: "corner-base" },
  ];
  
  const wallCabinets = [
    { name: "Standard Wall 60cm", type: "wall", width: 60, height: 70, depth: 35, category: "standard-wall" },
    { name: "Standard Wall 45cm", type: "wall", width: 45, height: 70, depth: 35, category: "standard-wall" },
    { name: "Standard Wall 30cm", type: "wall", width: 30, height: 70, depth: 35, category: "standard-wall" },
    { name: "Corner Wall 60cm", type: "wall", width: 60, height: 70, depth: 60, category: "corner-wall" },
    { name: "Open Shelf 60cm", type: "wall", width: 60, height: 70, depth: 35, category: "open-shelf" },
    { name: "Open Shelf 45cm", type: "wall", width: 45, height: 70, depth: 35, category: "open-shelf" },
    { name: "Glass Door 60cm", type: "wall", width: 60, height: 70, depth: 35, category: "glass-wall" },
    { name: "Glass Door 45cm", type: "wall", width: 45, height: 70, depth: 35, category: "glass-wall" },
    { name: "Microwave Unit 60cm", type: "wall", width: 60, height: 40, depth: 35, category: "microwave-wall" },
  ];
  
  const tallCabinets = [
    { name: "Pantry Unit 60cm", type: "tall", width: 60, height: 210, depth: 60, category: "pantry-tall" },
    { name: "Pantry Unit 45cm", type: "tall", width: 45, height: 210, depth: 60, category: "pantry-tall" },
    { name: "Oven Housing 60cm", type: "tall", width: 60, height: 210, depth: 60, category: "oven-tall" },
    { name: "Fridge Housing 60cm", type: "tall", width: 60, height: 210, depth: 60, category: "fridge-tall" },
    { name: "Broom Cabinet 45cm", type: "tall", width: 45, height: 210, depth: 60, category: "broom-tall" },
    { name: "Pull-out Pantry 30cm", type: "tall", width: 30, height: 210, depth: 60, category: "pullout-tall" },
  ];
  
  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleItemSelect = (itemType: string, templateData: any) => {
    if (onItemSelect) {
      onItemSelect(itemType, templateData);
    }
  };

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="base">Base</TabsTrigger>
          <TabsTrigger value="drawer">Drawers</TabsTrigger>
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

        <TabsContent value="drawer">
          <CabinetDrawerTypes searchTerm={searchTerm} onItemSelect={handleItemSelect} />
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

// Add default export for backward compatibility
export default CabinetCatalog;
