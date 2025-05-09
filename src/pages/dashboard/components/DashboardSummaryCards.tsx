
import React from 'react';
import { Package, Users, Truck, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatting';
import { Product, Client, Supplier } from '@/types';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
          <CardTitle className="text-sm font-medium text-gestorApp-gray">Total Produtos</CardTitle>
          <Package className="h-4 w-4 text-gestorApp-blue" />
        </CardHeader>
        <CardContent className="px-6 pt-0">
          <div className="text-2xl font-bold text-gestorApp-gray-dark">{products.length}</div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
          <CardTitle className="text-sm font-medium text-gestorApp-gray">Total Clientes</CardTitle>
          <Users className="h-4 w-4 text-gestorApp-blue" />
        </CardHeader>
        <CardContent className="px-6 pt-0">
          <div className="text-2xl font-bold text-gestorApp-gray-dark">{clients.length}</div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
          <CardTitle className="text-sm font-medium text-gestorApp-gray">Total Fornecedores</CardTitle>
          <Truck className="h-4 w-4 text-gestorApp-blue" />
        </CardHeader>
        <CardContent className="px-6 pt-0">
          <div className="text-2xl font-bold text-gestorApp-gray-dark">{suppliers.length}</div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
          <CardTitle className="text-sm font-medium text-gestorApp-gray">Valor do Stock</CardTitle>
          <TrendingUp className="h-4 w-4 text-gestorApp-blue" />
        </CardHeader>
        <CardContent className="px-6 pt-0">
          <div className="text-2xl font-bold text-gestorApp-gray-dark">
            {formatCurrency(totalStockValue)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummaryCards;
