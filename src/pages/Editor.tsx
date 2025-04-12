
import { useState } from "react";
import { useKitchenStore, ViewMode, ToolMode } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch"; 
import { 
  Save, Home, Undo, Redo, Grid3X3, Ruler, Download, 
  PanelLeft, List, LayoutGrid, Box, Layers, 
  Maximize2, Pen, Square, DoorOpen, Blinds, PackageOpen,
  ChevronsDown, ChevronsUp, ChevronsLeft, ChevronsRight
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
              <span className="text-xs text-gray-500">Snap</span>
              <Switch 
                checked={snapToGrid} 
                onCheckedChange={setSnapToGrid} 
                size="sm"
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
              onClick={handleExportBOQ}
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
        {/* Left panel */}
        <div className={`relative ${leftPanelOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r bg-white shadow-sm z-10`}>
          <div className={`h-full flex flex-col ${!leftPanelOpen && 'invisible'}`}>
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-800">Tools</h3>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center rounded-md ${currentToolMode === 'select' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`} 
                onClick={() => handleToolSelect('select')}
              >
                <Pen className="h-5 w-5 mb-1" />
                <span className="text-xs">Select</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center rounded-md ${currentToolMode === 'room' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`} 
                onClick={() => handleToolSelect('room')}
              >
                <Square className="h-5 w-5 mb-1" />
                <span className="text-xs">Room</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center rounded-md ${currentToolMode === 'door' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`} 
                onClick={() => handleToolSelect('door')}
              >
                <DoorOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">Door</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center rounded-md ${currentToolMode === 'window' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`} 
                onClick={() => handleToolSelect('window')}
              >
                <Blinds className="h-5 w-5 mb-1" />
                <span className="text-xs">Window</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center rounded-md ${currentToolMode === 'cabinet' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`} 
                onClick={() => handleToolSelect('cabinet')}
              >
                <PackageOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">Cabinet</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex flex-col py-3 h-auto items-center justify-center rounded-md ${currentToolMode === 'appliance' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`} 
                onClick={() => handleToolSelect('appliance')}
              >
                <Box className="h-5 w-5 mb-1" />
                <span className="text-xs">Appliance</span>
              </Button>
            </div>
            
            <Tabs defaultValue="objects" className="flex-1 flex flex-col mt-4">
              <TabsList className="mx-4 mb-2 bg-gray-100 p-0.5">
                <TabsTrigger value="objects" className="flex-1 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Objects
                </TabsTrigger>
                <TabsTrigger value="layers" className="flex-1 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Layers className="h-4 w-4 mr-2" />
                  Layers
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-hidden">
                <ObjectPanel />
              </div>
            </Tabs>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 h-6 w-6 rounded-full bg-white border shadow-sm z-10 p-0"
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
              className="absolute bottom-4 right-4 bg-white rounded-full shadow-sm border-gray-200"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
          )}
        </div>
        
        {/* Right panel */}
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
