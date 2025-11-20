
import React, { useState, useEffect, useRef } from 'react';
import { Palette } from 'lucide-react';
import { LayoutConfig, WidgetConfig } from './DashboardCustomization/types';
import { defaultLayoutConfig } from './DashboardCustomization/defaultConfigs';
import PageCard from './DashboardCustomization/PageCard';

const DashboardCustomization: React.FC = () => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => {
    const saved = localStorage.getItem('dashboard-layout-config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Basic merge to ensure new default widgets are added if not in saved config
      return {
        dashboard: [
          ...parsed.dashboard,
          ...defaultLayoutConfig.dashboard.filter(def => !parsed.dashboard.find(p => p.id === def.id))
        ].map((item, index) => ({...item, order: index})),
        statistics: [
          ...parsed.statistics,
          ...defaultLayoutConfig.statistics.filter(def => !parsed.statistics.find(p => p.id === def.id))
        ].map((item, index) => ({...item, order: index}))
      }
    }
    return defaultLayoutConfig;
  });
  
  const [widgetColors, setWidgetColors] = useState<{[key:string]: {[key:string]: string}}>(() => {
    const quickActionColors = localStorage.getItem('dashboard-quick-action-colors');
    const cardColors = localStorage.getItem('dashboard-card-colors');
    return {
        'quick-actions': quickActionColors ? JSON.parse(quickActionColors) : {},
        'summary-cards': cardColors ? JSON.parse(cardColors) : {},
    };
  });

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    dashboard: false,
    statistics: false
  });

  // Refs para os cartões de página
  const dashboardCardRef = useRef<HTMLDivElement>(null);
  const statisticsCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('dashboard-layout-config', JSON.stringify(layoutConfig));

    const quickActionsWidget = layoutConfig.dashboard.find(w => w.id === 'quick-actions');
    if (quickActionsWidget?.children) {
      localStorage.setItem('dashboard-quick-actions-config', JSON.stringify(quickActionsWidget.children));
    }
    const summaryCardsWidget = layoutConfig.dashboard.find(w => w.id === 'summary-cards');
    if (summaryCardsWidget?.children) {
      localStorage.setItem('dashboard-card-config', JSON.stringify(summaryCardsWidget.children));
    }

    localStorage.setItem('dashboard-quick-action-colors', JSON.stringify(widgetColors['quick-actions'] || {}));
    localStorage.setItem('dashboard-card-colors', JSON.stringify(widgetColors['summary-cards'] || {}));

    // Dispatch a storage event to notify other components of the change
    window.dispatchEvent(new Event('storage'));

  }, [layoutConfig, widgetColors]);

  // Função para fazer scroll suave para o elemento
  const scrollToElement = (element: HTMLElement) => {
    setTimeout(() => {
      const elementRect = element.getBoundingClientRect();
      const offsetTop = window.pageYOffset + elementRect.top - 120;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }, 300);
  };

  // Handler para expansão/colapso de seções
  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => {
      const newExpanded = { ...prev, [section]: !prev[section] };
      
      // Se a seção foi expandida, fazer scroll
      if (newExpanded[section]) {
        const targetRef = section === 'dashboard' ? dashboardCardRef.current : statisticsCardRef.current;
        if (targetRef) {
          scrollToElement(targetRef);
        }
      }
      
      return newExpanded;
    });
  };

  const handleToggle = (page: keyof LayoutConfig, widgetId: string, childId?: string) => {
    setLayoutConfig(prev => {
      const newConfig = { ...prev };
      const pageWidgets = [...newConfig[page]];
      const widgetIndex = pageWidgets.findIndex(w => w.id === widgetId);

      if (widgetIndex === -1) return prev;

      if (childId) { // Toggling a child
        const widget = { ...pageWidgets[widgetIndex] };
        if (widget.children) {
          const childIndex = widget.children.findIndex(c => c.id === childId);
          if (childIndex !== -1) {
            const newChildren = [...widget.children];
            newChildren[childIndex] = { ...newChildren[childIndex], enabled: !newChildren[childIndex].enabled };
            widget.children = newChildren;
            pageWidgets[widgetIndex] = widget;
          }
        }
      } else { // Toggling a parent widget
        pageWidgets[widgetIndex] = { ...pageWidgets[widgetIndex], enabled: !pageWidgets[widgetIndex].enabled };
      }

      newConfig[page] = pageWidgets;
      return newConfig;
    });
  };
  
  const handleMove = (page: keyof LayoutConfig, widgetId: string, direction: 'up' | 'down', childId?: string) => {
    setLayoutConfig(prev => {
      const newConfig = { ...prev };
      let items = [...newConfig[page]];
      let parentWidget: WidgetConfig | undefined;

      if (childId) {
        parentWidget = items.find(w => w.id === widgetId);
        if (!parentWidget || !parentWidget.children) return prev;
        items = [...parentWidget.children];
      }

      const currentIndex = items.findIndex(item => item.id === (childId || widgetId));
      if ((direction === 'up' && currentIndex === 0) || (direction === 'down' && currentIndex === items.length - 1)) {
        return prev;
      }

      const newItems = [...items];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];

      const reorderedItems = newItems.map((item, index) => ({ ...item, order: index }));

      if (parentWidget) {
        parentWidget.children = reorderedItems as any;
        const pageWidgets = [...newConfig[page]];
        const widgetIndex = pageWidgets.findIndex(w => w.id === widgetId);
        pageWidgets[widgetIndex] = parentWidget;
        newConfig[page] = pageWidgets;
      } else {
        newConfig[page] = reorderedItems as WidgetConfig[];
      }
      
      return newConfig;
    });
  };

  const handleToggleAll = (page: keyof LayoutConfig, checked: boolean, widgetId?: string) => {
    setLayoutConfig(prev => {
        const newConfig = { ...prev };
        const pageWidgets = [...newConfig[page]];

        if(widgetId) { // Toggle all children of a widget
            const widgetIndex = pageWidgets.findIndex(w => w.id === widgetId);
            if (widgetIndex !== -1 && pageWidgets[widgetIndex].children) {
                const updatedChildren = pageWidgets[widgetIndex].children!.map(child => ({ ...child, enabled: checked }));
                pageWidgets[widgetIndex] = { ...pageWidgets[widgetIndex], children: updatedChildren };
                newConfig[page] = pageWidgets; // CORRIGIDO: aplicar as mudanças
            }
        } else { // Toggle all widgets on a page
            newConfig[page] = pageWidgets.map(widget => ({ ...widget, enabled: checked }));
        }
        return newConfig;
    });
  };

  const handleColorChange = (widgetId: string, childId: string, color: string) => {
    setWidgetColors(prev => ({
        ...prev,
        [widgetId]: {
            ...prev[widgetId],
            [childId]: color
        }
    }));
  };
  
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-6">
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <Palette className="h-5 w-5" />
          Personalização de Componentes
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecione e ordene elementos por página
        </p>
      </div>

      <div className="space-y-4">
        <PageCard
          page="dashboard"
          title="Dashboard"
          cardRef={dashboardCardRef}
          isExpanded={expandedSections.dashboard}
          layoutConfig={layoutConfig}
          widgetColors={widgetColors}
          onSectionToggle={handleSectionToggle}
          onToggle={handleToggle}
          onMove={handleMove}
          onToggleAll={handleToggleAll}
          onColorChange={handleColorChange}
        />
        <PageCard
          page="statistics"
          title="Estatísticas"
          cardRef={statisticsCardRef}
          isExpanded={expandedSections.statistics}
          layoutConfig={layoutConfig}
          widgetColors={widgetColors}
          onSectionToggle={handleSectionToggle}
          onToggle={handleToggle}
          onMove={handleMove}
          onToggleAll={handleToggleAll}
          onColorChange={handleColorChange}
        />
      </div>
    </div>
  );
};

export default DashboardCustomization;
