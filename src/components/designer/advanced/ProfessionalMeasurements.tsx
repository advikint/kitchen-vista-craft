import { useState, useRef, useEffect, useCallback } from "react"; // Added useCallback
import { Stage, Layer, Line, Text, Circle, Group, Rect } from "react-konva";
import { useKitchenStore } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ruler, Move, RotateCcw, Maximize2, Grid3X3, Target } from "lucide-react";
import { KonvaEventObject } from "konva/lib/Node"; // Added import
import { Vector2d } from "konva/lib/types"; // Added import

interface Dimension { /* ... existing ... */ }
interface MeasurementPoint { /* ... existing ... */ }

const ProfessionalMeasurements = () => {
  const { 
    room, walls, cabinets, appliances, 
    showDimensions, toggleDimensions,
    selectedObject, setSelectedObject 
  } = useKitchenStore();
  
  const [measurementMode, setMeasurementMode] = useState<'select' | 'measure' | 'area'>('select');
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [tempMeasurement, setTempMeasurement] = useState<{ start: { x: number; y: number } | null }>({ start: null });
  const [snapToGridVisual, setSnapToGridVisual] = useState(true); // Renamed from snapToGrid to avoid conflict if store has one
  const [gridSizeVisual] = useState(12 * 2); // Assuming 2 pixels per inch, so 12 inches = 24 pixels
  const [units, setUnits] = useState<'inches' | 'cm' | 'mm'>('inches');
  const [precision, setPrecision] = useState(2);

  const stageRef = useRef<any>(null); // Konva.Stage instance
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the div wrapping the stage

  // Stage transform and panning state
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState<Vector2d>({ x: 0, y: 0 }); // Use Vector2d
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    stageX: 0,
    stageY: 0
  });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 }); // Initial default size

  // Effect to update stage size when its container resizes
  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    checkSize(); // Initial size
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []); // Empty array ensures this runs on mount and cleans up on unmount

  const conversionFactors = { /* ... existing ... */ };
  const snapToGridPoint = (x: number, y: number) => { /* ... existing (uses gridSizeVisual) ... */
    if (!snapToGridVisual) return { x, y };
    return {
      x: Math.round(x / gridSizeVisual) * gridSizeVisual,
      y: Math.round(y / gridSizeVisual) * gridSizeVisual
    };
  };
  const pixelsToUnits = (pixels: number) => { /* ... existing ... */ return 0;};
  const formatMeasurement = (value: number) => { /* ... existing ... */ return "";};
  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => { /* ... existing ... */ return 0;};

  useEffect(() => { /* ... existing logic to generate measurementPoints ... */ }, [walls, cabinets, appliances]);

  // Panning Handlers
  const handleStageDblClick = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target !== e.currentTarget) return; // Only pan if clicking on the stage itself

    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition(); // Returns position relative to stage container
    if (!pointer) return;

    setIsPanning(true);
    panStartRef.current = {
      pointerX: pointer.x,
      pointerY: pointer.y,
      stageX: stage.x(),
      stageY: stage.y(),
    };
    stage.container().style.cursor = 'grabbing';
    e.evt.preventDefault();
  }, [stageRef]); // setIsPanning, panStartRef are stable

  const handleStagePanMove = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isPanning || !stageRef.current) return;

    const stage = stageRef.current;
    const currentScreenPointer = stage.getPointerPosition(); // Position relative to stage container
    if (!currentScreenPointer) return;

    const dx = currentScreenPointer.x - panStartRef.current.pointerX;
    const dy = currentScreenPointer.y - panStartRef.current.pointerY;

    setStagePosition({
      x: panStartRef.current.stageX + dx,
      y: panStartRef.current.stageY + dy,
    });

    if (e.evt instanceof TouchEvent) { // Prevent page scroll only on touch
        e.evt.preventDefault();
    }
  }, [isPanning, stageRef, setStagePosition]); // panStartRef is stable

  const handleStagePanEnd = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      if (stageRef.current) {
        stageRef.current.container().style.cursor = 'default';
      }
    }
  }, [isPanning, stageRef]); // setIsPanning is stable

  const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => { // Ensure type is KonvaEventObject
    if (isPanning) { // Prevent measurement clicks during/immediately after pan
        // If it's a touchend that might also be a tap, ensure pan has fully ended before processing click
        if (e.evt.type === 'touchend' || e.evt.type === 'mouseup') {
             // Allow a very brief moment for pan end to register
            setTimeout(() => { if(isPanning) return; }, 50);
        } else {
            return;
        }
    }

    if (measurementMode !== 'measure') return;
    if (e.target !== e.currentTarget) return; // Click on item, not stage for measurement start/end

    const pos = stageRef.current?.getPointerPosition(); // Use raw stage pointer
    if (!pos) return;

    // Transform pointer position to be relative to world coords (scaled and panned)
    const worldPos = {
        x: (pos.x - stagePosition.x) / stageScale,
        y: (pos.y - stagePosition.y) / stageScale,
    };
    const snappedPos = snapToGridPoint(worldPos.x, worldPos.y);


    if (!tempMeasurement.start) {
      setTempMeasurement({ start: snappedPos });
    } else {
      const distance = calculateDistance(tempMeasurement.start, snappedPos);
      const newDimension: Dimension = {
        id: `dim-${Date.now()}`,
        start: tempMeasurement.start,
        end: snappedPos,
        value: distance,
        label: formatMeasurement(distance), // formatMeasurement needs to be updated if pixelsToUnits uses fixed scale
        type: Math.abs(tempMeasurement.start.y - snappedPos.y) < 10 / stageScale ? 'horizontal' :
              Math.abs(tempMeasurement.start.x - snappedPos.x) < 10 / stageScale ? 'vertical' : 'diagonal',
        precision
      };
      
      setDimensions(prev => [...prev, newDimension]);
      setTempMeasurement({ start: null });
    }
  };

  const renderDimension = (dim: Dimension) => { /* ... existing ... */ return null; };
  const renderMeasurementPoints = () => { /* ... existing ... */ return null; };
  const renderGrid = () => { /* ... existing (uses gridSizeVisual) ... */ return null; };

  return (
    <div className="h-full flex">
      {/* Left Panel with controls */}
      <div className="w-80 bg-white border-r flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Ruler className="h-5 w-5 mr-2" />
            Professional Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 overflow-y-auto"> {/* Added overflow-y-auto */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Measurement Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant={measurementMode === 'select' ? 'default' : 'outline'} onClick={() => setMeasurementMode('select')}><Move className="h-4 w-4" /></Button>
              <Button size="sm" variant={measurementMode === 'measure' ? 'default' : 'outline'} onClick={() => setMeasurementMode('measure')}><Ruler className="h-4 w-4" /></Button>
              <Button size="sm" variant={measurementMode === 'area' ? 'default' : 'outline'} onClick={() => setMeasurementMode('area')}><Maximize2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Snap to Grid</label>
              <Button size="sm" variant={snapToGridVisual ? 'default' : 'outline'} onClick={() => setSnapToGridVisual(!snapToGridVisual)}><Grid3X3 className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Units</label>
              <div className="grid grid-cols-3 gap-2">
                {(['inches', 'cm', 'mm'] as const).map(unit => ( <Button key={unit} size="sm" variant={units === unit ? 'default' : 'outline'} onClick={() => setUnits(unit)}>{unit}</Button>))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Precision</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map(p => ( <Button key={p} size="sm" variant={precision === p ? 'default' : 'outline'} onClick={() => setPrecision(p)}>{p}</Button> ))}
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Dimensions</label>
              <Badge variant="secondary">{dimensions.length}</Badge>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {dimensions.map(dim => (
                <div key={dim.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{dim.label}</span>
                  <Button size="sm" variant="ghost" onClick={() => setDimensions(prev => prev.filter(d => d.id !== dim.id))}>×</Button>
                </div>
              ))}
            </div>
            {dimensions.length > 0 && (<Button size="sm" variant="outline" className="w-full" onClick={() => setDimensions([])}>Clear All</Button>)}
          </div>
          <Separator />
          <div className="space-y-2">
            <label className="text-sm font-medium">Instructions</label>
            {/* ... existing instruction text ... */}
          </div>
        </CardContent>
      </div>

      {/* Measurement canvas area */}
      <div ref={containerRef} className="flex-1 bg-gray-100 relative"> {/* Changed bg color */}
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick} // For measurements
          onTap={handleStageClick}   // For measurements on mobile

          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}

          onDblClick={handleStageDblClick}
          onDblTap={handleStageDblClick}

          onMouseMove={handleStagePanMove}
          onTouchMove={handleStagePanMove} // Use same handler for touch pan after dbltap

          onMouseUp={handleStagePanEnd}
          onTouchEnd={handleStagePanEnd}
          onMouseLeave={handleStagePanEnd}
        >
          <Layer>
            {renderGrid()}
            {/* TODO: Render room outline, walls, cabinets, appliances scaled and positioned */}
            {renderMeasurementPoints()}
            {showDimensions && dimensions.map(renderDimension)}
            {tempMeasurement.start && stageRef.current?.getPointerPosition() && ( // Ensure pointer for temp line
              <Line
                points={[
                  tempMeasurement.start.x, tempMeasurement.start.y,
                  (stageRef.current.getPointerPosition()!.x - stagePosition.x) / stageScale, // Transform live pointer
                  (stageRef.current.getPointerPosition()!.y - stagePosition.y) / stageScale
                ]}
                stroke="#94a3b8" strokeWidth={2} dash={[5, 5]}
              />
            )}
          </Layer>
        </Stage>
        
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          {/* ... existing status bar ... */}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalMeasurements;