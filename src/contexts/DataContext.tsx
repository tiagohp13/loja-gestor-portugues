import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, snakeToCamel, increment, decrement } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { 
  Product, Category, Client, Supplier, 
  Order, OrderItem, StockEntry, StockEntryItem,
  StockExit, StockExitItem, ExportDataType
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

// ... other context and state setup ...

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
      console.error('[exportData] tipo desconhecido:', type);
      return;
  }
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${type}.json`);
};

// ... rest of DataProvider code, including importData, updateData, and provider return ...

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // state declarations: products, categories, clients, suppliers, orders, stockEntries, stockExits, isLoading

  // useEffect calls to fetch data and subscribe to real-time updates

  // CRUD and utility functions (addProduct, updateProduct, etc.)

  // Place the updated exportData here alongside importData and updateData

  const contextValue = {
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getProductHistory,
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    clients,
    setClients,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    getClientHistory,
    suppliers,
    setSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplier,
    getSupplierHistory,
    orders,
    setOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    findOrder,
    findProduct,
    findClient,
    convertOrderToStockExit,
    stockEntries,
    setStockEntries,
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    stockExits,
    setStockExits,
    addStockExit,
    updateStockExit,
    deleteStockExit,
    exportData,
    importData,
    updateData,
    getBusinessAnalytics,
    isLoading,
    setIsLoading
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
