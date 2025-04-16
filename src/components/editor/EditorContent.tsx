
import { Button } from "@/components/ui/button";
import RoomDesigner from "../designer/RoomDesigner";
import { Maximize2, PanelLeft, List } from "lucide-react";
import { ViewMode } from "@/store/types";
import DesignCatalog from "../designer/DesignCatalog";
import PropertiesPanel from "../panels/PropertiesPanel";

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
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel with catalog */}
      <div className={`relative ${leftPanelOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r bg-white shadow-sm z-10`}>
        <div className={`h-full flex flex-col ${!leftPanelOpen && 'invisible'}`}>
          <DesignCatalog />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1/2 -right-3 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border shadow-sm z-10 p-0"
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        >
          <PanelLeft className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Main canvas */}
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        <RoomDesigner />
        
        {viewMode === '3d' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-4 right-4 bg-white rounded-full shadow-sm border-gray-200"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        )}
      </div>
      
      {/* Right panel for properties */}
      <div className={`relative ${rightPanelOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-l bg-white shadow-sm z-10`}>
        <div className={`h-full flex flex-col ${!rightPanelOpen && 'invisible'}`}>
          <PropertiesPanel />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1/2 -left-3 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border shadow-sm z-10 p-0"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
        >
          <List className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
