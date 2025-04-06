
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
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StockEntry {
  id: string;
  productId: string;
  productName?: string;
  supplierId: string;
  supplierName?: string;
  quantity: number;
  purchasePrice: number;
  invoiceNumber?: string;
  notes?: string;
  date: string;
  createdAt: Date | string;
}

export interface StockExit {
  id: string;
  productId: string;
  productName?: string;
  clientId: string;
  clientName?: string;
  quantity: number;
  salePrice: number;
  notes?: string;
  date: string;
  createdAt: Date | string;
}
