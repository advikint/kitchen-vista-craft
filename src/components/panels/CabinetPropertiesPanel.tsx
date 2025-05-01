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
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';

const CabinetPropertiesPanel = ({ cabinet }: { cabinet: any }) => {
  const { 
    updateCabinetPosition,
    updateCabinetDimensions,
    updateCabinetProperties,
    updateCabinetRotation,
    deleteCabinet,
  } = useKitchenStore();

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    updateCabinetPosition(cabinet.id, {
      ...cabinet.position,
      [axis]: value
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    updateCabinetDimensions(cabinet.id, {
      ...cabinet,
      [dimension]: value
    });
  };

  const handlePropertyChange = (property: string, value: any) => {
    updateCabinetProperties(cabinet.id, {
      ...cabinet,
      [property]: value
    });
  };

  const handleRotate90Degrees = () => {
    // Calculate the new rotation by adding 90 degrees (π/2 radians)
    // and keeping it within 0-360 range
    const newRotation = (cabinet.rotation + 90) % 360;
    updateCabinetRotation(cabinet.id, newRotation);
    toast.success("Cabinet rotated 90 degrees");
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Cabinet Properties</h2>
        <p className="text-sm text-gray-500">{cabinet.type} cabinet - {cabinet.category}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cabinet-x">X Position (cm)</Label>
          <Input
            id="cabinet-x"
            type="number"
            value={cabinet.position.x}
            onChange={(e) => handlePositionChange('x', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="cabinet-y">Y Position (cm)</Label>
          <Input
            id="cabinet-y"
            type="number"
            value={cabinet.position.y}
            onChange={(e) => handlePositionChange('y', Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cabinet-width">Width (cm)</Label>
        <Input
          id="cabinet-width"
          type="number"
          value={cabinet.width}
          onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cabinet-height">Height (cm)</Label>
          <Input
            id="cabinet-height"
            type="number"
            value={cabinet.height}
            onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="cabinet-depth">Depth (cm)</Label>
          <Input
            id="cabinet-depth"
            type="number"
            value={cabinet.depth}
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
            value={cabinet.rotation}
            onChange={(e) => updateCabinetRotation(cabinet.id, Number(e.target.value))}
            className="w-full"
          />
          <Button 
            variant="outline" 
            onClick={handleRotate90Degrees}
            className="flex items-center justify-center"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Rotate 90°
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cabinet-material">Material</Label>
        <Select 
          value={cabinet.material}
          onValueChange={(value) => handlePropertyChange('material', value)}
        >
          <SelectTrigger id="cabinet-material">
            <SelectValue placeholder="Select Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="laminate">Laminate</SelectItem>
            <SelectItem value="wood">Wood</SelectItem>
            <SelectItem value="mdf">MDF</SelectItem>
            <SelectItem value="plywood">Plywood</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cabinet-color">Color</Label>
        <Select 
          value={cabinet.color}
          onValueChange={(value) => handlePropertyChange('color', value)}
        >
          <SelectTrigger id="cabinet-color">
            <SelectValue placeholder="Select Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="cream">Cream</SelectItem>
            <SelectItem value="grey">Grey</SelectItem>
            <SelectItem value="black">Black</SelectItem>
            <SelectItem value="brown">Brown</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="destructive" 
        className="w-full mt-4"
        onClick={() => deleteCabinet(cabinet.id)}
      >
        Delete Cabinet
      </Button>
    </div>
  );
};

export default CabinetPropertiesPanel;
