
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useKitchenStore, Cabinet } from "@/store/kitchenStore";
import { toast } from "sonner";

type ApplyToAllButtonProps = {
  cabinet: Cabinet;
  property: 'width' | 'height' | 'depth' | 'color' | 'material';
  value: number | string;
};

const ApplyToAllButton = ({ cabinet, property, value }: ApplyToAllButtonProps) => {
  const { cabinets, updateCabinet } = useKitchenStore();
  const [open, setOpen] = useState(false);
  
  const handleApplyToAll = () => {
    let count = 0;
    
    cabinets.forEach(existingCabinet => {
      if (existingCabinet.id !== cabinet.id && existingCabinet.type === cabinet.type) {
        updateCabinet({
          ...existingCabinet,
          [property]: value
        });
        count++;
      }
    });
    
    setOpen(false);
    
    if (count > 0) {
      toast.success(`Applied ${property} to ${count} ${cabinet.type} cabinets`);
    } else {
      toast.info(`No other ${cabinet.type} cabinets to update`);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm" // Changed from 'xs' to 'sm'
          className="h-7 px-2 text-xs"
        >
          Apply to all {cabinet.type}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apply to All {cabinet.type.charAt(0).toUpperCase() + cabinet.type.slice(1)} Cabinets</AlertDialogTitle>
          <AlertDialogDescription>
            This will set the {property} to {value} for all {cabinet.type} cabinets. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleApplyToAll}>Apply</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApplyToAllButton;
