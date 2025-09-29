import { supabase } from '@/integrations/supabase/client';

export interface DependencyCheck {
  canDelete: boolean;
  message?: string;
  dependencies?: string[];
}

/**
 * Verifica se um produto pode ser eliminado
 */
export const checkProductDependencies = async (productId: string): Promise<DependencyCheck> => {
  try {
    const dependencies: string[] = [];

    // Verificar entradas de stock
    const { data: stockEntries } = await supabase
      .from('stock_entry_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    if (stockEntries && stockEntries.length > 0) {
      dependencies.push('compras');
    }

    // Verificar saídas de stock
    const { data: stockExits } = await supabase
      .from('stock_exit_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    if (stockExits && stockExits.length > 0) {
      dependencies.push('vendas');
    }

    // Verificar encomendas
    const { data: orders } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    if (orders && orders.length > 0) {
      dependencies.push('encomendas');
    }

    if (dependencies.length > 0) {
      return {
        canDelete: false,
        message: `Este produto não pode ser eliminado porque tem ${dependencies.join(', ')} associadas.`,
        dependencies
      };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Erro ao verificar dependências do produto:', error);
    return {
      canDelete: false,
      message: 'Erro ao verificar dependências. Tente novamente.'
    };
  }
};

/**
 * Verifica se uma encomenda pode ser eliminada
 */
export const checkOrderDependencies = async (orderId: string): Promise<DependencyCheck> => {
  try {
    // Verificar se foi convertida em venda
    const { data: order } = await supabase
      .from('orders')
      .select('converted_to_stock_exit_id')
      .eq('id', orderId)
      .single();

    if (order && order.converted_to_stock_exit_id) {
      return {
        canDelete: false,
        message: 'Esta encomenda não pode ser eliminada porque já foi convertida numa venda.',
        dependencies: ['venda']
      };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Erro ao verificar dependências da encomenda:', error);
    return {
      canDelete: false,
      message: 'Erro ao verificar dependências. Tente novamente.'
    };
  }
};

/**
 * Verifica se uma venda pode ser eliminada
 */
export const checkStockExitDependencies = async (exitId: string): Promise<DependencyCheck> => {
  try {
    // Verificar se veio de uma encomenda
    const { data: exit } = await supabase
      .from('stock_exits')
      .select('from_order_id')
      .eq('id', exitId)
      .single();

    if (exit && exit.from_order_id) {
      return {
        canDelete: false,
        message: 'Esta venda não pode ser eliminada porque veio de uma encomenda. Elimine primeiro a encomenda se necessário.',
        dependencies: ['encomenda']
      };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Erro ao verificar dependências da venda:', error);
    return {
      canDelete: false,
      message: 'Erro ao verificar dependências. Tente novamente.'
    };
  }
};

/**
 * Verifica se um cliente pode ser eliminado
 */
export const checkClientDependencies = async (clientId: string): Promise<DependencyCheck> => {
  try {
    const dependencies: string[] = [];

    // Verificar vendas
    const { data: stockExits } = await supabase
      .from('stock_exits')
      .select('id')
      .eq('client_id', clientId)
      .limit(1);

    if (stockExits && stockExits.length > 0) {
      dependencies.push('vendas');
    }

    // Verificar encomendas
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('client_id', clientId)
      .limit(1);

    if (orders && orders.length > 0) {
      dependencies.push('encomendas');
    }

    if (dependencies.length > 0) {
      return {
        canDelete: false,
        message: `Este cliente não pode ser eliminado porque tem ${dependencies.join(', ')} associadas.`,
        dependencies
      };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Erro ao verificar dependências do cliente:', error);
    return {
      canDelete: false,
      message: 'Erro ao verificar dependências. Tente novamente.'
    };
  }
};

/**
 * Verifica se um fornecedor pode ser eliminado
 */
export const checkSupplierDependencies = async (supplierId: string): Promise<DependencyCheck> => {
  try {
    const dependencies: string[] = [];

    // Verificar compras
    const { data: stockEntries } = await supabase
      .from('stock_entries')
      .select('id')
      .eq('supplier_id', supplierId)
      .limit(1);

    if (stockEntries && stockEntries.length > 0) {
      dependencies.push('compras');
    }

    // Verificar despesas
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id')
      .eq('supplier_id', supplierId)
      .limit(1);

    if (expenses && expenses.length > 0) {
      dependencies.push('despesas');
    }

    if (dependencies.length > 0) {
      return {
        canDelete: false,
        message: `Este fornecedor não pode ser eliminado porque tem ${dependencies.join(', ')} associadas.`,
        dependencies
      };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Erro ao verificar dependências do fornecedor:', error);
    return {
      canDelete: false,
      message: 'Erro ao verificar dependências. Tente novamente.'
    };
  }
};

/**
 * Verifica se uma categoria pode ser eliminada
 */
export const checkCategoryDependencies = async (categoryName: string): Promise<DependencyCheck> => {
  try {
    // Verificar produtos
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('category', categoryName)
      .or('status.is.null,status.neq.deleted')
      .limit(1);

    if (products && products.length > 0) {
      return {
        canDelete: false,
        message: 'Esta categoria não pode ser eliminada porque tem produtos associados.',
        dependencies: ['produtos']
      };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Erro ao verificar dependências da categoria:', error);
    return {
      canDelete: false,
      message: 'Erro ao verificar dependências. Tente novamente.'
    };
  }
};

/**
 * Verifica se uma entrada de stock pode ser eliminada
 */
export const checkStockEntryDependencies = async (entryId: string): Promise<DependencyCheck> => {
  try {
    // Para entradas de stock, normalmente podem ser eliminadas
    // Mas se houvesse dependências específicas, verificaríamos aqui
    return { canDelete: true };
  } catch (error) {
    console.error('Erro ao verificar dependências da entrada:', error);
    return {
      canDelete: false,
      message: 'Erro ao verificar dependências. Tente novamente.'
    };
  }
};

/**
 * Verifica se uma despesa pode ser eliminada
 */
export const checkExpenseDependencies = async (expenseId: string): Promise<DependencyCheck> => {
  try {
    // Para despesas, normalmente podem ser eliminadas
    // Mas se houvesse dependências específicas, verificaríamos aqui
    return { canDelete: true };
  } catch (error) {
    console.error('Erro ao verificar dependências da despesa:', error);
    return {
      canDelete: false,
      message: 'Erro ao verificar dependências. Tente novamente.'
    };
  }
};