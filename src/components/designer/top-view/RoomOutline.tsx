
import { useKitchenStore } from "@/store/kitchenStore";
import { Rect } from "react-konva";

const RoomOutline = () => {
  const { room } = useKitchenStore();
  
  if (!room.width || !room.height) return null;
  
  return (
    <Rect
      x={-room.width / 2}
      y={-room.height / 2}
      width={room.width}
      height={room.height}
      stroke="#d1d5db"
      strokeWidth={1}
      dash={[10, 10]}
      fill="#f9fafb"
    />
  );
};

export default RoomOutline;
