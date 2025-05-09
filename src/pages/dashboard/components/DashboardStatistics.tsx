
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatting';
import { Percent, Euro } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gestorApp-gray font-medium">Produto Mais Vendido</dt>
            <dd className="font-semibold text-gestorApp-gray-dark">
              {mostSoldProduct ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-gestorApp-gray-dark hover:text-blue-600"
                  onClick={() => mostSoldProduct && navigateToProductDetail(mostSoldProduct.id)}
                >
                  {mostSoldProduct.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gestorApp-gray font-medium">Cliente Mais Frequente</dt>
            <dd className="font-semibold text-gestorApp-gray-dark">
              {mostFrequentClient ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-gestorApp-gray-dark hover:text-blue-600"
                  onClick={() => mostFrequentClient && navigateToClientDetail(mostFrequentClient.id)}
                >
                  {mostFrequentClient.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gestorApp-gray font-medium">Fornecedor Mais Usado</dt>
            <dd className="font-semibold text-gestorApp-gray-dark">
              {mostUsedSupplier ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-gestorApp-gray-dark hover:text-blue-600"
                  onClick={() => mostUsedSupplier && navigateToSupplierDetail(mostUsedSupplier.id)}
                >
                  {mostUsedSupplier.name}
                </Button>
              ) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gestorApp-gray font-medium">Total Compras</dt>
            <dd className="font-semibold text-purple-600">
              {formatCurrency(totalPurchaseValue)}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gestorApp-gray font-medium">Total Vendas</dt>
            <dd className="font-semibold text-gestorApp-blue">
              {formatCurrency(totalSalesValue)}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gestorApp-gray font-medium">Lucro</dt>
            <dd className="font-semibold text-green-600">
              {formatCurrency(totalProfit)}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-gestorApp-gray font-medium">Margem de Lucro</dt>
            <dd className="font-semibold text-green-600">
              {profitMarginPercent.toFixed(2)}%
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="flex items-center text-gestorApp-gray font-medium">
              <Euro className="h-4 w-4 mr-1" /> ROI (€)
            </dt>
            <dd className="font-semibold text-green-600">
              {formatCurrency(roiValue)}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="flex items-center text-gestorApp-gray font-medium">
              <Percent className="h-4 w-4 mr-1" /> ROI (%)
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
