
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import mockData from '../data/mockData';

// Define types for our data
type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  status: 'active' | 'inactive';
};

type Category = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
};

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
};

type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
};

type StockEntry = {
  id: string;
  date: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  purchasePrice: number;
  invoiceNumber?: string;
};

type StockExit = {
  id: string;
  date: string;
  productId: string;
  productName: string;
  clientId: string;
  clientName: string;
  quantity: number;
  salePrice: number;
  invoiceNumber?: string;
};

type Order = {
  id: string;
  date: string;
  productId: string;
  productName: string;
  clientId: string;
  clientName: string;
  quantity: number;
  salePrice: number;
  notes?: string;
};

// Define the context type
interface DataContextType {
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  orders: Order[];
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addStockEntry: (entry: Omit<StockEntry, 'id'>) => void;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;
  
  addStockExit: (exit: Omit<StockExit, 'id'>) => void;
  updateStockExit: (id: string, exit: Partial<StockExit>) => void;
  deleteStockExit: (id: string) => void;
  
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  convertOrderToStockExit: (orderId: string) => void;
  
  findProduct: (id: string) => Product | undefined;
  findCategory: (id: string) => Category | undefined;
  findClient: (id: string) => Client | undefined;
  findSupplier: (id: string) => Supplier | undefined;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create a provider component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockData.products);
  const [categories, setCategories] = useState<Category[]>(mockData.categories);
  const [clients, setClients] = useState<Client[]>(mockData.clients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockData.suppliers);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>(mockData.stockEntries);
  const [stockExits, setStockExits] = useState<StockExit[]>(mockData.stockExits);
  const [orders, setOrders] = useState<Order[]>([]);

  // Make window.appData available for exporting
  useEffect(() => {
    window.appData = { products, categories, clients, suppliers, stockEntries, stockExits, orders };
  }, [products, categories, clients, suppliers, stockEntries, stockExits, orders]);

  // Products
  const addProduct = (product: Omit<Product, 'id'>) => {
    // Check if product code already exists
    const codeExists = products.some(p => p.code.toLowerCase() === product.code.toLowerCase());
    if (codeExists) {
      toast.error(`O código de produto "${product.code}" já existe. Use um código único.`);
      throw new Error(`Product code "${product.code}" already exists. Use a unique code.`);
    }
    
    const newProduct = { ...product, id: uuidv4() };
    setProducts([...products, newProduct as Product]);
    toast.success('Produto adicionado com sucesso!');
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    // Check if product code already exists and it's not the same product
    if (product.code) {
      const codeExists = products.some(p => p.code.toLowerCase() === product.code?.toLowerCase() && p.id !== id);
      if (codeExists) {
        toast.error(`O código de produto "${product.code}" já existe. Use um código único.`);
        throw new Error(`Product code "${product.code}" already exists. Use a unique code.`);
      }
    }
    
    setProducts(products.map(p => p.id === id ? { ...p, ...product } : p));
    toast.success('Produto atualizado com sucesso!');
  };

  const deleteProduct = (id: string) => {
    // Check if the product is used in stock entries or exits
    const usedInEntry = stockEntries.some(entry => entry.productId === id);
    const usedInExit = stockExits.some(exit => exit.productId === id);
    const usedInOrder = orders.some(order => order.productId === id);
    
    if (usedInEntry || usedInExit || usedInOrder) {
      toast.error('Não é possível excluir um produto que possui movimentações.');
      return;
    }
    
    setProducts(products.filter(p => p.id !== id));
    toast.success('Produto excluído com sucesso!');
  };

  // Categories
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setCategories([...categories, newCategory as Category]);
    toast.success('Categoria adicionada com sucesso!');
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...category } : c));
    toast.success('Categoria atualizada com sucesso!');
  };

  const deleteCategory = (id: string) => {
    // Check if the category is used in products
    const usedInProducts = products.some(product => product.category === id);
    
    if (usedInProducts) {
      toast.error('Não é possível excluir uma categoria que está em uso.');
      return;
    }
    
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Categoria excluída com sucesso!');
  };

  // Clients
  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: uuidv4() };
    setClients([...clients, newClient as Client]);
    toast.success('Cliente adicionado com sucesso!');
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...client } : c));
    toast.success('Cliente atualizado com sucesso!');
  };

  const deleteClient = (id: string) => {
    // Check if the client is used in stock exits or orders
    const usedInExit = stockExits.some(exit => exit.clientId === id);
    const usedInOrder = orders.some(order => order.clientId === id);
    
    if (usedInExit || usedInOrder) {
      toast.error('Não é possível excluir um cliente que possui movimentações.');
      return;
    }
    
    setClients(clients.filter(c => c.id !== id));
    toast.success('Cliente excluído com sucesso!');
  };

  // Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplier, id: uuidv4() };
    setSuppliers([...suppliers, newSupplier as Supplier]);
    toast.success('Fornecedor adicionado com sucesso!');
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...supplier } : s));
    toast.success('Fornecedor atualizado com sucesso!');
  };

  const deleteSupplier = (id: string) => {
    // Check if the supplier is used in stock entries
    const usedInEntry = stockEntries.some(entry => entry.supplierId === id);
    
    if (usedInEntry) {
      toast.error('Não é possível excluir um fornecedor que possui movimentações.');
      return;
    }
    
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast.success('Fornecedor excluído com sucesso!');
  };

  // Stock Entries
  const addStockEntry = (entry: Omit<StockEntry, 'id'>) => {
    const newEntry = { ...entry, id: uuidv4() };
    
    // Update product stock
    setProducts(products.map(product => 
      product.id === entry.productId 
        ? { ...product, currentStock: product.currentStock + entry.quantity }
        : product
    ));
    
    setStockEntries([...stockEntries, newEntry as StockEntry]);
    toast.success('Entrada de stock registada com sucesso!');
  };

  const updateStockEntry = (id: string, entry: Partial<StockEntry>) => {
    const oldEntry = stockEntries.find(e => e.id === id);
    
    if (!oldEntry) {
      toast.error('Entrada não encontrada.');
      return;
    }
    
    // If quantity changed, update product stock
    if (entry.quantity !== undefined && entry.quantity !== oldEntry.quantity) {
      const diff = entry.quantity - oldEntry.quantity;
      
      setProducts(products.map(product => 
        product.id === oldEntry.productId 
          ? { ...product, currentStock: product.currentStock + diff }
          : product
      ));
    }
    
    setStockEntries(stockEntries.map(e => e.id === id ? { ...e, ...entry } : e));
    toast.success('Entrada de stock atualizada com sucesso!');
  };

  const deleteStockEntry = (id: string) => {
    const entry = stockEntries.find(e => e.id === id);
    
    if (!entry) {
      toast.error('Entrada não encontrada.');
      return;
    }
    
    // Update product stock
    const product = products.find(p => p.id === entry.productId);
    
    if (product && product.currentStock >= entry.quantity) {
      setProducts(products.map(p => 
        p.id === entry.productId 
          ? { ...p, currentStock: p.currentStock - entry.quantity }
          : p
      ));
      
      setStockEntries(stockEntries.filter(e => e.id !== id));
      toast.success('Entrada de stock excluída com sucesso!');
    } else {
      toast.error('Não é possível excluir esta entrada. O stock ficaria negativo.');
    }
  };

  // Stock Exits
  const addStockExit = (exit: Omit<StockExit, 'id'>) => {
    const product = products.find(p => p.id === exit.productId);
    
    if (!product) {
      toast.error('Produto não encontrado.');
      return;
    }
    
    if (product.currentStock < exit.quantity) {
      toast.error(`Stock insuficiente. Disponível: ${product.currentStock} unidades.`);
      return;
    }
    
    const newExit = { ...exit, id: uuidv4() };
    
    // Update product stock
    setProducts(products.map(p => 
      p.id === exit.productId 
        ? { ...p, currentStock: p.currentStock - exit.quantity }
        : p
    ));
    
    setStockExits([...stockExits, newExit as StockExit]);
    toast.success('Saída de stock registada com sucesso!');
  };

  const updateStockExit = (id: string, exit: Partial<StockExit>) => {
    const oldExit = stockExits.find(e => e.id === id);
    
    if (!oldExit) {
      toast.error('Saída não encontrada.');
      return;
    }
    
    // If quantity changed, update product stock
    if (exit.quantity !== undefined && exit.quantity !== oldExit.quantity) {
      const diff = oldExit.quantity - exit.quantity;
      const product = products.find(p => p.id === oldExit.productId);
      
      if (!product) {
        toast.error('Produto não encontrado.');
        return;
      }
      
      if (product.currentStock + diff < 0) {
        toast.error(`Stock insuficiente. Disponível: ${product.currentStock + oldExit.quantity} unidades.`);
        return;
      }
      
      setProducts(products.map(p => 
        p.id === oldExit.productId 
          ? { ...p, currentStock: p.currentStock + diff }
          : p
      ));
    }
    
    setStockExits(stockExits.map(e => e.id === id ? { ...e, ...exit } : e));
    toast.success('Saída de stock atualizada com sucesso!');
  };

  const deleteStockExit = (id: string) => {
    const exit = stockExits.find(e => e.id === id);
    
    if (!exit) {
      toast.error('Saída não encontrada.');
      return;
    }
    
    // Update product stock
    setProducts(products.map(p => 
      p.id === exit.productId 
        ? { ...p, currentStock: p.currentStock + exit.quantity }
        : p
    ));
    
    setStockExits(stockExits.filter(e => e.id !== id));
    toast.success('Saída de stock excluída com sucesso!');
  };
  
  // Orders
  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder = { ...order, id: uuidv4() };
    setOrders([...orders, newOrder as Order]);
    toast.success('Encomenda registada com sucesso!');
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    setOrders(orders.map(o => o.id === id ? { ...o, ...order } : o));
    toast.success('Encomenda atualizada com sucesso!');
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    toast.success('Encomenda excluída com sucesso!');
  };
  
  const convertOrderToStockExit = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      toast.error('Encomenda não encontrada.');
      throw new Error('Order not found');
    }
    
    const product = products.find(p => p.id === order.productId);
    
    if (!product) {
      toast.error('Produto não encontrado.');
      throw new Error('Product not found');
    }
    
    if (product.currentStock < order.quantity) {
      toast.error(`Stock insuficiente. Disponível: ${product.currentStock} unidades.`);
      throw new Error('Insufficient stock');
    }
    
    // Create a stock exit
    const stockExit: Omit<StockExit, 'id'> = {
      productId: order.productId,
      productName: order.productName,
      clientId: order.clientId,
      clientName: order.clientName,
      quantity: order.quantity,
      salePrice: order.salePrice,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Add the stock exit
    addStockExit(stockExit);
    
    // Remove the order
    deleteOrder(orderId);
    
    return 'success';
  };

  // Helper functions
  const findProduct = (id: string) => products.find(p => p.id === id);
  const findCategory = (id: string) => categories.find(c => c.id === id);
  const findClient = (id: string) => clients.find(c => c.id === id);
  const findSupplier = (id: string) => suppliers.find(s => s.id === id);

  return (
    <DataContext.Provider value={{
      products,
      categories,
      clients,
      suppliers,
      stockEntries,
      stockExits,
      orders,
      
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
      
      addStockEntry,
      updateStockEntry,
      deleteStockEntry,
      
      addStockExit,
      updateStockExit,
      deleteStockExit,
      
      addOrder,
      updateOrder,
      deleteOrder,
      convertOrderToStockExit,
      
      findProduct,
      findCategory,
      findClient,
      findSupplier
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Create a hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Add global window type for appData
declare global {
  interface Window {
    appData: {
      products: Product[];
      categories: Category[];
      clients: Client[];
      suppliers: Supplier[];
      stockEntries: StockEntry[];
      stockExits: StockExit[];
      orders: Order[];
    };
  }
}
