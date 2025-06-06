import React from 'react';
import { Package, Users, Truck, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { Product, Client, Supplier } from '@/types/';
import DashboardSummaryCard from './DashboardSummaryCard';
import { DashboardCardData } from '@/types/dashboard';

interface DashboardSummaryCardsProps {
  products: Product[];
  clients: Client[];
  suppliers: Supplier[];
  totalStockValue: number;
}

const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  products,
  clients,
  suppliers,
  totalStockValue
}) => {
  const cards: DashboardCardData[] = [
    {
      title: 'Total Produtos',
      value: products.length,
      icon: <Package className="h-6 w-6" />,
      navigateTo: '/produtos/consultar',
      iconColor: 'text-blue-500',
      iconBackground: 'bg-blue-100'
    },
    {
      title: 'Total Clientes',
      value: clients.length,
      icon: <Users className="h-6 w-6" />,
      navigateTo: '/clientes/consultar',
      iconColor: 'text-green-500',
      iconBackground: 'bg-green-100'
    },
    {
      title: 'Total Fornecedores',
      value: suppliers.length,
      icon: <Truck className="h-6 w-6" />,
      navigateTo: '/fornecedores/consultar',
      iconColor: 'text-orange-500',
      iconBackground: 'bg-orange-100'
    },
    {
      title: 'Valor do Stock',
      value: formatCurrency(totalStockValue),
      icon: <TrendingUp className="h-6 w-6" />,
      navigateTo: '/produtos/consultar',
      iconColor: 'text-purple-500',
      iconBackground: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="min-h-[120px] hover:shadow-lg transition-shadow"
        >
          <DashboardSummaryCard cardData={card} />
        </div>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
