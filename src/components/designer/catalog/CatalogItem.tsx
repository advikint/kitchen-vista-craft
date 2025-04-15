
import React from 'react';

interface CatalogItemProps {
  item: any;
  icon: React.ReactNode;
  onClick: () => void;
}

export const CatalogItem = ({ item, icon, onClick }: CatalogItemProps) => (
  <button
    className="w-full flex items-center p-3 hover:bg-muted rounded-md border transition-colors text-left"
    onClick={onClick}
  >
    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mr-3">
      {icon}
    </div>
    <div>
      <p className="font-medium">{item.name}</p>
      <p className="text-xs text-muted-foreground">
        {item.width} x {item.height}{item.depth ? ` x ${item.depth}` : ''} cm
      </p>
    </div>
  </button>
);
