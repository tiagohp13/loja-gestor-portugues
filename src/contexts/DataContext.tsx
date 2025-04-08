
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import * as mockData from '../data/mockData';
import { 
  Product, Category, Client, Supplier, 
  StockEntry, StockExit, Order, 
  StockEntryItem, StockExitItem, OrderItem,
  LegacyStockEntry, LegacyStockExit, LegacyOrder
} from '../types';

// Define the context type
interface DataContextType {
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  orders: Order[];
  
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt'>) => void;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;
  
  addStockExit: (exit: Omit<StockExit, 'id' | 'createdAt'>) => void;
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
  findOrder: (id: string) => Order | undefined;
  
  getProduct: (id: string) => Product | undefined;
  getProductHistory: (id: string) => any;
  getCategory: (id: string) => Category | undefined;
  getClient: (id: string) => Client | undefined;
  getClientHistory: (id: string) => any;
  getSupplier: (id: string) => Supplier | undefined;
  getSupplierHistory: (id: string) => any;
  
  getBusinessAnalytics: () => any;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to convert old format to new format (for backward compatibility)
const convertOldStockEntriesToNew = (oldEntries: any[]): StockEntry[] => {
  return oldEntries.map(entry => ({
    id: entry.id,
    supplierId: entry.supplierId,
    supplierName: entry.supplierName,
    items: [{
      productId: entry.productId,
      productName: entry.productName,
      quantity: entry.quantity,
      purchasePrice: entry.purchasePrice
    }],
    invoiceNumber: entry.invoiceNumber,
    notes: entry.notes,
    date: entry.date,
    createdAt: entry.createdAt
  }));
};

const convertOldStockExitsToNew = (oldExits: any[]): StockExit[] => {
  return oldExits.map(exit => ({
    id: exit.id,
    clientId: exit.clientId,
    clientName: exit.clientName,
    items: [{
      productId: exit.productId,
      productName: exit.productName,
      quantity: exit.quantity,
      salePrice: exit.salePrice
    }],
    invoiceNumber: exit.invoiceNumber,
    notes: exit.notes,
    date: exit.date,
    createdAt: exit.createdAt,
    fromOrderId: exit.fromOrderId
  }));
};

const convertOldOrdersToNew = (oldOrders: any[]): Order[] => {
  return oldOrders.map(order => ({
    id: order.id,
    clientId: order.clientId,
    clientName: order.clientName,
    items: [{
      productId: order.productId,
      productName: order.productName,
      quantity: order.quantity,
      salePrice: order.salePrice
    }],
    date: order.date,
    notes: order.notes,
    convertedToStockExitId: order.convertedToStockExitId
  }));
};

// Create a provider component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockData.products as Product[]);
  const [categories, setCategories] = useState<Category[]>(mockData.categories as Category[]);
  const [clients, setClients] = useState<Client[]>(mockData.clients as Client[]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockData.suppliers as Supplier[]);
  
  // Convert old format to new format for stockEntries, stockExits, and orders
  const [stockEntries, setStockEntries] = useState<StockEntry[]>(() => 
    convertOldStockEntriesToNew(mockData.stockEntries as any[])
  );
  
  const [stockExits, setStockExits] = useState<StockExit[]>(() => 
    convertOldStockExitsToNew(mockData.stockExits as any[])
  );
  
  const [orders, setOrders] = useState<Order[]>(() => 
    convertOldOrdersToNew(mockData.orders || [])
  );

  // Make window.appData available for exporting
  useEffect(() => {
    window.appData = { products, categories, clients, suppliers, stockEntries, stockExits, orders };
  }, [products, categories, clients, suppliers, stockEntries, stockExits, orders]);

  // Products
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check if product code already exists
    const codeExists = products.some(p => p.code.toLowerCase() === product.code.toLowerCase());
    if (codeExists) {
      toast.error(`O código de produto "${product.code}" já existe. Use um código único.`);
      throw new Error(`Product code "${product.code}" already exists. Use a unique code.`);
    }
    
    const now = new Date().toISOString();
    const newProduct = { 
      ...product, 
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
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
    
    setProducts(products.map(p => p.id === id ? { 
      ...p, 
      ...product,
      updatedAt: new Date().toISOString()
    } : p));
    toast.success('Produto atualizado com sucesso!');
  };

  const deleteProduct = (id: string) => {
    // Check if the product is used in stock entries or exits
    const usedInEntry = stockEntries.some(entry => 
      entry.items.some(item => item.productId === id)
    );
    
    const usedInExit = stockExits.some(exit => 
      exit.items.some(item => item.productId === id)
    );
    
    const usedInOrder = orders.some(order => 
      order.items.some(item => item.productId === id)
    );
    
    if (usedInEntry || usedInExit || usedInOrder) {
      toast.error('Não é possível excluir um produto que possui movimentações.');
      return;
    }
    
    setProducts(products.filter(p => p.id !== id));
    toast.success('Produto excluído com sucesso!');
  };

  // Categories
  const addCategory = (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newCategory = { 
      ...category, 
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    setCategories([...categories, newCategory as Category]);
    toast.success('Categoria adicionada com sucesso!');
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(categories.map(c => c.id === id ? { 
      ...c, 
      ...category,
      updatedAt: new Date().toISOString()
    } : c));
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
  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newClient = { 
      ...client, 
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    setClients([...clients, newClient as Client]);
    toast.success('Cliente adicionado com sucesso!');
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { 
      ...c, 
      ...client,
      updatedAt: new Date().toISOString()
    } : c));
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
  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newSupplier = { 
      ...supplier, 
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    setSuppliers([...suppliers, newSupplier as Supplier]);
    toast.success('Fornecedor adicionado com sucesso!');
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setSuppliers(suppliers.map(s => s.id === id ? { 
      ...s, 
      ...supplier,
      updatedAt: new Date().toISOString()
    } : s));
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
  const addStockEntry = (entry: Omit<StockEntry, 'id' | 'createdAt'>) => {
    const newEntry = { 
      ...entry, 
      id: uuidv4(),
      createdAt: new Date().toISOString() 
    };
    
    // Update product stock for each item
    entry.items.forEach(item => {
      setProducts(products.map(product => 
        product.id === item.productId 
          ? { ...product, currentStock: product.currentStock + item.quantity }
          : product
      ));
    });
    
    setStockEntries([...stockEntries, newEntry as StockEntry]);
    toast.success('Entrada de stock registada com sucesso!');
  };

  const updateStockEntry = (id: string, entry: Partial<StockEntry>) => {
    const oldEntry = stockEntries.find(e => e.id === id);
    
    if (!oldEntry) {
      toast.error('Entrada não encontrada.');
      return;
    }
    
    // If items changed, update product stock
    if (entry.items) {
      // Revert old quantities
      oldEntry.items.forEach(oldItem => {
        setProducts(products.map(product => 
          product.id === oldItem.productId 
            ? { ...product, currentStock: product.currentStock - oldItem.quantity }
            : product
        ));
      });
      
      // Add new quantities
      entry.items.forEach(newItem => {
        setProducts(products.map(product => 
          product.id === newItem.productId 
            ? { ...product, currentStock: product.currentStock + newItem.quantity }
            : product
        ));
      });
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
    
    // Update product stock for each item
    let canDelete = true;
    
    entry.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.currentStock < item.quantity) {
        canDelete = false;
      }
    });
    
    if (!canDelete) {
      toast.error('Não é possível excluir esta entrada. O stock ficaria negativo.');
      return;
    }
    
    // Update quantities
    entry.items.forEach(item => {
      setProducts(products.map(p => 
        p.id === item.productId 
          ? { ...p, currentStock: p.currentStock - item.quantity }
          : p
      ));
    });
    
    setStockEntries(stockEntries.filter(e => e.id !== id));
    toast.success('Entrada de stock excluída com sucesso!');
  };

  // Stock Exits
  const addStockExit = (exit: Omit<StockExit, 'id' | 'createdAt'>) => {
    // Check if we have enough stock for each product
    let hasEnoughStock = true;
    
    exit.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.currentStock < item.quantity) {
        hasEnoughStock = false;
        toast.error(`Stock insuficiente para ${item.productName}. Disponível: ${product?.currentStock || 0} unidades.`);
      }
    });
    
    if (!hasEnoughStock) return;
    
    const newExit = { 
      ...exit, 
      id: uuidv4(),
      createdAt: new Date().toISOString() 
    };
    
    // Update product stock for each item
    exit.items.forEach(item => {
      setProducts(products.map(product => 
        product.id === item.productId 
          ? { ...product, currentStock: product.currentStock - item.quantity }
          : product
      ));
    });
    
    // If this exit is from an order, update the order
    if (exit.fromOrderId) {
      setOrders(orders.map(order => 
        order.id === exit.fromOrderId 
          ? { ...order, convertedToStockExitId: newExit.id }
          : order
      ));
    }
    
    setStockExits([...stockExits, newExit as StockExit]);
    toast.success('Saída de stock registada com sucesso!');
  };

  const updateStockExit = (id: string, exit: Partial<StockExit>) => {
    const oldExit = stockExits.find(e => e.id === id);
    
    if (!oldExit) {
      toast.error('Saída não encontrada.');
      return;
    }
    
    // If items changed, update product stock
    if (exit.items) {
      // Revert old quantities
      oldExit.items.forEach(oldItem => {
        setProducts(products.map(product => 
          product.id === oldItem.productId 
            ? { ...product, currentStock: product.currentStock + oldItem.quantity }
            : product
        ));
      });
      
      // Check if we have enough stock for new quantities
      let hasEnoughStock = true;
      
      exit.items.forEach(newItem => {
        const product = products.find(p => p.id === newItem.productId);
        const oldItemIndex = oldExit.items.findIndex(item => item.productId === newItem.productId);
        const oldQuantity = oldItemIndex >= 0 ? oldExit.items[oldItemIndex].quantity : 0;
        
        // Calculate adjusted current stock (after reverting old quantity)
        const adjustedCurrentStock = product ? product.currentStock + oldQuantity : 0;
        
        if (!product || adjustedCurrentStock < newItem.quantity) {
          hasEnoughStock = false;
          toast.error(`Stock insuficiente para ${newItem.productName}. Disponível: ${adjustedCurrentStock} unidades.`);
        }
      });
      
      if (!hasEnoughStock) return;
      
      // Apply new quantities
      exit.items.forEach(newItem => {
        setProducts(products.map(product => 
          product.id === newItem.productId 
            ? { ...product, currentStock: product.currentStock - newItem.quantity }
            : product
        ));
      });
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
    
    // If this exit is from an order, update the order to not be converted
    if (exit.fromOrderId) {
      setOrders(orders.map(order => 
        order.id === exit.fromOrderId 
          ? { ...order, convertedToStockExitId: undefined }
          : order
      ));
    }
    
    // Update product stock for each item
    exit.items.forEach(item => {
      setProducts(products.map(p => 
        p.id === item.productId 
          ? { ...p, currentStock: p.currentStock + item.quantity }
          : p
      ));
    });
    
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
    const existingOrder = orders.find(o => o.id === id);
    
    if (!existingOrder) {
      toast.error('Encomenda não encontrada.');
      return;
    }
    
    // Cannot update an order that has been converted to stock exit
    if (existingOrder.convertedToStockExitId) {
      toast.error('Não é possível editar uma encomenda já convertida em saída de stock.');
      return;
    }
    
    setOrders(orders.map(o => o.id === id ? { ...o, ...order } : o));
    toast.success('Encomenda atualizada com sucesso!');
  };

  const deleteOrder = (id: string) => {
    const existingOrder = orders.find(o => o.id === id);
    
    if (!existingOrder) {
      toast.error('Encomenda não encontrada.');
      return;
    }
    
    // Cannot delete an order that has been converted to stock exit
    if (existingOrder.convertedToStockExitId) {
      toast.error('Não é possível excluir uma encomenda já convertida em saída de stock.');
      return;
    }
    
    setOrders(orders.filter(o => o.id !== id));
    toast.success('Encomenda excluída com sucesso!');
  };
  
  const convertOrderToStockExit = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      toast.error('Encomenda não encontrada.');
      throw new Error('Order not found');
    }
    
    // Check if order is already converted
    if (order.convertedToStockExitId) {
      toast.error('Esta encomenda já foi convertida em saída de stock.');
      throw new Error('Order already converted');
    }
    
    // Check if we have enough stock for each product
    let hasEnoughStock = true;
    
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.currentStock < item.quantity) {
        hasEnoughStock = false;
        toast.error(`Stock insuficiente para ${item.productName}. Disponível: ${product?.currentStock || 0} unidades.`);
      }
    });
    
    if (!hasEnoughStock) {
      throw new Error('Insufficient stock');
    }
    
    // Create a stock exit
    const stockExit: Omit<StockExit, 'id' | 'createdAt'> = {
      clientId: order.clientId,
      clientName: order.clientName || '',
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice
      })),
      date: new Date().toISOString().split('T')[0],
      fromOrderId: order.id
    };
    
    // Add the stock exit
    addStockExit(stockExit);
    
    return 'success';
  };

  // Helper functions
  const findProduct = (id: string) => products.find(p => p.id === id);
  const findCategory = (id: string) => categories.find(c => c.id === id);
  const findClient = (id: string) => clients.find(c => c.id === id);
  const findSupplier = (id: string) => suppliers.find(s => s.id === id);
  const findOrder = (id: string) => orders.find(o => o.id === id);

  // Add the missing getter methods
  const getProduct = (id: string) => products.find(p => p.id === id);
  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getClient = (id: string) => clients.find(c => c.id === id);
  const getSupplier = (id: string) => suppliers.find(s => s.id === id);

  const getProductHistory = (id: string) => {
    const product = products.find(p => p.id === id);
    
    const entries = stockEntries.filter(entry => 
      entry.items.some(item => item.productId === id)
    );
    
    const exits = stockExits.filter(exit => 
      exit.items.some(item => item.productId === id)
    );
    
    return { product, entries, exits };
  };

  const getClientHistory = (id: string) => {
    const client = clients.find(c => c.id === id);
    const exitItems = stockExits
      .filter(exit => exit.clientId === id)
      .flatMap(exit => exit.items.map(item => ({
        ...item,
        exitId: exit.id,
        exitDate: exit.date,
        exitCreatedAt: exit.createdAt
      })));
      
    const clientOrders = orders.filter(order => order.clientId === id);
    
    return { client, exitItems, orders: clientOrders };
  };

  const getSupplierHistory = (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    const entryItems = stockEntries
      .filter(entry => entry.supplierId === id)
      .flatMap(entry => entry.items.map(item => ({
        ...item,
        entryId: entry.id,
        entryDate: entry.date,
        entryCreatedAt: entry.createdAt
      })));
      
    return { supplier, entryItems };
  };
  
  // Business Analytics 
  const getBusinessAnalytics = () => {
    // Calculate total sales, revenue, profit
    let totalSales = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    
    // Product sales analysis
    const productSales: Record<string, {
      productId: string,
      name: string,
      totalQuantity: number,
      totalRevenue: number,
      averagePrice: number
    }> = {};
    
    // Client analysis
    const clientPurchases: Record<string, {
      clientId: string,
      name: string,
      purchaseCount: number,
      totalSpent: number,
      lastPurchaseDate: string
    }> = {};
    
    // Calculate stock value
    const currentStockValue = products.reduce((total, product) => {
      return total + (product.purchasePrice * product.currentStock);
    }, 0);
    
    // Process all sales
    stockExits.forEach(exit => {
      exit.items.forEach(item => {
        totalSales += item.quantity;
        const saleRevenue = item.quantity * item.salePrice;
        totalRevenue += saleRevenue;
        
        // Find product for cost calculation
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const itemCost = item.quantity * product.purchasePrice;
          totalCost += itemCost;
          totalProfit += (saleRevenue - itemCost);
        }
        
        // Update product sales data
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.productName,
            totalQuantity: 0,
            totalRevenue: 0,
            averagePrice: 0
          };
        }
        
        productSales[item.productId].totalQuantity += item.quantity;
        productSales[item.productId].totalRevenue += saleRevenue;
      });
      
      // Update client purchase data
      if (!clientPurchases[exit.clientId]) {
        const client = clients.find(c => c.id === exit.clientId);
        clientPurchases[exit.clientId] = {
          clientId: exit.clientId,
          name: client?.name || exit.clientName,
          purchaseCount: 0,
          totalSpent: 0,
          lastPurchaseDate: ''
        };
      }
      
      const exitTotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      clientPurchases[exit.clientId].purchaseCount++;
      clientPurchases[exit.clientId].totalSpent += exitTotal;
      
      // Update last purchase date if newer
      if (!clientPurchases[exit.clientId].lastPurchaseDate || 
          new Date(exit.date) > new Date(clientPurchases[exit.clientId].lastPurchaseDate)) {
        clientPurchases[exit.clientId].lastPurchaseDate = exit.date;
      }
    });
    
    // Calculate average prices
    Object.values(productSales).forEach(product => {
      if (product.totalQuantity > 0) {
        product.averagePrice = product.totalRevenue / product.totalQuantity;
      }
    });
    
    // Get top selling products
    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
    
    // Get most profitable products
    const mostProfitableProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
    
    // Get top clients
    const topClients = Object.values(clientPurchases)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    // Low stock warnings
    const lowStockProducts = products
      .filter(p => p.currentStock <= p.minStock)
      .map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        currentStock: p.currentStock,
        minStock: p.minStock
      }));
    
    // Inactive clients (no purchases in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveClients = clients.filter(client => {
      const clientData = clientPurchases[client.id];
      return !clientData || !clientData.lastPurchaseDate || 
             new Date(clientData.lastPurchaseDate) < thirtyDaysAgo;
    }).map(client => ({
      id: client.id,
      name: client.name,
      lastPurchaseDate: clientPurchases[client.id]?.lastPurchaseDate || 'Nunca'
    }));
    
    // Calculate profit margin
    const overallProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    return {
      summary: {
        totalSales,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin: overallProfitMargin,
        currentStockValue
      },
      topSellingProducts,
      mostProfitableProducts,
      topClients,
      lowStockProducts,
      inactiveClients
    };
  };

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
      findSupplier,
      findOrder,
      
      getProduct,
      getProductHistory,
      getCategory,
      getClient,
      getClientHistory,
      getSupplier,
      getSupplierHistory,
      
      getBusinessAnalytics
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
