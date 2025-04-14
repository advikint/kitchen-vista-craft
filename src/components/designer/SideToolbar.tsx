
import { useState } from "react";
import { useKitchenStore, ToolMode } from "@/store/kitchenStore";
import { 
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/";
import { cn } from "@/lib/utils";
import { 
  Pointer, 
  Square, 
  DoorOpen, 
  Blinds, 
  PackageOpen, 
  Refrigerator, 
  ChevronsLeft,
  ChevronsRight 
} from "lucide-react";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const ToolButton = ({ icon, label, active, onClick }: ToolButtonProps) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors",
            active 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="text-xl mb-1">{icon}</div>
          <span className="text-xs font-medium">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label} Tool</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const SideToolbar = () => {
  const { currentToolMode, setToolMode } = useKitchenStore();
  const [collapsed, setCollapsed] = useState(false);

  const tools = [
    { id: 'select' as ToolMode, icon: <Pointer size={22} />, label: 'Select' },
    { id: 'room' as ToolMode, icon: <Square size={22} />, label: 'Room' },
    { id: 'door' as ToolMode, icon: <DoorOpen size={22} />, label: 'Door' },
    { id: 'window' as ToolMode, icon: <Blinds size={22} />, label: 'Window' },
    { id: 'cabinet' as ToolMode, icon: <PackageOpen size={22} />, label: 'Cabinet' },
    { id: 'appliance' as ToolMode, icon: <Refrigerator size={22} />, label: 'Appliance' },
  ];

  const handleToolSelect = (toolId: ToolMode) => {
    if (toolId === 'room') {
      // Show room creation dialog
      // We'll dispatch this in the Editor component
      setToolMode(toolId);
    } else {
      setToolMode(toolId);
    }
  };

  return (
    <div 
      className={cn(
        "h-full bg-card shadow-md border-r flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-20"
      )}
    >
      <ScrollArea className="flex-1 px-1 py-3">
        <div className="flex flex-col items-center space-y-3">
          {tools.map(tool => (
            <ToolButton
              key={tool.id}
              icon={tool.icon}
              label={collapsed ? "" : tool.label}
              active={currentToolMode === tool.id}
              onClick={() => handleToolSelect(tool.id)}
            />
          ))}
        </div>
      </ScrollArea>
      
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-8 mt-auto mb-2 mx-auto text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>
    </div>
  );
};

export default SideToolbar;
