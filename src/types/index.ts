
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  image: string;
  status: 'active' | 'inactive';
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
  notes?: string;
  status: 'active' | 'inactive';
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
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface StockEntryItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

export interface StockEntry {
  id: string;
  number: string; // Added sequential number
  supplierId: string;
  supplierName: string;
  items: StockEntryItem[];
  invoiceNumber?: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface StockExitItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
}

export interface StockExit {
  id: string;
  number: string; // Added sequential number
  clientId: string;
  clientName: string;
  items: StockExitItem[];
  invoiceNumber?: string;
  notes?: string;
  date: string;
  createdAt: string;
  fromOrderId?: string;
  fromOrderNumber?: string; // Added order number reference
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
}

export interface Order {
  id: string;
  number: string; // Added sequential number
  clientId: string;
  clientName?: string;
  items: OrderItem[];
  date: string;
  notes?: string;
  convertedToStockExitId?: string;
  convertedToStockExitNumber?: string; // Added exit number reference
}

// Backward compatibility interfaces for code that still uses the old format
export interface LegacyStockEntry {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  invoiceNumber?: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface LegacyStockExit {
  id: string;
  clientId: string;
  clientName: string;
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  invoiceNumber?: string;
  notes?: string;
  date: string;
  createdAt: string;
  fromOrderId?: string;
}

export interface LegacyOrder {
  id: string;
  clientId: string;
  clientName?: string;
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  date: string;
  notes?: string;
  convertedToStockExitId?: string;
}

// Added export data type interface for settings page
export type ExportDataType = 'products' | 'categories' | 'clients' | 'suppliers' | 'orders' | 'stockEntries' | 'stockExits';
