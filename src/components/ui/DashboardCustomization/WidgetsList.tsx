
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
    <div className="space-y-4">
      {!parentId && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center space-x-3">
            <Checkbox
              id={`toggle-all-${page}-global`}
              checked={allChecked}
              onCheckedChange={(checked) => onToggleAll(page, Boolean(checked))}
              className="h-5 w-5"
            />
            <label htmlFor={`toggle-all-${page}-global`} className="text-sm font-semibold text-primary">
              {allChecked ? 'Desmarcar Todos os Componentes' : 'Marcar Todos os Componentes'}
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-8">
            Controle global para todos os elementos desta página
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {items.sort((a,b) => a.order - b.order).map((item, index) => {
          const widget = item as WidgetConfig;

          if (widget.children) {
            const childrenAllChecked = widget.children.every(child => child.enabled);
            
            return (
              <div key={widget.id} className="border rounded-lg bg-card shadow-sm">
                <div className="flex items-center space-x-3 p-4 border-b bg-muted/30">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Checkbox
                    id={`${page}-${widget.id}`}
                    checked={widget.enabled}
                    onCheckedChange={() => onToggle(page, widget.id)}
                    className="h-4 w-4"
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
                <div className="p-4">
                  <div className="bg-muted/20 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`toggle-all-${page}-${widget.id}`}
                        checked={childrenAllChecked}
                        onCheckedChange={(checked) => onToggleAll(page, Boolean(checked), widget.id)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`toggle-all-${page}-${widget.id}`} className="text-xs font-medium text-muted-foreground">
                        {childrenAllChecked ? 'Desmarcar Todos os Subitens' : 'Marcar Todos os Subitens'}
                      </label>
                    </div>
                  </div>
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
