
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { LayoutConfig } from './types';
import WidgetsList from './WidgetsList';

interface PageCardProps {
  page: keyof LayoutConfig;
  title: string;
  cardRef: React.RefObject<HTMLDivElement>;
  isExpanded: boolean;
  layoutConfig: LayoutConfig;
  widgetColors: {[key:string]: {[key:string]: string}};
  onSectionToggle: (section: string) => void;
  onToggle: (page: keyof LayoutConfig, widgetId: string, childId?: string) => void;
  onMove: (page: keyof LayoutConfig, widgetId: string, direction: 'up' | 'down', childId?: string) => void;
  onToggleAll: (page: keyof LayoutConfig, checked: boolean, widgetId?: string) => void;
  onColorChange: (widgetId: string, childId: string, color: string) => void;
}

const PageCard: React.FC<PageCardProps> = ({
  page,
  title,
  cardRef,
  isExpanded,
  layoutConfig,
  widgetColors,
  onSectionToggle,
  onToggle,
  onMove,
  onToggleAll,
  onColorChange
}) => {
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <Card ref={cardRef} className="border-l-4 border-l-primary">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => onSectionToggle(page)}
      >
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-3">
            <ChevronIcon className="h-5 w-5 text-primary" />
            {title}
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {layoutConfig[page].filter(w => w.enabled).length} ativos
          </span>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <WidgetsList
            items={layoutConfig[page]}
            page={page}
            widgetColors={widgetColors}
            onToggle={onToggle}
            onMove={onMove}
            onToggleAll={onToggleAll}
            onColorChange={onColorChange}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default PageCard;
