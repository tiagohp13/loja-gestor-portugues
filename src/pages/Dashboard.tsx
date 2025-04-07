
import React from 'react';
import { useData } from '../contexts/DataContext';
import { getDashboardData } from '../data/mockData';
import PageHeader from '../components/ui/PageHeader';
import { Package, Users, Truck, TrendingUp, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';

const DashboardPage: React.FC = () => {
  const { products, suppliers, clients, stockEntries, stockExits } = useData();
  const dashboardData = getDashboardData();
  
  // Ensure dates are properly converted for charting
  const ensureDate = (dateInput: string | Date): Date => {
    return dateInput instanceof Date ? dateInput : new Date(dateInput);
  };
  
  // Calculate monthly data for chart
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
  
  // Calculate sales data
  stockExits.forEach(exit => {
    const date = ensureDate(exit.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (monthlyData.has(monthKey)) {
      const current = monthlyData.get(monthKey);
      monthlyData.set(monthKey, {
        ...current,
        vendas: current.vendas + (exit.quantity * exit.salePrice)
      });
    }
  });
  
  // Calculate purchase data
  stockEntries.forEach(entry => {
    const date = ensureDate(entry.date);
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
  
  // Count products by category
  const categoryCounts = products.reduce((acc, product) => {
    const { category } = product;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
    name: category || 'Sem categoria',
    quantidade: count
  }));
  
  // Calculate products with low stock
  const lowStockProducts = products.filter(product => 
    product.currentStock <= (product.minStock || 0) && product.minStock > 0
  );
  
  // Calculate recent transactions
  const allTransactions = [
    ...stockEntries.map(entry => ({
      id: entry.id,
      type: 'entry' as const,
      productId: entry.productId,
      product: products.find(p => p.id === entry.productId),
      entity: entry.supplierName || suppliers.find(s => s.id === entry.supplierId)?.name || 'Desconhecido',
      quantity: entry.quantity,
      date: entry.date,
      value: entry.quantity * entry.purchasePrice
    })),
    ...stockExits.map(exit => ({
      id: exit.id,
      type: 'exit' as const,
      productId: exit.productId,
      product: products.find(p => p.id === exit.productId),
      entity: exit.clientName || clients.find(c => c.id === exit.clientId)?.name || 'Desconhecido',
      quantity: exit.quantity,
      date: exit.date,
      value: exit.quantity * exit.salePrice
    }))
  ];
  
  // Sort by date (most recent first)
  const recentTransactions = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  // Calculate most sold product
  const productSales = stockExits.reduce((acc, exit) => {
    const { productId, quantity } = exit;
    if (!acc[productId]) {
      acc[productId] = 0;
    }
    acc[productId] += quantity;
    return acc;
  }, {} as Record<string, number>);
  
  let mostSoldProductId = '';
  let mostSoldQuantity = 0;
  
  Object.entries(productSales).forEach(([productId, quantity]) => {
    if (quantity > mostSoldQuantity) {
      mostSoldProductId = productId;
      mostSoldQuantity = quantity;
    }
  });
  
  const mostSoldProduct = products.find(p => p.id === mostSoldProductId);
  
  // Calculate most frequent client
  const clientPurchases = stockExits.reduce((acc, exit) => {
    const { clientId } = exit;
    if (!acc[clientId]) {
      acc[clientId] = 0;
    }
    acc[clientId] += 1;
    return acc;
  }, {} as Record<string, number>);
  
  let mostFrequentClientId = '';
  let mostFrequentClientCount = 0;
  
  Object.entries(clientPurchases).forEach(([clientId, count]) => {
    if (count > mostFrequentClientCount) {
      mostFrequentClientId = clientId;
      mostFrequentClientCount = count;
    }
  });
  
  const mostFrequentClient = clients.find(c => c.id === mostFrequentClientId);
  
  // Calculate most used supplier
  const supplierPurchases = stockEntries.reduce((acc, entry) => {
    const { supplierId } = entry;
    if (!acc[supplierId]) {
      acc[supplierId] = 0;
    }
    acc[supplierId] += 1;
    return acc;
  }, {} as Record<string, number>);
  
  let mostUsedSupplierId = '';
  let mostUsedSupplierCount = 0;
  
  Object.entries(supplierPurchases).forEach(([supplierId, count]) => {
    if (count > mostUsedSupplierCount) {
      mostUsedSupplierId = supplierId;
      mostUsedSupplierCount = count;
    }
  });
  
  const mostUsedSupplier = suppliers.find(s => s.id === mostUsedSupplierId);
  
  // Calculate total sales value
  const totalSalesValue = stockExits.reduce((total, exit) => {
    return total + (exit.quantity * exit.salePrice);
  }, 0);
  
  // Calculate total stock value
  const totalStockValue = products.reduce((total, product) => {
    return total + (product.currentStock * product.purchasePrice);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-6">
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
              {formatCurrency(totalStockValue)}
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
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gestorApp-gray">Código: {product.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-600 font-medium">{product.currentStock} unidades</div>
                      <div className="text-sm text-gestorApp-gray">Mínimo: {product.minStock} unidades</div>
                    </div>
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
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <li key={transaction.id} className="flex justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium">{transaction.product?.name || "Produto removido"}</div>
                          <div className="text-sm text-gestorApp-gray">
                            {transaction.type === 'entry' ? 'Fornecedor' : 'Cliente'}: {transaction.entity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={transaction.type === 'entry' ? 'text-purple-600' : 'text-gestorApp-blue'}>
                            {transaction.type === 'entry' ? '+ ' : '- '}
                            {transaction.quantity} unidades
                          </div>
                          <div className="text-sm text-gestorApp-gray">
                            {formatDate(ensureDate(transaction.date))}
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center py-6 text-gestorApp-gray">
                      Nenhuma transação encontrada
                    </li>
                  )}
                </ul>
              </TabsContent>
              
              <TabsContent value="entry">
                <ul className="space-y-3">
                  {recentTransactions
                    .filter(t => t.type === 'entry')
                    .map((transaction) => (
                      <li key={transaction.id} className="flex justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium">{transaction.product?.name || "Produto removido"}</div>
                          <div className="text-sm text-gestorApp-gray">
                            Fornecedor: {transaction.entity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-600">
                            + {transaction.quantity} unidades
                          </div>
                          <div className="text-sm text-gestorApp-gray">
                            {formatDate(ensureDate(transaction.date))}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="exit">
                <ul className="space-y-3">
                  {recentTransactions
                    .filter(t => t.type === 'exit')
                    .map((transaction) => (
                      <li key={transaction.id} className="flex justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium">{transaction.product?.name || "Produto removido"}</div>
                          <div className="text-sm text-gestorApp-gray">
                            Cliente: {transaction.entity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gestorApp-blue">
                            - {transaction.quantity} unidades
                          </div>
                          <div className="text-sm text-gestorApp-gray">
                            {formatDate(ensureDate(transaction.date))}
                          </div>
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
                  {mostSoldProduct?.name || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-gestorApp-gray font-medium">Cliente Mais Frequente</dt>
                <dd className="font-semibold text-gestorApp-gray-dark">
                  {mostFrequentClient?.name || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-gestorApp-gray font-medium">Fornecedor Mais Usado</dt>
                <dd className="font-semibold text-gestorApp-gray-dark">
                  {mostUsedSupplier?.name || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-gestorApp-gray font-medium">Total Vendas</dt>
                <dd className="font-semibold text-gestorApp-blue">
                  {formatCurrency(totalSalesValue)}
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
    </div>
  );
};

export default DashboardPage;
