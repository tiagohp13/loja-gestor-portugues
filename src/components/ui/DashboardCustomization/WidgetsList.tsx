
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetConfig, ChildConfig, LayoutConfig } from './types';
import WidgetItem from './WidgetItem';

interface WidgetsListProps {
  items: (WidgetConfig | ChildConfig)[];
  page: keyof LayoutConfig;
  parentId?: string;
  widgetColors: {[key:string]: {[key:string]: string}};
  onToggle: (page: keyof LayoutConfig, widgetId: string, childId?: string) => void;
  onMove: (page: keyof LayoutConfig, widgetId: string, direction: 'up' | 'down', childId?: string) => void;
  onToggleAll: (page: keyof LayoutConfig, checked: boolean, widgetId?: string) => void;
  onColorChange: (widgetId: string, childId: string, color: string) => void;
}

const WidgetsList: React.FC<WidgetsListProps> = ({
  items,
  page,
  parentId,
  widgetColors,
  onToggle,
  onMove,
  onToggleAll,
  onColorChange
}) => {
  const allChecked = items.every(item => item.enabled);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`toggle-all-${page}-${parentId || 'parent'}`}
            checked={allChecked}
            onCheckedChange={(checked) => onToggleAll(page, Boolean(checked), parentId)}
          />
          <label htmlFor={`toggle-all-${page}-${parentId || 'parent'}`} className="text-sm font-medium">
            {allChecked ? 'Desmarcar Todos' : 'Marcar Todos'}
          </label>
        </div>
      </div>
      
      <div className="space-y-2">
        {items.sort((a,b) => a.order - b.order).map((item, index) => {
          const widget = item as WidgetConfig;

          if (widget.children) {
            return (
              <div key={widget.id} className="border rounded-lg bg-card">
                <div className="flex items-center space-x-3 p-3 border-b">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Checkbox
                    id={`${page}-${widget.id}`}
                    checked={widget.enabled}
                    onCheckedChange={() => onToggle(page, widget.id)}
                  />
                  <span className="flex-1 text-sm font-medium">{widget.title}</span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onMove(page, widget.id, 'up')} disabled={index === 0} className="h-7 w-7 p-0">
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onMove(page, widget.id, 'down')} disabled={index === items.length - 1} className="h-7 w-7 p-0">
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <WidgetsList
                    items={widget.children}
                    page={page}
                    parentId={widget.id}
                    widgetColors={widgetColors}
                    onToggle={onToggle}
                    onMove={onMove}
                    onToggleAll={onToggleAll}
                    onColorChange={onColorChange}
                  />
                </div>
              </div>
            );
          }

          return (
            <WidgetItem
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              page={page}
              parentId={parentId}
              widgetColors={widgetColors}
              onToggle={onToggle}
              onMove={onMove}
              onColorChange={onColorChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WidgetsList;
