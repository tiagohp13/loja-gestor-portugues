
export interface SupportChartData {
  label: string;
  value: number;
}

export interface ProductData {
  id: string;
  name: string;
  sales: number;
  profit: number;
  quantity?: number; // Adding optional quantity field to fix compatibility
}

export interface ClientData {
  id: string;
  name: string;
  spent: number;
  orders: number;
}

export interface SupplierData {
  id: string;
  name: string;
  spent: number;
  purchases: number;
  entries: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
}

export interface MonthlyOrderData {
  month: string;
  count: number;
  completedExits: number;
}

export interface SupportStats {
  totalSales: number;
  totalSpent: number;
  profit: number;
  profitMargin: number;
  clientsCount: number;
  suppliersCount: number;
  categoriesCount: number;
  productsCount: number;
  pendingOrders: number;
  monthlyData: SupportChartData[];
  topProducts: ProductData[];
  topClients: ClientData[];
  topSuppliers: SupplierData[];
  lowStockProducts: LowStockProduct[];
  monthlyOrders: MonthlyOrderData[];
}

export interface KpiData {
  id: string;
  name: string;
  value: number;
  target: number;
  description: string;
  isPercentage: boolean;
}
