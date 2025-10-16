import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatting';
import { Client, Supplier, Product } from '@/types';

interface DashboardStatisticsProps {
  mostSoldProduct: Product | undefined;
  mostFrequentClient: Client | undefined;
  mostUsedSupplier: Supplier | undefined;
  totalPurchaseValue: number;
  totalSalesValue: number;
  totalProfit: number;
  profitMarginPercent: number;
  roiValue: number;
  roiPercent: number;
  totalSpentWithExpenses: number;
  totalProfitWithExpenses: number;
  profitMarginPercentWithExpenses: number;
  roiValueWithExpenses: number;
  roiPercentWithExpenses: number;
  navigateToProductDetail: (id: string) => void;
  navigateToClientDetail: (id: string) => void;
  navigateToSupplierDetail: (id: string) => void;
}

const DashboardStatistics: React.FC<DashboardStatisticsProps> = ({
  mostSoldProduct,
  mostFrequentClient,
  mostUsedSupplier,
  totalSalesValue,
  totalSpentWithExpenses,
  totalProfitWithExpenses,
  profitMarginPercentWithExpenses,
  roiValueWithExpenses,
  roiPercentWithExpenses,
  navigateToProductDetail,
  navigateToClientDetail,
  navigateToSupplierDetail
}) => {
  const statisticsData = useMemo(() => [
    {
      label: 'Produto Mais Vendido',
      value: mostSoldProduct,
      type: 'product' as const
    },
    {
      label: 'Cliente Mais Frequente',
      value: mostFrequentClient,
      type: 'client' as const
    },
    {
      label: 'Fornecedor Mais Usado',
      value: mostUsedSupplier,
      type: 'supplier' as const
    },
    {
      label: 'Total Gasto',
      value: formatCurrency(totalSpentWithExpenses),
      className: 'text-red-500'
    },
    {
      label: 'Total Vendas',
      value: formatCurrency(totalSalesValue),
      className: 'text-green-600'
    },
    {
      label: 'Lucro',
      value: formatCurrency(totalProfitWithExpenses),
      className: 'text-green-600'
    },
    {
      label: 'Margem de Lucro',
      value: `${profitMarginPercentWithExpenses.toFixed(2)}%`,
      className: 'text-green-600'
    },
    {
      label: 'ROI (€)',
      value: formatCurrency(roiValueWithExpenses),
      className: 'text-green-600'
    },
    {
      label: 'ROI (%)',
      value: `${roiPercentWithExpenses.toFixed(2)}%`,
      className: 'text-green-600',
      noBorder: true
    }
  ], [
    mostSoldProduct,
    mostFrequentClient,
    mostUsedSupplier,
    totalSalesValue,
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses,
    roiValueWithExpenses,
    roiPercentWithExpenses
  ]);

  const handleNavigation = (type: 'product' | 'client' | 'supplier', id: string) => {
    const navigationMap = {
      product: navigateToProductDetail,
      client: navigateToClientDetail,
      supplier: navigateToSupplierDetail
    };
    navigationMap[type]?.(id);
  };
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Estatísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          {statisticsData.map((stat, index) => (
            <div 
              key={index}
              className={`flex justify-between items-center py-2 ${stat.noBorder ? '' : 'border-b'}`}
            >
              <dt className="text-gray-500 font-medium text-left">{stat.label}</dt>
              <dd className={`font-semibold text-right ${stat.className || 'text-gray-800'}`}>
                {stat.type && stat.value && typeof stat.value === 'object' ? (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-500 hover:underline transition-colors text-right w-full justify-end"
                    onClick={() => handleNavigation(stat.type!, (stat.value as any).id)}
                  >
                    {(stat.value as any).name}
                  </Button>
                ) : (
                  (typeof stat.value === 'string' ? stat.value : 'N/A')
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

export default DashboardStatistics;
