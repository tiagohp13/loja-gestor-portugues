import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, snakeToCamel, increment, decrement } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { 
  Product, Category, Client, Supplier, 
  Order, OrderItem, StockEntry, StockEntryItem,
  StockExit, StockExitItem, ExportDataType, Expense, ExpenseItem
} from '../types';
import {
  mapDbProductToProduct, 
  mapDbCategoryToCategory,
  mapDbClientToClient,
  mapDbSupplierToSupplier,
  mapDbOrderToOrder,
  mapDbOrderItemToOrderItem,
  mapDbStockEntryToStockEntry,
  mapDbStockEntryItemToStockEntryItem,
  mapDbStockExitToStockExit,
  mapDbStockExitItemToStockExitItem,
  mapOrderItemToDbOrderItem,
  mapStockEntryItemToDbStockEntryItem,
  mapStockExitItemToDbStockExitItem
} from '../utils/mappers';

interface DataProviderProps {
  children: React.ReactNode;
}

interface DataContextType {
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  expenses: Expense[];
  addOrder: (orderData: Omit<Order, 'id' | 'number'>) => Promise<Order>;
  addStockEntry: (entryData: Omit<StockEntry, 'id' | 'number' | 'createdAt'>) => Promise<StockEntry>;
  addStockExit: (exitData: Omit<StockExit, 'id' | 'number' | 'createdAt'>) => Promise<StockExit>;
  exportData: (dataType: ExportDataType) => any[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const generateId = () => crypto.randomUUID();

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    // Fetch data on mount
    fetchProducts();
    fetchCategories();
    fetchClients();
    fetchSuppliers();
    fetchOrders();
    fetchStockEntries();
    fetchStockExits();
    fetchExpenses();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    setProducts(data.map(mapDbProductToProduct));
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data.map(mapDbCategoryToCategory));
  };

  const fetchClients = async () => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }
    setClients(data.map(mapDbClientToClient));
  };

  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) {
      console.error('Error fetching suppliers:', error);
      return;
    }
    setSuppliers(data.map(mapDbSupplierToSupplier));
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    setOrders(data.map(mapDbOrderToOrder));
  };

  const fetchStockEntries = async () => {
    const { data, error } = await supabase.from('stock_entries').select('*');
    if (error) {
      console.error('Error fetching stock entries:', error);
      return;
    }
    setStockEntries(data.map(mapDbStockEntryToStockEntry));
  };

  const fetchStockExits = async () => {
    const { data, error } = await supabase.from('stock_exits').select('*');
    if (error) {
      console.error('Error fetching stock exits:', error);
      return;
    }
    setStockExits(data.map(mapDbStockExitToStockExit));
  };

  const fetchExpenses = async () => {
    const { data, error } = await supabase.from('expenses').select('*');
    if (error) {
      console.error('Error fetching expenses:', error);
      return;
    }
    setExpenses(data);
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'number'>): Promise<Order> => {
    try {
      const { data: counterData } = await supabase.rpc('get_next_counter', { 
        counter_id: 'orders' 
      });
      
      const orderNumber = `E${counterData}`;
      
      const newOrder = {
        ...orderData,
        id: generateId(),
        number: orderNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { error } = await supabase.from('orders').insert(newOrder);
      if (error) {
        throw error;
      }
      
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const addStockEntry = async (entryData: Omit<StockEntry, 'id' | 'number' | 'createdAt'>): Promise<StockEntry> => {
    try {
      const { data: counterData } = await supabase.rpc('get_next_counter', { 
        counter_id: 'stock_entries' 
      });
      
      const entryNumber = `C${counterData}`;
      
      const newEntry = {
        ...entryData,
        id: generateId(),
        number: entryNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { error } = await supabase.from('stock_entries').insert(newEntry);
      if (error) {
        throw error;
      }
      
      return newEntry;
    } catch (error) {
      console.error('Error adding stock entry:', error);
      throw error;
    }
  };

  const addStockExit = async (exitData: Omit<StockExit, 'id' | 'number' | 'createdAt'>): Promise<StockExit> => {
    try {
      const { data: counterData } = await supabase.rpc('get_next_counter', { 
        counter_id: 'stock_exits' 
      });
      
      const exitNumber = `V${counterData}`;
      
      const newExit = {
        ...exitData,
        id: generateId(),
        number: exitNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { error } = await supabase.from('stock_exits').insert(newExit);
      if (error) {
        throw error;
      }
      
      return newExit;
    } catch (error) {
      console.error('Error adding stock exit:', error);
      throw error;
    }
  };

  const exportData = (dataType: ExportDataType) => {
    const dataMap = {
      products,
      categories,
      clients,
      suppliers,
      orders,
      stockEntries,
      stockExits,
      expenses: expenses,
      all: {
        products,
        categories,
        clients,
        suppliers,
        orders,
        stockEntries,
        stockExits,
        expenses
      }
    };
    
    if (dataType === 'expenses') {
      return expenses;
    }
    
    return dataMap[dataType] || [];
  };

  return (
    <DataContext.Provider value={{
      products,
      categories,
      clients,
      suppliers,
      orders,
      stockEntries,
      stockExits,
      expenses,
      addOrder,
      addStockEntry,
      addStockExit,
      exportData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
