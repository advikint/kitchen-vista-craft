
import { useState } from "react";
import { useKitchenStore, ViewMode, ToolMode } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, Home, Undo, Redo, Grid3X3, Ruler, Download, 
  PanelLeft, List, LayoutGrid, Box, Layers, ChevronsDown, 
  ChevronsUp, Maximize2, Pen, Square, DoorOpen, Blinds, PackageOpen
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import RoomDesigner from "@/components/designer/RoomDesigner";
import ObjectPanel from "@/components/panels/ObjectPanel";
import PropertiesPanel from "@/components/panels/PropertiesPanel";
import CreateRoomDialog from "@/components/dialogs/CreateRoomDialog";

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
  
  const handleExportBOQ = () => {
    const boq = generateBOQ();
    console.log("Generated BOQ:", boq);
    
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
      <header className="bg-white border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="font-medium">{projectName}</h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" title="Undo">
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Redo">
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Save" onClick={() => toast.success("Design saved")}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs value={viewMode} onValueChange={handleViewModeChange} className="w-[400px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="2d-top">2D Top View</TabsTrigger>
              <TabsTrigger value="2d-elevation">Elevation</TabsTrigger>
              <TabsTrigger value="3d">3D View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              title={showDimensions ? "Hide dimensions" : "Show dimensions"}
              onClick={toggleDimensions}
              className={showDimensions ? "bg-gray-100" : ""}
            >
              <Ruler className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Toggle grid">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={handleExportBOQ}>
              <Download className="h-4 w-4 mr-2" />
              Export BOQ
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className={`relative ${leftPanelOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r bg-white`}>
          <div className={`h-full flex flex-col ${!leftPanelOpen && 'invisible'}`}>
            <div className="p-4 border-b">
              <h3 className="font-medium">Tools</h3>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center ${currentToolMode === 'select' ? 'bg-kitchen-100 text-kitchen-800' : ''}`} 
                onClick={() => handleToolSelect('select')}
              >
                <Pen className="h-5 w-5 mb-1" />
                <span className="text-xs">Select</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col py-3 h-auto items-center justify-center bg-kitchen-50 text-kitchen-700" 
                onClick={() => handleToolSelect('room')}
              >
                <Square className="h-5 w-5 mb-1" />
                <span className="text-xs">Room</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center ${currentToolMode === 'door' ? 'bg-kitchen-100 text-kitchen-800' : ''}`} 
                onClick={() => handleToolSelect('door')}
              >
                <DoorOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">Door</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center ${currentToolMode === 'window' ? 'bg-kitchen-100 text-kitchen-800' : ''}`} 
                onClick={() => handleToolSelect('window')}
              >
                <Blinds className="h-5 w-5 mb-1" />
                <span className="text-xs">Window</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center ${currentToolMode === 'cabinet' ? 'bg-kitchen-100 text-kitchen-800' : ''}`} 
                onClick={() => handleToolSelect('cabinet')}
              >
                <PackageOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">Cabinet</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center ${currentToolMode === 'appliance' ? 'bg-kitchen-100 text-kitchen-800' : ''}`} 
                onClick={() => handleToolSelect('appliance')}
              >
                <Box className="h-5 w-5 mb-1" />
                <span className="text-xs">Appliance</span>
              </Button>
            </div>
            
            <Tabs defaultValue="objects" className="flex-1 flex flex-col mt-4">
              <TabsList className="mx-4 mb-2">
                <TabsTrigger value="objects" className="flex-1">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Objects
                </TabsTrigger>
                <TabsTrigger value="layers" className="flex-1">
                  <List className="h-4 w-4 mr-2" />
                  Layers
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto p-4">
                <ObjectPanel />
              </div>
            </Tabs>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border shadow-sm z-10"
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          >
            {leftPanelOpen ? <ChevronsLeft className="h-3 w-3" /> : <ChevronsRight className="h-3 w-3" />}
          </Button>
        </div>
        
        {/* Main canvas */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          <RoomDesigner />
          
          {viewMode === '3d' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute bottom-4 right-4 bg-white"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
          )}
        </div>
        
        {/* Right panel */}
        <div className={`relative ${rightPanelOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-l bg-white`}>
          <div className={`h-full flex flex-col ${!rightPanelOpen && 'invisible'}`}>
            <div className="p-4 border-b">
              <h3 className="font-medium">Properties</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PropertiesPanel />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1/2 -left-3 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border shadow-sm z-10"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            {rightPanelOpen ? <ChevronsRight className="h-3 w-3" /> : <ChevronsLeft className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {/* Room Creation Dialog */}
      <CreateRoomDialog
        open={createRoomDialogOpen}
        onOpenChange={setCreateRoomDialogOpen}
      />
    </div>
  );
};

export default Editor;

const ChevronsLeft = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m11 17-5-5 5-5" />
    <path d="m18 17-5-5 5-5" />
  </svg>
);

const ChevronsRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 17 5-5-5-5" />
    <path d="m13 17 5-5-5-5" />
  </svg>
);
