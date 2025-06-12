import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Text, Circle, Group, Rect } from "react-konva";
import { useKitchenStore } from "@/store/kitchenStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ruler, Move, RotateCcw, Maximize2, Grid3X3, Target } from "lucide-react";

interface Dimension {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  value: number;
  label: string;
  type: 'horizontal' | 'vertical' | 'diagonal';
  precision: number;
}

interface MeasurementPoint {
  x: number;
  y: number;
  id: string;
  type: 'corner' | 'midpoint' | 'intersection';
}

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
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize] = useState(12); // 12 inches grid
  const [units, setUnits] = useState<'inches' | 'cm' | 'mm'>('inches');
  const [precision, setPrecision] = useState(2);

  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Conversion factors
  const conversionFactors = {
    inches: 1,
    cm: 2.54,
    mm: 25.4
  };

  // Snap point to grid
  const snapToGridPoint = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    const gridSizePixels = gridSize * 2; // Assuming 2 pixels per inch
    return {
      x: Math.round(x / gridSizePixels) * gridSizePixels,
      y: Math.round(y / gridSizePixels) * gridSizePixels
    };
  };

  // Convert pixels to real units
  const pixelsToUnits = (pixels: number) => {
    const inches = pixels / 2; // Assuming 2 pixels per inch scale
    return inches * conversionFactors[units];
  };

  // Format measurement value
  const formatMeasurement = (value: number) => {
    const converted = pixelsToUnits(value);
    if (units === 'inches') {
      const feet = Math.floor(converted / 12);
      const inches = converted % 12;
      if (feet > 0) {
        return `${feet}'-${inches.toFixed(precision)}"`;
      }
      return `${converted.toFixed(precision)}"`;
    }
    return `${converted.toFixed(precision)} ${units}`;
  };

  // Calculate distance between two points
  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Generate measurement points from objects
  useEffect(() => {
    const points: MeasurementPoint[] = [];
    
    // Add wall endpoints and midpoints
    walls.forEach((wall, index) => {
      points.push({
        id: `wall-${index}-start`,
        x: wall.start.x,
        y: wall.start.y,
        type: 'corner'
      });
      points.push({
        id: `wall-${index}-end`,
        x: wall.end.x,
        y: wall.end.y,
        type: 'corner'
      });
      points.push({
        id: `wall-${index}-mid`,
        x: (wall.start.x + wall.end.x) / 2,
        y: (wall.start.y + wall.end.y) / 2,
        type: 'midpoint'
      });
    });

    // Add cabinet corners
    cabinets.forEach((cabinet, index) => {
      const corners = [
        { x: cabinet.position.x - cabinet.width / 2, y: cabinet.position.y - cabinet.depth / 2 },
        { x: cabinet.position.x + cabinet.width / 2, y: cabinet.position.y - cabinet.depth / 2 },
        { x: cabinet.position.x + cabinet.width / 2, y: cabinet.position.y + cabinet.depth / 2 },
        { x: cabinet.position.x - cabinet.width / 2, y: cabinet.position.y + cabinet.depth / 2 },
      ];
      
      corners.forEach((corner, cornerIndex) => {
        points.push({
          id: `cabinet-${index}-corner-${cornerIndex}`,
          x: corner.x,
          y: corner.y,
          type: 'corner'
        });
      });
    });

    setMeasurementPoints(points);
  }, [walls, cabinets, appliances]);

  // Handle stage click for measurements
  const handleStageClick = (e: any) => {
    if (measurementMode !== 'measure') return;

    const pos = e.target.getStage().getPointerPosition();
    const snappedPos = snapToGridPoint(pos.x, pos.y);

    if (!tempMeasurement.start) {
      setTempMeasurement({ start: snappedPos });
    } else {
      const distance = calculateDistance(tempMeasurement.start, snappedPos);
      const newDimension: Dimension = {
        id: `dim-${Date.now()}`,
        start: tempMeasurement.start,
        end: snappedPos,
        value: distance,
        label: formatMeasurement(distance),
        type: Math.abs(tempMeasurement.start.y - snappedPos.y) < 10 ? 'horizontal' : 
              Math.abs(tempMeasurement.start.x - snappedPos.x) < 10 ? 'vertical' : 'diagonal',
        precision
      };
      
      setDimensions(prev => [...prev, newDimension]);
      setTempMeasurement({ start: null });
    }
  };

  // Render dimension line
  const renderDimension = (dim: Dimension) => {
    const offset = 30;
    const textPos = {
      x: (dim.start.x + dim.end.x) / 2,
      y: (dim.start.y + dim.end.y) / 2 - offset
    };

    return (
      <Group key={dim.id}>
        {/* Main dimension line */}
        <Line
          points={[dim.start.x, dim.start.y, dim.end.x, dim.end.y]}
          stroke="#2563eb"
          strokeWidth={2}
        />
        
        {/* Extension lines */}
        <Line
          points={[dim.start.x, dim.start.y - offset, dim.start.x, dim.start.y + offset]}
          stroke="#2563eb"
          strokeWidth={1}
        />
        <Line
          points={[dim.end.x, dim.end.y - offset, dim.end.x, dim.end.y + offset]}
          stroke="#2563eb"
          strokeWidth={1}
        />
        
        {/* Arrowheads */}
        <Line
          points={[dim.start.x, dim.start.y, dim.start.x + 10, dim.start.y - 5, dim.start.x + 10, dim.start.y + 5]}
          stroke="#2563eb"
          strokeWidth={2}
          closed
          fill="#2563eb"
        />
        <Line
          points={[dim.end.x, dim.end.y, dim.end.x - 10, dim.end.y - 5, dim.end.x - 10, dim.end.y + 5]}
          stroke="#2563eb"
          strokeWidth={2}
          closed
          fill="#2563eb"
        />
        
        {/* Dimension text */}
        <Rect
          x={textPos.x - 30}
          y={textPos.y - 10}
          width={60}
          height={20}
          fill="white"
          stroke="#2563eb"
          strokeWidth={1}
        />
        <Text
          x={textPos.x}
          y={textPos.y}
          text={dim.label}
          fontSize={12}
          fill="#2563eb"
          align="center"
          verticalAlign="middle"
          offsetX={30}
          offsetY={10}
        />
      </Group>
    );
  };

  // Render measurement points
  const renderMeasurementPoints = () => {
    if (measurementMode !== 'measure') return null;
    
    return measurementPoints.map(point => (
      <Circle
        key={point.id}
        x={point.x}
        y={point.y}
        radius={4}
        fill={point.type === 'corner' ? "#ef4444" : "#f59e0b"}
        stroke="white"
        strokeWidth={2}
      />
    ));
  };

  // Render grid
  const renderGrid = () => {
    if (!snapToGrid) return null;
    
    const lines = [];
    const gridSizePixels = gridSize * 2;
    
    // Vertical lines
    for (let i = 0; i <= stageSize.width; i += gridSizePixels) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageSize.height]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= stageSize.height; i += gridSizePixels) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageSize.width, i]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      );
    }
    
    return lines;
  };

  return (
    <div className="h-full flex">
      {/* Measurement tools panel */}
      <div className="w-80 bg-white border-r flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Ruler className="h-5 w-5 mr-2" />
            Professional Measurements
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 space-y-4">
          {/* Measurement modes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Measurement Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant={measurementMode === 'select' ? 'default' : 'outline'}
                onClick={() => setMeasurementMode('select')}
              >
                <Move className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={measurementMode === 'measure' ? 'default' : 'outline'}
                onClick={() => setMeasurementMode('measure')}
              >
                <Ruler className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={measurementMode === 'area' ? 'default' : 'outline'}
                onClick={() => setMeasurementMode('area')}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Snap to Grid</label>
              <Button
                size="sm"
                variant={snapToGrid ? 'default' : 'outline'}
                onClick={() => setSnapToGrid(!snapToGrid)}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Units</label>
              <div className="grid grid-cols-3 gap-2">
                {(['inches', 'cm', 'mm'] as const).map(unit => (
                  <Button
                    key={unit}
                    size="sm"
                    variant={units === unit ? 'default' : 'outline'}
                    onClick={() => setUnits(unit)}
                  >
                    {unit}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Precision</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map(p => (
                  <Button
                    key={p}
                    size="sm"
                    variant={precision === p ? 'default' : 'outline'}
                    onClick={() => setPrecision(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Dimensions list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Dimensions</label>
              <Badge variant="secondary">{dimensions.length}</Badge>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {dimensions.map(dim => (
                <div key={dim.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{dim.label}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDimensions(prev => prev.filter(d => d.id !== dim.id))}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            
            {dimensions.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setDimensions([])}
              >
                Clear All
              </Button>
            )}
          </div>

          <Separator />

          {/* Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Instructions</label>
            <div className="text-xs text-gray-600 space-y-1">
              {measurementMode === 'measure' && (
                <>
                  <div>• Click two points to measure distance</div>
                  <div>• Red dots: Object corners</div>
                  <div>• Yellow dots: Midpoints</div>
                  <div>• Measurements snap to grid when enabled</div>
                </>
              )}
              {measurementMode === 'select' && (
                <>
                  <div>• Click objects to select and view dimensions</div>
                  <div>• Drag to move selected objects</div>
                </>
              )}
              {measurementMode === 'area' && (
                <>
                  <div>• Click multiple points to define area</div>
                  <div>• Double-click to complete area measurement</div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </div>

      {/* Measurement canvas */}
      <div className="flex-1 bg-gray-50 relative">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick}
        >
          <Layer>
            {/* Grid */}
            {renderGrid()}
            
            {/* Measurement points */}
            {renderMeasurementPoints()}
            
            {/* Dimensions */}
            {showDimensions && dimensions.map(renderDimension)}
            
            {/* Temporary measurement line */}
            {tempMeasurement.start && (
              <Line
                points={[
                  tempMeasurement.start.x,
                  tempMeasurement.start.y,
                  tempMeasurement.start.x + 100,
                  tempMeasurement.start.y
                ]}
                stroke="#94a3b8"
                strokeWidth={2}
                dash={[5, 5]}
              />
            )}
          </Layer>
        </Stage>
        
        {/* Status bar */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1 text-blue-500" />
              <span>Mode: {measurementMode}</span>
            </div>
            <div className="flex items-center">
              <Grid3X3 className="h-4 w-4 mr-1 text-green-500" />
              <span>Grid: {snapToGrid ? 'On' : 'Off'}</span>
            </div>
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-1 text-purple-500" />
              <span>Units: {units}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalMeasurements;