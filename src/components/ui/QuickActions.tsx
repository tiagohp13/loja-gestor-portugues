
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, Users, FileText, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  // Load configuration from localStorage
  const getQuickActionConfig = () => {
    const defaultActions = [
      {
        id: 'product',
        title: 'Novo Produto',
        icon: <Plus className="h-3 w-3" />,
        onClick: () => navigate('/produtos/novo'),
        color: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
        description: 'Adicionar novo produto'
      },
      {
        id: 'client',
        title: 'Novo Cliente',
        icon: <Users className="h-3 w-3" />,
        onClick: () => navigate('/clientes/novo'),
        color: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
        description: 'Adicionar novo cliente'
      },
      {
        id: 'order',
        title: 'Nova Encomenda',
        icon: <FileText className="h-3 w-3" />,
        onClick: () => navigate('/encomendas/nova'),
        color: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
        description: 'Criar nova encomenda'
      },
      {
        id: 'purchase',
        title: 'Nova Compra',
        icon: <Package className="h-3 w-3" />,
        onClick: () => navigate('/entradas/nova'),
        color: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        description: 'Registrar nova entrada de stock'
      },
      {
        id: 'sale',
        title: 'Nova Venda',
        icon: <ShoppingCart className="h-3 w-3" />,
        onClick: () => navigate('/saidas/nova'),
        color: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        description: 'Registrar nova saída de stock'
      },
      {
        id: 'expense',
        title: 'Nova Despesa',
        icon: <Receipt className="h-3 w-3" />,
        onClick: () => navigate('/despesas/nova'),
        color: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
        description: 'Registrar nova despesa'
      }
    ];

    const savedConfig = localStorage.getItem('dashboard-quick-actions-config');
    const savedColors = localStorage.getItem('dashboard-quick-action-colors');
    
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      const colors = savedColors ? JSON.parse(savedColors) : {};
      
      return defaultActions
        .map(action => {
          const configItem = config.find(c => c.id === action.id);
          if (!configItem) return null;
          
          const customColor = colors[action.id];
          let colorClasses = action.color;
          
          if (customColor) {
            const baseColor = customColor.replace('bg-', '');
            colorClasses = `${customColor} hover:${customColor.replace('bg-', 'bg-').replace('-600', '-700').replace('-500', '-600')} focus:ring-${baseColor.replace('-600', '-500').replace('-500', '-400')}`;
          }
          
          return {
            ...action,
            enabled: configItem.enabled,
            order: configItem.order,
            color: colorClasses
          };
        })
        .filter(action => action && action.enabled)
        .sort((a, b) => a.order - b.order);
    }
    
    return defaultActions;
  };

  const actions = getQuickActionConfig();

  return (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {actions.map((action, index) => (
            <Button
              key={action.id || index}
              onClick={action.onClick}
              className={`${action.color} text-white h-auto p-2 flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2`}
              title={action.description}
              size="sm"
            >
              {action.icon}
              <span className="text-[10px] font-medium leading-tight text-center">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
