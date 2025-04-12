
import { useEffect, useState } from "react";
import { useKitchenStore, Wall, Door, Window, Cabinet, Appliance } from "@/store/kitchenStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Trash2, ArrowLeft, Copy, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PropertiesPanel = () => {
  const { 
    room, setRoom, 
    walls, updateWall, removeWall,
    doors, updateDoor, removeDoor,
    windows, updateWindow, removeWindow,
    cabinets, updateCabinet, removeCabinet,
    appliances, updateAppliance, removeAppliance,
    selectedItemId
  } = useKitchenStore();
  
  const [itemType, setItemType] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [dimensionsLocked, setDimensionsLocked] = useState(true);
  
  useEffect(() => {
    if (!selectedItemId) {
      setItemType(null);
      setCurrentItem(null);
      return;
    }
    
    // Handle template items from the sidebar
    if (selectedItemId.startsWith('template_')) {
      const type = selectedItemId.split('_')[1];
      setItemType(type);
      // Set current item based on template (this would need to be implemented in kitchenStore)
      return;
    }
    
    if (selectedItemId === "room") {
      setItemType("room");
      setCurrentItem(room);
      return;
    }
    
    const wall = walls.find(w => w.id === selectedItemId);
    if (wall) {
      setItemType("wall");
      setCurrentItem(wall);
      return;
    }
    
    const door = doors.find(d => d.id === selectedItemId);
    if (door) {
      setItemType("door");
      setCurrentItem(door);
      return;
    }
    
    const window = windows.find(w => w.id === selectedItemId);
    if (window) {
      setItemType("window");
      setCurrentItem(window);
      return;
    }
    
    const cabinet = cabinets.find(c => c.id === selectedItemId);
    if (cabinet) {
      setItemType("cabinet");
      setCurrentItem(cabinet);
      return;
    }
    
    const appliance = appliances.find(a => a.id === selectedItemId);
    if (appliance) {
      setItemType("appliance");
      setCurrentItem(appliance);
      return;
    }
    
    setItemType(null);
    setCurrentItem(null);
  }, [selectedItemId, room, walls, doors, windows, cabinets, appliances]);
  
  const handleInputChange = (field: string, value: any) => {
    if (!currentItem || !itemType) return;
    
    if (itemType === "room") {
      setRoom({ ...room, [field]: parseFloat(value) || 0 });
    } else if (itemType === "wall") {
      updateWall(currentItem.id, { [field]: value });
    } else if (itemType === "door") {
      updateDoor(currentItem.id, { [field]: value });
    } else if (itemType === "window") {
      updateWindow(currentItem.id, { [field]: value });
    } else if (itemType === "cabinet") {
      updateCabinet(currentItem.id, { [field]: value });
    } else if (itemType === "appliance") {
      updateAppliance(currentItem.id, { [field]: value });
    }
  };
  
  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!currentItem || !['cabinet', 'appliance'].includes(itemType || '')) return;
    
    const newPosition = { ...currentItem.position };
    newPosition[axis] = parseFloat(String(value)) || 0;
    
    if (itemType === "cabinet") {
      updateCabinet(currentItem.id, { position: newPosition });
    } else if (itemType === "appliance") {
      updateAppliance(currentItem.id, { position: newPosition });
    }
  };
  
  const handleDelete = () => {
    if (!currentItem || !itemType) return;
    
    if (itemType === "wall") {
      removeWall(currentItem.id);
      toast.success("Wall deleted");
    } else if (itemType === "door") {
      removeDoor(currentItem.id);
      toast.success("Door deleted");
    } else if (itemType === "window") {
      removeWindow(currentItem.id);
      toast.success("Window deleted");
    } else if (itemType === "cabinet") {
      removeCabinet(currentItem.id);
      toast.success("Cabinet deleted");
    } else if (itemType === "appliance") {
      removeAppliance(currentItem.id);
      toast.success("Appliance deleted");
    }
  };
  
  const handleDuplicate = () => {
    if (!currentItem || !itemType) return;
    
    let newPosition;
    
    if (itemType === "cabinet") {
      newPosition = { ...currentItem.position, x: currentItem.position.x + 10 };
      const newCabinet = { ...currentItem, position: newPosition };
      delete newCabinet.id;
      updateCabinet(currentItem.id, { position: currentItem.position });
      toast.success("Cabinet duplicated");
    } else if (itemType === "appliance") {
      newPosition = { ...currentItem.position, x: currentItem.position.x + 10 };
      const newAppliance = { ...currentItem, position: newPosition };
      delete newAppliance.id;
      updateAppliance(currentItem.id, { position: currentItem.position });
      toast.success("Appliance duplicated");
    }
  };
  
  if (!selectedItemId) {
    return (
      <div className="text-sm text-gray-500 text-center p-4">
        <div className="mt-8 mb-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <p>No item selected</p>
        <p className="mt-2 text-xs">Click on an item to view and edit its properties.</p>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-800">
            {itemType === "room" ? "Room Properties" :
            itemType === "wall" ? "Wall Properties" :
            itemType === "door" ? "Door Properties" :
            itemType === "window" ? "Window Properties" :
            itemType === "cabinet" ? "Cabinet Properties" :
            itemType === "appliance" ? "Appliance Properties" :
            "Properties"}
          </h3>
          
          <div className="flex gap-1">
            {(itemType === "cabinet" || itemType === "appliance") && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 h-8 w-8 p-0" 
                onClick={handleDuplicate}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            
            {itemType !== "room" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 h-8 w-8 p-0"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100%-57px)]">
        <div className="p-4 space-y-6">
          {itemType === "room" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-width">Width (cm)</Label>
                <Input
                  id="room-width"
                  type="number"
                  value={room.width}
                  onChange={(e) => handleInputChange('width', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-height">Length (cm)</Label>
                <Input
                  id="room-height"
                  type="number"
                  value={room.height}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                />
              </div>
              {room.roomHeight && (
                <div className="space-y-2">
                  <Label htmlFor="room-room-height">Room Height (cm)</Label>
                  <Input
                    id="room-room-height"
                    type="number"
                    value={room.roomHeight}
                    onChange={(e) => handleInputChange('roomHeight', parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
          )}
          
          {itemType === "wall" && currentItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wall-height">Height (cm)</Label>
                <Input
                  id="wall-height"
                  type="number"
                  value={currentItem.height || 240}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                />
              </div>
              
              <Separator />
              <h4 className="text-sm font-medium">Wall Position</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="wall-start-x">Start X</Label>
                  <Input
                    id="wall-start-x"
                    type="number"
                    value={currentItem.start.x}
                    onChange={(e) => handleInputChange('start', { ...currentItem.start, x: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wall-start-y">Start Y</Label>
                  <Input
                    id="wall-start-y"
                    type="number"
                    value={currentItem.start.y}
                    onChange={(e) => handleInputChange('start', { ...currentItem.start, y: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="wall-end-x">End X</Label>
                  <Input
                    id="wall-end-x"
                    type="number"
                    value={currentItem.end.x}
                    onChange={(e) => handleInputChange('end', { ...currentItem.end, x: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wall-end-y">End Y</Label>
                  <Input
                    id="wall-end-y"
                    type="number"
                    value={currentItem.end.y}
                    onChange={(e) => handleInputChange('end', { ...currentItem.end, y: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
          
          {itemType === "door" && currentItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="door-position">Position (0-1)</Label>
                <Slider
                  id="door-position"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[currentItem.position]}
                  onValueChange={(values) => handleInputChange('position', values[0])}
                />
                <div className="text-xs text-right text-gray-500">{Math.round(currentItem.position * 100)}%</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="door-width">Width (cm)</Label>
                <Input
                  id="door-width"
                  type="number"
                  value={currentItem.width}
                  onChange={(e) => handleInputChange('width', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="door-height">Height (cm)</Label>
                <Input
                  id="door-height"
                  type="number"
                  value={currentItem.height}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="door-type">Type</Label>
                <Select
                  value={currentItem.type || 'standard'}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger id="door-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="sliding">Sliding</SelectItem>
                    <SelectItem value="folding">Folding</SelectItem>
                    <SelectItem value="pocket">Pocket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {itemType === "window" && currentItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="window-position">Position (0-1)</Label>
                <Slider
                  id="window-position"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[currentItem.position]}
                  onValueChange={(values) => handleInputChange('position', values[0])}
                />
                <div className="text-xs text-right text-gray-500">{Math.round(currentItem.position * 100)}%</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="window-width">Width (cm)</Label>
                <Input
                  id="window-width"
                  type="number"
                  value={currentItem.width}
                  onChange={(e) => handleInputChange('width', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="window-height">Height (cm)</Label>
                <Input
                  id="window-height"
                  type="number"
                  value={currentItem.height}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="window-sill-height">Sill Height (cm)</Label>
                <Input
                  id="window-sill-height"
                  type="number"
                  value={currentItem.sillHeight}
                  onChange={(e) => handleInputChange('sillHeight', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="window-type">Type</Label>
                <Select
                  value={currentItem.type || 'standard'}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger id="window-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="sliding">Sliding</SelectItem>
                    <SelectItem value="louvered">Louvered</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {itemType === "cabinet" && currentItem && (
            <div className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                  <TabsTrigger value="dimensions" className="flex-1">Dimensions</TabsTrigger>
                  <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cabinet-type">Type</Label>
                    <Select
                      value={currentItem.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger id="cabinet-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="wall">Wall</SelectItem>
                        <SelectItem value="tall">Tall</SelectItem>
                        <SelectItem value="island">Island</SelectItem>
                        <SelectItem value="corner">Corner</SelectItem>
                        <SelectItem value="loft">Loft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cabinet-category">Category</Label>
                    <Select
                      value={currentItem.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger id="cabinet-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shutter">Shutter</SelectItem>
                        <SelectItem value="drawer">Drawer</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="corner">Corner</SelectItem>
                        <SelectItem value="pullout">Pull-out</SelectItem>
                        <SelectItem value="magic-corner">Magic Corner</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="cabinet-position-x">Position X</Label>
                      <Input
                        id="cabinet-position-x"
                        type="number"
                        value={currentItem.position.x}
                        onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cabinet-position-y">Position Y</Label>
                      <Input
                        id="cabinet-position-y"
                        type="number"
                        value={currentItem.position.y}
                        onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cabinet-rotation">Rotation (degrees)</Label>
                    <Slider
                      id="cabinet-rotation"
                      min={0}
                      max={360}
                      step={1}
                      value={[currentItem.rotation]}
                      onValueChange={(values) => handleInputChange('rotation', values[0])}
                    />
                    <div className="text-xs text-right text-gray-500">{currentItem.rotation}°</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dimensions" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Dimensions</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => setDimensionsLocked(!dimensionsLocked)}
                      title={dimensionsLocked ? "Unlock proportions" : "Lock proportions"}
                    >
                      {dimensionsLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cabinet-width">Width (cm)</Label>
                    <Input
                      id="cabinet-width"
                      type="number"
                      value={currentItem.width}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        handleInputChange('width', newValue);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cabinet-height">Height (cm)</Label>
                    <Input
                      id="cabinet-height"
                      type="number"
                      value={currentItem.height}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        handleInputChange('height', newValue);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cabinet-depth">Depth (cm)</Label>
                    <Input
                      id="cabinet-depth"
                      type="number" 
                      value={currentItem.depth}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        handleInputChange('depth', newValue);
                      }}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cabinet-material">Material</Label>
                    <Select
                      value={currentItem.material}
                      onValueChange={(value) => handleInputChange('material', value)}
                    >
                      <SelectTrigger id="cabinet-material">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laminate">Laminate</SelectItem>
                        <SelectItem value="veneer">Veneer</SelectItem>
                        <SelectItem value="solid">Solid Wood</SelectItem>
                        <SelectItem value="acrylic">Acrylic</SelectItem>
                        <SelectItem value="pvc">PVC</SelectItem>
                        <SelectItem value="membrane">Membrane</SelectItem>
                        <SelectItem value="glass">Glass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cabinet-color">Color</Label>
                    <Select
                      value={currentItem.color}
                      onValueChange={(value) => handleInputChange('color', value)}
                    >
                      <SelectTrigger id="cabinet-color">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="brown">Brown</SelectItem>
                        <SelectItem value="black">Black</SelectItem>
                        <SelectItem value="grey">Grey</SelectItem>
                        <SelectItem value="beige">Beige</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="woodgrain">Wood Grain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {itemType === "appliance" && currentItem && (
            <div className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                  <TabsTrigger value="dimensions" className="flex-1">Dimensions</TabsTrigger>
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="appliance-type">Type</Label>
                    <Select
                      value={currentItem.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger id="appliance-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sink">Sink</SelectItem>
                        <SelectItem value="stove">Stove</SelectItem>
                        <SelectItem value="oven">Oven</SelectItem>
                        <SelectItem value="fridge">Refrigerator</SelectItem>
                        <SelectItem value="dishwasher">Dishwasher</SelectItem>
                        <SelectItem value="microwave">Microwave</SelectItem>
                        <SelectItem value="hood">Hood</SelectItem>
                        <SelectItem value="chimney">Chimney</SelectItem>
                        <SelectItem value="mixer-grinder">Mixer Grinder</SelectItem>
                        <SelectItem value="water-purifier">Water Purifier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="appliance-position-x">Position X</Label>
                      <Input
                        id="appliance-position-x"
                        type="number"
                        value={currentItem.position.x}
                        onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appliance-position-y">Position Y</Label>
                      <Input
                        id="appliance-position-y"
                        type="number"
                        value={currentItem.position.y}
                        onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appliance-rotation">Rotation (degrees)</Label>
                    <Slider
                      id="appliance-rotation"
                      min={0}
                      max={360}
                      step={1}
                      value={[currentItem.rotation]}
                      onValueChange={(values) => handleInputChange('rotation', values[0])}
                    />
                    <div className="text-xs text-right text-gray-500">{currentItem.rotation}°</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dimensions" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Dimensions</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => setDimensionsLocked(!dimensionsLocked)}
                      title={dimensionsLocked ? "Unlock proportions" : "Lock proportions"}
                    >
                      {dimensionsLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appliance-width">Width (cm)</Label>
                    <Input
                      id="appliance-width"
                      type="number"
                      value={currentItem.width}
                      onChange={(e) => handleInputChange('width', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appliance-height">Height (cm)</Label>
                    <Input
                      id="appliance-height"
                      type="number"
                      value={currentItem.height}
                      onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appliance-depth">Depth (cm)</Label>
                    <Input
                      id="appliance-depth"
                      type="number"
                      value={currentItem.depth}
                      onChange={(e) => handleInputChange('depth', parseFloat(e.target.value))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="appliance-model">Model</Label>
                    <Input
                      id="appliance-model"
                      value={currentItem.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                    />
                  </div>
                  
                  {currentItem.brand !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor="appliance-brand">Brand</Label>
                      <Input
                        id="appliance-brand"
                        value={currentItem.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                      />
                    </div>
                  )}
                  
                  {currentItem.color !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor="appliance-color">Color</Label>
                      <Select
                        value={currentItem.color}
                        onValueChange={(value) => handleInputChange('color', value)}
                      >
                        <SelectTrigger id="appliance-color">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="stainless">Stainless Steel</SelectItem>
                          <SelectItem value="grey">Grey</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PropertiesPanel;
