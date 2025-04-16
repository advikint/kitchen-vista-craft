
import { Button } from "@/components/ui/button";
import RoomDesigner from "../designer/RoomDesigner";
import { Maximize2, PanelLeft, List } from "lucide-react";
import { ViewMode } from "@/store/types";
import DesignCatalog from "../designer/DesignCatalog";
import PropertiesPanel from "../panels/PropertiesPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

interface EditorContentProps {
  viewMode: ViewMode;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
}

export const EditorContent = ({
  viewMode,
  leftPanelOpen,
  rightPanelOpen,
  setLeftPanelOpen,
  setRightPanelOpen,
}: EditorContentProps) => {
  const isMobile = useIsMobile();
  const [activePanel, setActivePanel] = useState<'left' | 'right' | null>(null);

  // Auto-close panels on mobile
  useEffect(() => {
    if (isMobile) {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
    }
  }, [isMobile, setLeftPanelOpen, setRightPanelOpen]);

  const handleMobilePanelToggle = (panel: 'left' | 'right') => {
    if (isMobile) {
      if (activePanel === panel) {
        // Close the panel if it's already open
        setActivePanel(null);
        setLeftPanelOpen(false);
        setRightPanelOpen(false);
      } else {
        // Open the requested panel and close the other one
        setActivePanel(panel);
        setLeftPanelOpen(panel === 'left');
        setRightPanelOpen(panel === 'right');
      }
    } else {
      // Default desktop behavior
      if (panel === 'left') {
        setLeftPanelOpen(!leftPanelOpen);
      } else {
        setRightPanelOpen(!rightPanelOpen);
      }
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel with catalog */}
      <div className={`relative ${leftPanelOpen ? (isMobile ? 'w-full absolute z-20 h-full' : 'w-64') : 'w-0'} transition-all duration-300 border-r bg-white shadow-sm`}>
        <div className={`h-full flex flex-col ${!leftPanelOpen && 'invisible'}`}>
          <DesignCatalog />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${isMobile ? 'absolute top-2 right-2' : 'absolute top-1/2 -right-3 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border shadow-sm z-10 p-0'}`}
          onClick={() => handleMobilePanelToggle('left')}
        >
          <PanelLeft className={`${isMobile ? 'h-5 w-5 rotate-90' : 'h-3 w-3'}`} />
        </Button>
      </div>
      
      {/* Main canvas */}
      <div className={`flex-1 overflow-hidden bg-gray-100 relative ${isMobile && (leftPanelOpen || rightPanelOpen) ? 'hidden' : 'block'}`}>
        <RoomDesigner />
        
        {viewMode === '3d' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-4 right-4 bg-white rounded-full shadow-sm border-gray-200"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            {!isMobile && "Fullscreen"}
          </Button>
        )}
      </div>
      
      {/* Right panel for properties */}
      <div className={`relative ${rightPanelOpen ? (isMobile ? 'w-full absolute z-20 h-full right-0' : 'w-64') : 'w-0'} transition-all duration-300 border-l bg-white shadow-sm`}>
        <div className={`h-full flex flex-col ${!rightPanelOpen && 'invisible'}`}>
          <PropertiesPanel />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${isMobile ? 'absolute top-2 left-2' : 'absolute top-1/2 -left-3 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border shadow-sm z-10 p-0'}`}
          onClick={() => handleMobilePanelToggle('right')}
        >
          <List className={`${isMobile ? 'h-5 w-5' : 'h-3 w-3'}`} />
        </Button>
      </div>

      {/* Mobile panel toggle buttons at the bottom */}
      {isMobile && !(leftPanelOpen || rightPanelOpen) && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-20">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-white"
            onClick={() => handleMobilePanelToggle('right')}
          >
            <List size={20} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-white"
            onClick={() => handleMobilePanelToggle('left')}
          >
            <PanelLeft size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};
