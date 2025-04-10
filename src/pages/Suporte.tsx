
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import { supabase, countPendingOrders, getLowStockProducts } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatting';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { CircleOff, DollarSign, PackageCheck, Users, TrendingUp, ShoppingCart, Truck, Tag, ChevronDown } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Suporte = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<string>('financial-summary');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalSpent: 0,
    profit: 0,
    profitMargin: 0,
    topProduct: { name: '', quantity: 0 },
    topClient: { name: '', orders: 0 },
    topSupplier: { name: '', entries: 0 },
    lowStockProducts: [] as any[],
    pendingOrders: 0,
    completedOrders: 0,
    clientsCount: 0,
    suppliersCount: 0,
    categoriesCount: 0,
    categories: [],
    monthlyData: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch total sales from stock exits
        const { data: exitItems, error: exitError } = await supabase
          .from('stock_exit_items')
          .select('quantity, sale_price, discount_percent');
          
        let totalSales = 0;
        if (exitItems && !exitError) {
          totalSales = exitItems.reduce((sum, item) => {
            const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
            return sum + (item.quantity * item.sale_price * discountMultiplier);
          }, 0);
        }
        
        // Fetch total spent on stock entries
        const { data: entryItems, error: entryError } = await supabase
          .from('stock_entry_items')
          .select('quantity, purchase_price, discount_percent');
          
        let totalSpent = 0;
        if (entryItems && !entryError) {
          totalSpent = entryItems.reduce((sum, item) => {
            const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
            return sum + (item.quantity * item.purchase_price * discountMultiplier);
          }, 0);
        }
        
        // Calculate profit and margin
        const profit = totalSales - totalSpent;
        const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;
        
        // Top product
        const { data: products, error: productsError } = await supabase
          .from('stock_exit_items')
          .select('product_name, quantity')
          .order('quantity', { ascending: false })
          .limit(1);
        
        // Top client
        const { data: clients, error: clientsError } = await supabase
          .from('stock_exits')
          .select('client_name, id')
          .order('client_name');
        
        const clientCounts = clients?.reduce((acc: Record<string, number>, current) => {
          acc[current.client_name] = (acc[current.client_name] || 0) + 1;
          return acc;
        }, {}) || {};
        
        const topClient = Object.entries(clientCounts).reduce(
          (top, [name, count]) => count > top.orders ? { name, orders: count } : top,
          { name: '', orders: 0 }
        );
        
        // Top supplier
        const { data: suppliers, error: suppliersError } = await supabase
          .from('stock_entries')
          .select('supplier_name, id')
          .order('supplier_name');
        
        const supplierCounts = suppliers?.reduce((acc: Record<string, number>, current) => {
          acc[current.supplier_name] = (acc[current.supplier_name] || 0) + 1;
          return acc;
        }, {}) || {};
        
        const topSupplier = Object.entries(supplierCounts).reduce(
          (top, [name, count]) => count > top.entries ? { name, entries: count } : top,
          { name: '', entries: 0 }
        );
        
        // Low stock products
        const lowStockProducts = await getLowStockProducts();
        
        // Pending orders count
        const pendingOrders = await countPendingOrders();
        
        // Completed orders count
        const { count: completedCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .not('converted_to_stock_exit_id', 'is', null);
        
        // Clients count
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
          
        // Suppliers count
        const { count: suppliersCount } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact', head: true });
          
        // Categories count and data
        const { data: categories, count: categoriesCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact' });
          
        // Generate monthly data for charts
        const monthlyData = await generateMonthlyData();
        
        setStats({
          totalSales,
          totalSpent,
          profit,
          profitMargin,
          topProduct: products && products.length > 0 ? { name: products[0].product_name, quantity: products[0].quantity } : { name: '', quantity: 0 },
          topClient,
          topSupplier,
          lowStockProducts,
          pendingOrders,
          completedOrders: completedCount || 0,
          clientsCount: clientsCount || 0,
          suppliersCount: suppliersCount || 0,
          categoriesCount: categoriesCount || 0,
          categories: categories || [],
          monthlyData
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const generateMonthlyData = async () => {
    const monthlyData = [];
    const today = new Date();
    
    // Fetch monthly sales data
    const { data: exitsByMonth, error: exitError } = await supabase
      .from('stock_exits')
      .select('date, id');
      
    const { data: entriesByMonth, error: entryError } = await supabase
      .from('stock_entries')
      .select('date, id');
      
    const { data: exitItems } = await supabase
      .from('stock_exit_items')
      .select('stock_exit_id, quantity, sale_price, discount_percent');
      
    const { data: entryItems } = await supabase
      .from('stock_entry_items')
      .select('stock_entry_id, quantity, purchase_price, discount_percent');
    
    // Get data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Calculate sales for the month
      let salesValue = 0;
      let purchasesValue = 0;
      
      if (exitsByMonth && exitItems) {
        const monthExits = exitsByMonth.filter(exit => {
          const exitDate = new Date(exit.date);
          return exitDate >= month && exitDate <= monthEnd;
        });
        
        monthExits.forEach(exit => {
          const exitItemsForExit = exitItems.filter(item => item.stock_exit_id === exit.id);
          exitItemsForExit.forEach(item => {
            const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
            salesValue += (item.quantity * item.sale_price * discountMultiplier);
          });
        });
      }
      
      if (entriesByMonth && entryItems) {
        const monthEntries = entriesByMonth.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= month && entryDate <= monthEnd;
        });
        
        monthEntries.forEach(entry => {
          const entryItemsForEntry = entryItems.filter(item => item.stock_entry_id === entry.id);
          entryItemsForEntry.forEach(item => {
            const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
            purchasesValue += (item.quantity * item.purchase_price * discountMultiplier);
          });
        });
      }
      
      monthlyData.push({
        name: month.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
        vendas: salesValue,
        compras: purchasesValue,
        lucro: salesValue - purchasesValue
      });
    }
    
    return monthlyData;
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Prepare data for charts
  const salesData = [
    { name: 'Vendas', value: stats.totalSales },
    { name: 'Gastos', value: stats.totalSpent },
    { name: 'Lucro', value: stats.profit }
  ];
  
  // Get chart data based on selected type
  const getChartData = () => {
    switch(chartType) {
      case 'sales-only':
        return stats.monthlyData.map(item => ({ name: item.name, vendas: item.vendas }));
      case 'purchases-only':
        return stats.monthlyData.map(item => ({ name: item.name, compras: item.compras }));
      case 'profit-only':
        return stats.monthlyData.map(item => ({ 
          name: item.name, 
          lucro: Number(item.vendas || 0) - Number(item.compras || 0) 
        }));
      case 'orders':
        return stats.monthlyData.map((item, index) => ({
          name: item.name,
          encomendas: Math.round(Math.random() * 10) + 5 // Placeholder data
        }));
      case 'most-moving-products':
        // Placeholder data for most moving products
        return [
          { name: 'Produto A', movimentos: 45 },
          { name: 'Produto B', movimentos: 38 },
          { name: 'Produto C', movimentos: 31 },
          { name: 'Produto D', movimentos: 28 },
          { name: 'Produto E', movimentos: 22 }
        ];
      case 'low-stock-products':
        return stats.lowStockProducts
          .slice(0, 5)
          .map(product => ({ 
            name: product.name, 
            stock: product.current_stock,
            minimo: product.min_stock 
          }));
      case 'top-clients':
        // Placeholder data for top clients
        return [
          { name: 'Cliente A', valor: 12500 },
          { name: 'Cliente B', valor: 9800 },
          { name: 'Cliente C', valor: 7600 },
          { name: 'Cliente D', valor: 6400 },
          { name: 'Cliente E', valor: 5200 }
        ];
      case 'top-suppliers':
        // Placeholder data for top suppliers
        return [
          { name: 'Fornecedor A', valor: 18500 },
          { name: 'Fornecedor B', valor: 15200 },
          { name: 'Fornecedor C', valor: 12800 },
          { name: 'Fornecedor D', valor: 9700 },
          { name: 'Fornecedor E', valor: 7300 }
        ];
      case 'financial-summary':
      default:
        return stats.monthlyData.map(item => ({
          name: item.name,
          vendas: Number(item.vendas || 0),
          compras: Number(item.compras || 0),
          lucro: Number(item.vendas || 0) - Number(item.compras || 0)
        }));
    }
  };

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
      case 'most-moving-products':
        return 'Produtos com Mais Movimento';
      case 'low-stock-products':
        return 'Produtos com Stock Mínimo';
      case 'top-clients':
        return 'Clientes com Mais Compras';
      case 'top-suppliers':
        return 'Fornecedores Mais Usados';
      case 'financial-summary':
      default:
        return 'Resumo Financeiro';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Dashboard de Estatísticas" 
        description="Visualize estatísticas importantes do seu negócio"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-red-500" />
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{formatCurrency(stats.profit)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.profitMargin.toFixed(2)}%</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
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
                  Vendas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('purchases-only')}>
                  Compras
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('profit-only')}>
                  Lucro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('orders')}>
                  Encomendas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('most-moving-products')}>
                  Produtos com mais movimento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('low-stock-products')}>
                  Produtos Stock Mínimo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('top-clients')}>
                  Clientes com mais compras
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('top-suppliers')}>
                  Fornecedores mais usados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CardDescription>Comparação entre vendas, gastos e lucro</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Stock Baixo</CardTitle>
            <CardDescription>Produtos que estão abaixo do stock mínimo definido</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Produto</th>
                      <th className="py-2 text-right">Stock Atual</th>
                      <th className="py-2 text-right">Stock Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/produtos/${product.id}`)}>
                        <td className="py-2 text-left text-blue-600">{product.name}</td>
                        <td className="py-2 text-right font-medium text-red-500">{product.current_stock}</td>
                        <td className="py-2 text-right">{product.min_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <CircleOff className="mx-auto h-8 w-8 mb-2" />
                <p>Não há produtos com stock baixo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produto Mais Vendido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <PackageCheck className="w-4 h-4 mr-2 text-blue-500" />
              {stats.topProduct.name ? (
                <div className="text-md font-medium">
                  <span className="text-blue-600 cursor-pointer hover:underline" 
                    onClick={() => {
                      // Navegar para o produto, precisaríamos do ID
                      const productId = stats.lowStockProducts.find(p => p.name === stats.topProduct.name)?.id;
                      if (productId) {
                        navigate(`/produtos/${productId}`);
                      }
                    }}>
                    {stats.topProduct.name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">({stats.topProduct.quantity} vendidos)</span>
                </div>
              ) : (
                <div className="text-md">Nenhuma venda registada</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cliente Mais Frequente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-green-500" />
              {stats.topClient.name ? (
                <div className="text-md font-medium">
                  <span className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => {
                      // Idealmente procuraríamos o ID do cliente para navegar
                      navigate(`/clientes`);
                    }}>
                    {stats.topClient.name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">({stats.topClient.orders} compras)</span>
                </div>
              ) : (
                <div className="text-md">Nenhum cliente com compras</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fornecedor Mais Usado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-blue-500" />
              {stats.topSupplier.name ? (
                <div className="text-md font-medium">
                  <span className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => {
                      // Idealmente procuraríamos o ID do fornecedor para navegar
                      navigate(`/fornecedores`);
                    }}>
                    {stats.topSupplier.name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">({stats.topSupplier.entries} entradas)</span>
                </div>
              ) : (
                <div className="text-md">Nenhum fornecedor com entradas</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Encomendas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2 text-orange-500" />
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              {stats.pendingOrders > 0 && (
                <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate('/encomendas/consultar')}>
                  Ver todas
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.clientsCount}</div>
              <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate('/clientes/consultar')}>
                Ver todos
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.suppliersCount}</div>
              <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate('/fornecedores/consultar')}>
                Ver todos
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.categoriesCount}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => navigate('/categorias/consultar')}
              >
                Ver todos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Operações</CardTitle>
            <CardDescription>Visão geral das operações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Encomendas</h3>
                <p>Pendentes: <span className="font-medium">{stats.pendingOrders}</span></p>
                <p>Concluídas: <span className="font-medium">{stats.completedOrders}</span></p>
                <p>Total: <span className="font-medium">{stats.pendingOrders + stats.completedOrders}</span></p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Financeiro</h3>
                <p>Total Vendas: <span className="font-medium">{formatCurrency(stats.totalSales)}</span></p>
                <p>Total Gastos: <span className="font-medium">{formatCurrency(stats.totalSpent)}</span></p>
                <p>Lucro: <span className="font-medium">{formatCurrency(stats.profit)}</span></p>
                <p>Margem: <span className="font-medium">{stats.profitMargin.toFixed(2)}%</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Suporte;
