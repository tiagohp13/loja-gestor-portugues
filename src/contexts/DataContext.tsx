import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import type { Database } from '@/integrations/supabase/types';
import {
  Product, Category, Client, Supplier,
  Order, StockEntry, StockExit, ExportDataType
} from '../types';
import {
  mapDbProductToProduct,
  mapDbCategoryToCategory,
  mapDbClientToClient,
  mapDbSupplierToSupplier,
  mapDbOrderToOrder,
  mapDbStockEntryToStockEntry,
  mapDbStockExitToStockExit
} from '../utils/mappers';

interface DataContextType {
  // Data arrays
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];

  // CRUD methods
  addProduct: (p: Omit<Product,'id'|'createdAt'|'updatedAt'>) => Promise<Product>;
  getProduct: (id: string) => Product | undefined;
  getProductHistory: (id: string) => { entries: StockEntry[]; exits: StockExit[] };
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addCategory: (c: Omit<Category,'id'|'createdAt'|'updatedAt'>) => Promise<Category>;
  getCategory: (id: string) => Category | undefined;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addClient: (c: Omit<Client,'id'|'createdAt'|'updatedAt'>) => Promise<Client>;
  getClient: (id: string) => Client | undefined;
  getClientHistory: (id: string) => { orders: Order[]; exits: StockExit[] };
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addSupplier: (s: Omit<Supplier,'id'|'createdAt'|'updatedAt'>) => Promise<Supplier>;
  getSupplier: (id: string) => Supplier | undefined;
  getSupplierHistory: (id: string) => { entries: StockEntry[] };
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  addOrder: (o: Omit<Order,'id'|'number'>) => Promise<Order>;
  findOrder: (id: string) => Order | undefined;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  convertOrderToStockExit: (orderId: string, invoiceNumber?: string) => Promise<StockExit | undefined>;

  addStockEntry: (e: Omit<StockEntry,'id'|'number'|'createdAt'>) => Promise<StockEntry>;
  updateStockEntry: (id: string, data: Partial<StockEntry>) => Promise<void>;
  deleteStockEntry: (id: string) => Promise<void>;

  addStockExit: (e: Omit<StockExit,'id'|'number'|'createdAt'>) => Promise<StockExit>;
  updateStockExit: (id: string, data: Partial<StockExit>) => Promise<void>;
  deleteStockExit: (id: string) => Promise<void>;

  // Export/Import
  exportData: (type: ExportDataType) => void;
  importData: (type: ExportDataType, data: string) => Promise<void>;

  // Analytics, loading
  getBusinessAnalytics: () => any;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be within DataProvider');
  return ctx;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch and real-time subscriptions omitted for brevity

  // CRUD implementations (omitted bodies) - ensure these exist
  const addProduct = async (...) => { /* ... */ };
  const getProduct = (id: string) => products.find(p=>p.id===id);
  const getProductHistory = (id: string) => ({ entries: stockEntries.filter(e=>...), exits: stockExits.filter(e=>...) });
  const updateProduct = async (id, data) => { /* ... */ };
  const deleteProduct = async id => { /* ... */ };
  // Repeat for Category, Client, Supplier, Order, StockEntry, StockExit

  const exportData = (type: ExportDataType) => {
    let payload: any;
    switch(type) {
      case 'products': payload = products; break;
      case 'categories': payload = categories; break;
      case 'clients': payload = clients; break;
      case 'suppliers': payload = suppliers; break;
      case 'orders': payload = orders; break;
      case 'stockEntries': payload = stockEntries; break;
      case 'stockExits': payload = stockExits; break;
      case 'all': payload = { products, categories, clients, suppliers, orders, stockEntries, stockExits }; break;
      default: return;
    }
    const blob = new Blob([JSON.stringify(payload, null,2)], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `${type}.json`);
  };

  const importData = async (type: ExportDataType, data: string) => { /* ... */ };

  const contextValue: DataContextType = {
    products, categories, clients, suppliers, orders, stockEntries, stockExits,
    addProduct, getProduct, getProductHistory, updateProduct, deleteProduct,
    addCategory, getCategory, updateCategory, deleteCategory,
    addClient, getClient, getClientHistory, updateClient, deleteClient,
    addSupplier, getSupplier, getSupplierHistory, updateSupplier, deleteSupplier,
    addOrder, findOrder, updateOrder, deleteOrder, convertOrderToStockExit,
    addStockEntry, updateStockEntry, deleteStockEntry,
    addStockExit, updateStockExit, deleteStockExit,
    exportData, importData,
    getBusinessAnalytics: () => ({}),
    isLoading, setIsLoading
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
