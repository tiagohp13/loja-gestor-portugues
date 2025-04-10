
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { getDashboardData } from '../data/mockData';
import PageHeader from '../components/ui/PageHeader';
import { Package, Users, Truck, TrendingUp, ShoppingCart, AlertTriangle, ExternalLink, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, suppliers, clients, stockEntries, stockExits, orders } = useData();
  const dashboardData = getDashboardData();
  
  // Chart type state
  const [chartType, setChartType] = useState<string>('financial-summary');
  
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
  
  // Calculate sales data - Update to use items array
  stockExits.forEach(exit => {
    const date = ensureDate(exit.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (monthlyData.has(monthKey)) {
      const current = monthlyData.get(monthKey);
      const exitTotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      
      monthlyData.set(monthKey, {
        ...current,
        vendas: current.vendas + exitTotal
      });
    }
  });
  
  // Calculate purchase data - Update to use items array
  stockEntries.forEach(entry => {
    const date = ensureDate(entry.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (monthlyData.has(monthKey)) {
      const current = monthlyData.get(monthKey);
      const entryTotal = entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
      
      monthlyData.set(monthKey, {
        ...current,
        compras: current.compras + entryTotal
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
  
  // Calculate recent transactions - Update to use items array
  const allTransactions = [
    ...stockEntries.flatMap(entry => entry.items.map(item => ({
      id: entry.id,
      type: 'entry' as const,
      productId: item.productId,
      product: products.find(p => p.id === item.productId),
      entity: entry.supplierName || suppliers.find(s => s.id === entry.supplierId)?.name || 'Desconhecido',
      entityId: entry.supplierId,
      quantity: item.quantity,
      date: entry.date,
      value: item.quantity * item.purchasePrice
    }))),
    ...stockExits.flatMap(exit => exit.items.map(item => ({
      id: exit.id,
      type: 'exit' as const,
      productId: item.productId,
      product: products.find(p => p.id === item.productId),
      entity: exit.clientName || clients.find(c => c.id === exit.clientId)?.name || 'Desconhecido',
      entityId: exit.clientId,
      quantity: item.quantity,
      date: exit.date,
      value: item.quantity * item.salePrice
    })))
  ];
  
  // Sort by date (most recent first) and limit to 5 transactions
  const recentTransactions = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Calculate most sold product - Update to use items array
  const productSales = stockExits.flatMap(exit => exit.items).reduce((acc, item) => {
    const { productId, quantity } = item;
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
  
  // Calculate total sales value - Update to use items array
  const totalSalesValue = stockExits.reduce((total, exit) => {
    const exitTotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
    return total + exitTotal;
  }, 0);
  
  // Calculate total purchase value
  const totalPurchaseValue = stockEntries.reduce((total, entry) => {
    const entryTotal = entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
    return total + entryTotal;
  }, 0);
  
  // Calculate total stock value
  const totalStockValue = products.reduce((total, product) => {
    return total + (product.currentStock * product.purchasePrice);
  }, 0);

  // Calculate profit
  const totalProfit = totalSalesValue - totalPurchaseValue;
  
  // Calculate profit margin percentage
  const profitMarginPercent = totalSalesValue > 0 ? (totalProfit / totalSalesValue) * 100 : 0;

  // Navigate to detail pages
  const navigateToProductDetail = (id: string) => {
    navigate(`/produtos/${id}`);
  };

  const navigateToClientDetail = (id: string) => {
    navigate(`/clientes/${id}`);
  };

  const navigateToSupplierDetail = (id: string) => {
    navigate(`/fornecedores/${id}`);
  };

  // Function to get chart data based on selected type
  const getChartData = () => {
    switch(chartType) {
      case 'sales-only':
        return chartData.map(item => ({ name: item.name, vendas: item.vendas }));
      case 'purchases-only':
        return chartData.map(item => ({ name: item.name, compras: item.compras }));
      case 'profit-only':
        // Fix: Ensure vendas and compras are numbers by using Number()
        return chartData.map(item => ({ 
          name: item.name, 
          lucro: Number(item.vendas) - Number(item.compras) 
        }));
      case 'orders':
        // Group orders by month
        const ordersByMonth = new Map();
        orders.forEach(order => {
          const date = ensureDate(order.date);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          if (monthlyData.has(monthKey)) {
            ordersByMonth.set(monthKey, (ordersByMonth.get(monthKey) || 0) + 1);
          }
        });
        return Array.from(monthlyData.keys()).map(key => ({
          name: monthlyData.get(key).name,
          encomendas: ordersByMonth.get(key) || 0
        }));
      case 'stock-entries':
        // Group stock entries by month
        const entriesByMonth = new Map();
        stockEntries.forEach(entry => {
          const date = ensureDate(entry.date);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          if (monthlyData.has(monthKey)) {
            entriesByMonth.set(monthKey, (entriesByMonth.get(monthKey) || 0) + 1);
          }
        });
        return Array.from(monthlyData.keys()).map(key => ({
          name: monthlyData.get(key).name,
          entradas: entriesByMonth.get(key) || 0
        }));
      case 'stock-exits':
        // Group stock exits by month
        const exitsByMonth = new Map();
        stockExits.forEach(exit => {
          const date = ensureDate(exit.date);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          if (monthlyData.has(monthKey)) {
            exitsByMonth.set(monthKey, (exitsByMonth.get(monthKey) || 0) + 1);
          }
        });
        return Array.from(monthlyData.keys()).map(key => ({
          name: monthlyData.get(key).name,
          saidas: exitsByMonth.get(key) || 0
        }));
      case 'most-moving-products':
        // Get top products by movement (entries + exits)
        const productMovements = {};
        
        // Add movements from entries
        stockEntries.forEach(entry => 
          entry.items.forEach(item => {
            if (!productMovements[item.productName]) {
              productMovements[item.productName] = 0;
            }
            productMovements[item.productName] += item.quantity;
          })
        );
        
        // Add movements from exits
        stockExits.forEach(exit => 
          exit.items.forEach(item => {
            if (!productMovements[item.productName]) {
              productMovements[item.productName] = 0;
            }
            productMovements[item.productName] += item.quantity;
          })
        );
        
        return Object.entries(productMovements)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, quantity]) => ({ name, movimentos: quantity }));
      case 'low-stock-products':
        return lowStockProducts
          .slice(0, 5)
          .map(product => ({ 
            name: product.name, 
            stock: product.currentStock,
            minimo: product.minStock 
          }));
      case 'top-clients':
        // Calculate clients with most purchases
        const clientPurchaseTotals = {};
        
        stockExits.forEach(exit => {
          if (!clientPurchaseTotals[exit.clientName]) {
            clientPurchaseTotals[exit.clientName] = 0;
          }
          
          const exitTotal = exit.items.reduce((sum, item) => 
            sum + (item.quantity * item.salePrice), 0);
          
          clientPurchaseTotals[exit.clientName] += exitTotal;
        });
        
        return Object.entries(clientPurchaseTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, valor: value }));
      case 'top-suppliers':
        // Calculate most used suppliers
        const supplierUsage = {};
        
        stockEntries.forEach(entry => {
          if (!supplierUsage[entry.supplierName]) {
            supplierUsage[entry.supplierName] = 0;
          }
          
          const entryTotal = entry.items.reduce((sum, item) => 
            sum + (item.quantity * item.purchasePrice), 0);
          
          supplierUsage[entry.supplierName] += entryTotal;
        });
        
        return Object.entries(supplierUsage)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, valor: value }));
      case 'financial-summary':
      default:
        // Fix: Add lucro field to the chart data with proper number conversion
        return chartData.map(item => ({
          name: item.name,
          vendas: item.vendas,
          compras: item.compras,
          lucro: Number(item.vendas) - Number(item.compras)
        }));
    }
  };

  // Function to get chart title based on selected type
  const getChartTitle = () => {
    switch(chartType) {
      case 'sales-only':
        return 'Vendas (últimos 6 meses)';
      case 'purchases-only':
        return 'Compras (últimos 6 meses)';
      case 'profit-only':
        return 'Lucro (últimos 6 meses)';
      case 'orders':
        return 'Encomendas (últimos 6 meses)';
      case 'stock-entries':
        return 'Compras (últimos 6 meses)';
      case 'stock-exits':
        return 'Vendas (últimos 6 meses)';
      case 'most-moving-products':
        return 'Produtos com Mais Movimento';
      case 'low-stock-products':
        return 'Produtos com Menos Stock';
      case 'top-clients':
        return 'Clientes com Mais Compras';
      case 'top-suppliers':
        return 'Fornecedores Mais Usados';
      case 'financial-summary':
      default:
        return 'Resumo Financeiro';
    }
  };

  // Function to render chart based on selected type
  const renderChart = () => {
    const data = getChartData();
    
    // Define custom tooltip formatter based on chart type
    const tooltipFormatter = (value, name) => {
      if (['top-clients', 'top-suppliers'].includes(chartType)) {
        return [formatCurrency(value), name];
      }
      if (['low-stock-products'].includes(chartType)) {
        return [`${value} unidades`, name];
      }
      if (['most-moving-products'].includes(chartType)) {
        return [`${value} movimentos`, name];
      }
      if (['sales-only', 'purchases-only', 'profit-only', 'financial-summary'].includes(chartType)) {
        return [formatCurrency(value), name];
      }
      return [value, name];
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
          {chartType === 'financial-summary' && (
            <>
              <Bar dataKey="vendas" name="Vendas" fill="#1a56db" />
              <Bar dataKey="compras" name="Compras" fill="#9333ea" />
              <Bar dataKey="lucro" name="Lucro" fill="#10b981" />
            </>
          )}
          {chartType === 'sales-only' && <Bar dataKey="vendas" name="Vendas" fill="#1a56db" />}
          {chartType === 'purchases-only' && <Bar dataKey="compras" name="Compras" fill="#9333ea" />}
          {chartType === 'profit-only' && <Bar dataKey="lucro" name="Lucro" fill="#10b981" />}
          {chartType === 'orders' && <Bar dataKey="encomendas" name="Encomendas" fill="#f59e0b" />}
          {chartType === 'stock-entries' && <Bar dataKey="entradas" name="Entradas" fill="#9333ea" />}
          {chartType === 'stock-exits' && <Bar dataKey="saidas" name="Saídas" fill="#1a56db" />}
          {chartType === 'most-moving-products' && <Bar dataKey="movimentos" name="Movimentos" fill="#1a56db" />}
          {chartType === 'low-stock-products' && (
            <>
              <Bar dataKey="stock" name="Stock Atual" fill="#ef4444" />
              <Bar dataKey="minimo" name="Stock Mínimo" fill="#9333ea" />
            </>
          )}
          {chartType === 'top-clients' && <Bar dataKey="valor" name="Valor" fill="#1a56db" />}
          {chartType === 'top-suppliers' && <Bar dataKey="valor" name="Valor" fill="#9333ea" />}
        </BarChart>
      </ResponsiveContainer>
    );
  };

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
          <CardHeader className="flex flex-row items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center">
                  <CardTitle>{getChartTitle()}</CardTitle>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white">
                <DropdownMenuItem onClick={() => setChartType('financial-summary')}>
                  Resumo Financeiro (Vendas, Gastos, Lucro)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('sales-only')}>
                  Apenas Vendas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('purchases-only')}>
                  Apenas Gastos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('profit-only')}>
                  Apenas Lucro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('orders')}>
                  Encomendas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('stock-entries')}>
                  Compras
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('stock-exits')}>
                  Vendas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('most-moving-products')}>
                  Produtos com mais movimento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('low-stock-products')}>
                  Produtos com menos stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('top-clients')}>
                  Clientes com mais compras
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('top-suppliers')}>
                  Fornecedores mais usados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {renderChart()}
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
                        <Button 
                          variant="link" 
                          className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                          onClick={() => navigateToProductDetail(product.id)}
                        >
                          {product.name}
                        </Button>
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
                          <Button 
                            variant="link" 
                            className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                            onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                          >
                            {transaction.product?.name || "Produto removido"}
                          </Button>
                          <div className="text-sm text-gestorApp-gray">
                            {transaction.type === 'entry' ? 'Fornecedor' : 'Cliente'}: 
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-gestorApp-gray hover:text-blue-600"
                              onClick={() => transaction.entityId && (
                                transaction.type === 'entry' 
                                  ? navigateToSupplierDetail(transaction.entityId)
                                  : navigateToClientDetail(transaction.entityId)
                              )}
                            >
                              {transaction.entity}
                            </Button>
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
                          <Button 
                            variant="link" 
                            className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                            onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                          >
                            {transaction.product?.name || "Produto removido"}
                          </Button>
                          <div className="text-sm text-gestorApp-gray">
                            Fornecedor: 
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-gestorApp-gray hover:text-blue-600"
                              onClick={() => transaction.entityId && navigateToSupplierDetail(transaction.entityId)}
                            >
                              {transaction.entity}
                            </Button>
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
                          <Button 
                            variant="link" 
                            className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                            onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                          >
                            {transaction.product?.name || "Produto removido"}
                          </Button>
                          <div className="text-sm text-gestorApp-gray">
                            Cliente: 
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-gestorApp-gray hover:text-blue-600"
                              onClick={() => transaction.entityId && navigateToClientDetail(transaction.entityId)}
                            >
                              {transaction.entity}
                            </Button>
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
              <div className="flex justify-between py-2">
                <dt className="text-gestorApp-gray font-medium">Margem de Lucro</dt>
                <dd className="font-semibold text-green-600">
                  {profitMarginPercent.toFixed(2)}%
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
                          <Button 
                            variant="link" 
                            className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                            onClick={() => navigateToProductDetail(product.id)}
                          >
                            {product.name}
                          </Button>
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
