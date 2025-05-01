
import React from 'react';
import { cn } from '@/lib/utils';

interface CatalogItemProps {
  item: {
    name: string;
    width?: number;
    height?: number;
    depth?: number;
    type?: string;
    category?: string;
  };
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export const CatalogItem: React.FC<CatalogItemProps> = ({ 
  item, 
  icon, 
  onClick, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center rounded-md border animate-fade-in",
        className
      )}
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify(item));
      }}
    >
      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3 overflow-hidden">
        <div className="text-gray-600">
          {icon}
        </div>
      </div>
      <div>
        <p className="font-medium">{item.name}</p>
        {(item.width && item.height) && (
          <p className="text-xs text-gray-500">
            {item.width} x {item.height}{item.depth ? ` x ${item.depth}` : ''} cm
          </p>
        )}
      </div>
    </div>
  );
};
