
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Save, Undo, Redo, Grid3X3, Ruler, Download, Menu } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ViewMode } from "@/store/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

interface EditorHeaderProps {
  projectName: string;
  viewMode: ViewMode;
  showDimensions: boolean;
  snapToGrid: boolean;
  onViewModeChange: (value: string) => void;
  onSnapToGridChange: (value: boolean) => void;
  toggleDimensions: () => void;
  onOpenBOQEditor: () => void;
}

export const EditorHeader = ({
  projectName,
  viewMode,
  showDimensions,
  snapToGrid,
  onViewModeChange,
  onSnapToGridChange,
  toggleDimensions,
  onOpenBOQEditor,
}: EditorHeaderProps) => {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  // Mobile header
  if (isMobile) {
    return (
      <header className="bg-white border-b px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full mr-2">
                <Home className="h-5 w-5 text-gray-600" />
              </Button>
            </Link>
            <h1 className="font-medium text-sm truncate max-w-[150px]">{projectName}</h1>
          </div>
          
          <Tabs value={viewMode} onValueChange={onViewModeChange} className="flex-1 mx-2">
            <TabsList className="grid grid-cols-3 bg-gray-100 p-0.5 h-8">
              <TabsTrigger value="2d-top" className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Top
              </TabsTrigger>
              <TabsTrigger value="2d-elevation" className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Front
              </TabsTrigger>
              <TabsTrigger value="3d" className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                3D
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="px-4 py-6">
              <SheetHeader>
                <SheetTitle>Options</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-toggle-mobile" className="text-sm">Snap to Grid</Label>
                  <Switch 
                    id="snap-toggle-mobile"
                    checked={snapToGrid} 
                    onCheckedChange={onSnapToGridChange} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dimension-toggle-mobile" className="text-sm">Show Dimensions</Label>
                  <Switch 
                    id="dimension-toggle-mobile"
                    checked={showDimensions} 
                    onCheckedChange={toggleDimensions} 
                  />
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onOpenBOQEditor}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export BOQ
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast.success("Design saved")}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  // Desktop header
  return (
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
        
        <Tabs value={viewMode} onValueChange={onViewModeChange} className="w-[400px]">
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
              onCheckedChange={onSnapToGridChange} 
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
            onClick={onOpenBOQEditor}
            className="rounded-full hover:bg-gray-50 border-gray-200 text-gray-700"
          >
            <Download className="h-4 w-4 mr-2 text-gray-600" />
            Export BOQ
          </Button>
        </div>
      </div>
    </header>
  );
};
