import { useState, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Layers, 
  Settings, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  MoreVertical,
  Plus,
  Trash2,
  Copy,
  Move,
  RotateCw,
  Maximize2,
  Minimize2,
  Grid,
  Ruler,
  Palette,
  Package,
  Wrench,
  FileText,
  Camera,
  Share2,
  Save,
  Undo,
  Redo
} from "lucide-react";
import { useKitchenStore } from "@/store/kitchenStore";
import AdvancedThreeDView from "./AdvancedThreeDView";
import ProfessionalCatalog from "./ProfessionalCatalog";
import ProfessionalMeasurements from "./ProfessionalMeasurements";
import ProfessionalBOQ from "./ProfessionalBOQ";
import ModelLibrary from "./ModelLibrary";

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  type: 'walls' | 'cabinets' | 'appliances' | 'dimensions' | 'annotations';
  color: string;
}

interface ViewportState {
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
}

const ProfessionalWorkspace = () => {
  const { 
    viewMode, setViewMode,
    showDimensions, toggleDimensions,
    walls, cabinets, appliances,
    selectedObject, setSelectedObject
  } = useKitchenStore();

  const [leftPanelSize, setLeftPanelSize] = useState(20);
  const [rightPanelSize, setRightPanelSize] = useState(25);
  const [bottomPanelSize, setBottomPanelSize] = useState(30);
  const [activeLeftTab, setActiveLeftTab] = useState("catalog");
  const [activeRightTab, setActiveRightTab] = useState("properties");
  const [activeBottomTab, setActiveBottomTab] = useState("boq");
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'walls', name: 'Walls', visible: true, locked: false, type: 'walls', color: '#3b82f6' },
    { id: 'cabinets', name: 'Cabinets', visible: true, locked: false, type: 'cabinets', color: '#8b5cf6' },
    { id: 'appliances', name: 'Appliances', visible: true, locked: false, type: 'appliances', color: '#10b981' },
    { id: 'dimensions', name: 'Dimensions', visible: showDimensions, locked: false, type: 'dimensions', color: '#f59e0b' },
    { id: 'annotations', name: 'Annotations', visible: true, locked: false, type: 'annotations', color: '#ef4444' },
  ]);

  const [viewportState, setViewportState] = useState<ViewportState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    rotation: 0
  });

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Layer management
  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
    
    if (layerId === 'dimensions') {
      toggleDimensions();
    }
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  // Viewport controls
  const resetViewport = () => {
    setViewportState({ zoom: 1, pan: { x: 0, y: 0 }, rotation: 0 });
  };

  const zoomIn = () => {
    setViewportState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 5) }));
  };

  const zoomOut = () => {
    setViewportState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.1) }));
  };

  const fitToView = () => {
    // Implementation would calculate optimal zoom and pan to fit all objects
    resetViewport();
  };

  // Render main viewport content based on view mode
  const renderViewportContent = () => {
    switch (viewMode) {
      case '3d':
        return <AdvancedThreeDView />;
      case '2d-elevation':
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Elevation View</h3>
              <p className="text-gray-600">Professional elevation view coming soon</p>
            </div>
          </div>
        );
      case '2d-top':
      default:
        return <ProfessionalMeasurements />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Professional Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* File operations */}
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Undo className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* View controls */}
          <div className="flex items-center space-x-1">
            <Button 
              size="sm" 
              variant={viewMode === '2d-top' ? 'default' : 'ghost'}
              onClick={() => setViewMode('2d-top')}
            >
              <Grid className="h-4 w-4 mr-1" />
              2D Plan
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === '2d-elevation' ? 'default' : 'ghost'}
              onClick={() => setViewMode('2d-elevation')}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Elevation
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === '3d' ? 'default' : 'ghost'}
              onClick={() => setViewMode('3d')}
            >
              <Package className="h-4 w-4 mr-1" />
              3D View
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Viewport controls */}
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={zoomIn}>
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">{Math.round(viewportState.zoom * 100)}%</span>
            <Button size="sm" variant="ghost" onClick={zoomOut}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={fitToView}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Tools */}
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost">
              <Ruler className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Camera className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Project info */}
          <div className="text-sm">
            <span className="font-medium">Kitchen Design Project</span>
            <Badge variant="secondary" className="ml-2">Draft</Badge>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel */}
          <ResizablePanel defaultSize={leftPanelSize} minSize={15} maxSize={35}>
            <div className="h-full bg-white border-r">
              <Tabs value={activeLeftTab} onValueChange={setActiveLeftTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="catalog">Catalog</TabsTrigger>
                  <TabsTrigger value="models">3D Models</TabsTrigger>
                  <TabsTrigger value="layers">Layers</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                </TabsList>
                
                <TabsContent value="catalog" className="flex-1 mt-0">
                  <ProfessionalCatalog />
                </TabsContent>
                
                <TabsContent value="models" className="flex-1 mt-0">
                  <ModelLibrary />
                </TabsContent>
                
                <TabsContent value="layers" className="flex-1 mt-0 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Layers</h3>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {layers.map((layer) => (
                          <div key={layer.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: layer.color }}
                              />
                              <span className="text-sm font-medium">{layer.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleLayerVisibility(layer.id)}
                              >
                                {layer.visible ? (
                                  <Eye className="h-3 w-3" />
                                ) : (
                                  <EyeOff className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleLayerLock(layer.id)}
                              >
                                {layer.locked ? (
                                  <Lock className="h-3 w-3" />
                                ) : (
                                  <Unlock className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="tools" className="flex-1 mt-0 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Design Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Move className="h-4 w-4 mr-1" />
                        Move
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCw className="h-4 w-4 mr-1" />
                        Rotate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Center Panel - Main Viewport */}
          <ResizablePanel defaultSize={100 - leftPanelSize - rightPanelSize}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={showBottomPanel ? 70 : 100}>
                <div className="h-full bg-white relative">
                  {renderViewportContent()}
                  
                  {/* Viewport overlay controls */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{viewMode.toUpperCase()}</Badge>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-xs text-gray-600">
                        Objects: {walls.length + cabinets.length + appliances.length}
                      </span>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
              
              {showBottomPanel && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                    <div className="h-full bg-white border-t">
                      <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab} className="h-full flex flex-col">
                        <div className="flex items-center justify-between px-4 py-2 border-b">
                          <TabsList>
                            <TabsTrigger value="boq">BOQ</TabsTrigger>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            <TabsTrigger value="reports">Reports</TabsTrigger>
                          </TabsList>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setShowBottomPanel(false)}
                          >
                            <Minimize2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <TabsContent value="boq" className="flex-1 mt-0">
                          <ProfessionalBOQ />
                        </TabsContent>
                        
                        <TabsContent value="timeline" className="flex-1 mt-0 p-4">
                          <div className="text-center text-gray-500">
                            <h3 className="font-semibold mb-2">Project Timeline</h3>
                            <p>Professional project timeline coming soon</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="reports" className="flex-1 mt-0 p-4">
                          <div className="text-center text-gray-500">
                            <h3 className="font-semibold mb-2">Project Reports</h3>
                            <p>Comprehensive reporting system coming soon</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Right Panel */}
          <ResizablePanel defaultSize={rightPanelSize} minSize={20} maxSize={40}>
            <div className="h-full bg-white border-l">
              <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>
                
                <TabsContent value="properties" className="flex-1 mt-0 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Object Properties</h3>
                    {selectedObject ? (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Selected Object</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-sm">
                            <div className="font-medium">Type: {selectedObject.type}</div>
                            <div>ID: {selectedObject.id}</div>
                          </div>
                          {/* Add more property controls here */}
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Select an object to view properties</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="materials" className="flex-1 mt-0 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Material Library</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Oak", color: "#D2691E" },
                        { name: "Maple", color: "#DEB887" },
                        { name: "Cherry", color: "#8B4513" },
                        { name: "White", color: "#FFFFFF" },
                        { name: "Black", color: "#000000" },
                        { name: "Gray", color: "#808080" },
                      ].map((material) => (
                        <div
                          key={material.name}
                          className="aspect-square border rounded cursor-pointer hover:shadow-md transition-shadow"
                          style={{ backgroundColor: material.color }}
                          title={material.name}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Zoom: {Math.round(viewportState.zoom * 100)}%</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Objects: {walls.length + cabinets.length + appliances.length}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Units: Inches</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Grid: 12"</span>
          {!showBottomPanel && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowBottomPanel(true)}
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                Show Panel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWorkspace;