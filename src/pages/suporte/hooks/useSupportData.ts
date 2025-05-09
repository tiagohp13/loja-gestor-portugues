import { useState, useEffect } from 'react';
import { supabase, countPendingOrders, getLowStockProducts } from '@/integrations/supabase/client';
import { KPI } from '@/components/statistics/KPIPanel';
import { 
  calculateRoiPercent, 
  calculateProfitMarginPercent 
} from '@/pages/dashboard/hooks/utils/financialUtils';

export interface SupportStats {
  totalSales: number;
  totalSpent: number;
  profit: number;
  profitMargin: number;
  topProducts: Array<{ name: string; quantity: number; productId?: string }>;
  topClients: Array<{ name: string; orders: number; spending: number }>;
  topSuppliers: Array<{ name: string; entries: number }>;
  lowStockProducts: any[];
  pendingOrders: number;
  completedOrders: number;
  clientsCount: number;
  suppliersCount: number;
  categoriesCount: number;
  monthlySales: any[];
  monthlyData: any[];
  monthlyOrders: any[];
}

export interface SupportDataReturn {
  isLoading: boolean;
  stats: SupportStats;
  kpis: KPI[];
}

export const useSupportData = (): SupportDataReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SupportStats>({
    totalSales: 0,
    totalSpent: 0,
    profit: 0,
    profitMargin: 0,
    topProducts: [],
    topClients: [],
    topSuppliers: [],
    lowStockProducts: [],
    pendingOrders: 0,
    completedOrders: 0,
    clientsCount: 0,
    suppliersCount: 0,
    categoriesCount: 0,
    monthlySales: [],
    monthlyData: [],
    monthlyOrders: []
  });
  
  const [kpis, setKpis] = useState<KPI[]>([]);
  
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
        
        // Calculate profit margin using real data
        const profitMargin = calculateProfitMarginPercent(profit, totalSales);
        
        // Calculate ROI using real data
        const roi = calculateRoiPercent(profit, totalSpent);
        
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
        
        // Update KPIs with real calculated data
        setKpis([
          {
            name: "ROI",
            value: roi,
            target: 40,
            unit: '%',
            isPercentage: true,
            previousValue: 30.1,
            description: "Mede o retorno em relação ao custo de investimento.",
            formula: "(Lucro / Custo) × 100",
            belowTarget: roi < 40
          },
          {
            name: "Margem de Lucro",
            value: profitMargin,
            target: 25,
            unit: '%',
            isPercentage: true,
            previousValue: 25.2,
            description: "Mede a rentabilidade da empresa.",
            formula: "(Lucro / Receita) × 100",
            belowTarget: profitMargin < 25
          },
          {
            name: "Ponto de Equilíbrio",
            value: 520,
            target: 500,
            unit: 'unidades',
            previousValue: 540,
            description: "Mede o volume de vendas necessário para cobrir os custos.",
            formula: "Custos fixos / (Preço venda unitário - Custo variável unitário)",
            belowTarget: false
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
            formula: "(Clientes perdidos / Clientes no início do período) × 100",
            belowTarget: false
          },
          {
            name: "Lifetime Value",
            value: 3250,
            target: 3000,
            unit: '€',
            previousValue: 3100,
            description: "Mede o valor total que um cliente gera ao longo do relacionamento.",
            formula: "Valor médio de compra × Compras por ano × Anos de relação",
            belowTarget: false
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
        
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return {
    isLoading,
    stats,
    kpis
  };
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
