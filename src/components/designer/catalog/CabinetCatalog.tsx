
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
} from "@/components/ui/index";
import { PackageOpen } from "lucide-react";
import { CatalogItem } from "./CatalogItem";

interface CabinetCatalogProps {
  searchTerm: string;
  onItemSelect: (itemType: string, templateData: any) => void;
}

export const CabinetCatalog = ({ searchTerm, onItemSelect }: CabinetCatalogProps) => {
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

  // Filter items based on search query
  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="p-4">
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
                onClick={() => onItemSelect('cabinet', {
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
                onClick={() => onItemSelect('cabinet', {
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
                onClick={() => onItemSelect('cabinet', {
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
