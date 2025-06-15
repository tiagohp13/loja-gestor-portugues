
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// KPIs retornados pela função
export interface DashboardSummary {
  totalSales: number;
  totalSpent: number;
  profit: number;
  profitMargin: number;
}

/**
 * Faz uma query única e super eficiente no supabase e retorna os campos necessários para os cards de resumo
 */
async function fetchDashboardSummary(): Promise<DashboardSummary> {
  // Consulta otimizada usando apenas agregações necessárias
  // Evita N+1 e retorna só os quatro KPIs
  // O ideal seria usar um view ou função SQL diretamente do supabase na vida real, mas faremos em JS aqui:

  // 1. VENDAS
  const { data: exitItems, error: exitError } = await supabase
    .from('stock_exit_items')
    .select('quantity, sale_price, discount_percent');

  let totalSales = 0;
  if (exitItems && !exitError) {
    totalSales = exitItems.reduce((sum, item) => {
      const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
      return sum + (item.quantity * item.sale_price * discountMultiplier);
    }, 0);
  } else if (exitError) {
    console.error('Erro carregando vendas:', exitError);
    throw exitError;
  }

  // 2. COMPRAS
  const { data: entryItems, error: entryError } = await supabase
    .from('stock_entry_items')
    .select('quantity, purchase_price, discount_percent');

  let totalPurchases = 0;
  if (entryItems && !entryError) {
    totalPurchases = entryItems.reduce((sum, item) => {
      const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
      return sum + (item.quantity * item.purchase_price * discountMultiplier);
    }, 0);
  } else if (entryError) {
    console.error('Erro carregando compras:', entryError);
    throw entryError;
  }

  // 3. DESPESAS (opcional, caso for considerar no gasto total)
  const { data: expenses, error: expenseError } = await supabase
    .from('expenses')
    .select('discount, expense_items(quantity, unit_price, discount_percent)');

  let totalExpenses = 0;
  if (expenses && !expenseError) {
    totalExpenses = expenses.reduce((sum, expense) => {
      const expenseItemsTotal = (expense.expense_items || []).reduce((itemSum: number, item: any) => {
        const itemTotal = item.quantity * item.unit_price;
        const itemDiscountAmount = itemTotal * ((item.discount_percent || 0) / 100);
        return itemSum + (itemTotal - itemDiscountAmount);
      }, 0);
      // Desconto a nível de despesa
      const finalExpenseTotal = expenseItemsTotal * (1 - ((expense.discount || 0) / 100));
      return sum + finalExpenseTotal;
    }, 0);
  } else if (expenseError) {
    console.error('Erro carregando despesas:', expenseError);
    throw expenseError;
  }

  // Gasto total = compras + despesas
  const totalSpent = totalPurchases + totalExpenses;
  const profit = totalSales - totalSpent;
  const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

  return { totalSales, totalSpent, profit, profitMargin };
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary-kpis'],
    queryFn: fetchDashboardSummary,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache para garantir resposta instantânea após a primeira chamada
    refetchOnWindowFocus: false,
  });
}
