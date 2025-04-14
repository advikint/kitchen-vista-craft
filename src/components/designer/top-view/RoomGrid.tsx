
import { useKitchenStore } from "@/store/kitchenStore";
import { Line } from "react-konva";

const RoomGrid = () => {
  const { room } = useKitchenStore();
  
  const gridSize = 50;
  const gridWidth = room.width > 0 ? room.width * 2 : 2000;
  const gridHeight = room.height > 0 ? room.height * 2 : 2000;
  
  const renderGrid = () => {
    const lines = [];
    
    for (let x = -gridWidth / 2; x <= gridWidth / 2; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, -gridHeight / 2, x, gridHeight / 2]}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    
    for (let y = -gridHeight / 2; y <= gridHeight / 2; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[-gridWidth / 2, y, gridWidth / 2, y]}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    
    lines.push(
      <Line
        key="center-h"
        points={[-gridWidth / 2, 0, gridWidth / 2, 0]}
        stroke="#d1d5db"
        strokeWidth={2}
      />
    );
    
    lines.push(
      <Line
        key="center-v"
        points={[0, -gridHeight / 2, 0, gridHeight / 2]}
        stroke="#d1d5db"
        strokeWidth={2}
      />
    );
    
    return lines;
  };
  
  return <>{renderGrid()}</>;
};

export default RoomGrid;
