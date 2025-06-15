
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Palette, ArrowUp, ArrowDown, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';

// Types
export interface ChildConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  color?: string;
}

export interface WidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  children?: ChildConfig[];
}

export interface PageConfig {
  [key: string]: WidgetConfig[];
}

export interface LayoutConfig {
  dashboard: WidgetConfig[];
  statistics: WidgetConfig[];
}

// Default Configurations
const defaultQuickActions: ChildConfig[] = [
    { id: 'product', title: 'Novo Produto', enabled: true, order: 0, color: 'bg-orange-600' },
    { id: 'client', title: 'Novo Cliente', enabled: true, order: 1, color: 'bg-purple-600' },
    { id: 'order', title: 'Nova Encomenda', enabled: true, order: 2, color: 'bg-teal-600' },
    { id: 'purchase', title: 'Nova Compra', enabled: true, order: 3, color: 'bg-blue-600' },
    { id: 'sale', title: 'Nova Venda', enabled: true, order: 4, color: 'bg-green-600' },
    { id: 'expense', title: 'Nova Despesa', enabled: true, order: 5, color: 'bg-yellow-500' }
];

const defaultSummaryCards: ChildConfig[] = [
    { id: 'totalSales', title: 'Total de Vendas', enabled: true, order: 0 },
    { id: 'totalSpent', title: 'Total Gasto', enabled: true, order: 1 },
    { id: 'profit', title: 'Lucro', enabled: true, order: 2 },
    { id: 'profitMargin', title: 'Margem de Lucro', enabled: true, order: 3 }
];

const defaultLayoutConfig: LayoutConfig = {
  dashboard: [
    { id: 'quick-actions', title: 'Botões de Ações Rápidas', enabled: true, order: 0, children: defaultQuickActions },
    { id: 'summary-cards', title: 'Cartões de Métricas', enabled: true, order: 1, children: defaultSummaryCards },
    { id: 'sales-purchases-chart', title: 'Gráfico "Resumo Financeiro"', enabled: true, order: 2 },
    { id: 'low-stock-products', title: 'Produtos com Stock Baixo', enabled: true, order: 3 },
    { id: 'pending-orders', title: 'Encomendas Pendentes', enabled: true, order: 4 },
    { id: 'insufficient-stock-orders', title: 'Encomendas com Stock Insuficiente', enabled: true, order: 5 },
    { id: 'kpi-panel', title: 'Indicadores de Performance', enabled: true, order: 6 },
  ],
  statistics: [
    { id: 'kpi-grid', title: 'Grelha de KPIs', enabled: true, order: 0 },
    { id: 'featured-products', title: 'Tabela de Top Produtos', enabled: true, order: 1 },
    { id: 'support-chart-resumo', title: 'Gráfico de Resumo Financeiro', enabled: true, order: 2 },
    { id: 'dashboard-statistics', title: 'Estatísticas do Dashboard', enabled: true, order: 3 },
    { id: 'recent-transactions', title: 'Transações Recentes', enabled: true, order: 4 },
    { id: 'metrics-cards', title: 'Cartões de Métricas', enabled: true, order: 5 },
    { id: 'product-category-chart', title: 'Gráfico de Produtos por Categoria', enabled: true, order: 6 },
  ],
};

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
        parentWidget.children = reorderedItems as ChildConfig[];
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
                const updatedChildren = pageWidgets[widgetIndex].children.map(child => ({ ...child, enabled: checked }));
                pageWidgets[widgetIndex] = { ...pageWidgets[widgetIndex], children: updatedChildren };
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

  const colorOptions = [
    { name: 'Padrão', value: '' },
    { name: 'Azul', value: 'bg-blue-600' },
    { name: 'Verde', value: 'bg-green-600' },
    { name: 'Vermelho', value: 'bg-red-600' },
    { name: 'Roxo', value: 'bg-purple-600' },
    { name: 'Laranja', value: 'bg-orange-600' },
    { name: 'Amarelo', value: 'bg-yellow-500' },
    { name: 'Rosa', value: 'bg-pink-600' },
    { name: 'Turquesa', value: 'bg-teal-600' },
    { name: 'Cinza', value: 'bg-gray-600' }
  ];

  const renderWidgetsList = (items: (WidgetConfig | ChildConfig)[], page: keyof LayoutConfig, parentId?: string) => {
    const allChecked = items.every(item => item.enabled);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Checkbox
              id={`toggle-all-${page}-${parentId || 'parent'}`}
              checked={allChecked}
              onCheckedChange={(checked) => handleToggleAll(page, Boolean(checked), parentId)}
            />
            <label htmlFor={`toggle-all-${page}-${parentId || 'parent'}`} className="text-sm font-medium">
              {allChecked ? 'Desmarcar Todos' : 'Marcar Todos'}
            </label>
          </div>
        </div>
        
        <div className="space-y-2">
          {items.sort((a,b) => a.order - b.order).map((item, index) => {
            const isChild = 'color' in item || parentId;
            const widget = item as WidgetConfig;
            const child = item as ChildConfig;
            const defaultColor = (isChild && child.color) ? child.color : '';
            const selectedColor = parentId && widgetColors[parentId]?.[child.id] ? widgetColors[parentId]?.[child.id] : defaultColor;

            if (widget.children) {
              return (
                <div key={widget.id} className="border rounded-lg bg-card">
                  <div className="flex items-center space-x-3 p-3 border-b">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Checkbox
                      id={`${page}-${widget.id}`}
                      checked={widget.enabled}
                      onCheckedChange={() => handleToggle(page, widget.id)}
                    />
                    <span className="flex-1 text-sm font-medium">{widget.title}</span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleMove(page, widget.id, 'up')} disabled={index === 0} className="h-7 w-7 p-0">
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleMove(page, widget.id, 'down')} disabled={index === items.length - 1} className="h-7 w-7 p-0">
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    {renderWidgetsList(widget.children, page, widget.id)}
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <Checkbox
                  id={`${page}-${parentId || ''}-${item.id}`}
                  checked={item.enabled}
                  onCheckedChange={() => handleToggle(page, parentId || item.id, parentId ? item.id : undefined)}
                />
                <span className="flex-1 text-sm font-medium">{item.title}</span>

                {isChild && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Cor:</span>
                    <select
                      value={selectedColor}
                      onChange={(e) => parentId && handleColorChange(parentId, child.id, e.target.value)}
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
                  <Button variant="ghost" size="sm" onClick={() => handleMove(page, parentId || item.id, 'up', parentId ? item.id : undefined)} disabled={index === 0} className="h-7 w-7 p-0">
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleMove(page, parentId || item.id, 'down', parentId ? item.id : undefined)} disabled={index === items.length - 1} className="h-7 w-7 p-0">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPageCard = (page: keyof LayoutConfig, title: string, ref: React.RefObject<HTMLDivElement>) => {
    const isExpanded = expandedSections[page];
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <Card ref={ref} className="border-l-4 border-l-primary">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleSectionToggle(page)}
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
            {renderWidgetsList(layoutConfig[page], page)}
          </CardContent>
        )}
      </Card>
    );
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
        {renderPageCard('dashboard', 'Dashboard', dashboardCardRef)}
        {renderPageCard('statistics', 'Estatísticas', statisticsCardRef)}
      </div>
    </div>
  );
};

export default DashboardCustomization;
