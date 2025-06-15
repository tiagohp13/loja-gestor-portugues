
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, Users, FileText, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Novo Produto',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => navigate('/produtos/novo'),
      color: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
      description: 'Adicionar novo produto'
    },
    {
      title: 'Novo Cliente',
      icon: <Users className="h-4 w-4" />,
      onClick: () => navigate('/clientes/novo'),
      color: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
      description: 'Adicionar novo cliente'
    },
    {
      title: 'Nova Encomenda',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => navigate('/encomendas/nova'),
      color: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
      description: 'Criar nova encomenda'
    },
    {
      title: 'Nova Compra',
      icon: <Package className="h-4 w-4" />,
      onClick: () => navigate('/entradas/nova'),
      color: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      description: 'Registrar nova entrada de stock'
    },
    {
      title: 'Nova Venda',
      icon: <ShoppingCart className="h-4 w-4" />,
      onClick: () => navigate('/saidas/nova'),
      color: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      description: 'Registrar nova saída de stock'
    },
    {
      title: 'Nova Despesa',
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => navigate('/despesas/nova'),
      color: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500',
      description: 'Registrar nova despesa'
    }
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white h-auto p-3 flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-105 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2`}
              title={action.description}
              size="sm"
            >
              {action.icon}
              <span className="text-xs font-medium leading-tight text-center">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
