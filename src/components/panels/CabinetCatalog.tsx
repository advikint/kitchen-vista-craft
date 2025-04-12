
import { useState } from "react";
import { useKitchenStore, CabinetType, CabinetCategory } from "@/store/kitchenStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";

const CabinetCatalog = () => {
  const { addCabinet } = useKitchenStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Cabinet catalog organized by type and category
  const cabinetCatalog = {
    base: [
      { id: "base-1", name: "Standard Base", category: "standard-base", width: 60, icon: "📦" },
      { id: "base-2", name: "Sink Base", category: "sink-base", width: 90, icon: "🚰" },
      { id: "base-3", name: "Drawer Base", category: "drawer-base", width: 60, icon: "🗄️" },
      { id: "base-4", name: "Corner Base", category: "corner-base", width: 90, icon: "📐" },
      { id: "base-5", name: "Cooktop Base", category: "cooktop-base", width: 90, icon: "🔥" },
      { id: "base-6", name: "Blind Corner Base", category: "blind-corner-base", width: 120, icon: "📦" },
      { id: "base-7", name: "Appliance Base", category: "appliance-base", width: 60, icon: "📦" },
    ],
    wall: [
      { id: "wall-1", name: "Standard Wall", category: "standard-wall", width: 60, icon: "📦" },
      { id: "wall-2", name: "Open Shelf", category: "open-shelf", width: 60, icon: "📚" },
      { id: "wall-3", name: "Microwave Wall", category: "microwave-wall", width: 60, icon: "📦" },
      { id: "wall-4", name: "Corner Wall", category: "corner-wall", width: 60, icon: "📐" },
      { id: "wall-5", name: "Glass Wall", category: "glass-wall", width: 60, icon: "🪟" },
      { id: "wall-6", name: "Blind Corner Wall", category: "blind-corner-wall", width: 60, icon: "📦" },
    ],
    tall: [
      { id: "tall-1", name: "Pantry Unit", category: "pantry-tall", width: 60, icon: "📦" },
      { id: "tall-2", name: "Oven Tower", category: "oven-tall", width: 60, icon: "🔥" },
      { id: "tall-3", name: "Fridge Surround", category: "fridge-tall", width: 60, icon: "❄️" },
      { id: "tall-4", name: "Broom Cabinet", category: "broom-tall", width: 45, icon: "🧹" },
      { id: "tall-5", name: "Appliance Tower", category: "appliance-tall", width: 60, icon: "📦" },
    ],
    specialty: [
      { id: "specialty-1", name: "Magic Corner", category: "magic-corner", width: 90, icon: "✨" },
      { id: "specialty-2", name: "Pull-out Pantry", category: "pullout", width: 30, icon: "📦" },
      { id: "specialty-3", name: "Carousel Corner", category: "carousel", width: 90, icon: "🔄" },
      { id: "specialty-4", name: "Wine Rack", category: "wine-rack", width: 30, icon: "🍷" },
    ],
  };

  // Filter cabinets based on search query
  const filterCabinets = (cabinets: any[]) => {
    if (!searchQuery) return cabinets;
    return cabinets.filter(cabinet => 
      cabinet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cabinet.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleDragStart = (e: React.DragEvent, cabinetData: any, type: CabinetType) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      ...cabinetData,
      type
    }));
  };

  const handleCabinetClick = (cabinetData: any, type: CabinetType) => {
    // Add cabinet at a default position
    addCabinet({
      type,
      category: cabinetData.category as CabinetCategory,
      frontType: 'shutter',
      finish: 'laminate',
      position: { x: 0, y: 0 },
      width: cabinetData.width,
      height: 0, // Will be auto-set based on type
      depth: 0, // Will be auto-set based on type
      rotation: 0,
      material: 'laminate',
      color: 'white'
    });
  };

  const CabinetItem = ({ item, type }: { item: any, type: CabinetType }) => (
    <div
      className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer"
      draggable
      onDragStart={(e) => handleDragStart(e, item, type)}
      onClick={() => handleCabinetClick(item, type)}
    >
      <span className="text-xl mr-2">{item.icon}</span>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{item.name}</span>
        <span className="text-xs text-gray-500">W: {item.width}cm</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search cabinets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <Tabs defaultValue="base" className="flex-1 overflow-hidden">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="base">Base</TabsTrigger>
          <TabsTrigger value="wall">Wall</TabsTrigger>
          <TabsTrigger value="tall">Tall</TabsTrigger>
          <TabsTrigger value="specialty">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="base" className="flex-1 overflow-y-auto mt-2">
          <Accordion type="multiple" defaultValue={["base-standard", "base-drawer"]}>
            <AccordionItem value="base-standard">
              <AccordionTrigger>Standard & Sink</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {filterCabinets(cabinetCatalog.base.filter(c => 
                    ["standard-base", "sink-base", "appliance-base", "cooktop-base"].includes(c.category)
                  )).map(item => (
                    <CabinetItem key={item.id} item={item} type="base" />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="base-drawer">
              <AccordionTrigger>Drawer Units</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {filterCabinets(cabinetCatalog.base.filter(c => c.category === "drawer-base")).map(item => (
                    <CabinetItem key={item.id} item={item} type="base" />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="base-corner">
              <AccordionTrigger>Corner Units</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {filterCabinets(cabinetCatalog.base.filter(c => 
                    ["corner-base", "blind-corner-base"].includes(c.category)
                  )).map(item => (
                    <CabinetItem key={item.id} item={item} type="base" />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="wall" className="flex-1 overflow-y-auto mt-2">
          <Accordion type="multiple" defaultValue={["wall-standard", "wall-specialty"]}>
            <AccordionItem value="wall-standard">
              <AccordionTrigger>Standard Wall</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {filterCabinets(cabinetCatalog.wall.filter(c => 
                    ["standard-wall", "microwave-wall"].includes(c.category)
                  )).map(item => (
                    <CabinetItem key={item.id} item={item} type="wall" />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wall-specialty">
              <AccordionTrigger>Specialty Wall</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {filterCabinets(cabinetCatalog.wall.filter(c => 
                    ["open-shelf", "glass-wall"].includes(c.category)
                  )).map(item => (
                    <CabinetItem key={item.id} item={item} type="wall" />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wall-corner">
              <AccordionTrigger>Corner Wall</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {filterCabinets(cabinetCatalog.wall.filter(c => 
                    ["corner-wall", "blind-corner-wall"].includes(c.category)
                  )).map(item => (
                    <CabinetItem key={item.id} item={item} type="wall" />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="tall" className="flex-1 overflow-y-auto mt-2">
          <div className="grid gap-2">
            {filterCabinets(cabinetCatalog.tall).map(item => (
              <CabinetItem key={item.id} item={item} type="tall" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="specialty" className="flex-1 overflow-y-auto mt-2">
          <div className="grid gap-2">
            {filterCabinets(cabinetCatalog.specialty).map(item => (
              <CabinetItem key={item.id} item={item} type="specialty" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CabinetCatalog;
