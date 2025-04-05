
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Client, Supplier, StockEntry, StockExit } from '../types';
import { products as initialProducts, clients as initialClients, suppliers as initialSuppliers, stockEntries as initialEntries, stockExits as initialExits } from '../data/mockData';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  products: Product[];
  clients: Client[];
  suppliers: Supplier[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  
  // CRUD operations for products
  getProduct: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // CRUD operations for clients
  getClient: (id: string) => Client | undefined;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // CRUD operations for suppliers
  getSupplier: (id: string) => Supplier | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Stock operations
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt'>) => void;
  addStockExit: (exit: Omit<StockExit, 'id' | 'createdAt'>) => void;
  
  // Get histories
  getProductHistory: (productId: string) => { entries: StockEntry[], exits: StockExit[] };
  getClientHistory: (clientId: string) => StockExit[];
  getSupplierHistory: (supplierId: string) => StockEntry[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const loadFromLocalStorage = <T,>(key: string, initialData: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initialData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return initialData;
  }
};

const saveToLocalStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => 
    loadFromLocalStorage('products', initialProducts));
  
  const [clients, setClients] = useState<Client[]>(() => 
    loadFromLocalStorage('clients', initialClients));
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => 
    loadFromLocalStorage('suppliers', initialSuppliers));
  
  const [stockEntries, setStockEntries] = useState<StockEntry[]>(() => 
    loadFromLocalStorage('stockEntries', initialEntries));
  
  const [stockExits, setStockExits] = useState<StockExit[]>(() => 
    loadFromLocalStorage('stockExits', initialExits));
  
  // Save to localStorage when data changes
  useEffect(() => {
    saveToLocalStorage('products', products);
  }, [products]);
  
  useEffect(() => {
    saveToLocalStorage('clients', clients);
  }, [clients]);
  
  useEffect(() => {
    saveToLocalStorage('suppliers', suppliers);
  }, [suppliers]);
  
  useEffect(() => {
    saveToLocalStorage('stockEntries', stockEntries);
  }, [stockEntries]);
  
  useEffect(() => {
    saveToLocalStorage('stockExits', stockExits);
  }, [stockExits]);
  
  // Product CRUD
  const getProduct = (id: string) => products.find(p => p.id === id);
  
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
    toast.success('Produto adicionado com sucesso');
  };
  
  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...product, updatedAt: new Date() } 
        : p
    ));
    toast.success('Produto atualizado com sucesso');
  };
  
  const deleteProduct = (id: string) => {
    // Check if product has related entries or exits
    const hasEntries = stockEntries.some(entry => entry.productId === id);
    const hasExits = stockExits.some(exit => exit.productId === id);
    
    if (hasEntries || hasExits) {
      toast.error('Não é possível eliminar este produto pois tem movimentos associados');
      return;
    }
    
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produto eliminado com sucesso');
  };
  
  // Client CRUD
  const getClient = (id: string) => clients.find(c => c.id === id);
  
  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...client,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setClients(prev => [...prev, newClient]);
    toast.success('Cliente adicionado com sucesso');
  };
  
  const updateClient = (id: string, client: Partial<Client>) => {
    setClients(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...client, updatedAt: new Date() } 
        : c
    ));
    toast.success('Cliente atualizado com sucesso');
  };
  
  const deleteClient = (id: string) => {
    // Check if client has related exits
    const hasExits = stockExits.some(exit => exit.clientId === id);
    
    if (hasExits) {
      toast.error('Não é possível eliminar este cliente pois tem vendas associadas');
      return;
    }
    
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('Cliente eliminado com sucesso');
  };
  
  // Supplier CRUD
  const getSupplier = (id: string) => suppliers.find(s => s.id === id);
  
  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSuppliers(prev => [...prev, newSupplier]);
    toast.success('Fornecedor adicionado com sucesso');
  };
  
  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => 
      s.id === id 
        ? { ...s, ...supplier, updatedAt: new Date() } 
        : s
    ));
    toast.success('Fornecedor atualizado com sucesso');
  };
  
  const deleteSupplier = (id: string) => {
    // Check if supplier has related entries
    const hasEntries = stockEntries.some(entry => entry.supplierId === id);
    
    if (hasEntries) {
      toast.error('Não é possível eliminar este fornecedor pois tem entregas associadas');
      return;
    }
    
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast.success('Fornecedor eliminado com sucesso');
  };
  
  // Stock operations
  const addStockEntry = (entry: Omit<StockEntry, 'id' | 'createdAt'>) => {
    const newEntry: StockEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date()
    };
    
    setStockEntries(prev => [...prev, newEntry]);
    
    // Update product stock
    const product = products.find(p => p.id === entry.productId);
    if (product) {
      updateProduct(product.id, {
        currentStock: product.currentStock + entry.quantity
      });
    }
    
    toast.success('Entrada de stock registada com sucesso');
  };
  
  const addStockExit = (exit: Omit<StockExit, 'id' | 'createdAt'>) => {
    const product = products.find(p => p.id === exit.productId);
    
    // Check if there's enough stock
    if (!product || product.currentStock < exit.quantity) {
      toast.error('Stock insuficiente para realizar esta operação');
      return;
    }
    
    const newExit: StockExit = {
      ...exit,
      id: uuidv4(),
      createdAt: new Date()
    };
    
    setStockExits(prev => [...prev, newExit]);
    
    // Update product stock
    updateProduct(product.id, {
      currentStock: product.currentStock - exit.quantity
    });
    
    toast.success('Saída de stock registada com sucesso');
  };
  
  // Get histories
  const getProductHistory = (productId: string) => {
    const entries = stockEntries.filter(entry => entry.productId === productId);
    const exits = stockExits.filter(exit => exit.productId === productId);
    return { entries, exits };
  };
  
  const getClientHistory = (clientId: string) => {
    return stockExits.filter(exit => exit.clientId === clientId);
  };
  
  const getSupplierHistory = (supplierId: string) => {
    return stockEntries.filter(entry => entry.supplierId === supplierId);
  };
  
  const value: DataContextType = {
    products,
    clients,
    suppliers,
    stockEntries,
    stockExits,
    
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    
    getClient,
    addClient,
    updateClient,
    deleteClient,
    
    getSupplier,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    
    addStockEntry,
    addStockExit,
    
    getProductHistory,
    getClientHistory,
    getSupplierHistory
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
