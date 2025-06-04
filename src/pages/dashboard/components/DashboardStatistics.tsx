
import React from 'react';
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
  // New props that include expenses
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
  totalPurchaseValue,
  totalSalesValue,
  totalProfit,
  profitMarginPercent,
  roiValue,
  roiPercent,
  totalSpentWithExpenses,
  totalProfitWithExpenses,
  profitMarginPercentWithExpenses,
  roiValueWithExpenses,
  roiPercentWithExpenses,
  navigateToProductDetail,
  navigateToClientDetail,
  navigateToSupplierDetail
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Estatísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <dt className="text-gray-500 font-medium text-left">Produto Mais Vendido</dt>
            <dd className="text-gray-800 text-right w-auto">
              {mostSoldProduct ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-500 hover:underline transition-colors text-right w-full justify-end"
                  onClick={() => mostSoldProduct && navigateToProductDetail(mostSoldProduct.id)}
                >
                  {mostSoldProduct.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <dt className="text-gray-500 font-medium text-left">Cliente Mais Frequente</dt>
            <dd className="text-gray-800 text-right w-auto">
              {mostFrequentClient ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-500 hover:underline transition-colors text-right w-full justify-end"
                  onClick={() => mostFrequentClient && navigateToClientDetail(mostFrequentClient.id)}
                >
                  {mostFrequentClient.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <dt className="text-gray-500 font-medium text-left">Fornecedor Mais Usado</dt>
            <dd className="text-gray-800 text-right w-auto">
              {mostUsedSupplier ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-500 hover:underline transition-colors text-right w-full justify-end"
                  onClick={() => mostUsedSupplier && navigateToSupplierDetail(mostUsedSupplier.id)}
                >
                  {mostUsedSupplier.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <dt className="text-gray-500 font-medium text-left">Total Gasto</dt>
            <dd className="font-semibold text-red-500 text-right">
              {formatCurrency(totalSpentWithExpenses)}
            </dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <dt className="text-gray-500 font-medium text-left">Total Vendas</dt>
            <dd className="font-semibold text-green-600 text-right">
              {formatCurrency(totalSalesValue)}
            </dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <dt className="text-gray-500 font-medium text-left">Lucro</dt>
            <dd className="font-semibold text-green-600 text-right">
              {formatCurrency(totalProfitWithExpenses)}
            </dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <dt className="text-gray-500 font-medium text-left">Margem de Lucro</dt>
            <dd className="font-semibold text-green-600 text-right">
              {profitMarginPercentWithExpenses.toFixed(2)}%
            </dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <dt className="flex items-center text-gray-500 font-medium text-left">
              ROI (€)
            </dt>
            <dd className="font-semibold text-green-600 text-right">
              {formatCurrency(roiValueWithExpenses)}
            </dd>
          </div>
          <div className="flex justify-between items-center py-2">
            <dt className="flex items-center text-gray-500 font-medium text-left">
              ROI (%)
            </dt>
            <dd className="font-semibold text-green-600 text-right">
              {roiPercentWithExpenses.toFixed(2)}%
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default DashboardStatistics;
