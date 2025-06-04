
export interface MonthlyDataItem {
  name: string;
  vendas: number;
  compras: number;
}

export interface MonthlyOrderItem {
  name: string;
  orders: number;
  completedExits: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  productId?: string;
}

export interface TopClient {
  name: string;
  orders: number;
  spending: number;
}

export interface TopSupplier {
  name: string;
  entries: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
}

export interface SupportStats {
  totalSales: number;
  totalSpent: number;
  profit: number;
  profitMargin: number;
  topProducts: TopProduct[];
  topClients: TopClient[];
  topSuppliers: TopSupplier[];
  lowStockProducts: LowStockProduct[];
  pendingOrders: number;
  completedOrders: number;
  clientsCount: number;
  suppliersCount: number;
  categoriesCount: number;
  productsCount: number;
  monthlySales: number[];
  monthlyData: MonthlyDataItem[];
  monthlyOrders: MonthlyOrderItem[];
  // Novo campo para contar o número de despesas
  numberOfExpenses: number;
}
