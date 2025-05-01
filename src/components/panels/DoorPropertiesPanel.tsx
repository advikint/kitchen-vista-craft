
import React from 'react';
import { useKitchenStore } from '@/store/kitchenStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DoorPropertiesPanel = ({ door }: { door: any }) => {
  const { 
    updateDoor,
    removeDoor
  } = useKitchenStore();

  const handlePropertyChange = (property: string, value: any) => {
    updateDoor(door.id, {
      [property]: value
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Door Properties</h2>
        <p className="text-sm text-gray-500">{door.type || 'Standard'} door</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="door-width">Width (cm)</Label>
        <Input
          id="door-width"
          type="number"
          value={door.width}
          onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="door-height">Height (cm)</Label>
        <Input
          id="door-height"
          type="number"
          value={door.height}
          onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="door-position">Position on Wall (%)</Label>
        <Input
          id="door-position"
          type="range"
          min={0}
          max={100}
          value={Math.round(door.position * 100)}
          onChange={(e) => handlePropertyChange('position', Number(e.target.value) / 100)}
          className="w-full"
        />
        <div className="text-right text-sm">{Math.round(door.position * 100)}%</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="door-type">Door Type</Label>
        <Select 
          value={door.type}
          onValueChange={(value) => handlePropertyChange('type', value)}
        >
          <SelectTrigger id="door-type">
            <SelectValue placeholder="Select Door Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="sliding">Sliding</SelectItem>
            <SelectItem value="pocket">Pocket</SelectItem>
            <SelectItem value="folding">Folding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="door-color">Color</Label>
        <Select 
          value={door.color}
          onValueChange={(value) => handlePropertyChange('color', value)}
        >
          <SelectTrigger id="door-color">
            <SelectValue placeholder="Select Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="brown">Brown</SelectItem>
            <SelectItem value="grey">Grey</SelectItem>
            <SelectItem value="black">Black</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="destructive" 
        className="w-full mt-4"
        onClick={() => removeDoor(door.id)}
      >
        Delete Door
      </Button>
    </div>
  );
};

export default DoorPropertiesPanel;
