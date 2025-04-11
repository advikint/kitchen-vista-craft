
import { useState } from "react";
import { useKitchenStore, CabinetType, CabinetCategory, ApplianceType } from "@/store/kitchenStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ObjectPanel = () => {
  const { 
    currentToolMode,
    addCabinet,
    addAppliance
  } = useKitchenStore();
  
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
    
    // In a real app, this would place the cabinet preview on the cursor
    // Here we'll just add it at the center of the room
    addCabinet({
      type,
      category,
      position: { x: 0, y: 0 },
      ...defaultCabinet
    });
    
    toast.success(`Added ${type} ${category} cabinet`);
  };
  
  const handleAddAppliance = (type: ApplianceType) => {
    if (currentToolMode !== 'appliance') {
      toast.warning("Switch to the Appliance tool to add appliances");
      return;
    }
    
    // In a real app, this would place the appliance preview on the cursor
    addAppliance({
      type,
      position: { x: 0, y: 0 },
      ...defaultAppliance
    });
    
    toast.success(`Added ${type}`);
  };
  
  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["cabinets", "appliances"]}>
        <AccordionItem value="cabinets">
          <AccordionTrigger className="text-sm font-medium">Cabinets</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-500">Base Cabinets</h4>
                <div className="space-y-1">
                  <div
                    className="cabinet-item text-xs"
                    onClick={() => handleAddCabinet('base', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200"></div>
                    </div>
                    <p>Base Cabinet</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs"
                    onClick={() => handleAddCabinet('base', 'drawer')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-full flex flex-col">
                        <div className="h-2 bg-white border border-gray-200"></div>
                        <div className="h-2 bg-white border border-gray-200"></div>
                        <div className="h-2 bg-white border border-gray-200"></div>
                      </div>
                    </div>
                    <p>Drawer Unit</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs"
                    onClick={() => handleAddCabinet('base', 'corner')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-6 h-6 bg-white border border-gray-200 transform rotate-45 translate-x-1"></div>
                    </div>
                    <p>Corner Cabinet</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-500">Wall Cabinets</h4>
                <div className="space-y-1">
                  <div
                    className="cabinet-item text-xs"
                    onClick={() => handleAddCabinet('wall', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-start justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200"></div>
                    </div>
                    <p>Wall Cabinet</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs"
                    onClick={() => handleAddCabinet('wall', 'open')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-start justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200 border-t-0"></div>
                    </div>
                    <p>Open Shelf</p>
                  </div>
                  
                  <div
                    className="cabinet-item text-xs"
                    onClick={() => handleAddCabinet('wall', 'corner')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-start justify-center">
                      <div className="w-6 h-6 bg-white border border-gray-200 transform rotate-45 translate-y-1"></div>
                    </div>
                    <p>Corner Wall</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-500">Tall Cabinets</h4>
                <div className="space-y-1">
                  <div
                    className="cabinet-item text-xs"
                    onClick={() => handleAddCabinet('tall', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center">
                      <div className="w-full h-8 bg-white border border-gray-200"></div>
                    </div>
                    <p>Tall Cabinet</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-500">Island Units</h4>
                <div className="space-y-1">
                  <div
                    className="cabinet-item text-xs"
                    onClick={() => handleAddCabinet('island', 'shutter')}
                  >
                    <div className="h-8 bg-gray-100 mb-1 flex items-end justify-center">
                      <div className="w-full h-6 bg-white border border-gray-200"></div>
                    </div>
                    <p>Island Unit</p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="appliances">
          <AccordionTrigger className="text-sm font-medium">Appliances</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div
                className="cabinet-item text-xs"
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
                <p>Sink</p>
              </div>
              
              <div
                className="cabinet-item text-xs"
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
                <p>Stove</p>
              </div>
              
              <div
                className="cabinet-item text-xs"
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
                <p>Oven</p>
              </div>
              
              <div
                className="cabinet-item text-xs"
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
                <p>Refrigerator</p>
              </div>
              
              <div
                className="cabinet-item text-xs"
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
                <p>Dishwasher</p>
              </div>
              
              <div
                className="cabinet-item text-xs"
                onClick={() => handleAddAppliance('microwave')}
              >
                <div className="h-8 bg-gray-100 mb-1 flex items-center justify-center text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="15" y="9" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p>Microwave</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="materials">
          <AccordionTrigger className="text-sm font-medium">Materials & Finishes</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['White', 'Oak', 'Walnut', 'Grey', 'Black', 'Navy'].map((color) => (
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

// Helper to get the Tailwind color class
const getColorClass = (color: string): string => {
  switch (color.toLowerCase()) {
    case 'white': return 'bg-white border border-gray-200';
    case 'oak': return 'bg-amber-200';
    case 'walnut': return 'bg-amber-800';
    case 'grey': return 'bg-gray-400';
    case 'black': return 'bg-gray-900';
    case 'navy': return 'bg-blue-900';
    default: return 'bg-gray-200';
  }
};

export default ObjectPanel;
