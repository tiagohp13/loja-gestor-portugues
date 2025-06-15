import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Palette, ArrowUp, ArrowDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface CardConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

export interface QuickActionConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  color: string;
}

const DashboardCustomization: React.FC = () => {
  // Default configurations
  const defaultCardConfig: CardConfig[] = [
    { id: 'totalSales', title: 'Total de Vendas', enabled: true, order: 0 },
    { id: 'totalSpent', title: 'Total Gasto', enabled: true, order: 1 },
    { id: 'profit', title: 'Lucro', enabled: true, order: 2 },
    { id: 'profitMargin', title: 'Margem de Lucro', enabled: true, order: 3 }
  ];

  const defaultQuickActions: QuickActionConfig[] = [
    { id: 'product', title: 'Novo Produto', enabled: true, order: 0, color: 'bg-orange-600' },
    { id: 'client', title: 'Novo Cliente', enabled: true, order: 1, color: 'bg-purple-600' },
    { id: 'order', title: 'Nova Encomenda', enabled: true, order: 2, color: 'bg-teal-600' },
    { id: 'purchase', title: 'Nova Compra', enabled: true, order: 3, color: 'bg-blue-600' },
    { id: 'sale', title: 'Nova Venda', enabled: true, order: 4, color: 'bg-green-600' },
    { id: 'expense', title: 'Nova Despesa', enabled: true, order: 5, color: 'bg-yellow-500' }
  ];

  const [cardConfig, setCardConfig] = useState<CardConfig[]>(() => {
    const saved = localStorage.getItem('dashboard-card-config');
    return saved ? JSON.parse(saved) : defaultCardConfig;
  });

  const [quickActionConfig, setQuickActionConfig] = useState<QuickActionConfig[]>(() => {
    const saved = localStorage.getItem('dashboard-quick-actions-config');
    return saved ? JSON.parse(saved) : defaultQuickActions;
  });

  const [cardColors, setCardColors] = useState(() => {
    const saved = localStorage.getItem('dashboard-card-colors');
    return saved ? JSON.parse(saved) : {};
  });

  const [quickActionColors, setQuickActionColors] = useState(() => {
    const saved = localStorage.getItem('dashboard-quick-action-colors');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('dashboard-card-config', JSON.stringify(cardConfig));
  }, [cardConfig]);

  useEffect(() => {
    localStorage.setItem('dashboard-quick-actions-config', JSON.stringify(quickActionConfig));
  }, [quickActionConfig]);

  useEffect(() => {
    localStorage.setItem('dashboard-card-colors', JSON.stringify(cardColors));
  }, [cardColors]);

  useEffect(() => {
    localStorage.setItem('dashboard-quick-action-colors', JSON.stringify(quickActionColors));
  }, [quickActionColors]);

  const handleToggleCard = (cardId: string) => {
    setCardConfig(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, enabled: !card.enabled }
          : card
      )
    );
  };

  const handleToggleQuickAction = (actionId: string) => {
    setQuickActionConfig(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, enabled: !action.enabled }
          : action
      )
    );
  };

  const moveCard = (cardId: string, direction: 'up' | 'down') => {
    const currentIndex = cardConfig.findIndex(card => card.id === cardId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === cardConfig.length - 1)
    ) {
      return;
    }

    const newConfig = [...cardConfig];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newConfig[currentIndex], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[currentIndex]];
    
    newConfig.forEach((card, index) => {
      card.order = index;
    });

    setCardConfig(newConfig);
  };

  const moveQuickAction = (actionId: string, direction: 'up' | 'down') => {
    const currentIndex = quickActionConfig.findIndex(action => action.id === actionId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === quickActionConfig.length - 1)
    ) {
      return;
    }

    const newConfig = [...quickActionConfig];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newConfig[currentIndex], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[currentIndex]];
    
    newConfig.forEach((action, index) => {
      action.order = index;
    });

    setQuickActionConfig(newConfig);
  };

  const handleToggleAll = (type: 'cards' | 'actions', checked: boolean) => {
    if (type === 'cards') {
      setCardConfig(prev => prev.map(c => ({ ...c, enabled: checked })));
    } else {
      setQuickActionConfig(prev => prev.map(a => ({ ...a, enabled: checked })));
    }
  };

  const allCardsChecked = cardConfig.every(c => c.enabled);
  const allActionsChecked = quickActionConfig.every(a => a.enabled);

  const colorOptions = [
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalização de Cartões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['metric-cards', 'quick-actions']} className="w-full">
            <AccordionItem value="metric-cards">
              <AccordionTrigger>Cartões Métricos</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex items-center space-x-3 p-3">
                  <Checkbox
                    id="toggle-all-cards"
                    checked={allCardsChecked}
                    onCheckedChange={(checked) => handleToggleAll('cards', Boolean(checked))}
                  />
                  <label htmlFor="toggle-all-cards" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {allCardsChecked ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </label>
                </div>
                <div className="space-y-2">
                  {cardConfig.map((card, index) => (
                    <div key={card.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
                      <Checkbox
                        checked={card.enabled}
                        onCheckedChange={() => handleToggleCard(card.id)}
                      />
                      <span className="flex-1 text-sm font-medium">{card.title}</span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveCard(card.id, 'up')}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveCard(card.id, 'down')}
                          disabled={index === cardConfig.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="quick-actions">
              <AccordionTrigger>Botões de Ações Rápidas</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex items-center space-x-3 p-3">
                  <Checkbox
                    id="toggle-all-actions"
                    checked={allActionsChecked}
                    onCheckedChange={(checked) => handleToggleAll('actions', Boolean(checked))}
                  />
                  <label htmlFor="toggle-all-actions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {allActionsChecked ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </label>
                </div>
                <div className="space-y-2">
                  {quickActionConfig.map((action, index) => (
                    <div key={action.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
                      <Checkbox
                        checked={action.enabled}
                        onCheckedChange={() => handleToggleQuickAction(action.id)}
                      />
                      <span className="flex-1 text-sm font-medium">{action.title}</span>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Cor:</span>
                        <select
                          value={quickActionColors[action.id] || action.color}
                          onChange={(e) => setQuickActionColors(prev => ({ ...prev, [action.id]: e.target.value }))}
                          className="text-xs border rounded px-2 py-1 bg-background"
                        >
                          {colorOptions.map(color => (
                            <option key={color.value} value={color.value}>
                              {color.name}
                            </option>
                          ))}
                        </select>
                        <div 
                          className={`w-4 h-4 rounded ${quickActionColors[action.id] || action.color}`}
                        />
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveQuickAction(action.id, 'up')}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveQuickAction(action.id, 'down')}
                          disabled={index === quickActionConfig.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCustomization;
