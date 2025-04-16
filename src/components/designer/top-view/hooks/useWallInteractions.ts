
import { useRef, MutableRefObject } from 'react';
import { useKitchenStore, Point } from "@/store/kitchenStore";
import { toast } from "sonner";

/**
 * Custom hook for handling wall-related interactions
 */
export const useWallInteractions = (
  startPoint: Point | null,
  setStartPoint: React.Dispatch<React.SetStateAction<Point | null>>,
  isDrawingWall: MutableRefObject<boolean>
) => {
  const { addWall, walls } = useKitchenStore();

  /**
   * Handle clicks for wall creation
   */
  const handleWallClick = (pos: Point) => {
    if (!startPoint) {
      // First click - set start point
      setStartPoint(pos);
      isDrawingWall.current = true;
    } else {
      // Second click - create wall
      addWall({
        start: startPoint,
        end: pos,
        height: 270, // 2700mm converted to cm (default)
        thickness: 10 // 100mm converted to cm (default)
      });
      
      setStartPoint(null);
      isDrawingWall.current = false;
      
      // Notify user of successful wall creation
      const wallCount = walls.length;
      toast.success(`Wall ${String.fromCharCode(65 + wallCount)} created successfully`);
    }
  };

  return { handleWallClick };
};
