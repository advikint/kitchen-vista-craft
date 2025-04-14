
import { useState } from "react";
import { useKitchenStore, ViewMode, ToolMode } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch"; 
import { 
  Save, Home, Undo, Redo, Grid3X3, Ruler, Download, 
  PanelLeft, List, Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// Import new components
import RoomDesigner from "@/components/designer/RoomDesigner";
import SideToolbar from "@/components/designer/SideToolbar";
import DesignCatalog from "@/components/designer/DesignCatalog";
import PropertiesPanel from "@/components/panels/PropertiesPanel";
import CreateRoomDialog from "@/components/dialogs/CreateRoomDialog";
import BOQEditorDialog from "@/components/dialogs/BOQEditorDialog";
import { Label } from "@/components/ui/label";

const Editor = () => {
  const { 
    viewMode, setViewMode, 
    currentToolMode, setToolMode,
    projectName,
    toggleDimensions, showDimensions,
    generateBOQ
  } = useKitchenStore();
  
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const [boqEditorOpen, setBoqEditorOpen] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  
  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };
  
  const handleToolSelect = (tool: ToolMode) => {
    if (tool === 'room') {
      setCreateRoomDialogOpen(true);
    } else {
      setToolMode(tool);
    }
  };
  
  const handleOpenBOQEditor = () => {
    setBoqEditorOpen(true);
  };
  
  const handleExportBOQ = (boq: any) => {
    console.log("Exporting edited BOQ:", boq);
    
    // In a real app, we'd create a proper export functionality
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
      {/* Top toolbar */}
      <header className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <Home className="h-5 w-5 text-gray-600" />
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="font-medium text-lg text-gray-800">{projectName}</h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" title="Undo" className="rounded-full hover:bg-gray-100">
                <Undo className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" title="Redo" className="rounded-full hover:bg-gray-100">
                <Redo className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" title="Save" onClick={() => toast.success("Design saved")} 
                className="rounded-full hover:bg-gray-100">
                <Save className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
          
          <Tabs value={viewMode} onValueChange={handleViewModeChange} className="w-[400px]">
            <TabsList className="grid grid-cols-3 bg-gray-100 p-1">
              <TabsTrigger value="2d-top" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                2D Top View
              </TabsTrigger>
              <TabsTrigger value="2d-elevation" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Elevation
              </TabsTrigger>
              <TabsTrigger value="3d" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                3D View
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-2">
              <Label htmlFor="snap-toggle" className="text-xs text-gray-500">Snap</Label>
              <Switch 
                id="snap-toggle"
                checked={snapToGrid} 
                onCheckedChange={setSnapToGrid} 
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              title={showDimensions ? "Hide dimensions" : "Show dimensions"}
              onClick={toggleDimensions}
              className={`rounded-full hover:bg-gray-100 ${showDimensions ? "bg-gray-100 text-blue-600" : "text-gray-600"}`}
            >
              <Ruler className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Toggle grid" className="rounded-full hover:bg-gray-100 text-gray-600">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenBOQEditor}
              className="rounded-full hover:bg-gray-50 border-gray-200 text-gray-700"
            >
              <Download className="h-4 w-4 mr-2 text-gray-600" />
              Export BOQ
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar with tools */}
        <SideToolbar />
        
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
      
      {/* Room Creation Dialog */}
      <CreateRoomDialog
        open={createRoomDialogOpen}
        onOpenChange={setCreateRoomDialogOpen}
      />
      
      {/* BOQ Editor Dialog */}
      <BOQEditorDialog
        open={boqEditorOpen}
        onOpenChange={setBoqEditorOpen}
        onExport={handleExportBOQ}
      />
    </div>
  );
};

export default Editor;
