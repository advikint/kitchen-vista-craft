
import { useState } from "react";
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
  const { setRoom, resetWalls, addWall } = useKitchenStore();
  const [width, setWidth] = useState(3000);
  const [length, setLength] = useState(4000);
  const [height, setHeight] = useState(2700);

  const handleCreateRoom = () => {
    if (width <= 0 || length <= 0 || height <= 0) {
      toast.error("Please enter valid dimensions");
      return;
    }

    // Convert mm to cm for internal calculations
    const widthInCm = width / 10;
    const lengthInCm = length / 10;
    const heightInCm = height / 10;

    setRoom({ 
      width: widthInCm, 
      height: lengthInCm,
      roomHeight: heightInCm 
    });

    // Clear existing walls and create new walls based on room dimensions
    resetWalls();

    // Create walls based on room dimensions
    const halfWidth = widthInCm / 2;
    const halfHeight = lengthInCm / 2;

    // Wall A - Top
    addWall({
      start: { x: -halfWidth, y: -halfHeight },
      end: { x: halfWidth, y: -halfHeight },
      height: heightInCm
    });

    // Wall B - Right
    addWall({
      start: { x: halfWidth, y: -halfHeight },
      end: { x: halfWidth, y: halfHeight },
      height: heightInCm
    });

    // Wall C - Bottom
    addWall({
      start: { x: halfWidth, y: halfHeight },
      end: { x: -halfWidth, y: halfHeight },
      height: heightInCm
    });

    // Wall D - Left
    addWall({
      start: { x: -halfWidth, y: halfHeight },
      end: { x: -halfWidth, y: -halfHeight },
      height: heightInCm
    });

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
              onChange={(e) => setWidth(parseInt(e.target.value))}
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
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="height" className="text-right">
              Height (mm)
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
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
