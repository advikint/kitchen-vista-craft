
import { useState, useEffect } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { ToolMode } from "@/store/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Pointer, 
  Square, 
  DoorOpen, 
  Blinds, 
  PackageOpen, 
  Refrigerator,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  Menu,
} from "lucide-react";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  showLabel?: boolean;
}

const ToolButton = ({ icon, label, active, onClick, showLabel = true }: ToolButtonProps) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg transition-colors",
            showLabel ? "w-14 h-14" : "w-10 h-10",
            active 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn("mb-1", showLabel ? "text-xl" : "text-lg")}>{icon}</div>
          {showLabel && <span className="text-xs font-medium">{label}</span>}
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
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const isMobile = useIsMobile();

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const tools = [
    { id: 'select' as ToolMode, icon: <Pointer size={22} />, label: 'Select' },
    { id: 'room' as ToolMode, icon: <Square size={22} />, label: 'Room' },
    { id: 'wall' as ToolMode, icon: <LayoutGrid size={22} />, label: 'Wall' },
    { id: 'door' as ToolMode, icon: <DoorOpen size={22} />, label: 'Door' },
    { id: 'window' as ToolMode, icon: <Blinds size={22} />, label: 'Window' },
    { id: 'cabinet' as ToolMode, icon: <PackageOpen size={22} />, label: 'Cabinet' },
    { id: 'appliance' as ToolMode, icon: <Refrigerator size={22} />, label: 'Appliance' },
  ];

  const handleToolSelect = (toolId: ToolMode) => {
    setToolMode(toolId);
    if (isMobile) {
      setMobileExpanded(false);
    }
  };

  // Mobile toolbar rendering
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 z-50 bg-white shadow-md rounded-full h-12 w-12"
          onClick={() => setMobileExpanded(!mobileExpanded)}
        >
          <Menu size={24} />
        </Button>
        
        {mobileExpanded && (
          <div className="fixed bottom-20 left-4 z-50 bg-card shadow-lg rounded-lg p-3 flex flex-col gap-3">
            {tools.map(tool => (
              <ToolButton
                key={tool.id}
                icon={tool.icon}
                label={tool.label}
                active={currentToolMode === tool.id}
                onClick={() => handleToolSelect(tool.id)}
                showLabel={false}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  // Desktop toolbar rendering
  return (
    <div 
      className={cn(
        "h-full bg-card shadow-md border-r flex flex-col transition-all duration-300 overflow-hidden",
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
