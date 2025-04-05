
import React from 'react';
import { useData } from '../contexts/DataContext';
import { getDashboardData } from '../data/mockData';
import AppLayout from '../components/layouts/AppLayout';
import PageHeader from '../components/ui/PageHeader';
import { Package, Users, Truck, TrendingUp, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';

const DashboardPage: React.FC = () => {
  const { products, suppliers, clients, stockEntries, stockExits } = useData();
  const dashboardData = getDashboardData();
  
  const monthlyData = new Map();
  
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
    monthlyData.set(monthKey, {
      name: month.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
      vendas: 0,
      compras: 0
    });
  }
  
  stockExits.forEach(exit => {
    const date = new Date(exit.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (monthlyData.has(monthKey)) {
      const current = monthlyData.get(monthKey);
      monthlyData.set(monthKey, {
        ...current,
        vendas: current.vendas + (exit.quantity * exit.salePrice)
      });
    }
  });
  
  stockEntries.forEach(entry => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (monthlyData.has(monthKey)) {
      const current = monthlyData.get(monthKey);
      monthlyData.set(monthKey, {
        ...current,
        compras: current.compras + (entry.quantity * entry.purchasePrice)
      });
    }
  });
  
  const chartData = Array.from(monthlyData.values());
  
  const categoryCounts = products.reduce((acc, product) => {
    const { category } = product;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
    name: category,
    quantidade: count
  }));

  return (
    <AppLayout>
      <PageHeader 
        title="Dashboard" 
        description="Vista geral do seu negócio"
      />
      
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
              {formatCurrency(dashboardData.totalStockValue)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Vendas e Compras (últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Período: ${label}`} 
                />
                <Legend />
                <Line type="monotone" dataKey="vendas" stroke="#1a56db" name="Vendas" />
                <Line type="monotone" dataKey="compras" stroke="#9333ea" name="Compras" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Produtos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} produto(s)`, '']}
                  labelFormatter={(label) => `Categoria: ${label}`} 
                />
                <Legend />
                <Bar dataKey="quantidade" fill="#1a56db" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Stock Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gestorApp-gray">Código: {product.code}</div>
                      </div>
                    </div>
                    <div className="text-red-600 font-medium">{product.currentStock} unidades</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gestorApp-gray">
                Não existem produtos com stock baixo.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="entry">Entradas</TabsTrigger>
                <TabsTrigger value="exit">Saídas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <ul className="space-y-3">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <li key={transaction.id} className="flex justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="font-medium">{transaction.product?.name}</div>
                        <div className="text-sm text-gestorApp-gray">
                          {transaction.type === 'entry' ? 'Fornecedor' : 'Cliente'}: {transaction.entity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={transaction.type === 'entry' ? 'text-purple-600' : 'text-gestorApp-blue'}>
                          {transaction.type === 'entry' ? '+ ' : '- '}
                          {transaction.quantity} unidades
                        </div>
                        <div className="text-sm text-gestorApp-gray">{formatDate(transaction.date)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="entry">
                <ul className="space-y-3">
                  {dashboardData.recentTransactions
                    .filter(t => t.type === 'entry')
                    .map((transaction) => (
                      <li key={transaction.id} className="flex justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium">{transaction.product?.name}</div>
                          <div className="text-sm text-gestorApp-gray">
                            Fornecedor: {transaction.entity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-600">
                            + {transaction.quantity} unidades
                          </div>
                          <div className="text-sm text-gestorApp-gray">{formatDate(transaction.date)}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="exit">
                <ul className="space-y-3">
                  {dashboardData.recentTransactions
                    .filter(t => t.type === 'exit')
                    .map((transaction) => (
                      <li key={transaction.id} className="flex justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium">{transaction.product?.name}</div>
                          <div className="text-sm text-gestorApp-gray">
                            Cliente: {transaction.entity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gestorApp-blue">
                            - {transaction.quantity} unidades
                          </div>
                          <div className="text-sm text-gestorApp-gray">{formatDate(transaction.date)}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <dt className="text-gestorApp-gray font-medium">Produto Mais Vendido</dt>
                <dd className="font-semibold text-gestorApp-gray-dark">
                  {dashboardData.mostSoldProduct?.name || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-gestorApp-gray font-medium">Cliente Mais Frequente</dt>
                <dd className="font-semibold text-gestorApp-gray-dark">
                  {dashboardData.mostFrequentClient?.name || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-gestorApp-gray font-medium">Fornecedor Mais Usado</dt>
                <dd className="font-semibold text-gestorApp-gray-dark">
                  {dashboardData.mostUsedSupplier?.name || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-gestorApp-gray font-medium">Total Vendas</dt>
                <dd className="font-semibold text-gestorApp-blue">
                  {formatCurrency(dashboardData.totalSalesValue)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Produtos em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 text-gestorApp-gray font-medium">Produto</th>
                    <th className="text-right pb-2 text-gestorApp-gray font-medium">Stock</th>
                    <th className="text-right pb-2 text-gestorApp-gray font-medium">Preço de Venda</th>
                    <th className="text-right pb-2 text-gestorApp-gray font-medium">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .sort((a, b) => (b.currentStock * b.salePrice) - (a.currentStock * a.salePrice))
                    .slice(0, 5)
                    .map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gestorApp-gray">{product.category}</div>
                        </td>
                        <td className="py-3 text-right">{product.currentStock} un.</td>
                        <td className="py-3 text-right">{formatCurrency(product.salePrice)}</td>
                        <td className="py-3 text-right font-medium">
                          {formatCurrency(product.currentStock * product.salePrice)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
