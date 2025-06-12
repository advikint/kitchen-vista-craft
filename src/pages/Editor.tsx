
import { useState, useEffect } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { ToolMode, ViewMode } from "@/store/types";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorContent } from "@/components/editor/EditorContent";
import SideToolbar from "@/components/designer/SideToolbar";
import CreateRoomDialog from "@/components/dialogs/CreateRoomDialog";
import BOQEditorDialog from "@/components/dialogs/BOQEditorDialog";
import ProfessionalWorkspace from "@/components/designer/advanced/ProfessionalWorkspace";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap } from "lucide-react";

const Editor = () => {
  const { 
    viewMode, setViewMode, 
    currentToolMode, setToolMode,
    projectName,
    toggleDimensions, showDimensions,
    generateBOQ,
    isWallDialogOpen,
    setWallDialogOpen
  } = useKitchenStore();
  
  const isMobile = useIsMobile();
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);
  const [boqEditorOpen, setBoqEditorOpen] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [professionalMode, setProfessionalMode] = useState(true); // Default to professional mode
  
  // Close panels when switching to mobile view
  useEffect(() => {
    if (isMobile) {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
      setProfessionalMode(false); // Force basic mode on mobile
    }
  }, [isMobile]);
  
  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };
  
  const handleToolSelect = (tool: ToolMode) => {
    if (tool === 'room') {
      setWallDialogOpen(true);
    } else {
      setToolMode(tool);
    }
  };
  
  const handleOpenBOQEditor = () => {
    // Generate BOQ data and open editor
    const boqData = generateBOQ();
    if (!boqData || (Array.isArray(boqData) && boqData.length === 0)) {
      toast.warning("No items to generate Bill of Quantities. Please add cabinets and appliances first.");
      return;
    }
    setBoqEditorOpen(true);
  };
  
  const handleExportBOQ = (boq: any) => {
    console.log("Exporting edited BOQ:", boq);
    
    const boqString = JSON.stringify(boq, null, 2);
    const blob = new Blob([boqString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_BOQ.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Bill of Quantities exported successfully");
  };

  // Professional mode toggle
  if (professionalMode && !isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Professional mode header */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">Kitchen Vista Craft</h1>
            <Badge variant="default" className="bg-blue-600">
              <Zap className="h-3 w-3 mr-1" />
              Professional
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setProfessionalMode(false)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Basic Mode
            </Button>
          </div>
        </div>
        
        <ProfessionalWorkspace />
        
        {/* Dialogs */}
        <CreateRoomDialog
          open={isWallDialogOpen}
          onOpenChange={setWallDialogOpen}
        />
        
        <BOQEditorDialog
          open={boqEditorOpen}
          onOpenChange={setBoqEditorOpen}
          onExport={handleExportBOQ}
        />
      </div>
    );
  }
  
  // Basic mode (original interface)
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <EditorHeader 
          projectName={projectName}
          viewMode={viewMode}
          showDimensions={showDimensions}
          snapToGrid={snapToGrid}
          onViewModeChange={handleViewModeChange}
          onSnapToGridChange={setSnapToGrid}
          toggleDimensions={toggleDimensions}
          onOpenBOQEditor={handleOpenBOQEditor}
        />
        {!isMobile && (
          <Button 
            size="sm" 
            onClick={() => setProfessionalMode(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-1" />
            Professional Mode
          </Button>
        )}
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && <SideToolbar />}
        <EditorContent 
          viewMode={viewMode}
          leftPanelOpen={leftPanelOpen}
          rightPanelOpen={rightPanelOpen}
          setLeftPanelOpen={setLeftPanelOpen}
          setRightPanelOpen={setRightPanelOpen}
        />
        {isMobile && <SideToolbar />}
      </div>
      
      {/* Dialogs */}
      <CreateRoomDialog
        open={isWallDialogOpen}
        onOpenChange={setWallDialogOpen}
      />
      
      <BOQEditorDialog
        open={boqEditorOpen}
        onOpenChange={setBoqEditorOpen}
        onExport={handleExportBOQ}
      />
    </div>
  );
};

export default Editor;
