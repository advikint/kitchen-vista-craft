
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

const WindowPropertiesPanel = ({ window }: { window: any }) => {
  const { 
    updateWindow,
    removeWindow
  } = useKitchenStore();

  const handlePropertyChange = (property: string, value: any) => {
    updateWindow(window.id, {
      [property]: value
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Window Properties</h2>
        <p className="text-sm text-gray-500">{window.type || 'Standard'} window</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="window-width">Width (cm)</Label>
        <Input
          id="window-width"
          type="number"
          value={window.width}
          onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="window-height">Height (cm)</Label>
        <Input
          id="window-height"
          type="number"
          value={window.height}
          onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="window-sill-height">Sill Height (cm)</Label>
        <Input
          id="window-sill-height"
          type="number"
          value={window.sillHeight}
          onChange={(e) => handlePropertyChange('sillHeight', Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="window-position">Position on Wall (%)</Label>
        <Input
          id="window-position"
          type="range"
          min={0}
          max={100}
          value={Math.round(window.position * 100)}
          onChange={(e) => handlePropertyChange('position', Number(e.target.value) / 100)}
          className="w-full"
        />
        <div className="text-right text-sm">{Math.round(window.position * 100)}%</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="window-type">Window Type</Label>
        <Select 
          value={window.type}
          onValueChange={(value) => handlePropertyChange('type', value)}
        >
          <SelectTrigger id="window-type">
            <SelectValue placeholder="Select Window Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="sliding">Sliding</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="louvered">Louvered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="destructive" 
        className="w-full mt-4"
        onClick={() => removeWindow(window.id)}
      >
        Delete Window
      </Button>
    </div>
  );
};

export default WindowPropertiesPanel;
