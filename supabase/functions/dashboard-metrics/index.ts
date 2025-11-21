import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KpiDelta {
  pct30d: number;
  pctMoM: number;
  value30d: number;
  valueMoM: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[AUDIT] Dashboard metrics calculated for user ${user.id} at ${new Date().toISOString()}`);

    // Fetch data with limits for better performance (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const twelveMonthsAgoStr = twelveMonthsAgo.toISOString();

    const [stockExitsRes, stockEntriesRes, expensesRes] = await Promise.all([
      supabaseClient
        .from('stock_exits')
        .select('date, discount, items:stock_exit_items(quantity, sale_price, discount_percent)')
        .eq('status', 'active')
        .gte('date', twelveMonthsAgoStr)
        .order('date', { ascending: false }),
      supabaseClient
        .from('stock_entries')
        .select('date, items:stock_entry_items(quantity, purchase_price, discount_percent)')
        .eq('status', 'active')
        .gte('date', twelveMonthsAgoStr)
        .order('date', { ascending: false }),
      supabaseClient
        .from('expenses')
        .select('date, discount, items:expense_items(quantity, unit_price, discount_percent)')
        .eq('status', 'active')
        .gte('date', twelveMonthsAgoStr)
    ]);

    if (stockExitsRes.error) throw stockExitsRes.error;
    if (stockEntriesRes.error) throw stockEntriesRes.error;
    if (expensesRes.error) throw expensesRes.error;

    const stockExits = stockExitsRes.data || [];
    const stockEntries = stockEntriesRes.data || [];
    const expenses = expensesRes.data || [];

    // Calculate totals efficiently
    const calculateTotal = (items: any[], isExit: boolean) => 
      items.reduce((sum, item) => {
        const itemsTotal = (item.items || []).reduce((itemSum: number, i: any) => {
          const price = isExit ? i.sale_price : (i.purchase_price || i.unit_price);
          const discount = 1 - ((i.discount_percent || 0) / 100);
          return itemSum + (i.quantity * price * discount);
        }, 0);
        const mainDiscount = 1 - ((item.discount || 0) / 100);
        return sum + (itemsTotal * mainDiscount);
      }, 0);

    // Date filters
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const filterByDate = (items: any[], start: Date, end: Date) => 
      items.filter(item => {
        const date = new Date(item.date);
        return date >= start && date <= end;
      });

    // Calculate KPI deltas
    const exits30d = filterByDate(stockExits, thirtyDaysAgo, now);
    const exitsPrev30d = filterByDate(stockExits, sixtyDaysAgo, thirtyDaysAgo);
    const exitsMoM = filterByDate(stockExits, currentMonthStart, now);
    const exitsLastMonth = filterByDate(stockExits, lastMonthStart, lastMonthEnd);

    const entries30d = filterByDate(stockEntries, thirtyDaysAgo, now);
    const entriesPrev30d = filterByDate(stockEntries, sixtyDaysAgo, thirtyDaysAgo);
    const entriesMoM = filterByDate(stockEntries, currentMonthStart, now);
    const entriesLastMonth = filterByDate(stockEntries, lastMonthStart, lastMonthEnd);

    const expenses30d = filterByDate(expenses, thirtyDaysAgo, now);
    const expensesPrev30d = filterByDate(expenses, sixtyDaysAgo, thirtyDaysAgo);
    const expensesMoM = filterByDate(expenses, currentMonthStart, now);
    const expensesLastMonth = filterByDate(expenses, lastMonthStart, lastMonthEnd);

    const sales30d = calculateTotal(exits30d, true);
    const salesPrev30d = calculateTotal(exitsPrev30d, true);
    const salesMoM = calculateTotal(exitsMoM, true);
    const salesLastMonth = calculateTotal(exitsLastMonth, true);

    const purchases30d = calculateTotal(entries30d, false);
    const purchasesPrev30d = calculateTotal(entriesPrev30d, false);
    const purchasesMoM = calculateTotal(entriesMoM, false);
    const purchasesLastMonth = calculateTotal(entriesLastMonth, false);

    const exp30d = calculateTotal(expenses30d, false);
    const expPrev30d = calculateTotal(expensesPrev30d, false);
    const expMoM = calculateTotal(expensesMoM, false);
    const expLastMonth = calculateTotal(expensesLastMonth, false);

    const totalSpent30d = purchases30d + exp30d;
    const totalSpentPrev30d = purchasesPrev30d + expPrev30d;
    const totalSpentMoM = purchasesMoM + expMoM;
    const totalSpentLastMonth = purchasesLastMonth + expLastMonth;

    const profit30d = sales30d - totalSpent30d;
    const profitPrev30d = salesPrev30d - totalSpentPrev30d;
    const profitMoM = salesMoM - totalSpentMoM;
    const profitLastMonth = salesLastMonth - totalSpentLastMonth;

    const margin30d = sales30d > 0 ? (profit30d / sales30d) * 100 : 0;
    const marginPrev30d = salesPrev30d > 0 ? (profitPrev30d / salesPrev30d) * 100 : 0;
    const marginMoM = salesMoM > 0 ? (profitMoM / salesMoM) * 100 : 0;
    const marginLastMonth = salesLastMonth > 0 ? (profitLastMonth / salesLastMonth) * 100 : 0;

    const calcPct = (current: number, previous: number) => 
      previous > 0 ? ((current - previous) / previous) * 100 : 0;

    const kpiDeltas = {
      sales: {
        pct30d: calcPct(sales30d, salesPrev30d),
        pctMoM: calcPct(salesMoM, salesLastMonth),
        value30d: sales30d,
        valueMoM: salesMoM
      },
      spent: {
        pct30d: calcPct(totalSpent30d, totalSpentPrev30d),
        pctMoM: calcPct(totalSpentMoM, totalSpentLastMonth),
        value30d: totalSpent30d,
        valueMoM: totalSpentMoM
      },
      profit: {
        pct30d: calcPct(profit30d, profitPrev30d),
        pctMoM: calcPct(profitMoM, profitLastMonth),
        value30d: profit30d,
        valueMoM: profitMoM
      },
      margin: {
        pct30d: calcPct(margin30d, marginPrev30d),
        pctMoM: calcPct(marginMoM, marginLastMonth),
        value30d: margin30d,
        valueMoM: marginMoM
      }
    };

    // Calculate all-time totals
    const totalSales = calculateTotal(stockExits, true);
    const totalPurchases = calculateTotal(stockEntries, false);
    const totalExpenses = calculateTotal(expenses, false);
    const totalSpent = totalPurchases + totalExpenses;
    const totalProfit = totalSales - totalSpent;
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    // Build monthly data for charts
    const monthlyDataMap = new Map<string, { vendas: number; compras: number }>();
    
    stockExits.forEach(exit => {
      const date = new Date(exit.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyDataMap.get(key) || { vendas: 0, compras: 0 };
      const total = (exit.items || []).reduce((sum: number, item: any) => {
        const discount = 1 - ((item.discount_percent || 0) / 100);
        return sum + (item.quantity * item.sale_price * discount);
      }, 0);
      const mainDiscount = 1 - ((exit.discount || 0) / 100);
      existing.vendas += total * mainDiscount;
      monthlyDataMap.set(key, existing);
    });

    stockEntries.forEach(entry => {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyDataMap.get(key) || { vendas: 0, compras: 0 };
      const total = (entry.items || []).reduce((sum: number, item: any) => {
        const discount = 1 - ((item.discount_percent || 0) / 100);
        return sum + (item.quantity * item.purchase_price * discount);
      }, 0);
      existing.compras += total;
      monthlyDataMap.set(key, existing);
    });

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyDataMap.get(key) || { vendas: 0, compras: 0 };
      const total = (expense.items || []).reduce((sum: number, item: any) => {
        const discount = 1 - ((item.discount_percent || 0) / 100);
        return sum + (item.quantity * item.unit_price * discount);
      }, 0);
      const mainDiscount = 1 - ((expense.discount || 0) / 100);
      existing.compras += total * mainDiscount;
      monthlyDataMap.set(key, existing);
    });

    const monthlyData = Array.from(monthlyDataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months only
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          mes: date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
          vendas: data.vendas,
          compras: data.compras
        };
      });

    return new Response(
      JSON.stringify({
        kpiDeltas,
        totals: {
          totalSales,
          totalSpent,
          totalProfit,
          profitMargin
        },
        monthlyData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calculating dashboard metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
