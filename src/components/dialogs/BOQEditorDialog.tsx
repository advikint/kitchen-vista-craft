
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKitchenStore } from "@/store/kitchenStore";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type BOQEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (boq: any) => void;
};

const BOQEditorDialog = ({ open, onOpenChange, onExport }: BOQEditorDialogProps) => {
  const { generateBOQ, projectName } = useKitchenStore();
  const [boq, setBoq] = useState<any>(null);
  const [editedBoq, setEditedBoq] = useState<any>(null);
  
  useEffect(() => {
    if (open) {
      const generatedBoq = generateBOQ();
      setBoq(generatedBoq);
      setEditedBoq(JSON.parse(JSON.stringify(generatedBoq))); // Deep copy for editing
    }
  }, [open, generateBOQ]);
  
  const handleExport = () => {
    onExport(editedBoq);
    onOpenChange(false);
  };
  
  const updateQuantity = (category: string, itemIndex: number, value: string) => {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue) || newValue < 0) return;
    
    const updatedBoq = { ...editedBoq };
    updatedBoq[category][itemIndex].quantity = newValue;
    setEditedBoq(updatedBoq);
  };
  
  const updatePrice = (category: string, itemIndex: number, value: string) => {
    const newValue = parseFloat(value);
    if (isNaN(newValue) || newValue < 0) return;
    
    const updatedBoq = { ...editedBoq };
    updatedBoq[category][itemIndex].price = newValue;
    setEditedBoq(updatedBoq);
  };
  
  if (!boq || !editedBoq) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Bill of Quantities</DialogTitle>
          <DialogDescription>
            Review and modify quantities and prices before exporting.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          {Object.keys(editedBoq).map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold capitalize mb-2">{category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Item</TableHead>
                    <TableHead className="w-[100px]">Dimensions</TableHead>
                    <TableHead className="w-[80px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Unit Price</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedBoq[category].map((item: any, index: number) => (
                    <TableRow key={`${category}-${index}`}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.dimensions}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(category, index, e.target.value)}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updatePrice(category, index, e.target.value)}
                          className="w-24 h-8"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Grand Total:</span>
              <span>
                {Object.keys(editedBoq).reduce((total, category) => {
                  return total + editedBoq[category].reduce((catTotal: number, item: any) => {
                    return catTotal + (item.quantity * item.price);
                  }, 0);
                }, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BOQEditorDialog;
