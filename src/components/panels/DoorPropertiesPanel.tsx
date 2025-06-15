import { useState, useEffect } from "react";
import { useKitchenStore, Door, DoorType } from "@/store/kitchenStore"; // Adjust path if needed
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
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DoorPropertiesPanelProps {
  door: Door;
}

const DoorPropertiesPanel = ({ door }: DoorPropertiesPanelProps) => {
  const { updateDoor, removeDoor } = useKitchenStore();

  // Local state for controlled inputs
  const [width, setWidth] = useState(door.width.toString());
  const [height, setHeight] = useState(door.height.toString());
  const [doorThickness, setDoorThickness] = useState((door.doorThickness ?? 4).toString());
  const [frameThickness, setFrameThickness] = useState((door.frameThickness ?? 5).toString());
  const [frameDepth, setFrameDepth] = useState((door.frameDepth ?? 12).toString());
  const [color, setColor] = useState(door.color || "#ffffff");

  // Update local state if the selected door changes
  useEffect(() => {
    setWidth(door.width.toString());
    setHeight(door.height.toString());
    setDoorThickness((door.doorThickness ?? 4).toString());
    setFrameThickness((door.frameThickness ?? 5).toString());
    setFrameDepth((door.frameDepth ?? 12).toString());
    setColor(door.color || "#ffffff");
  }, [door]);

  const handleDimensionOrNumericPropertyChange = (property: keyof Door, value: string) => {
    const numValue = parseFloat(value); // Use parseFloat for potentially non-integer values
    if (!isNaN(numValue)) {
      updateDoor(door.id, { [property]: numValue } as Partial<Door>);
    } else if (value === "") {
      // If input is cleared, send undefined to potentially clear optional property or let store handle default
      if (property === "doorThickness" || property === "frameThickness" || property === "frameDepth") {
         updateDoor(door.id, { [property]: undefined } as Partial<Door>);
      }
    }
  };

  const handleTypeChange = (value: string) => {
    updateDoor(door.id, { type: value as DoorType });
  };

  const handleColorChange = (value: string) => {
    setColor(value);
    updateDoor(door.id, { color: value });
  };

  const handleDelete = () => {
    removeDoor(door.id);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Door Properties</h3>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          title="Delete Door"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
        <div className="space-y-4">
          {/* Door Type */}
          <div className="space-y-1">
            <Label htmlFor="doorTypeSelect">Type</Label>
            <Select
              value={door.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="doorTypeSelect">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="sliding">Sliding</SelectItem>
                <SelectItem value="pocket">Pocket</SelectItem>
                <SelectItem value="folding">Folding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dimensions */}
          <div className="space-y-1">
            <Label htmlFor="doorWidth">Width (cm)</Label>
            <Input
              id="doorWidth"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              onBlur={() => handleDimensionOrNumericPropertyChange('width', width)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="doorHeight">Height (cm)</Label>
            <Input
              id="doorHeight"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              onBlur={() => handleDimensionOrNumericPropertyChange('height', height)}
            />
          </div>

          {/* Door Thickness */}
          <div className="space-y-1">
            <Label htmlFor="doorThickness">Door Slab Thickness (cm)</Label>
            <Input
              id="doorThickness"
              type="number"
              value={doorThickness}
              onChange={(e) => setDoorThickness(e.target.value)}
              onBlur={() => handleDimensionOrNumericPropertyChange('doorThickness', doorThickness)}
              placeholder="e.g., 4"
            />
          </div>

          {/* Frame Thickness */}
          <div className="space-y-1">
            <Label htmlFor="frameThickness">Frame Thickness (cm)</Label>
            <Input
              id="frameThickness"
              type="number"
              value={frameThickness}
              onChange={(e) => setFrameThickness(e.target.value)}
              onBlur={() => handleDimensionOrNumericPropertyChange('frameThickness', frameThickness)}
              placeholder="e.g., 5"
            />
          </div>

          {/* Frame Depth */}
          <div className="space-y-1">
            <Label htmlFor="frameDepth">Frame Depth (cm)</Label>
            <Input
              id="frameDepth"
              type="number"
              value={frameDepth}
              onChange={(e) => setFrameDepth(e.target.value)}
              onBlur={() => handleDimensionOrNumericPropertyChange('frameDepth', frameDepth)}
              placeholder="e.g., 12"
            />
          </div>

          {/* Door Color */}
          <div className="space-y-1">
            <Label htmlFor="doorColorProp">Color</Label>
            <div className="flex gap-2">
              <Input
                id="doorColorProp"
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Read-only info: Wall ID and Position on wall */}
          <div className="space-y-1 border-t pt-3 mt-4">
            <Label>Placement Info (Read-only)</Label>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Wall ID: {door.wallId}</div>
              <div>Position along wall: {door.position.toFixed(2)}</div>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default DoorPropertiesPanel;
