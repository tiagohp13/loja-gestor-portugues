import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import * as mockData from '../data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { 
  Product, Category, Client, Supplier, 
  StockEntry, StockExit, Order, 
  StockEntryItem, StockExitItem, OrderItem,
  LegacyStockEntry, LegacyStockExit, LegacyOrder
} from '../types';

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
  
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt' | 'number'>) => void;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;
  
  addStockExit: (exit: Omit<StockExit, 'id' | 'createdAt' | 'number'>) => void;
  updateStockExit: (id: string, exit: Partial<StockExit>) => void;
  deleteStockExit: (id: string) => void;
  
  addOrder: (order: Omit<Order, 'id' | 'number'>) => void;
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

const DataContext = createContext<DataContextType | undefined>(undefined);

const convertOldStockEntriesToNew = (oldEntries: any[]): StockEntry[] => {
  return oldEntries.map((entry, index) => ({
    id: entry.id,
    number: `ENT${String(index + 1).padStart(6, '0')}`,
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

const convertOldStockExitsToNew = (oldExits: any[], oldOrders: any[]): StockExit[] => {
  return oldExits.map((exit, index) => {
    const fromOrder = oldOrders?.find(order => order.id === exit.fromOrderId);
    
    return {
      id: exit.id,
      number: `SAI${String(index + 1).padStart(6, '0')}`,
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
      fromOrderId: exit.fromOrderId,
      fromOrderNumber: fromOrder ? `ENC${String(oldOrders.indexOf(fromOrder) + 1).padStart(6, '0')}` : undefined
    };
  });
};

const convertOldOrdersToNew = (oldOrders: any[], oldExits: any[]): Order[] => {
  return oldOrders.map((order, index) => {
    const convertedToExit = oldExits?.find(exit => exit.fromOrderId === order.id);
    
    return {
      id: order.id,
      number: `2025/${String(index + 1).padStart(3, '0')}`,
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
      convertedToStockExitId: order.convertedToStockExitId,
      convertedToStockExitNumber: convertedToExit ? `2025/${String(oldExits.indexOf(convertedToExit) + 1).padStart(3, '0')}` : undefined
    };
  });
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockData.products as Product[]);
  const [categories, setCategories] = useState<Category[]>(mockData.categories as Category[]);
  const [clients, setClients] = useState<Client[]>(mockData.clients as Client[]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockData.suppliers as Supplier[]);

  const [stockEntries, setStockEntries] = useState<StockEntry[]>(() => 
    convertOldStockEntriesToNew(mockData.stockEntries as any[])
  );
  
  const [stockExits, setStockExits] = useState<StockExit[]>(() => 
    convertOldStockExitsToNew(mockData.stockExits as any[], mockData.orders as any[] || [])
  );
  
  const [orders, setOrders] = useState<Order[]>(() => 
    convertOldOrdersToNew(mockData.orders || [], mockData.stockExits as any[])
  );

  useEffect(() => {
    window.appData = { products, categories, clients, suppliers, stockEntries, stockExits, orders };
  }, [products, categories, clients, suppliers, stockEntries, stockExits, orders]);

  const getNextOrderNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', {
        counter_id: 'orders'
      });
      
      if (error) {
        console.error("Error getting order number:", error);
        return `${new Date().getFullYear()}/${String(orders.length + 1).padStart(3, '0')}`;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getNextOrderNumber:", error);
      return `${new Date().getFullYear()}/${String(orders.length + 1).padStart(3, '0')}`;
    }
  };

  const getNextEntryNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', {
        counter_id: 'stock_entries'
      });
      
      if (error) {
        console.error("Error getting stock entry number:", error);
        return `${new Date().getFullYear()}/${String(stockEntries.length + 1).padStart(3, '0')}`;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getNextEntryNumber:", error);
      return `${new Date().getFullYear()}/${String(stockEntries.length + 1).padStart(3, '0')}`;
    }
  };

  const getNextExitNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', {
        counter_id: 'stock_exits'
      });
      
      if (error) {
        console.error("Error getting stock exit number:", error);
        return `${new Date().getFullYear()}/${String(stockExits.length + 1).padStart(3, '0')}`;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getNextExitNumber:", error);
      return `${new Date().getFullYear()}/${String(stockExits.length + 1).padStart(3, '0')}`;
    }
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
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
    const usedInProducts = products.some(product => product.category === id);
    
    if (usedInProducts) {
      toast.error('Não é possível excluir uma categoria que está em uso.');
      return;
    }
    
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Categoria excluída com sucesso!');
  };

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
    const usedInExit = stockExits.some(exit => exit.clientId === id);
    const usedInOrder = orders.some(order => order.clientId === id);
    
    if (usedInExit || usedInOrder) {
      toast.error('Não é possível excluir um cliente que possui movimentações.');
      return;
    }
    
    setClients(clients.filter(c => c.id !== id));
    toast.success('Cliente excluído com sucesso!');
  };

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
    const usedInEntry = stockEntries.some(entry => entry.supplierId === id);
    
    if (usedInEntry) {
      toast.error('Não é possível excluir um fornecedor que possui movimentações.');
      return;
    }
    
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast.success('Fornecedor excluído com sucesso!');
  };

  const addStockEntry = async (entry: Omit<StockEntry, 'id' | 'createdAt' | 'number'>) => {
    const newEntryNumber = await getNextEntryNumber();
    
    const newEntry = { 
      ...entry, 
      id: uuidv4(),
      number: newEntryNumber,
      createdAt: new Date().toISOString() 
    };
    
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
    
    if (entry.items) {
      oldEntry.items.forEach(oldItem => {
        setProducts(products.map(product => 
          product.id === oldItem.productId 
            ? { ...product, currentStock: product.currentStock + oldItem.quantity }
            : product
        ));
      });
      
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

  const addStockExit = async (exit: Omit<StockExit, 'id' | 'createdAt' | 'number'>) => {
    let hasEnoughStock = true;
    
    exit.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.currentStock < item.quantity) {
        hasEnoughStock = false;
        toast.error(`Stock insuficiente para ${item.productName}. Disponível: ${product?.currentStock || 0} unidades.`);
      }
    });
    
    if (!hasEnoughStock) return;
    
    const newExitNumber = await getNextExitNumber();
    
    const newExit = { 
      ...exit, 
      id: uuidv4(),
      number: newExitNumber,
      createdAt: new Date().toISOString() 
    };
    
    exit.items.forEach(item => {
      setProducts(products.map(product => 
        product.id === item.productId 
          ? { ...product, currentStock: product.currentStock - item.quantity }
          : product
      ));
    });
    
    if (exit.fromOrderId) {
      setOrders(orders.map(order => 
        order.id === exit.fromOrderId 
          ? { 
              ...order, 
              convertedToStockExitId: newExit.id,
              convertedToStockExitNumber: newExitNumber 
            }
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
    
    if (exit.items) {
      oldExit.items.forEach(oldItem => {
        setProducts(products.map(product => 
          product.id === oldItem.productId 
            ? { ...product, currentStock: product.currentStock + oldItem.quantity }
            : product
        ));
      });
      
      let hasEnoughStock = true;
      
      exit.items.forEach(newItem => {
        const product = products.find(p => p.id === newItem.productId);
        const oldItemIndex = oldExit.items.findIndex(item => item.productId === newItem.productId);
        const oldQuantity = oldItemIndex >= 0 ? oldExit.items[oldItemIndex].quantity : 0;
        
        const adjustedCurrentStock = product ? product.currentStock + oldQuantity : 0;
        
        if (!product || adjustedCurrentStock < newItem.quantity) {
          hasEnoughStock = false;
          toast.error(`Stock insuficiente para ${newItem.productName}. Disponível: ${adjustedCurrentStock} unidades.`);
        }
      });
      
      if (!hasEnoughStock) return;
      
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
    
    if (exit.fromOrderId) {
      setOrders(orders.map(order => 
        order.id === exit.fromOrderId 
          ? { ...order, convertedToStockExitId: undefined }
          : order
      ));
    }
    
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

  const addOrder = async (order: Omit<Order, 'id' | 'number'>) => {
    const newOrderNumber = await getNextOrderNumber();
    
    const newOrder = { 
      ...order, 
      id: uuidv4(),
      number: newOrderNumber
    };
    setOrders([...orders, newOrder as Order]);
    toast.success('Encomenda registada com sucesso!');
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    const existingOrder = orders.find(o => o.id === id);
    
    if (!existingOrder) {
      toast.error('Encomenda não encontrada.');
      return;
    }
    
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
    
    if (order.convertedToStockExitId) {
      toast.error('Esta encomenda já foi convertida em saída de stock.');
      throw new Error('Order already converted');
    }
    
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
    
    const stockExit: Omit<StockExit, 'id' | 'createdAt' | 'number'> = {
      clientId: order.clientId,
      clientName: order.clientName || '',
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice
      })),
      date: new Date().toISOString().split('T')[0],
      fromOrderId: order.id,
      fromOrderNumber: order.number
    };
    
    addStockExit(stockExit);
    
    return 'success';
  };

  const findProduct = (id: string) => products.find(p => p.id === id);
  const findCategory = (id: string) => categories.find(c => c.id === id);
  const findClient = (id: string) => clients.find(c => c.id === id);
  const findSupplier = (id: string) => suppliers.find(s => s.id === id);
  const findOrder = (id: string) => orders.find(o => o.id === id);

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

  const getBusinessAnalytics = () => {
    let totalSales = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    
    const productSales: Record<string, {
      productId: string,
      name: string,
      totalQuantity: number,
      totalRevenue: number,
      averagePrice: number
    }> = {};
    
    const clientPurchases: Record<string, {
      clientId: string,
      name: string,
      purchaseCount: number,
      totalSpent: number,
      lastPurchaseDate: string
    }> = {};
    
    const currentStockValue = products.reduce((total, product) => {
      return total + (product.purchasePrice * product.currentStock);
    }, 0);
    
    stockExits.forEach(exit => {
      exit.items.forEach(item => {
        totalSales += item.quantity;
        const saleRevenue = item.quantity * item.salePrice;
        totalRevenue += saleRevenue;
        
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const itemCost = item.quantity * product.purchasePrice;
          totalCost += itemCost;
          totalProfit += (saleRevenue - itemCost);
        }
        
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
      
      if (!clientPurchases[exit.clientId].lastPurchaseDate || 
          new Date(exit.date) > new Date(clientPurchases[exit.clientId].lastPurchaseDate)) {
        clientPurchases[exit.clientId].lastPurchaseDate = exit.date;
      }
    });
    
    Object.values(productSales).forEach(product => {
      if (product.totalQuantity > 0) {
        product.averagePrice = product.totalRevenue / product.totalQuantity;
      }
    });
    
    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
    
    const mostProfitableProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
    
    const topClients = Object.values(clientPurchases)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    const lowStockProducts = products
      .filter(p => p.currentStock <= p.minStock)
      .map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        currentStock: p.currentStock,
        minStock: p.minStock
      }));
    
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

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

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
