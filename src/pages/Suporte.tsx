import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import { supabase, countPendingOrders, getLowStockProducts } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatting';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { CircleOff, DollarSign, PackageCheck, PackageMinus, Users, TrendingUp, ShoppingCart, Truck, ChevronDown, Tag } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ChartDropdown from '@/components/statistics/ChartDropdown';
import { ChartType } from '@/components/statistics/ChartDropdown';
import KPIPanel, { KPI } from '@/components/statistics/KPIPanel';

interface TopProduct {
  name: string;
  quantity: number;
  productId?: string;
}

const Suporte = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('resumo');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalSpent: 0,
    profit: 0,
    profitMargin: 0,
    topProducts: [] as TopProduct[],
    topClients: [] as { name: string, orders: number, spending: number }[],
    topSuppliers: [] as { name: string, entries: number }[],
    lowStockProducts: [] as any[],
    pendingOrders: 0,
    completedOrders: 0,
    clientsCount: 0,
    suppliersCount: 0,
    categoriesCount: 0,
    monthlySales: [] as any[],
    monthlyData: [] as any[],
    monthlyOrders: [] as any[]
  });

  // KPI data
  const [kpis, setKpis] = useState<KPI[]>([
    {
      name: "ROI",
      value: 32.4,
      target: 40,
      unit: '%',
      isPercentage: true,
      previousValue: 30.1,
      description: "Mede o retorno em relação ao custo de investimento.",
      formula: "(Lucro / Custo) × 100",
      belowTarget: true
    },
    {
      name: "Margem de Lucro",
      value: 28.6,
      target: 25,
      unit: '%',
      isPercentage: true,
      previousValue: 25.2,
      description: "Mede a rentabilidade da empresa.",
      formula: "(Lucro / Receita) × 100"
    },
    {
      name: "Ponto de Equilíbrio",
      value: 520,
      target: 500,
      unit: 'unidades',
      previousValue: 540,
      description: "Mede o volume de vendas necessário para cobrir os custos.",
      formula: "Custos fixos / (Preço venda unitário - Custo variável unitário)"
    },
    {
      name: "Taxa de Conversão",
      value: 18.3,
      target: 20,
      unit: '%',
      isPercentage: true,
      previousValue: 17.5,
      description: "Mede a eficiência de transformar leads em clientes.",
      formula: "(Número de vendas / Número de leads) × 100",
      belowTarget: true
    },
    {
      name: "Churn Rate",
      value: 3.7,
      target: 5,
      unit: '%',
      isPercentage: true,
      previousValue: 4.2,
      description: "Mede a fidelidade dos clientes e a rotatividade.",
      formula: "(Clientes perdidos / Clientes no início do período) × 100"
    },
    {
      name: "Lifetime Value",
      value: 3250,
      target: 3000,
      unit: '€',
      previousValue: 3100,
      description: "Mede o valor total que um cliente gera ao longo do relacionamento.",
      formula: "Valor médio de compra × Compras por ano × Anos de relação"
    },
    {
      name: "NPS",
      value: 42,
      target: 50,
      unit: 'pontos',
      previousValue: 38,
      description: "Mede a satisfação e lealdade dos clientes.",
      formula: "% de promotores - % de detratores",
      belowTarget: true
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
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
        
        const profit = totalSales - totalSpent;
        const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;
        
        const { data: topProductsData, error: productsError } = await supabase
          .from('stock_exit_items')
          .select('product_name, product_id, quantity')
          .order('quantity', { ascending: false })
          .limit(5);
        
        const topProducts = topProductsData?.map((product) => ({
          name: product.product_name,
          quantity: product.quantity,
          productId: product.product_id
        })) || [];

        const { data: clients, error: clientsError } = await supabase
          .from('stock_exits')
          .select('client_name, id')
          .order('client_name');
        
        const clientCounts = clients?.reduce((acc: Record<string, {orders: number, ids: string[]}>, current) => {
          if (!acc[current.client_name]) {
            acc[current.client_name] = { orders: 0, ids: [] };
          }
          acc[current.client_name].orders += 1;
          acc[current.client_name].ids.push(current.id);
          return acc;
        }, {}) || {};
        
        const clientSpending: Record<string, number> = {};
        
        for (const clientName of Object.keys(clientCounts)) {
          const exitIds = clientCounts[clientName].ids;
          let totalSpent = 0;
          
          for (const exitId of exitIds) {
            const { data: items } = await supabase
              .from('stock_exit_items')
              .select('quantity, sale_price, discount_percent')
              .eq('exit_id', exitId);
              
            if (items) {
              totalSpent += items.reduce((sum, item) => {
                const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
                return sum + (item.quantity * item.sale_price * discountMultiplier);
              }, 0);
            }
          }
          
          clientSpending[clientName] = totalSpent;
        }
        
        const topClients = Object.entries(clientCounts).map(([name, data]) => ({
          name,
          orders: data.orders,
          spending: clientSpending[name] || 0
        })).sort((a, b) => b.orders - a.orders).slice(0, 5);
        
        const { data: suppliers, error: suppliersError } = await supabase
          .from('stock_entries')
          .select('supplier_name, id')
          .order('supplier_name');
        
        const supplierCounts = suppliers?.reduce((acc: Record<string, number>, current) => {
          acc[current.supplier_name] = (acc[current.supplier_name] || 0) + 1;
          return acc;
        }, {}) || {};
        
        const topSuppliers = Object.entries(supplierCounts)
          .map(([name, entries]) => ({ name, entries }))
          .sort((a, b) => b.entries - a.entries)
          .slice(0, 5);
        
        const lowStockProducts = await getLowStockProducts();
        
        const pendingOrders = await countPendingOrders();
        
        const { count: completedCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .not('converted_to_stock_exit_id', 'is', null);
        
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
          
        const { count: suppliersCount } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact', head: true });
        
        const { count: categoriesCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });
        
        const monthlyData = await fetchMonthlyData();
        const monthlyOrders = await fetchMonthlyOrders();
        
        setStats({
          totalSales,
          totalSpent,
          profit,
          profitMargin,
          topProducts,
          topClients,
          topSuppliers,
          lowStockProducts,
          pendingOrders,
          completedOrders: completedCount || 0,
          clientsCount: clientsCount || 0,
          suppliersCount: suppliersCount || 0,
          categoriesCount: categoriesCount || 0,
          monthlySales: [],
          monthlyData,
          monthlyOrders
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const getCategoriesCount = async () => {
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    return count || 0;
  };
  
  const fetchMonthlyData = async () => {
    const today = new Date();
    const months = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push({ month, monthName });
    }
    
    for (const { month, monthName } of months) {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();
      
      const { data: sales } = await supabase
        .from('stock_exits')
        .select(`
          id,
          date,
          stock_exit_items:stock_exit_items(
            quantity,
            sale_price,
            discount_percent
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate);
      
      let monthSales = 0;
      if (sales) {
        sales.forEach((sale: any) => {
          if (sale.stock_exit_items) {
            sale.stock_exit_items.forEach((item: any) => {
              const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
              monthSales += item.quantity * item.sale_price * discountMultiplier;
            });
          }
        });
      }
      
      const { data: purchases } = await supabase
        .from('stock_entries')
        .select(`
          id,
          date,
          stock_entry_items:stock_entry_items(
            quantity,
            purchase_price,
            discount_percent
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate);
      
      let monthPurchases = 0;
      if (purchases) {
        purchases.forEach((purchase: any) => {
          if (purchase.stock_entry_items) {
            purchase.stock_entry_items.forEach((item: any) => {
              const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
              monthPurchases += item.quantity * item.purchase_price * discountMultiplier;
            });
          }
        });
      }
      
      const { data: orders, count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .gte('date', startDate)
        .lte('date', endDate);
      
      data.push({
        name: monthName,
        vendas: monthSales,
        compras: monthPurchases,
        lucro: monthSales - monthPurchases,
        encomendas: orderCount || 0
      });
    }
    
    return data;
  };
  
  const fetchMonthlyOrders = async () => {
    const today = new Date();
    const months = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push({ month, monthName });
    }
    
    for (const { month, monthName } of months) {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();
      
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .is('converted_to_stock_exit_id', null)
        .gte('date', startDate)
        .lte('date', endDate);
      
      const { count: completedCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .not('converted_to_stock_exit_id', 'is', null)
        .gte('date', startDate)
        .lte('date', endDate);
      
      data.push({
        name: monthName,
        pendentes: pendingCount || 0,
        concluidas: completedCount || 0,
        total: (pendingCount || 0) + (completedCount || 0)
      });
    }
    
    return data;
  };
  
  const renderChart = () => {
    if (isLoading) return <LoadingSpinner />;

    switch(chartType) {
      case 'resumo':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Resumo Financeiro (6 meses)" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Comparação entre vendas, gastos e lucro dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar name="Vendas" dataKey="vendas" fill="#3065ac" />
                  <Bar name="Compras" dataKey="compras" fill="#ff6961" />
                  <Bar name="Lucro" dataKey="lucro" fill="#bdecb6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        );
      
      case 'vendas':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Vendas Mensais" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Valores de vendas em euros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="vendas" fill="#3065ac" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        );
      
      case 'compras':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Compras Mensais" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Valores de compras em euros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="compras" fill="#ff6961" name="Compras" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        );
      
      case 'lucro':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Lucro Mensal" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Valores de lucro em euros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="lucro" fill="#bdecb6" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        );
      
      case 'produtos':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Produtos com mais movimento" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Top 5 produtos mais vendidos</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={stats.topProducts}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há dados de produtos disponíveis</p>
                </div>
              )}
            </CardContent>
          </>
        );

      case 'stockMinimo':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Produtos com Stock Mínimo" 
                  onSelect={setChartType} 
                />
              </CardTitle>
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
          </>
        );

      case 'clientes':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Clientes com mais compras" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Top 5 clientes por número de compras</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topClients.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={stats.topClients.map(c => ({ name: c.name, value: c.orders }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há dados de clientes disponíveis</p>
                </div>
              )}
            </CardContent>
          </>
        );

      case 'fornecedores':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Fornecedores mais usados" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Top 5 fornecedores por número de entradas</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topSuppliers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={stats.topSuppliers.map(s => ({ name: s.name, value: s.entries }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há dados de fornecedores disponíveis</p>
                </div>
              )}
            </CardContent>
          </>
        );

      case 'encomendas':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Encomendas Mensais" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Encomendas pendentes e concluídas nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.monthlyOrders.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.monthlyOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pendentes" fill="#3065ac" name="Encomendas Pendentes" />
                    <Bar dataKey="concluidas" fill="#bdecb6" name="Encomendas Concluídas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há dados de encomendas disponíveis</p>
                </div>
              )}
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
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
      
      {/* KPI Panel */}
      <div className="mb-6">
        <KPIPanel 
          title="Indicadores de Performance" 
          description="Principais KPIs do negócio" 
          kpis={kpis} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <Card>
          {renderChart()}
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
              {stats.topProducts.length > 0 ? (
                <div className="text-md font-medium">
                  <span className="text-blue-600 cursor-pointer hover:underline" 
                    onClick={() => {
                      const product = stats.topProducts[0];
                      if (product.productId) {
                        navigate(`/produtos/${product.productId}`);
                      }
                    }}>
                    {stats.topProducts[0].name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">({stats.topProducts[0].quantity} vendidos)</span>
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
              {stats.topClients.length > 0 ? (
                <div className="text-md font-medium">
                  <span className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/clientes/consultar`)}>
                    {stats.topClients[0].name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">({stats.topClients[0].orders} compras)</span>
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
              {stats.topSuppliers.length > 0 ? (
                <div className="text-md font-medium">
                  <span className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/fornecedores/consultar`)}>
                    {stats.topSuppliers[0].name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">({stats.topSuppliers[0].entries} entradas)</span>
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => navigate('/encomendas/consultar')}
              >
                Ver todas
              </Button>
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
              <Tag className="w-4 h-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.categoriesCount}</div>
              <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate('/categorias/consultar')}>
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
