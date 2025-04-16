
import { useState } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { ToolMode, ViewMode } from "@/store/types";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorContent } from "@/components/editor/EditorContent";
import SideToolbar from "@/components/designer/SideToolbar";
import CreateRoomDialog from "@/components/dialogs/CreateRoomDialog";
import BOQEditorDialog from "@/components/dialogs/BOQEditorDialog";
import { toast } from "sonner";

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
  
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [boqEditorOpen, setBoqEditorOpen] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  
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
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
      
      <div className="flex-1 flex">
        <SideToolbar />
        <EditorContent 
          viewMode={viewMode}
          leftPanelOpen={leftPanelOpen}
          rightPanelOpen={rightPanelOpen}
          setLeftPanelOpen={setLeftPanelOpen}
          setRightPanelOpen={setRightPanelOpen}
        />
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
