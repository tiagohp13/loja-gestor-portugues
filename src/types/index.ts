
export interface Product {
  id: string;
  userId?: string;
  code: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  salePrice: number;
  purchasePrice: number;
  currentStock: number;
  minStock: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  status?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithAddress extends Client {
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface Supplier {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  paymentTerms?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierWithAddress extends Supplier {
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface Order {
  id: string;
  userId?: string;
  number: string;
  clientId?: string;
  clientName?: string;
  date: string;
  notes?: string;
  discount?: number;
  total?: number;
  convertedToStockExitId?: string;
  convertedToStockExitNumber?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId?: string;
  productName: string;
  quantity: number;
  salePrice: number;
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockEntry {
  id: string;
  userId?: string;
  number: string;
  supplierId: string;
  supplierName: string;
  date: string;
  invoiceNumber?: string;
  notes?: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
  items: StockEntryItem[];
}

export interface StockEntryItem {
  id: string;
  entryId?: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockExit {
  id: string;
  userId?: string;
  number: string;
  clientId?: string;
  clientName: string;
  date: string;
  notes?: string;
  discount?: number;
  fromOrderId?: string;
  fromOrderNumber?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
  items: StockExitItem[];
}

export interface StockExitItem {
  id: string;
  exitId?: string;
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId?: string;
  number: string;
  supplierId?: string;
  supplierName: string;
  date: string;
  notes?: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
  items: ExpenseItem[];
}

export interface ExpenseItem {
  id: string;
  expenseId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

// Legacy types for mockData compatibility
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface LegacyStockEntry {
  id: string;
  number: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: any[];
}

export interface LegacyStockExit {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  items: any[];
}

export interface LegacyOrder {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  items: any[];
}

export type ExportDataType = 'products' | 'categories' | 'clients' | 'suppliers' | 'orders' | 'stockEntries' | 'stockExits' | 'expenses' | 'all';
