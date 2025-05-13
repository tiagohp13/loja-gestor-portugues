
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

// Mock data for monthly variations
// In a real implementation, this would come from the API or be calculated
const getMockVariationData = (current: number, entity: string): { 
  previousValue: number;
  previousMonth: string;
} => {
  // Calculate previous month
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const previousMonth = date.toLocaleDateString('pt-PT', { month: 'long' });
  
  // For demo purposes, generate a random previous value
  // In a real implementation, this would be actual historical data
  const variationPercent = Math.random() * 0.2 - 0.1; // Between -10% and +10%
  const previousValue = Math.round(current / (1 + variationPercent));
  
  return {
    previousValue,
    previousMonth
  };
};

const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  products,
  clients,
  suppliers,
  totalStockValue
}) => {
  // Create variation data for each metric
  const productsVariation = getMockVariationData(products.length, 'products');
  const clientsVariation = getMockVariationData(clients.length, 'clients');
  const suppliersVariation = getMockVariationData(suppliers.length, 'suppliers');
  const stockValueVariation = getMockVariationData(totalStockValue, 'stockValue');
  
  const cards: DashboardCardData[] = [
    {
      title: 'Total Produtos',
      value: products.length,
      icon: <Package className="h-6 w-6" />,
      variation: {
        currentValue: products.length,
        previousValue: productsVariation.previousValue,
        percentChange: ((products.length - productsVariation.previousValue) / productsVariation.previousValue) * 100,
        absoluteChange: products.length - productsVariation.previousValue,
        previousMonth: productsVariation.previousMonth
      },
      navigateTo: '/produtos/consultar',
      iconColor: 'text-blue-500',
      iconBackground: 'bg-blue-100'
    },
    {
      title: 'Total Clientes',
      value: clients.length,
      icon: <Users className="h-6 w-6" />,
      variation: {
        currentValue: clients.length,
        previousValue: clientsVariation.previousValue,
        percentChange: ((clients.length - clientsVariation.previousValue) / clientsVariation.previousValue) * 100,
        absoluteChange: clients.length - clientsVariation.previousValue,
        previousMonth: clientsVariation.previousMonth
      },
      navigateTo: '/clientes/consultar',
      iconColor: 'text-green-500',
      iconBackground: 'bg-green-100'
    },
    {
      title: 'Total Fornecedores',
      value: suppliers.length,
      icon: <Truck className="h-6 w-6" />,
      variation: {
        currentValue: suppliers.length,
        previousValue: suppliersVariation.previousValue,
        percentChange: ((suppliers.length - suppliersVariation.previousValue) / suppliersVariation.previousValue) * 100,
        absoluteChange: suppliers.length - suppliersVariation.previousValue,
        previousMonth: suppliersVariation.previousMonth
      },
      navigateTo: '/fornecedores/consultar',
      iconColor: 'text-orange-500',
      iconBackground: 'bg-orange-100'
    },
    {
      title: 'Valor do Stock',
      value: formatCurrency(totalStockValue),
      icon: <TrendingUp className="h-6 w-6" />,
      variation: {
        currentValue: totalStockValue,
        previousValue: stockValueVariation.previousValue,
        percentChange: ((totalStockValue - stockValueVariation.previousValue) / stockValueVariation.previousValue) * 100,
        absoluteChange: totalStockValue - stockValueVariation.previousValue,
        previousMonth: stockValueVariation.previousMonth
      },
      navigateTo: '/produtos/consultar',
      iconColor: 'text-purple-500',
      iconBackground: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <DashboardSummaryCard key={index} cardData={card} />
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
