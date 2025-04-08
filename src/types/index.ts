export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
  nome?: string;
  telefone?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount?: number;
  status?: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  notes: string;
  status?: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  notes: string;
  status?: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  status?: 'active' | 'inactive';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExportDataType = 'products' | 'categories' | 'clients' | 'suppliers' | 'orders' | 'stockEntries' | 'stockExits';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
}

export interface StockEntryItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

export interface StockExitItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  date: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  discount: number;
}

export interface StockEntry {
  id: string;
  supplierId: string;
  supplierName: string;
  items: StockEntryItem[];
  date: string;
  invoiceNumber?: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  entryNumber: string;
  discount: number;
}

export interface StockExit {
  id: string;
  reason: string;
  items: StockExitItem[];
  date: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  exitNumber: string;
  discount: number;
}
