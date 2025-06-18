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
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  exportData: (type: ExportDataType) => void;
  importData: (type: ExportDataType, data: string) => Promise<void>;
  // ... other methods omitted for brevity
}

const DataContext = createContext<DataContextType | undefined>(undefined);
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data effects omitted for brevity

  // Place exportData inside DataProvider so it sees state
  const exportData = (type: ExportDataType) => {
    console.log('[exportData] invoked with type:', type);
    let payload: any;
    switch (type) {
      case 'products':      payload = products;      break;
      case 'categories':    payload = categories;    break;
      case 'clients':       payload = clients;       break;
      case 'suppliers':     payload = suppliers;     break;
      case 'orders':        payload = orders;        break;
      case 'stockEntries':  payload = stockEntries;  break;
      case 'stockExits':    payload = stockExits;    break;
      case 'all':
        payload = { products, categories, clients, suppliers, orders, stockEntries, stockExits };
        break;
      default:
        console.error('[exportData] unknown type:', type);
        return;
    }
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `${type}.json`);
  };

  const importData = async (type: ExportDataType, data: string) => {
    // implementation...
  };

  const contextValue: DataContextType = {
    products, categories, clients, suppliers, orders, stockEntries, stockExits,
    exportData, importData,
    // other methods...
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
