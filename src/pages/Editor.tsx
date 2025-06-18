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
import { Badge } from "@/components/ui/badge"; // Button removed, Badge might still be used
import { Zap } from "lucide-react"; // Settings icon removed if Button removed

const Editor = () => {
  const { 
    viewMode, setViewMode, 
    // currentToolMode, // currentToolMode seems unused in this component's direct render logic
    setToolMode, // setToolMode is used by handleToolSelect, which is not present in ProfessionalWorkspace directly
    projectName,
    toggleDimensions, showDimensions,
    generateBOQ,
    isWallDialogOpen,
    setWallDialogOpen
  } = useKitchenStore();
  
  const isMobile = useIsMobile();
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile); // Panels open by default on desktop
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile); // Panels open by default on desktop
  const [boqEditorOpen, setBoqEditorOpen] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true); // Used by EditorHeader, which is now mobile-only header
  // const [professionalMode, setProfessionalMode] = useState(true); // REMOVED

  // Close panels when switching to mobile view, or adjust default panel states
  useEffect(() => {
    if (isMobile) {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
      // setProfessionalMode(false); // REMOVED
    } else {
      // Optional: set default panel states for desktop if they were closed by mobile view previously
      // For now, panels once closed by user on desktop will remain closed until reopened.
      // Or, enforce them open on desktop load:
      // setLeftPanelOpen(true);
      // setRightPanelOpen(true);
    }
  }, [isMobile]);
  
  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };
  
  // handleToolSelect is used by SideToolbar, which is present in both modes now
  // (ProfessionalWorkspace likely has its own SideToolbar or equivalent functionality)
  // If SideToolbar is truly shared and uses this, it should remain.
  // For now, assuming ProfessionalWorkspace might handle its own tool selections or SideToolbar is part of it.
  // If SideToolbar is global and outside ProfessionalWorkspace, this would be needed.
  // The prompt implies ProfessionalWorkspace is a self-contained unit.
  // Let's assume SideToolbar in the mobile view uses this, and ProfessionalWorkspace has its own.
  // const handleToolSelect = (tool: ToolMode) => {
  //   if (tool === 'room') {
  //     setWallDialogOpen(true);
  //   } else {
  //     setToolMode(tool);
  //   }
  // };
  
  const handleOpenBOQEditor = () => {
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

  if (!isMobile) { // Desktop view is Professional Workspace
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
          {/* Basic Mode Button REMOVED */}
        </div>
        
        <ProfessionalWorkspace /> {/* This component will manage its own layout, panels, toolbars */}
        
        {/* Dialogs common to both modes */}
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
  } else { // Mobile view (implicitly, this is the old "basic mode" layout)
    return (
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <EditorHeader
            projectName={projectName}
            viewMode={viewMode}
            showDimensions={showDimensions}
            snapToGrid={snapToGrid} // snapToGrid state is still defined
            onViewModeChange={handleViewModeChange}
            onSnapToGridChange={setSnapToGrid} // setSnapToGrid is still defined
            toggleDimensions={toggleDimensions}
            onOpenBOQEditor={handleOpenBOQEditor}
          />
          {/* Professional Mode Button REMOVED */}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* {!isMobile && <SideToolbar />} // This would be false here */}
          <EditorContent // EditorContent might need its own SideToolbar or panel controls for mobile
            viewMode={viewMode}
            leftPanelOpen={leftPanelOpen} // These are now false by default on mobile via useEffect
            rightPanelOpen={rightPanelOpen} // These are now false by default on mobile via useEffect
            setLeftPanelOpen={setLeftPanelOpen}
            setRightPanelOpen={setRightPanelOpen}
          />
          {/* SideToolbar for mobile, if EditorContent doesn't include its own navigation */}
          {/* Assuming SideToolbar is designed to be responsive or is specific for this mobile layout part */}
          <SideToolbar />
        </div>

        {/* Dialogs common to both modes */}
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
};

export default Editor;
