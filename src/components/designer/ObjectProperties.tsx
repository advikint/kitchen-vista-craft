
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RotateCw } from "lucide-react";
import { useKitchenStore, Cabinet, Appliance, Door, Window } from "@/store/kitchenStore";
import useItemInteractions from "./top-view/hooks/useItemInteractions";
import { useState, useEffect } from "react";

export function ObjectProperties() {
  const { selectedItemId, cabinets, appliances, doors, windows, updateCabinet } = useKitchenStore();
  const { rotateCabinet } = useItemInteractions();
  
  // State for the selected item
  const [item, setItem] = useState<Cabinet | Appliance | Door | Window | null>(null);
  const [itemType, setItemType] = useState<"cabinet" | "appliance" | "door" | "window" | null>(null);

  // Find and set the selected item when the selectedItemId changes
  useEffect(() => {
    if (!selectedItemId) {
      setItem(null);
      setItemType(null);
      return;
    }
    
    // Check cabinets
    const cabinet = cabinets.find(c => c.id === selectedItemId);
    if (cabinet) {
      setItem(cabinet);
      setItemType("cabinet");
      return;
    }
    
    // Check appliances
    const appliance = appliances.find(a => a.id === selectedItemId);
    if (appliance) {
      setItem(appliance);
      setItemType("appliance");
      return;
    }
    
    // Check doors
    const door = doors.find(d => d.id === selectedItemId);
    if (door) {
      setItem(door);
      setItemType("door");
      return;
    }
    
    // Check windows
    const window = windows.find(w => w.id === selectedItemId);
    if (window) {
      setItem(window);
      setItemType("window");
      return;
    }
  }, [selectedItemId, cabinets, appliances, doors, windows]);
  
  // Handle width change for cabinets
  const handleWidthChange = (value: string) => {
    if (!item || !itemType || itemType !== "cabinet") return;
    
    const width = parseFloat(value);
    if (isNaN(width)) return;
    
    updateCabinet(item.id, { width });
  };
  
  // Handle depth change for cabinets
  const handleDepthChange = (value: string) => {
    if (!item || !itemType || itemType !== "cabinet") return;
    
    const depth = parseFloat(value);
    if (isNaN(depth)) return;
    
    updateCabinet(item.id, { depth });
  };
  
  // Handle 90-degree rotation
  const handleRotate90 = () => {
    if (!item || !itemType || itemType !== "cabinet") return;
    rotateCabinet(item.id);
  };
  
  if (!item || !itemType) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select an object to view its properties
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-medium">{itemType.charAt(0).toUpperCase() + itemType.slice(1)} Properties</h3>
        <p className="text-sm text-gray-500">ID: {item.id.slice(0, 8)}</p>
      </div>
      
      <Separator />
      
      {itemType === "cabinet" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width">Width (cm)</Label>
              <Input 
                id="width" 
                type="number"
                value={(item as Cabinet).width} 
                onChange={(e) => handleWidthChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="depth">Depth (cm)</Label>
              <Input 
                id="depth" 
                type="number" 
                value={(item as Cabinet).depth}
                onChange={(e) => handleDepthChange(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="rotation">Rotation</Label>
            <div className="flex items-center mt-2">
              <Input 
                id="rotation" 
                type="number" 
                value={(item as Cabinet).rotation}
                readOnly
                className="mr-2"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRotate90}
                title="Rotate 90°"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Input id="type" value={(item as Cabinet).type} readOnly />
          </div>
          
          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center mt-2">
              <div 
                className="w-6 h-6 mr-2 border border-gray-300" 
                style={{backgroundColor: (item as Cabinet).color}}
              ></div>
              <Input id="color" value={(item as Cabinet).color} readOnly />
            </div>
          </div>
        </div>
      )}
      
      {itemType === "appliance" && (
        <div className="space-y-4">
          {/* Appliance properties */}
          <div>
            <Label htmlFor="type">Type</Label>
            <Input id="type" value={(item as Appliance).type} readOnly />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width">Width (cm)</Label>
              <Input id="width" value={(item as Appliance).width} readOnly />
            </div>
            <div>
              <Label htmlFor="depth">Depth (cm)</Label>
              <Input id="depth" value={(item as Appliance).depth} readOnly />
            </div>
          </div>
        </div>
      )}
      
      {itemType === "door" && (
        <div className="space-y-4">
          {/* Door properties */}
          <div>
            <Label htmlFor="type">Type</Label>
            <Input id="type" value={(item as Door).type || 'standard'} readOnly />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width">Width (cm)</Label>
              <Input id="width" value={(item as Door).width} readOnly />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" value={(item as Door).height} readOnly />
            </div>
          </div>
        </div>
      )}
      
      {itemType === "window" && (
        <div className="space-y-4">
          {/* Window properties */}
          <div>
            <Label htmlFor="type">Type</Label>
            <Input id="type" value={(item as Window).type || 'standard'} readOnly />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width">Width (cm)</Label>
              <Input id="width" value={(item as Window).width} readOnly />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" value={(item as Window).height} readOnly />
            </div>
          </div>
          <div>
            <Label htmlFor="sillHeight">Sill Height (cm)</Label>
            <Input id="sillHeight" value={(item as Window).sillHeight} readOnly />
          </div>
        </div>
      )}
    </div>
  );
}

export default ObjectProperties;
