
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  code: string; // Changed from internalCode
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  image?: string; // Changed from photo
  description?: string; // Added description
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  phone?: string; // Changed from contact
  email: string;
  address?: string; // Added address
  notes?: string; // Added notes
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string; // Changed from contact
  email: string;
  address?: string; // Added address
  notes?: string; // Added notes
  createdAt: Date;
  updatedAt: Date;
}

export interface StockEntry {
  id: string;
  productId: string;
  product?: Product;
  supplierId: string;
  supplier?: Supplier;
  quantity: number;
  purchasePrice: number;
  invoiceNumber: string;
  date: Date;
  createdAt: Date;
}

export interface StockExit {
  id: string;
  productId: string;
  product?: Product;
  clientId: string;
  client?: Client;
  quantity: number;
  salePrice: number;
  date: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
