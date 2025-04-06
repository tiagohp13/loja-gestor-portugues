
// Product type
export interface Product {
  id: string;
  name: string;
  code: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  category: string;
  description: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category type
export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Client type
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier type
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Stock Entry type
export interface StockEntry {
  id: string;
  productId: string;
  productName?: string;
  supplierId: string;
  supplierName?: string;
  quantity: number;
  purchasePrice: number;
  date: string;
  invoiceNumber: string;
  createdAt: Date;
}

// Stock Exit type
export interface StockExit {
  id: string;
  productId: string;
  productName?: string;
  clientId: string;
  clientName?: string;
  quantity: number;
  salePrice: number;
  date: string;
  createdAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  totalProducts: number;
  totalClients: number;
  totalSuppliers: number;
  stockValue: number;
  lowStockProducts: Product[];
  recentTransactions: (StockEntry | StockExit)[];
  monthlySales: { month: string; value: number }[];
  monthlyPurchases: { month: string; value: number }[];
  productsByCategory: { category: string; count: number }[];
}
