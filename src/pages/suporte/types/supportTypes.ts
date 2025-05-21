
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
