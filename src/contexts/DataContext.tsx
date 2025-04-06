
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Client, Supplier, StockEntry, StockExit, Category } from '../types';
import { products as initialProducts, clients as initialClients, suppliers as initialSuppliers, stockEntries as initialEntries, stockExits as initialExits } from '../data/mockData';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  products: Product[];
  clients: Client[];
  suppliers: Supplier[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  categories: Category[];
  
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
  
  // CRUD operations for categories
  getCategory: (id: string) => Category | undefined;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Stock operations
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt'>) => void;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;
  
  addStockExit: (exit: Omit<StockExit, 'id' | 'createdAt'>) => void;
  updateStockExit: (id: string, exit: Partial<StockExit>) => void;
  deleteStockExit: (id: string) => void;
  
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

// Initial categories data
const initialCategories: Category[] = [
  {
    id: uuidv4(),
    name: 'Mobiliário',
    description: 'Móveis para casa e escritório',
    productCount: 4,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: uuidv4(),
    name: 'Eletrônica',
    description: 'Produtos eletrônicos',
    productCount: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: uuidv4(),
    name: 'Vivos',
    description: 'Animais e plantas',
    productCount: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

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
  
  const [categories, setCategories] = useState<Category[]>(() => 
    loadFromLocalStorage('categories', initialCategories));
  
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
  
  useEffect(() => {
    saveToLocalStorage('categories', categories);
  }, [categories]);
  
  // Update category product counts
  useEffect(() => {
    const updateCategoryCounts = () => {
      const categoryCounts: Record<string, number> = {};
      
      products.forEach(product => {
        if (product.category) {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
      });
      
      setCategories(prevCategories => 
        prevCategories.map(category => ({
          ...category,
          productCount: categoryCounts[category.name] || 0
        }))
      );
    };
    
    updateCategoryCounts();
  }, [products]);
  
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
    const hasEntries = stockEntries.some(entry => entry.productId === id);
    const hasExits = stockExits.some(exit => exit.productId === id);
    
    if (hasEntries || hasExits) {
      toast.error('Não é possível eliminar este produto pois tem movimentos associados');
      return;
    }
    
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produto eliminado com sucesso');
  };
  
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
    const hasExits = stockExits.some(exit => exit.clientId === id);
    
    if (hasExits) {
      toast.error('Não é possível eliminar este cliente pois tem vendas associadas');
      return;
    }
    
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('Cliente eliminado com sucesso');
  };
  
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
    const hasEntries = stockEntries.some(entry => entry.supplierId === id);
    
    if (hasEntries) {
      toast.error('Não é possível eliminar este fornecedor pois tem entregas associadas');
      return;
    }
    
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast.success('Fornecedor eliminado com sucesso');
  };
  
  const getCategory = (id: string) => categories.find(c => c.id === id);
  
  const addCategory = (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>) => {
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCategories(prev => [...prev, newCategory]);
    toast.success('Categoria adicionada com sucesso');
  };
  
  const updateCategory = (id: string, category: Partial<Category>) => {
    const existingCategory = categories.find(c => c.id === id);
    if (!existingCategory) {
      toast.error('Categoria não encontrada');
      return;
    }
    
    // If we're updating the name, we need to update all products with this category
    if (category.name && category.name !== existingCategory.name) {
      setProducts(prev => prev.map(p => 
        p.category === existingCategory.name
          ? { ...p, category: category.name, updatedAt: new Date() }
          : p
      ));
    }
    
    setCategories(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...category, updatedAt: new Date() } 
        : c
    ));
    toast.success('Categoria atualizada com sucesso');
  };
  
  const deleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) {
      toast.error('Categoria não encontrada');
      return;
    }
    
    const hasProducts = products.some(p => p.category === category.name);
    
    if (hasProducts) {
      toast.error('Não é possível eliminar esta categoria pois tem produtos associados');
      return;
    }
    
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Categoria eliminada com sucesso');
  };
  
  const addStockEntry = (entry: Omit<StockEntry, 'id' | 'createdAt'>) => {
    const newEntry: StockEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date()
    };
    
    setStockEntries(prev => [...prev, newEntry]);
    
    const product = products.find(p => p.id === entry.productId);
    if (product) {
      updateProduct(product.id, {
        currentStock: product.currentStock + entry.quantity
      });
    }
    
    toast.success('Entrada de stock registada com sucesso');
  };
  
  const updateStockEntry = (id: string, updatedEntry: Partial<StockEntry>) => {
    const entry = stockEntries.find(e => e.id === id);
    
    if (!entry) {
      toast.error('Entrada não encontrada');
      return;
    }
    
    const product = products.find(p => p.id === entry.productId);
    if (!product) {
      toast.error('Produto não encontrado');
      return;
    }
    
    // Calculate stock difference if quantity changed
    if (updatedEntry.quantity && updatedEntry.quantity !== entry.quantity) {
      const quantityDiff = updatedEntry.quantity - entry.quantity;
      
      // Update product stock
      updateProduct(product.id, {
        currentStock: product.currentStock + quantityDiff
      });
    }
    
    // Update the entry
    setStockEntries(prev => prev.map(e => 
      e.id === id 
        ? { ...e, ...updatedEntry } 
        : e
    ));
    
    toast.success('Entrada de stock atualizada com sucesso');
  };
  
  const deleteStockEntry = (id: string) => {
    const entry = stockEntries.find(e => e.id === id);
    
    if (!entry) {
      toast.error('Entrada não encontrada');
      return;
    }
    
    const product = products.find(p => p.id === entry.productId);
    
    if (product && product.currentStock >= entry.quantity) {
      updateProduct(product.id, {
        currentStock: product.currentStock - entry.quantity
      });
      
      setStockEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Entrada de stock eliminada com sucesso');
    } else {
      toast.error('Não é possível eliminar esta entrada pois causaria stock negativo');
    }
  };
  
  const addStockExit = (exit: Omit<StockExit, 'id' | 'createdAt'>) => {
    const product = products.find(p => p.id === exit.productId);
    
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
    
    updateProduct(product.id, {
      currentStock: product.currentStock - exit.quantity
    });
    
    toast.success('Saída de stock registada com sucesso');
  };
  
  const updateStockExit = (id: string, updatedExit: Partial<StockExit>) => {
    const exit = stockExits.find(e => e.id === id);
    
    if (!exit) {
      toast.error('Saída não encontrada');
      return;
    }
    
    const product = products.find(p => p.id === exit.productId);
    if (!product) {
      toast.error('Produto não encontrado');
      return;
    }
    
    // Calculate stock difference if quantity changed
    if (updatedExit.quantity && updatedExit.quantity !== exit.quantity) {
      const quantityDiff = exit.quantity - updatedExit.quantity;
      
      // Check if we have enough stock for an increase
      if (quantityDiff < 0 && product.currentStock < Math.abs(quantityDiff)) {
        toast.error('Stock insuficiente para aumentar a quantidade');
        return;
      }
      
      // Update product stock
      updateProduct(product.id, {
        currentStock: product.currentStock + quantityDiff
      });
    }
    
    // Update the exit
    setStockExits(prev => prev.map(e => 
      e.id === id 
        ? { ...e, ...updatedExit } 
        : e
    ));
    
    toast.success('Saída de stock atualizada com sucesso');
  };
  
  const deleteStockExit = (id: string) => {
    const exit = stockExits.find(e => e.id === id);
    
    if (!exit) {
      toast.error('Saída não encontrada');
      return;
    }
    
    const product = products.find(p => p.id === exit.productId);
    
    if (product) {
      updateProduct(product.id, {
        currentStock: product.currentStock + exit.quantity
      });
      
      setStockExits(prev => prev.filter(e => e.id !== id));
      toast.success('Saída de stock eliminada com sucesso');
    } else {
      toast.error('Não é possível eliminar esta saída pois o produto não existe');
    }
  };
  
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
    categories,
    
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
    
    getCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    
    addStockExit,
    updateStockExit,
    deleteStockExit,
    
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
