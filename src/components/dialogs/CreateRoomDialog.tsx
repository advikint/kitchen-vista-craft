import { useState, useEffect } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateRoomDialog = ({ open, onOpenChange }: CreateRoomDialogProps) => {
  // Changed resetWalls to clearWalls
  const { setRoom, clearWalls, addWall, setToolMode } = useKitchenStore();
  const [width, setWidth] = useState(3000); // mm
  const [length, setLength] = useState(4000); // mm (depth of the room)
  const [height, setHeight] = useState(2700); // mm (height of the walls)

  useEffect(() => {
    if (open) {
      setWidth(3000);
      setLength(4000);
      setHeight(2700);
    }
  }, [open]);

  const handleCreateRoom = () => {
    if (width <= 0 || length <= 0 || height <= 0) {
      toast.error("Please enter valid dimensions (all must be > 0 mm)");
      return;
    }

    const widthInCm = width / 10;
    const lengthInCm = length / 10; // This is the room's depth/length along the Y-axis in 2D top view
    const wallHeightInCm = height / 10; // This is the height of the walls

    // Set room dimensions (width and length/depth for the 2D top view)
    setRoom({ 
      width: widthInCm, 
      height: lengthInCm
      // roomHeight is not part of the Room type; wall height is stored per wall.
    });

    clearWalls(); // Call new action to empty walls array

    // Create walls based on room dimensions, assuming room is centered at (0,0)
    const trueHalfWidth = widthInCm / 2;
    const trueHalfLength = lengthInCm / 2; // This is half of the room's depth/length

    const defaultWallThickness = 10; // cm

    // Wall A (Top wall in typical coordinate system, along positive X, at negative Y)
    addWall({
      start: { x: -trueHalfWidth, y: -trueHalfLength },
      end: { x: trueHalfWidth, y: -trueHalfLength },
      height: wallHeightInCm,
      label: "Wall A",
      thickness: defaultWallThickness
    });

    // Wall B (Right wall, along positive Y, at positive X)
    addWall({
      start: { x: trueHalfWidth, y: -trueHalfLength },
      end: { x: trueHalfWidth, y: trueHalfLength },
      height: wallHeightInCm,
      label: "Wall B",
      thickness: defaultWallThickness
    });

    // Wall C (Bottom wall, along negative X, at positive Y)
    addWall({
      start: { x: trueHalfWidth, y: trueHalfLength },
      end: { x: -trueHalfWidth, y: trueHalfLength },
      height: wallHeightInCm,
      label: "Wall C",
      thickness: defaultWallThickness
    });

    // Wall D (Left wall, along negative Y, at negative X)
    addWall({
      start: { x: -trueHalfWidth, y: trueHalfLength },
      end: { x: -trueHalfWidth, y: -trueHalfLength },
      height: wallHeightInCm,
      label: "Wall D",
      thickness: defaultWallThickness
    });
    
    setToolMode('select');
    toast.success("Room created successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="width" className="text-right">
              Width (mm)
            </Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="length" className="text-right">
              Length (mm)
            </Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value) || 0)}
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="height" className="text-right">
              Wall Height (mm)
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
              className="col-span-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateRoom}>
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;
