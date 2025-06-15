
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { WidgetConfig, ChildConfig, LayoutConfig, colorOptions } from './types';

interface WidgetItemProps {
  item: WidgetConfig | ChildConfig;
  index: number;
  totalItems: number;
  page: keyof LayoutConfig;
  parentId?: string;
  widgetColors: {[key:string]: {[key:string]: string}};
  onToggle: (page: keyof LayoutConfig, widgetId: string, childId?: string) => void;
  onMove: (page: keyof LayoutConfig, widgetId: string, direction: 'up' | 'down', childId?: string) => void;
  onColorChange: (widgetId: string, childId: string, color: string) => void;
}

const WidgetItem: React.FC<WidgetItemProps> = ({
  item,
  index,
  totalItems,
  page,
  parentId,
  widgetColors,
  onToggle,
  onMove,
  onColorChange
}) => {
  const isChild = 'color' in item || parentId;
  const child = item as ChildConfig;
  const defaultColor = (isChild && child.color) ? child.color : '';
  const selectedColor = parentId && widgetColors[parentId]?.[child.id] ? widgetColors[parentId]?.[child.id] : defaultColor;

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
      <Checkbox
        id={`${page}-${parentId || ''}-${item.id}`}
        checked={item.enabled}
        onCheckedChange={() => onToggle(page, parentId || item.id, parentId ? item.id : undefined)}
      />
      <span className="flex-1 text-sm font-medium">{item.title}</span>

      {isChild && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Cor:</span>
          <select
            value={selectedColor}
            onChange={(e) => parentId && onColorChange(parentId, child.id, e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-background"
          >
            {colorOptions.map(opt => (
              <option key={opt.name} value={opt.value}>
                {opt.name}
              </option>
            ))}
          </select>
          <div className={`w-3 h-3 rounded ${selectedColor || defaultColor}`} />
        </div>
      )}
      
      <div className="flex space-x-1">
        <Button variant="ghost" size="sm" onClick={() => onMove(page, parentId || item.id, 'up', parentId ? item.id : undefined)} disabled={index === 0} className="h-7 w-7 p-0">
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onMove(page, parentId || item.id, 'down', parentId ? item.id : undefined)} disabled={index === totalItems - 1} className="h-7 w-7 p-0">
          <ArrowDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default WidgetItem;
