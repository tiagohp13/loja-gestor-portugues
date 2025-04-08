
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
  password?: string;
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
  taxId: string; // Changed from taxNumber to taxId
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
  taxId: string; // Changed from taxNumber to taxId
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
  // Additional fields
  supplierId?: string;
  supplierName?: string;
}

export type ExportDataType = 'products' | 'categories' | 'clients' | 'suppliers' | 'orders' | 'stockEntries' | 'stockExits';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  discount: number; // Item-level discount
}

export interface StockEntryItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  discount: number; // Item-level discount
}

export interface StockExitItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  discount: number; // Item-level discount
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
  discount: number; // Order-level discount
  convertedToStockExitId?: string;
  // Additional fields
  deliveryDate?: string;
  paymentMethod?: string;
  shippingAddress?: string;
  billingAddress?: string;
  shippingCost?: number;
  totalAmount?: number;
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
  discount: number; // Entry-level discount
  // Properties for individual entry items
  quantity?: number;
  purchasePrice?: number;
  productId?: string;
  productName?: string;
  reason?: string; // Added this field to match db column
}

export interface StockExit {
  id: string;
  clientId?: string;
  clientName?: string;
  reason: string;
  items: StockExitItem[];
  date: string;
  invoiceNumber?: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  exitNumber: string;
  discount: number; // Exit-level discount
  fromOrderId?: string;
  // Properties for individual exit items
  quantity?: number;
  salePrice?: number;
  productId?: string;
  productName?: string;
}

export interface ClientHistory {
  id: string;
  orders: Order[];
  stockExits: StockExit[];
}

export interface SupplierHistory {
  id: string;
  entries: StockEntry[];
}

export interface ProductHistory {
  entries: StockEntry[];
  exits: StockExit[];
}
