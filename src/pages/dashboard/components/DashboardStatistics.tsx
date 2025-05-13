
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
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gray-500 font-medium">Produto Mais Vendido</dt>
            <dd className="text-gray-800">
              {mostSoldProduct ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-500 hover:underline transition-colors"
                  onClick={() => mostSoldProduct && navigateToProductDetail(mostSoldProduct.id)}
                >
                  {mostSoldProduct.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gray-500 font-medium">Cliente Mais Frequente</dt>
            <dd className="text-gray-800">
              {mostFrequentClient ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-500 hover:underline transition-colors"
                  onClick={() => mostFrequentClient && navigateToClientDetail(mostFrequentClient.id)}
                >
                  {mostFrequentClient.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gray-500 font-medium">Fornecedor Mais Usado</dt>
            <dd className="text-gray-800">
              {mostUsedSupplier ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-500 hover:underline transition-colors"
                  onClick={() => mostUsedSupplier && navigateToSupplierDetail(mostUsedSupplier.id)}
                >
                  {mostUsedSupplier.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gray-500 font-medium">Total Compras</dt>
            <dd className="font-semibold text-red-500">
              {formatCurrency(totalPurchaseValue)}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gray-500 font-medium">Total Vendas</dt>
            <dd className="font-semibold text-green-600">
              {formatCurrency(totalSalesValue)}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gray-500 font-medium">Lucro</dt>
            <dd className="font-semibold text-green-600">
              {formatCurrency(totalProfit)}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gray-500 font-medium">Margem de Lucro</dt>
            <dd className="font-semibold text-green-600">
              {profitMarginPercent.toFixed(2)}%
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="flex items-center text-gray-500 font-medium">
              ROI (€)
            </dt>
            <dd className="font-semibold text-green-600">
              {formatCurrency(roiValue)}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="flex items-center text-gray-500 font-medium">
              ROI (%)
            </dt>
            <dd className="font-semibold text-green-600">
              {roiPercent.toFixed(2)}%
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default DashboardStatistics;
