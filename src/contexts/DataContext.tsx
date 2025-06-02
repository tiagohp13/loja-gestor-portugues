import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Product, 
  Category, 
  Client, 
  Supplier, 
  Order, 
  StockEntry, 
  StockExit, 
  Expense,
  StockEntryItem,
  StockExitItem,
  OrderItem,
  ExpenseItem
} from '../types';
import { mockProducts, mockCategories, mockClients, mockSuppliers } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique ID
const generateId = () => uuidv4();

interface DataContextType {
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  expenses: Expense[];
  
  // Add methods
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  
  addOrder: (order: Omit<Order, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  
  addStockEntry: (entry: { supplierId: string; supplierName: string; items: StockEntryItem[]; date: string; invoiceNumber: string; notes: string; total: number; }) => Promise<StockEntry>;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => Promise<StockEntry>;
  deleteStockEntry: (id: string) => Promise<void>;
  
  addStockExit: (exit: Omit<StockExit, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Promise<StockExit>;
  updateStockExit: (id: string, exit: Partial<StockExit>) => Promise<StockExit>;
  deleteStockExit: (id: string) => Promise<void>;
  
  addExpense: (expense: Omit<Expense, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  
  exportData: <T extends keyof DataContextType>(type: T) => DataContextType[T];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Initialize with mock data
  useEffect(() => {
    setProducts(mockProducts);
    setCategories(mockCategories);
    setClients(mockClients);
    setSuppliers(mockSuppliers);
  }, []);

  // Product operations
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
    const updatedProduct = { ...productData, id, updatedAt: new Date().toISOString() } as Product;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    return updatedProduct;
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Category operations
  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const newCategory: Category = {
      ...categoryData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const updatedCategory = { ...categoryData, id, updatedAt: new Date().toISOString() } as Category;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedCategory } : c));
    return updatedCategory;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Client operations
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client> => {
    const updatedClient = { ...clientData, id, updatedAt: new Date().toISOString() } as Client;
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));
    return updatedClient;
  };

  const deleteClient = async (id: string): Promise<void> => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Supplier operations
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>): Promise<Supplier> => {
    const updatedSupplier = { ...supplierData, id, updatedAt: new Date().toISOString() } as Supplier;
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updatedSupplier } : s));
    return updatedSupplier;
  };

  const deleteSupplier = async (id: string): Promise<void> => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Order operations
  const addOrder = async (orderData: Omit<Order, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const orderNumber = `ORD-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: generateId(),
      number: orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderData.items.map(item => ({
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
    const updatedOrder = { ...orderData, id, updatedAt: new Date().toISOString() } as Order;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updatedOrder } : o));
    return updatedOrder;
  };

  const deleteOrder = async (id: string): Promise<void> => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // Stock Entry operations
  const addStockEntry = async (entryData: { supplierId: string; supplierName: string; items: StockEntryItem[]; date: string; invoiceNumber: string; notes: string; total: number; }): Promise<StockEntry> => {
    const entryNumber = `ENT-${Date.now()}`;
    const newEntry: StockEntry = {
      id: generateId(),
      number: entryNumber,
      supplierId: entryData.supplierId,
      supplierName: entryData.supplierName,
      date: entryData.date,
      invoiceNumber: entryData.invoiceNumber,
      notes: entryData.notes,
      discount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: entryData.items.map(item => ({
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    };
    
    setStockEntries(prev => [...prev, newEntry]);
    
    // Update product stock
    entryData.items.forEach(item => {
      setProducts(prev => prev.map(product => 
        product.id === item.productId 
          ? { ...product, currentStock: product.currentStock + item.quantity }
          : product
      ));
    });
    
    return newEntry;
  };

  const updateStockEntry = async (id: string, entryData: Partial<StockEntry>): Promise<StockEntry> => {
    const updatedEntry = { ...entryData, id, updatedAt: new Date().toISOString() } as StockEntry;
    setStockEntries(prev => prev.map(e => e.id === id ? { ...e, ...updatedEntry } : e));
    return updatedEntry;
  };

  const deleteStockEntry = async (id: string): Promise<void> => {
    setStockEntries(prev => prev.filter(e => e.id !== id));
  };

  // Stock Exit operations
  const addStockExit = async (exitData: Omit<StockExit, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Promise<StockExit> => {
    const exitNumber = `SAI-${Date.now()}`;
    const newExit: StockExit = {
      ...exitData,
      id: generateId(),
      number: exitNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: exitData.items.map(item => ({
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    };
    
    setStockExits(prev => [...prev, newExit]);
    
    // Update product stock
    exitData.items.forEach(item => {
      setProducts(prev => prev.map(product => 
        product.id === item.productId 
          ? { ...product, currentStock: Math.max(0, product.currentStock - item.quantity) }
          : product
      ));
    });
    
    return newExit;
  };

  const updateStockExit = async (id: string, exitData: Partial<StockExit>): Promise<StockExit> => {
    const updatedExit = { ...exitData, id, updatedAt: new Date().toISOString() } as StockExit;
    setStockExits(prev => prev.map(e => e.id === id ? { ...e, ...updatedExit } : e));
    return updatedExit;
  };

  const deleteStockExit = async (id: string): Promise<void> => {
    setStockExits(prev => prev.filter(e => e.id !== id));
  };

  // Expense operations
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
    const expenseNumber = `EXP-${Date.now()}`;
    const newExpense: Expense = {
      ...expenseData,
      id: generateId(),
      number: expenseNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: expenseData.items.map(item => ({
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        discountPercent: item.discountPercent || 0,
      }))
    };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>): Promise<Expense> => {
    const updatedExpense = { ...expenseData, id, updatedAt: new Date().toISOString() } as Expense;
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedExpense } : e));
    return updatedExpense;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Export data function
  const exportData = <T extends keyof DataContextType>(type: T): DataContextType[T] => {
    switch (type) {
      case 'products': return products as DataContextType[T];
      case 'categories': return categories as DataContextType[T];
      case 'clients': return clients as DataContextType[T];
      case 'suppliers': return suppliers as DataContextType[T];
      case 'orders': return orders as DataContextType[T];
      case 'stockEntries': return stockEntries as DataContextType[T];
      case 'stockExits': return stockExits as DataContextType[T];
      case 'expenses': return expenses as DataContextType[T];
      default: return [] as DataContextType[T];
    }
  };

  const value: DataContextType = {
    products,
    categories,
    clients,
    suppliers,
    orders,
    stockEntries,
    stockExits,
    expenses,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addClient,
    updateClient,
    deleteClient,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addOrder,
    updateOrder,
    deleteOrder,
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    addStockExit,
    updateStockExit,
    deleteStockExit,
    addExpense,
    updateExpense,
    deleteExpense,
    exportData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
