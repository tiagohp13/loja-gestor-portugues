import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product, Category, Client, Supplier, Order, OrderItem, StockEntry, StockEntryItem, StockExit, StockExitItem } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface DataContextType {
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderNumber' | 'discount'>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'entryNumber' | 'discount'>) => Promise<StockEntry>;
  updateStockEntry: (id: string, updates: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;
  addStockExit: (exit: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'exitNumber' | 'discount'>) => Promise<StockExit>;
  updateStockExit: (id: string, updates: Partial<StockExit>) => void;
  deleteStockExit: (id: string) => void;
  updateProductStock: (productId: string, quantityChange: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productsData = localStorage.getItem('products');
      if (productsData) setProducts(JSON.parse(productsData));

      const categoriesData = localStorage.getItem('categories');
      if (categoriesData) setCategories(JSON.parse(categoriesData));

      const clientsData = localStorage.getItem('clients');
      if (clientsData) setClients(JSON.parse(clientsData));

      const suppliersData = localStorage.getItem('suppliers');
      if (suppliersData) setSuppliers(JSON.parse(suppliersData));

      const ordersData = localStorage.getItem('orders');
      if (ordersData) setOrders(JSON.parse(ordersData));

      const stockEntriesData = localStorage.getItem('stockEntries');
      if (stockEntriesData) setStockEntries(JSON.parse(stockEntriesData));

      const stockExitsData = localStorage.getItem('stockExits');
      if (stockExitsData) setStockExits(JSON.parse(stockExitsData));
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  };

  const saveData = (key: string, data: any[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  const generateOrderNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'orders' });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating order number:", error);
      return `${new Date().getFullYear()}/???`;
    }
  };

  const generateStockEntryNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'stock_entries' });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating stock entry number:", error);
      return `${new Date().getFullYear()}/???`;
    }
  };

  const generateStockExitNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'stock_exits' });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating stock exit number:", error);
      return `${new Date().getFullYear()}/???`;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const newProduct: Product = {
      id: uuidv4(),
      ...productData,
      currentStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
    saveData('products', [...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updates, updatedAt: new Date().toISOString() } : product
    );
    setProducts(updatedProducts);
    saveData('products', updatedProducts);
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    saveData('products', updatedProducts);
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const newCategory: Category = {
      id: uuidv4(),
      ...categoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCategories(prev => [newCategory, ...prev]);
    saveData('categories', [...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(category =>
      category.id === id ? { ...category, ...updates, updatedAt: new Date().toISOString() } : category
    );
    setCategories(updatedCategories);
    saveData('categories', updatedCategories);
  };

  const deleteCategory = (id: string) => {
    const updatedCategories = categories.filter(category => category.id !== id);
    setCategories(updatedCategories);
    saveData('categories', updatedCategories);
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const newClient: Client = {
      id: uuidv4(),
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
    saveData('clients', [...clients, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updatedClients = clients.map(client =>
      client.id === id ? { ...client, ...updates, updatedAt: new Date().toISOString() } : client
    );
    setClients(updatedClients);
    saveData('clients', updatedClients);
  };

  const deleteClient = (id: string) => {
    const updatedClients = clients.filter(client => client.id !== id);
    setClients(updatedClients);
    saveData('clients', updatedClients);
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const newSupplier: Supplier = {
      id: uuidv4(),
      ...supplierData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    saveData('suppliers', [...suppliers, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const updatedSuppliers = suppliers.map(supplier =>
      supplier.id === id ? { ...supplier, ...updates, updatedAt: new Date().toISOString() } : supplier
    );
    setSuppliers(updatedSuppliers);
    saveData('suppliers', updatedSuppliers);
  };

  const deleteSupplier = (id: string) => {
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
    setSuppliers(updatedSuppliers);
    saveData('suppliers', updatedSuppliers);
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderNumber' | 'discount'>) => {
    const orderNumber = await generateOrderNumber();
    const newOrder: Order = {
      id: uuidv4(),
      ...orderData,
      orderNumber: orderNumber,
      status: 'pending', // Default status
      discount: 0, // Default discount
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    saveData('orders', [...orders, newOrder]);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const updatedOrders = orders.map(order =>
      order.id === id ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
    );
    setOrders(updatedOrders);
    saveData('orders', updatedOrders);
  };

  const deleteOrder = (id: string) => {
    const updatedOrders = orders.filter(order => order.id !== id);
    setOrders(updatedOrders);
    saveData('orders', updatedOrders);
  };

  const addStockEntry = async (entryData: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'entryNumber' | 'discount'>) => {
    const entryNumber = await generateStockEntryNumber();
    const newEntry: StockEntry = {
      id: uuidv4(),
      ...entryData,
      entryNumber: entryNumber,
      status: 'completed', // Default status
      discount: 0, // Default discount
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update product stock quantities
    newEntry.items.forEach(item => {
      updateProductStock(item.productId, item.quantity);
    });
    
    setStockEntries(prev => [newEntry, ...prev]);
    saveData('stockEntries', [...stockEntries, newEntry]);
    return newEntry;
  };

  const updateStockEntry = (id: string, updates: Partial<StockEntry>) => {
    const updatedStockEntries = stockEntries.map(entry =>
      entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
    );
    setStockEntries(updatedStockEntries);
    saveData('stockEntries', updatedStockEntries);
  };

  const deleteStockEntry = (id: string) => {
    const updatedStockEntries = stockEntries.filter(entry => entry.id !== id);
    setStockEntries(updatedStockEntries);
    saveData('stockEntries', updatedStockEntries);
  };

  const addStockExit = async (exitData: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'exitNumber' | 'discount'>) => {
    const exitNumber = await generateStockExitNumber();
    const newExit: StockExit = {
      id: uuidv4(),
      ...exitData,
      exitNumber: exitNumber,
      status: 'completed', // Default status
      discount: 0, // Default discount
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update product stock quantities (negative for exits)
    newExit.items.forEach(item => {
      updateProductStock(item.productId, -item.quantity);
    });
    
    setStockExits(prev => [newExit, ...prev]);
    saveData('stockExits', [...stockExits, newExit]);
    return newExit;
  };

  const updateStockExit = (id: string, updates: Partial<StockExit>) => {
    const updatedStockExits = stockExits.map(exit =>
      exit.id === id ? { ...exit, ...updates, updatedAt: new Date().toISOString() } : exit
    );
    setStockExits(updatedStockExits);
    saveData('stockExits', updatedStockExits);
  };

  const deleteStockExit = (id: string) => {
    const updatedStockExits = stockExits.filter(exit => exit.id !== id);
    setStockExits(updatedStockExits);
    saveData('stockExits', updatedStockExits);
  };

  const updateProductStock = (productId: string, quantityChange: number) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        const newStock = Math.max(0, product.currentStock + quantityChange);
        return { ...product, currentStock: newStock, updatedAt: new Date().toISOString() };
      }
      return product;
    });
    setProducts(updatedProducts);
    saveData('products', updatedProducts);
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
      updateProductStock,
    }}>
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
