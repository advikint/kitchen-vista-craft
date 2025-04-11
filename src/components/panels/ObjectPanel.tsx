import { useState } from "react";
import { useKitchenStore, CabinetType, CabinetCategory, ApplianceType } from "@/store/kitchenStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const ObjectPanel = () => {
  const { 
    currentToolMode,
    addCabinet,
    addAppliance
  } = useKitchenStore();
  
  const [activeTab, setActiveTab] = useState("base");
  
  const [defaultCabinet] = useState({
    width: 60,
    height: 80,
    depth: 60,
    material: 'laminate',
    color: 'white',
    rotation: 0
  });
  
  const [defaultAppliance] = useState({
    width: 60,
    height: 85,
    depth: 60,
    rotation: 0,
    model: 'Standard'
  });
  
  const handleAddCabinet = (type: CabinetType, category: CabinetCategory) => {
    if (currentToolMode !== 'cabinet') {
      toast.warning("Switch to the Cabinet tool to add cabinets");
      return;
    }
    
    let cabinetDimensions = { ...defaultCabinet };
    
    switch (type) {
      case 'base':
        cabinetDimensions = { ...cabinetDimensions, height: 80, depth: 60 };
        break;
      case 'wall':
        cabinetDimensions = { ...cabinetDimensions, height: 70, depth: 35 };
        break;
      case 'tall':
        cabinetDimensions = { ...cabinetDimensions, height: 210, depth: 60 };
        break;
      case 'loft':
        cabinetDimensions = { ...cabinetDimensions, height: 40, depth: 35 };
        break;
      case 'island':
        cabinetDimensions = { ...cabinetDimensions, height: 80, depth: 65 };
        break;
      case 'corner':
        cabinetDimensions = { ...cabinetDimensions, height: 80, depth: 60 };
        break;
    }
    
    addCabinet({
      type,
      category,
      position: { x: 0, y: 0 },
      ...cabinetDimensions
    });
    
    toast.success(`Added ${type} ${category} cabinet`);
  };
  
  const handleAddAppliance = (type: ApplianceType) => {
    if (currentToolMode !== 'appliance') {
      toast.warning("Switch to the Appliance tool to add appliances");
      return;
    }
    
    let applianceDimensions = { ...defaultAppliance };
    
    switch (type) {
      case 'sink':
        applianceDimensions = { ...applianceDimensions, width: 80, height: 20, depth: 60 };
        break;
      case 'stove':
        applianceDimensions = { ...applianceDimensions, width: 60, height: 5, depth: 60 };
        break;
      case 'oven':
        applianceDimensions = { ...applianceDimensions, width: 60, height: 60, depth: 60 };
        break;
      case 'fridge':
        applianceDimensions = { ...applianceDimensions, width: 75, height: 180, depth: 65 };
        break;
      case 'dishwasher':
        applianceDimensions = { ...applianceDimensions, width: 60, height: 80, depth: 60 };
        break;
      case 'microwave':
        applianceDimensions = { ...applianceDimensions, width: 50, height: 30, depth: 40 };
        break;
      case 'hood':
      case 'chimney':
        applianceDimensions = { ...applianceDimensions, width: 60, height: 15, depth: 50 };
        break;
    }
    
    addAppliance({
      type,
      position: { x: 0, y: 0 },
      ...applianceDimensions,
      model: `Standard ${type.charAt(0).toUpperCase() + type.slice(1)}`
    });
    
    toast.success(`Added ${type}`);
  };
  
  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["cabinets", "appliances"]}>
        <AccordionItem value="cabinets">
          <AccordionTrigger className="text-sm font-medium">Cabinets</AccordionTrigger>
          <AccordionContent>
            <Tabs defaultValue="base" value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="base">Base</TabsTrigger>
                <TabsTrigger value="wall">Wall</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
              
              <TabsContent value="base" className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('base', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200"></div>
                    </div>
                    <p className="text-center">Base Cabinet</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('base', 'drawer')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-full flex flex-col">
                        <div className="h-2 bg-white border border-gray-200"></div>
                        <div className="h-2 bg-white border border-gray-200"></div>
                        <div className="h-2 bg-white border border-gray-200"></div>
                      </div>
                    </div>
                    <p className="text-center">Drawer Unit</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('base', 'pullout')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200 relative">
                        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-300"></div>
                      </div>
                    </div>
                    <p className="text-center">Pull-out Unit</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('corner', 'corner')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-6 h-6 bg-white border border-gray-200 transform rotate-45 translate-x-1"></div>
                    </div>
                    <p className="text-center">Corner Unit</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('base', 'magic-corner')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="relative">
                        <div className="w-6 h-6 bg-white border border-gray-200 transform rotate-45 translate-x-1"></div>
                        <div className="absolute top-0 left-0 w-3 h-3 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-center">Magic Corner</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('base', 'carousel')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-6 h-6 bg-white border border-gray-200 rounded-full"></div>
                    </div>
                    <p className="text-center">Carousel Unit</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="wall" className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('wall', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-start justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200"></div>
                    </div>
                    <p className="text-center">Wall Cabinet</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('wall', 'open')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-start justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200 border-t-0"></div>
                    </div>
                    <p className="text-center">Open Shelf</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('wall', 'corner')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-start justify-center">
                      <div className="w-6 h-6 bg-white border border-gray-200 transform rotate-45 translate-y-1"></div>
                    </div>
                    <p className="text-center">Corner Wall</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('loft', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-start justify-center pt-1">
                      <div className="w-full h-3 bg-white border border-gray-200"></div>
                    </div>
                    <p className="text-center">Loft Cabinet</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="other" className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('tall', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center">
                      <div className="w-full h-8 bg-white border border-gray-200"></div>
                    </div>
                    <p className="text-center">Tall Cabinet</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('island', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200"></div>
                    </div>
                    <p className="text-center">Island Unit</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAddCabinet('island', 'drawer')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-full flex flex-col">
                        <div className="h-2 bg-white border border-gray-200"></div>
                        <div className="h-2 bg-white border border-gray-200"></div>
                        <div className="h-2 bg-white border border-gray-200"></div>
                      </div>
                    </div>
                    <p className="text-center">Island Drawers</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="appliances">
          <AccordionTrigger className="text-sm font-medium">Appliances</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div
                className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddAppliance('sink')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="7" width="20" height="10" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M6 10C6 8.89543 6.89543 8 8 8H16C17.1046 8 18 8.89543 18 10V10C18 11.1046 17.1046 12 16 12H8C6.89543 12 6 11.1046 6 10V10Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 12V17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 17H16" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-center">Sink</p>
              </div>
              
              <div
                className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddAppliance('stove')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8" cy="10" r="1" fill="currentColor"/>
                    <circle cx="16" cy="10" r="1" fill="currentColor"/>
                    <circle cx="8" cy="14" r="1" fill="currentColor"/>
                    <circle cx="16" cy="14" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <p className="text-center">Stove</p>
              </div>
              
              <div
                className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddAppliance('oven')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="5" width="16" height="14" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 8H17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 12H17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 16H17" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-center">Oven</p>
              </div>
              
              <div
                className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddAppliance('fridge')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="3" width="14" height="18" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 10H19" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15 7L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M15 16L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-center">Refrigerator</p>
              </div>
              
              <div
                className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddAppliance('dishwasher')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="5" width="16" height="14" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 9H20" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 6.5H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 13L7 16" stroke="currentColor" strokeWidth="2"/>
                    <path d="M14 13L17 16" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 13V16" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-center">Dishwasher</p>
              </div>
              
              <div
                className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddAppliance('microwave')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="15" y="9" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-center">Microwave</p>
              </div>
              
              <div
                className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddAppliance('chimney')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="4" width="14" height="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 8V12" stroke="currentColor" strokeWidth="2"/>
                    <path d="M17 8V12" stroke="currentColor" strokeWidth="2"/>
                    <rect x="5" y="12" width="14" height="6" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 18V20" stroke="currentColor" strokeWidth="2"/>
                    <path d="M14 18V20" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-center">Chimney</p>
              </div>
              
              <div
                className="cabinet-item text-xs border rounded p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddAppliance('water-purifier')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="12" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 8H14" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12L15 12" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 16H14" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 4V2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-center">Water Purifier</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="materials">
          <AccordionTrigger className="text-sm font-medium">Materials & Finishes</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['White', 'Oak', 'Walnut', 'Grey', 'Black', 'Navy', 'Beige', 'High Gloss', 'Matte'].map((color) => (
                <Button 
                  key={color} 
                  variant="outline" 
                  size="sm" 
                  className="h-auto py-4 flex flex-col items-center justify-center gap-1"
                >
                  <div className={`w-full h-6 rounded ${getColorClass(color)}`}></div>
                  <span className="text-xs">{color}</span>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const getColorClass = (color: string): string => {
  switch (color.toLowerCase()) {
    case 'white': return 'bg-white border border-gray-200';
    case 'oak': return 'bg-amber-200';
    case 'walnut': return 'bg-amber-800';
    case 'grey': return 'bg-gray-400';
    case 'black': return 'bg-gray-900';
    case 'navy': return 'bg-blue-900';
    case 'beige': return 'bg-amber-100';
    case 'high gloss': return 'bg-gray-200 bg-opacity-70';
    case 'matte': return 'bg-gray-300';
    default: return 'bg-gray-200';
  }
};

export default ObjectPanel;
