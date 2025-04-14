export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
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
  createdAt: string;
  updatedAt: string;
  image?: string;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  productCount?: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

export interface ClientWithAddress {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  address?: {
    street: string;
    postalCode: string;
    city: string;
  };
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

export interface SupplierWithAddress {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxId: string;
  paymentTerms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  address?: {
    street: string;
    postalCode: string;
    city: string;
  };
}

export interface StockEntryItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  discountPercent?: number;
}

export interface StockExit {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  items: StockExitItem[];
  date: string;
  invoiceNumber?: string;
  notes?: string;
  fromOrderId?: string;
  fromOrderNumber?: string;
  createdAt: string;
  discount?: number;
}

export interface StockExitItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  discountPercent?: number;
}

export interface StockEntry {
  id: string;
  type?: 'purchase' | 'consumption';
  number: string;
  supplierId: string;
  supplierName: string;
  date: string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  items: StockEntryItem[];
  type?: string;
  status?: string;
}

export interface Order {
  id: string;
  number: string;
  clientId: string;
  clientName?: string;
  items: OrderItem[];
  date: string;
  notes?: string;
  convertedToStockExitId?: string;
  convertedToStockExitNumber?: string;
  discount?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  discountPercent?: number;
}

export type ExportDataType = 'products' | 'categories' | 'clients' | 'suppliers' | 'orders' | 'stockEntries' | 'stockExits';

export interface LegacyStockEntry {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  purchasePrice: number;
  invoiceNumber: string;
  notes: string;
  date: string;
  createdAt: string;
}

export interface LegacyStockExit {
  id: string;
  productId: string;
  productName: string;
  clientId: string;
  clientName: string;
  quantity: number;
  salePrice: number;
  invoiceNumber: string;
  notes: string;
  date: string;
  createdAt: string;
  fromOrderId?: string;
}

export interface LegacyOrder {
  id: string;
  productId: string;
  productName: string;
  clientId: string;
  clientName: string;
  quantity: number;
  salePrice: number;
  date: string;
  notes: string;
  convertedToStockExitId?: string;
}
