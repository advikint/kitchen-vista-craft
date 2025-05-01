
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
import { toast } from 'sonner';

const AppliancePropertiesPanel = ({ appliance }: { appliance: any }) => {
  const { 
    updateAppliance,
    removeAppliance
  } = useKitchenStore();

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    updateAppliance(appliance.id, {
      position: {
        ...appliance.position,
        [axis]: value
      }
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    updateAppliance(appliance.id, {
      [dimension]: value
    });
  };

  const handlePropertyChange = (property: string, value: any) => {
    updateAppliance(appliance.id, {
      [property]: value
    });
  };

  const handleRotate90Degrees = () => {
    // Calculate the new rotation by adding 90 degrees
    const newRotation = (appliance.rotation + 90) % 360;
    updateAppliance(appliance.id, { rotation: newRotation });
    toast.success("Appliance rotated 90 degrees");
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Appliance Properties</h2>
        <p className="text-sm text-gray-500">{appliance.type} appliance</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="appliance-x">X Position (cm)</Label>
          <Input
            id="appliance-x"
            type="number"
            value={appliance.position.x}
            onChange={(e) => handlePositionChange('x', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="appliance-y">Y Position (cm)</Label>
          <Input
            id="appliance-y"
            type="number"
            value={appliance.position.y}
            onChange={(e) => handlePositionChange('y', Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="appliance-width">Width (cm)</Label>
        <Input
          id="appliance-width"
          type="number"
          value={appliance.width}
          onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="appliance-height">Height (cm)</Label>
          <Input
            id="appliance-height"
            type="number"
            value={appliance.height}
            onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="appliance-depth">Depth (cm)</Label>
          <Input
            id="appliance-depth"
            type="number"
            value={appliance.depth}
            onChange={(e) => handleDimensionChange('depth', Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Rotation</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            value={appliance.rotation}
            onChange={(e) => handlePropertyChange('rotation', Number(e.target.value))}
            className="w-full"
          />
          <Button 
            variant="outline" 
            onClick={handleRotate90Degrees}
            className="flex items-center justify-center"
          >
            Rotate 90°
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="appliance-type">Type</Label>
        <Select 
          value={appliance.type}
          onValueChange={(value) => handlePropertyChange('type', value)}
        >
          <SelectTrigger id="appliance-type">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sink">Sink</SelectItem>
            <SelectItem value="stove">Stove</SelectItem>
            <SelectItem value="fridge">Refrigerator</SelectItem>
            <SelectItem value="dishwasher">Dishwasher</SelectItem>
            <SelectItem value="oven">Oven</SelectItem>
            <SelectItem value="microwave">Microwave</SelectItem>
            <SelectItem value="hood">Hood</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appliance-brand">Brand (optional)</Label>
        <Input
          id="appliance-brand"
          type="text"
          value={appliance.brand || ''}
          onChange={(e) => handlePropertyChange('brand', e.target.value)}
          className="w-full"
        />
      </div>

      <Button 
        variant="destructive" 
        className="w-full mt-4"
        onClick={() => removeAppliance(appliance.id)}
      >
        Delete Appliance
      </Button>
    </div>
  );
};

export default AppliancePropertiesPanel;
