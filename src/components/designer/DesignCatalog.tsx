import { useState, useEffect } from "react";
import { useKitchenStore } from "@/store/kitchenStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolMode } from "@/store/types";
import { Search, Pointer, LayoutGrid } from "lucide-react";

import CabinetCatalog from "./catalog/CabinetCatalog";
import DoorCatalog from "./catalog/DoorCatalog";
import WindowCatalog from "./catalog/WindowCatalog";
import ApplianceCatalog from "./catalog/ApplianceCatalog";

const DesignCatalog = () => {
  const { currentToolMode, setToolMode, setWallDialogOpen } = useKitchenStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("tools");

  // Set active tab based on current tool mode
  useEffect(() => {
    switch (currentToolMode) {
      case "cabinet":
        setActiveTab("cabinets");
        break;
      case "door":
        setActiveTab("doors");
        break;
      case "window":
        setActiveTab("windows");
        break;
      case "appliance":
        setActiveTab("appliances");
        break;
      default:
        // Keep current tab if not specifically related to a catalog section
        break;
    }
  }, [currentToolMode]);

  // Handle tool selection
  const handleToolSelect = (tool: ToolMode) => {
    setToolMode(tool);
    if (tool === 'room') {
      setWallDialogOpen(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-r">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold">Design Catalog</h2>
        <div className="flex items-center mt-2 gap-2">
          <Search className="w-4 h-4 text-muted-foreground absolute ml-2" />
          <Input
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-5 px-2">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="cabinets">Cabinets</TabsTrigger>
          <TabsTrigger value="appliances">Appliances</TabsTrigger>
          <TabsTrigger value="doors">Doors</TabsTrigger>
          <TabsTrigger value="windows">Windows</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100%-48px)] w-full p-3">
            <TabsContent value="tools" className="mt-0 h-full">
              <div className="space-y-4 p-2">
                <h3 className="text-sm font-medium">Design Tools</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant={currentToolMode === "select" ? "default" : "outline"}
                    className="justify-start h-auto py-4 px-4"
                    onClick={() => handleToolSelect("select")}
                  >
                    <div className="flex items-center">
                      <div className="bg-primary-foreground p-2 rounded-md mr-3">
                        <Pointer size={24} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium">Select Tool</h4>
                        <p className="text-xs text-muted-foreground">Select and modify objects</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={currentToolMode === "room" ? "default" : "outline"}
                    className="justify-start h-auto py-4 px-4"
                    onClick={() => handleToolSelect("room")}
                  >
                    <div className="flex items-center">
                      <div className="bg-primary-foreground p-2 rounded-md mr-3">
                        <LayoutGrid size={24} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium">Room Tool</h4>
                        <p className="text-xs text-muted-foreground">Define room dimensions</p>
                      </div>
                    </div>
                  </Button>
                </div>
                
                <h3 className="text-sm font-medium mt-6">Instructions</h3>
                <div className="bg-muted rounded-md p-3 text-sm">
                  <p className="mb-2">• Click and drag to move objects</p>
                  <p className="mb-2">• Use the Select tool to edit properties</p>
                  <p className="mb-2">• Drag items from catalog onto walls</p>
                  <p className="mb-0">• Items will snap to walls automatically</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cabinets" className="mt-0">
              <CabinetCatalog searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="appliances" className="mt-0">
              <ApplianceCatalog searchQuery={searchQuery} />
            </TabsContent>
            
            <TabsContent value="doors" className="mt-0">
              <DoorCatalog searchQuery={searchQuery} />
            </TabsContent>
            
            <TabsContent value="windows" className="mt-0">
              <WindowCatalog searchQuery={searchQuery} />
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
};

export default DesignCatalog;
