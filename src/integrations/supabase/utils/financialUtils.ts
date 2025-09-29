
import { supabase } from '../client';

/**
 * Get client's total spent
 */
export const getClientTotalSpent = async (clientId: string): Promise<number> => {
  try {
    // Fetch all stock exits for this client
    const { data: exitData, error: exitError } = await supabase
      .from('stock_exits')
      .select('id')
      .eq('client_id', clientId);
    
    if (exitError) {
      console.error('Error fetching client exits:', exitError);
      return 0;
    }
    
    if (!exitData || exitData.length === 0) {
      return 0;
    }
    
    // Fetch the exit items for all exit IDs
    const exitIds = exitData.map(exit => exit.id);
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('stock_exit_items')
      .select('quantity, sale_price, discount_percent')
      .in('exit_id', exitIds);
    
    if (itemsError) {
      console.error('Error fetching exit items:', itemsError);
      return 0;
    }
    
    // Calculate total spent
    let totalSpent = 0;
    
    if (itemsData && itemsData.length > 0) {
      totalSpent = itemsData.reduce((sum, item) => {
        const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
        return sum + (item.quantity * item.sale_price * discountMultiplier);
      }, 0);
    }
    
    return totalSpent;
  } catch (err) {
    console.error('Exception fetching client total spent:', err);
    return 0;
  }
};

/**
 * Get supplier's total spent
 */
export const getSupplierTotalSpent = async (supplierId: string): Promise<number> => {
  try {
    let totalSpent = 0;
    
    // 1. Buscar todas as entradas (compras) para este fornecedor
    const { data: entryData, error: entryError } = await supabase
      .from('stock_entries')
      .select('id')
      .eq('supplier_id', supplierId)
      .or('status.is.null,status.neq.deleted'); // Include non-deleted entries
    
    if (entryError) {
      console.error('Error fetching supplier entries:', entryError);
    } else if (entryData && entryData.length > 0) {
      // Buscar os itens de entrada para todos os IDs de entrada
      const entryIds = entryData.map(entry => entry.id);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('stock_entry_items')
        .select('quantity, purchase_price, discount_percent')
        .in('entry_id', entryIds);
      
      if (itemsError) {
        console.error('Error fetching entry items:', itemsError);
      } else if (itemsData && itemsData.length > 0) {
        // Calcular o total gasto em compras
        totalSpent += itemsData.reduce((sum, item) => {
          const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
          return sum + (item.quantity * item.purchase_price * discountMultiplier);
        }, 0);
      }
    }
    
    // 2. Buscar todas as despesas para este fornecedor
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('id')
      .eq('supplier_id', supplierId)
      .or('status.is.null,status.neq.deleted'); // Include non-deleted expenses
    
    if (expenseError) {
      console.error('Error fetching supplier expenses:', expenseError);
    } else if (expenseData && expenseData.length > 0) {
      // Buscar os itens de despesa para todos os IDs de despesa
      const expenseIds = expenseData.map(expense => expense.id);
      
      const { data: expenseItemsData, error: expenseItemsError } = await supabase
        .from('expense_items')
        .select('quantity, unit_price, discount_percent')
        .in('expense_id', expenseIds);
      
      if (expenseItemsError) {
        console.error('Error fetching expense items:', expenseItemsError);
      } else if (expenseItemsData && expenseItemsData.length > 0) {
        // Calcular o total gasto em despesas
        totalSpent += expenseItemsData.reduce((sum, item) => {
          const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
          return sum + (item.quantity * item.unit_price * discountMultiplier);
        }, 0);
      }
    }
    
    return totalSpent;
  } catch (err) {
    console.error('Exception fetching supplier total spent:', err);
    return 0;
  }
};
