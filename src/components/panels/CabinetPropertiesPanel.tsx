
import { useState } from "react";
import { useKitchenStore, Cabinet, CabinetFrontType, CabinetType, CabinetFinish } from "@/store/kitchenStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  RotateCw,
  Trash2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CabinetPropertiesPanelProps {
  cabinet: Cabinet;
}

const CabinetPropertiesPanel = ({ cabinet }: CabinetPropertiesPanelProps) => {
  const { updateCabinet, removeCabinet } = useKitchenStore();
  const [width, setWidth] = useState(cabinet.width.toString());
  const [height, setHeight] = useState(cabinet.height.toString());
  const [depth, setDepth] = useState(cabinet.depth.toString());
  
  // Handle dimension changes
  const handleDimensionChange = () => {
    updateCabinet(cabinet.id, {
      width: parseInt(width) || cabinet.width,
      height: parseInt(height) || cabinet.height,
      depth: parseInt(depth) || cabinet.depth,
    });
  };
  
  // Handle front type change
  const handleFrontTypeChange = (value: string) => {
    updateCabinet(cabinet.id, {
      frontType: value as CabinetFrontType,
      // Reset drawers if changing from drawer to another type
      ...(cabinet.frontType === 'drawer' && value !== 'drawer' && { drawers: undefined })
    });
  };
  
  // Handle drawer count change
  const handleDrawerCountChange = (value: string) => {
    updateCabinet(cabinet.id, {
      drawers: parseInt(value) || 1
    });
  };

  // Handle cabinet type change
  const handleTypeChange = (value: string) => {
    updateCabinet(cabinet.id, {
      type: value as CabinetType
    });
  };

  // Handle finish change
  const handleFinishChange = (value: string) => {
    updateCabinet(cabinet.id, {
      finish: value as CabinetFinish
    });
  };
  
  // Handle color change
  const handleColorChange = (value: string) => {
    updateCabinet(cabinet.id, {
      color: value
    });
  };

  // Handle rotation (90 degrees increments)
  const handleRotate = () => {
    const newRotation = (cabinet.rotation + 90) % 360;
    updateCabinet(cabinet.id, { rotation: newRotation });
  };
  
  // Handle delete
  const handleDelete = () => {
    removeCabinet(cabinet.id);
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cabinet Properties</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleRotate}
            title="Rotate 90°"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="space-y-4">
          {/* Cabinet Type */}
          <div className="space-y-1">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={cabinet.type} 
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base Cabinet</SelectItem>
                <SelectItem value="wall">Wall Cabinet</SelectItem>
                <SelectItem value="tall">Tall Cabinet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Cabinet Front Type */}
          <div className="space-y-1">
            <Label htmlFor="frontType">Front Type</Label>
            <Select 
              value={cabinet.frontType} 
              onValueChange={handleFrontTypeChange}
            >
              <SelectTrigger id="frontType">
                <SelectValue placeholder="Select Front Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shutter">Shutter</SelectItem>
                <SelectItem value="drawer">Drawer</SelectItem>
                <SelectItem value="glass">Glass</SelectItem>
                <SelectItem value="open">Open</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Drawer count (only if drawer front type) */}
          {cabinet.frontType === 'drawer' && (
            <div className="space-y-1">
              <Label htmlFor="drawers">Number of Drawers</Label>
              <Select 
                value={(cabinet.drawers || 1).toString()} 
                onValueChange={handleDrawerCountChange}
              >
                <SelectTrigger id="drawers">
                  <SelectValue placeholder="Number of Drawers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Drawer</SelectItem>
                  <SelectItem value="2">2 Drawers</SelectItem>
                  <SelectItem value="3">3 Drawers</SelectItem>
                  <SelectItem value="4">4 Drawers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Cabinet Finish */}
          <div className="space-y-1">
            <Label htmlFor="finish">Finish</Label>
            <Select 
              value={cabinet.finish} 
              onValueChange={handleFinishChange}
            >
              <SelectTrigger id="finish">
                <SelectValue placeholder="Select Finish" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laminate">Laminate</SelectItem>
                <SelectItem value="veneer">Veneer</SelectItem>
                <SelectItem value="acrylic">Acrylic</SelectItem>
                <SelectItem value="matte">Matte</SelectItem>
                <SelectItem value="gloss">Gloss</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Cabinet Color */}
          <div className="space-y-1">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={cabinet.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={cabinet.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          {/* Cabinet Dimensions */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Dimensions (cm)</Label>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="width" className="text-xs">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  onBlur={handleDimensionChange}
                  min={10}
                  max={300}
                />
              </div>
              
              <div>
                <Label htmlFor="height" className="text-xs">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  onBlur={handleDimensionChange}
                  min={10}
                  max={300}
                />
              </div>
              
              <div>
                <Label htmlFor="depth" className="text-xs">Depth</Label>
                <Input
                  id="depth"
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  onBlur={handleDimensionChange}
                  min={10}
                  max={100}
                />
              </div>
            </div>
          </div>
          
          {/* Position information (read-only) */}
          <div className="space-y-1 border-t pt-3 mt-4">
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="posX" className="text-xs">X</Label>
                <Input
                  id="posX"
                  value={Math.round(cabinet.position.x)}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="posY" className="text-xs">Y</Label>
                <Input
                  id="posY"
                  value={Math.round(cabinet.position.y)}
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>
          
          {/* Rotation (read-only display) */}
          <div className="space-y-1">
            <Label htmlFor="rotation">Rotation</Label>
            <div className="flex items-center gap-2">
              <Input
                id="rotation"
                value={`${cabinet.rotation}°`}
                readOnly
                disabled
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Rotate 90°
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CabinetPropertiesPanel;
