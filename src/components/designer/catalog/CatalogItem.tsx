
import { ReactNode } from "react";

interface CatalogItemProps {
  item: any;
  icon: ReactNode;
  onClick: () => void;
}

export const CatalogItem = ({ item, icon, onClick }: CatalogItemProps) => {
  return (
    <div 
      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center rounded-md border mb-2"
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify(item));
      }}
    >
      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
        <div className="text-gray-600">{icon}</div>
      </div>
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-gray-500">
          {item.width} x {item.height} {item.depth ? `x ${item.depth}` : ''} cm
          {item.sillHeight ? `, Sill: ${item.sillHeight} cm` : ''}
        </p>
      </div>
    </div>
  );
};
