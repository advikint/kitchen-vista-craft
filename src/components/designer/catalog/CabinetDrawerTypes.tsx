
import React from 'react';
import { useKitchenStore } from '@/store/kitchenStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CatalogItem } from './CatalogItem';
import { Layers, Layers2, Layers3 } from 'lucide-react';

interface CabinetDrawerTypesProps {
  searchTerm: string;
  onItemSelect: (itemType: string, templateData: any) => void;
}

export const CabinetDrawerTypes = ({ searchTerm, onItemSelect }: CabinetDrawerTypesProps) => {
  // Drawer cabinet types
  const singleDrawerCabinets = [
    { name: "Single Drawer Base 60cm", type: "base", width: 60, height: 85, depth: 60, category: "drawer-base", drawers: 1 },
    { name: "Single Drawer Base 45cm", type: "base", width: 45, height: 85, depth: 60, category: "drawer-base", drawers: 1 },
    { name: "Single Drawer Base 30cm", type: "base", width: 30, height: 85, depth: 60, category: "drawer-base", drawers: 1 },
  ];

  const doubleDrawerCabinets = [
    { name: "Two Drawer Base 60cm", type: "base", width: 60, height: 85, depth: 60, category: "drawer-base", drawers: 2 },
    { name: "Two Drawer Base 45cm", type: "base", width: 45, height: 85, depth: 60, category: "drawer-base", drawers: 2 },
    { name: "Two Drawer Base 30cm", type: "base", width: 30, height: 85, depth: 60, category: "drawer-base", drawers: 2 },
  ];

  const multiDrawerCabinets = [
    { name: "Three Drawer Base 60cm", type: "base", width: 60, height: 85, depth: 60, category: "drawer-base", drawers: 3 },
    { name: "Four Drawer Base 45cm", type: "base", width: 45, height: 85, depth: 60, category: "drawer-base", drawers: 4 },
    { name: "Five Drawer Base 30cm", type: "base", width: 30, height: 85, depth: 60, category: "drawer-base", drawers: 5 },
  ];

  const specialDrawerCabinets = [
    { name: "Mixed Drawer Base 60cm", type: "base", width: 60, height: 85, depth: 60, category: "drawer-base", drawers: 3, special: 'mixed' },
    { name: "File Drawer Base 45cm", type: "base", width: 45, height: 85, depth: 60, category: "drawer-base", drawers: 2, special: 'file' },
    { name: "Deep Drawer Base 60cm", type: "base", width: 60, height: 85, depth: 60, category: "drawer-base", drawers: 1, special: 'deep' },
  ];

  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="p-3">
      <div className="text-center p-4 mb-4 bg-blue-50 rounded-lg">
        <Layers className="w-10 h-10 text-blue-500 mx-auto mb-2" />
        <h3 className="font-medium text-blue-700">Drawer Base Cabinets</h3>
        <p className="text-sm text-blue-600 mt-1">Click to place or drag to position</p>
      </div>

      <Tabs defaultValue="single">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="double">Double</TabsTrigger>
          <TabsTrigger value="multi">Multi</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-280px)] mt-3">
          <TabsContent value="single" className="pt-1">
            <div className="space-y-2">
              {filterItems(singleDrawerCabinets).map(cabinet => (
                <CatalogItem
                  key={cabinet.name}
                  item={cabinet}
                  icon={<Layers />}
                  onClick={() => onItemSelect('cabinet', {
                    ...cabinet,
                    frontType: 'drawer',
                    finish: 'laminate',
                    material: 'laminate',
                    color: 'white'
                  })}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="double" className="pt-1">
            <div className="space-y-2">
              {filterItems(doubleDrawerCabinets).map(cabinet => (
                <CatalogItem
                  key={cabinet.name}
                  item={cabinet}
                  icon={<Layers2 />}
                  onClick={() => onItemSelect('cabinet', {
                    ...cabinet,
                    frontType: 'drawer',
                    finish: 'laminate',
                    material: 'laminate',
                    color: 'white'
                  })}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="multi" className="pt-1">
            <div className="space-y-2">
              {filterItems(multiDrawerCabinets).map(cabinet => (
                <CatalogItem
                  key={cabinet.name}
                  item={cabinet}
                  icon={<Layers3 />}
                  onClick={() => onItemSelect('cabinet', {
                    ...cabinet,
                    frontType: 'drawer',
                    finish: 'laminate',
                    material: 'laminate',
                    color: 'white'
                  })}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="special" className="pt-1">
            <div className="space-y-2">
              {filterItems(specialDrawerCabinets).map(cabinet => (
                <CatalogItem
                  key={cabinet.name}
                  item={cabinet}
                  icon={<Layers3 />}
                  onClick={() => onItemSelect('cabinet', {
                    ...cabinet,
                    frontType: 'drawer',
                    finish: 'laminate',
                    material: 'laminate',
                    color: 'white',
                    special: cabinet.special
                  })}
                />
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default CabinetDrawerTypes;
