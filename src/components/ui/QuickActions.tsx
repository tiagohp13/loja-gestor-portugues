
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Nova Venda',
      icon: <ShoppingCart className="h-4 w-4" />,
      onClick: () => navigate('/saidas/nova'),
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Registrar nova saída de stock'
    },
    {
      title: 'Nova Compra',
      icon: <Package className="h-4 w-4" />,
      onClick: () => navigate('/entradas/nova'),
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Registrar nova entrada de stock'
    },
    {
      title: 'Novo Cliente',
      icon: <Users className="h-4 w-4" />,
      onClick: () => navigate('/clientes/novo'),
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Adicionar novo cliente'
    },
    {
      title: 'Novo Produto',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => navigate('/produtos/novo'),
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Adicionar novo produto'
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 shadow-sm`}
              title={action.description}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
