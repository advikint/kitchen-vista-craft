
import { useRef, MutableRefObject } from 'react';
import { useKitchenStore, Point } from "@/store/kitchenStore";

/**
 * Custom hook for handling wall-related interactions
 */
export const useWallInteractions = (
  startPoint: Point | null,
  setStartPoint: React.Dispatch<React.SetStateAction<Point | null>>,
  isDrawingWall: MutableRefObject<boolean>
) => {
  const { addWall } = useKitchenStore();

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
        height: 240 // Default wall height
      });
      setStartPoint(null);
      isDrawingWall.current = false;
    }
  };

  return { handleWallClick };
};
