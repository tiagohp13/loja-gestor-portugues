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
  // Products
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  getProductHistory: (id: string) => { entries: StockEntry[], exits: StockExit[] };
  
  // Categories
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategory: (id: string) => Category | undefined;
  
  // Clients
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  getClientHistory: (id: string) => { orders: Order[], exits: StockExit[] };
  
  // Suppliers
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplier: (id: string) => Supplier | undefined;
  getSupplierHistory: (id: string) => { entries: StockEntry[] };
  
  // Orders
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Omit<Order, 'id' | 'number'>) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  findOrder: (id: string) => Order | undefined;
  findProduct: (id: string) => Product | undefined;
  findClient: (id: string) => Client | undefined;
  convertOrderToStockExit: (orderId: string, invoiceNumber?: string) => Promise<StockExit | undefined>;
  
  // Stock Entries
  stockEntries: StockEntry[];
  setStockEntries: React.Dispatch<React.SetStateAction<StockEntry[]>>;
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'number' | 'createdAt'>) => Promise<StockEntry>;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => Promise<void>;
  deleteStockEntry: (id: string) => Promise<void>;
  
  // Stock Exits
  stockExits: StockExit[];
  setStockExits: React.Dispatch<React.SetStateAction<StockExit[]>>;
  addStockExit: (exit: Omit<StockExit, 'id' | 'number' | 'createdAt'>) => Promise<StockExit>;
  updateStockExit: (id: string, exit: Partial<StockExit>) => Promise<void>;
  deleteStockExit: (id: string) => Promise<void>;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (expense: Expense, id: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Export/Import
  exportData: (dataType: ExportDataType) => any[];
  importData: (type: ExportDataType, data: string) => Promise<void>;
  updateData: (type: keyof DataState, data: any) => void;
  
  // Business Analytics
  getBusinessAnalytics: () => { 
    totalProducts: number;
    totalCategories: number;
    totalClients: number;
    totalSuppliers: number;
    totalOrders: number;
    totalStockEntries: number;
    totalStockExits: number;
    lowStockProducts: Product[];
    summary: {
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
      profitMargin: number;
      currentStockValue: number;
    };
    topSellingProducts: { id: string, name: string, totalQuantity: number, totalRevenue: number }[];
    mostProfitableProducts: { id: string, name: string, totalQuantity: number, totalRevenue: number }[];
    topClients: { id: string, name: string, purchaseCount: number, totalSpent: number, lastPurchaseDate: string }[];
    inactiveClients: { id: string, name: string, purchaseCount: number, totalSpent: number, lastPurchaseDate: string }[];
  };
  
  // Loading state
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DataState {
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  expenses: Expense[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchClients(),
          fetchSuppliers(),
          fetchOrders(),
          fetchStockEntries(),
          fetchStockExits()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  useEffect(() => {
    const stockEntriesChannel = supabase
      .channel('public:stock_entries')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_entries' }, 
        () => {
          fetchStockEntries();
        }
      )
      .subscribe();
    
    const stockExitsChannel = supabase
      .channel('public:stock_exits')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_exits' }, 
        () => {
          fetchStockExits();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(stockEntriesChannel);
      supabase.removeChannel(stockExitsChannel);
    };
  }, []);

  const getProduct = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };
  
  const findProduct = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };
  
  const getProductHistory = (id: string) => {
    const entries = stockEntries.filter(entry => 
      entry.items.some(item => item.productId === id)
    );
    
    const exits = stockExits.filter(exit => 
      exit.items.some(item => item.productId === id)
    );
    
    return { entries, exits };
  };
  
  const getCategory = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };
  
  const getClient = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };
  
  const findClient = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };
  
  const getClientHistory = (id: string) => {
    const clientOrders = orders.filter(order => order.clientId === id);
    const clientExits = stockExits.filter(exit => exit.clientId === id);
    
    return { orders: clientOrders, exits: clientExits };
  };
  
  const getSupplier = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };
  
  const getSupplierHistory = (id: string) => {
    const supplierEntries = stockEntries.filter(entry => entry.supplierId === id);
    
    return { entries: supplierEntries };
  };
  
  const findOrder = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };
  
  const getBusinessAnalytics = () => {
    const basicAnalytics = {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalClients: clients.length,
      totalSuppliers: suppliers.length,
      totalOrders: orders.length,
      totalStockEntries: stockEntries.length,
      totalStockExits: stockExits.length,
      lowStockProducts: products.filter(p => p.currentStock <= p.minStock)
    };
    
    const totalRevenue = stockExits.reduce((sum, exit) => {
      const exitTotal = exit.items.reduce((itemSum, item) => {
        const itemPrice = item.salePrice * item.quantity;
        const discountAmount = item.discountPercent ? (itemPrice * item.discountPercent / 100) : 0;
        return itemSum + (itemPrice - discountAmount);
      }, 0);
      
      const orderDiscount = exit.discount || 0;
      return sum + (exitTotal * (1 - orderDiscount / 100));
    }, 0);
    
    const totalCost = stockEntries.reduce((sum, entry) => {
      return sum + entry.items.reduce((itemSum, item) => {
        return itemSum + (item.purchasePrice * item.quantity);
      }, 0);
    }, 0);
    
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    const currentStockValue = products.reduce((sum, product) => {
      return sum + (product.purchasePrice * product.currentStock);
    }, 0);
    
    const productSales = products.map(product => {
      const totalQuantity = stockExits.reduce((sum, exit) => {
        const productItems = exit.items.filter(item => item.productId === product.id);
        return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);
      
      const totalRevenue = stockExits.reduce((sum, exit) => {
        const productItems = exit.items.filter(item => item.productId === product.id);
        return sum + productItems.reduce((itemSum, item) => {
          const itemTotal = item.salePrice * item.quantity;
          const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent / 100) : 0;
          return itemSum + (itemTotal - discountAmount);
        }, 0);
      }, 0);
      
      return {
        id: product.id,
        name: product.name,
        totalQuantity,
        totalRevenue
      };
    })
    .filter(p => p.totalQuantity > 0)
    .sort((a, b) => b.totalQuantity - a.totalQuantity);
    
    const clientPurchases = clients.map(client => {
      const clientExits = stockExits.filter(exit => exit.clientId === client.id);
      const purchaseCount = clientExits.length;
      
      const totalSpent = clientExits.reduce((sum, exit) => {
        const exitTotal = exit.items.reduce((itemSum, item) => {
          const itemTotal = item.salePrice * item.quantity;
          const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent / 100) : 0;
          return itemSum + (itemTotal - discountAmount);
        }, 0);
        
        const orderDiscount = exit.discount || 0;
        return sum + (exitTotal * (1 - orderDiscount / 100));
      }, 0);
      
      let lastPurchaseDate = 'Nunca';
      if (clientExits.length > 0) {
        const sortedExits = [...clientExits].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        lastPurchaseDate = sortedExits[0].date;
      }
      
      return {
        id: client.id,
        name: client.name,
        purchaseCount,
        totalSpent,
        lastPurchaseDate
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveClients = clientPurchases
      .filter(client => {
        if (client.lastPurchaseDate === 'Nunca') return true;
        
        const lastPurchase = new Date(client.lastPurchaseDate);
        return lastPurchase < thirtyDaysAgo;
      })
      .sort((a, b) => {
        if (a.lastPurchaseDate === 'Nunca' && b.lastPurchaseDate === 'Nunca') return 0;
        if (a.lastPurchaseDate === 'Nunca') return -1;
        if (b.lastPurchaseDate === 'Nunca') return 1;
        
        return new Date(a.lastPurchaseDate).getTime() - new Date(b.lastPurchaseDate).getTime();
      });
    
    return {
      ...basicAnalytics,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        currentStockValue
      },
      topSellingProducts: productSales.slice(0, 5),
      mostProfitableProducts: [...productSales].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5),
      topClients: clientPurchases.slice(0, 5),
      inactiveClients
    };
  };
  
  const convertOrderToStockExit = async (orderId: string, invoiceNumber?: string): Promise<StockExit | undefined> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;
    
    const stockExit: Omit<StockExit, 'id' | 'number' | 'createdAt'> = {
      clientId: order.clientId,
      clientName: order.clientName || '',
      date: new Date().toISOString(),
      invoiceNumber: invoiceNumber || '',
      notes: `Converted from order ${order.number}`,
      fromOrderId: order.id,
      fromOrderNumber: order.number,
      discount: order.discount,
      updatedAt: new Date().toISOString(),
      items: order.items.map(item => ({
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    };
    
    return await addStockExit(stockExit);
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        const formattedProducts = data.map(mapDbProductToProduct);
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        const formattedCategories = data.map(mapDbCategoryToCategory);
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    }
  };
  
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        const formattedClients = data.map(mapDbClientToClient);
        setClients(formattedClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    }
  };
  
  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        const formattedSuppliers = data.map(mapDbSupplierToSupplier);
        setSuppliers(formattedSuppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Erro ao carregar fornecedores');
    }
  };
  
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedOrders = data.map(order => {
          const items = order.order_items || [];
          return mapDbOrderToOrder(order, items);
        });
        
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar encomendas');
    }
  };
  
  const fetchStockEntries = async () => {
    console.log("Fetching stock entries...");
    try {
      const { data, error } = await supabase
        .from('stock_entries')
        .select(`
          *,
          stock_entry_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching stock entries:', error);
        throw error;
      }
      
      if (data) {
        console.log("Received stock entries data:", data);
        const formattedEntries = data.map(entry => {
          const items = entry.stock_entry_items || [];
          return mapDbStockEntryToStockEntry(entry, items);
        });
        
        setStockEntries(formattedEntries);
      }
    } catch (error) {
      console.error('Error fetching stock entries:', error);
      toast.error('Erro ao carregar entradas de stock');
    }
  };
  
  const fetchStockExits = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_exits')
        .select(`
          *,
          stock_exit_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedExits = data.map(exit => {
          const items = exit.stock_exit_items || [];
          return mapDbStockExitToStockExit(exit, items);
        });
        
        setStockExits(formattedExits);
      }
    } catch (error) {
      console.error('Error fetching stock exits:', error);
      toast.error('Erro ao carregar saídas de stock');
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          code: product.code,
          name: product.name,
          description: product.description,
          category: product.category,
          purchase_price: product.purchasePrice,
          sale_price: product.salePrice,
          current_stock: product.currentStock,
          min_stock: product.minStock,
          image: product.image,
          status: product.status
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newProduct = mapDbProductToProduct(data);
        setProducts([...products, newProduct]);
        return newProduct;
      }
      
      throw new Error('Failed to add product');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erro ao adicionar produto');
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          code: product.code,
          name: product.name,
          description: product.description,
          category: product.category,
          purchase_price: product.purchasePrice,
          sale_price: product.salePrice,
          current_stock: product.currentStock,
          min_stock: product.minStock,
          image: product.image,
          status: product.status
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(products.map(p => 
        p.id === id ? { ...p, ...product } : p
      ));
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
      throw error;
    }
  };
  
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao eliminar produto');
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          description: category.description,
          status: category.status,
          product_count: category.productCount || 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newCategory = mapDbCategoryToCategory(data);
        setCategories([...categories, newCategory]);
        return newCategory;
      }
      
      throw new Error('Failed to add category');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erro ao adicionar categoria');
      throw error;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description,
          status: category.status,
          product_count: category.productCount
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.map(c => 
        c.id === id ? { ...c, ...category } : c
      ));
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
      throw error;
    }
  };
  
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao eliminar categoria');
      throw error;
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          tax_id: client.taxId,
          notes: client.notes,
          status: client.status
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newClient = mapDbClientToClient(data);
        setClients([...clients, newClient]);
        return newClient;
      }
      
      throw new Error('Failed to add client');
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Erro ao adicionar cliente');
      throw error;
    }
  };
  
  const updateClient = async (id: string, client: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          tax_id: client.taxId,
          notes: client.notes,
          status: client.status
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setClients(clients.map(c => 
        c.id === id ? { ...c, ...client } : c
      ));
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erro ao atualizar cliente');
      throw error;
    }
  };
  
  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setClients(clients.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erro ao eliminar cliente');
      throw error;
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          tax_id: supplier.taxId,
          payment_terms: supplier.paymentTerms,
          notes: supplier.notes,
          status: supplier.status
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newSupplier = mapDbSupplierToSupplier(data);
        setSuppliers([...suppliers, newSupplier]);
        return newSupplier;
      }
      
      throw new Error('Failed to add supplier');
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Erro ao adicionar fornecedor');
      throw error;
    }
  };
  
  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          tax_id: supplier.taxId,
          payment_terms: supplier.paymentTerms,
          notes: supplier.notes,
          status: supplier.status
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setSuppliers(suppliers.map(s => 
        s.id === id ? { ...s, ...supplier } : s
      ));
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Erro ao atualizar fornecedor');
      throw error;
    }
  };
  
  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Erro ao eliminar fornecedor');
      throw error;
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'number'>) => {
    try {
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('get_next_counter', { counter_id: 'order' });
      
      if (orderNumberError) throw orderNumberError;
      
      const orderNumber = orderNumberData || `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          number: orderNumber,
          client_id: order.clientId,
          client_name: order.clientName,
          date: order.date,
          notes: order.notes,
          discount: order.discount,
          converted_to_stock_exit_id: order.convertedToStockExitId,
          converted_to_stock_exit_number: order.convertedToStockExitNumber
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (!data) throw new Error('Failed to add order');
      
      const orderItems = order.items.map(item => mapOrderItemToDbOrderItem(item, data.id));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      const newOrder: Order = {
        id: data.id,
        number: data.number,
        clientId: data.client_id || '',
        clientName: data.client_name || '',
        date: data.date,
        notes: data.notes || '',
        convertedToStockExitId: data.converted_to_stock_exit_id,
        convertedToStockExitNumber: data.converted_to_stock_exit_number,
        discount: Number(data.discount || 0),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: order.items
      };
      
      setOrders([newOrder, ...orders]);
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Erro ao adicionar encomenda');
      throw error;
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          client_id: order.clientId,
          client_name: order.clientName,
          date: order.date,
          notes: order.notes,
          discount: order.discount,
          converted_to_stock_exit_id: order.convertedToStockExitId,
          converted_to_stock_exit_number: order.convertedToStockExitNumber
        })
        .eq('id', id);
      
      if (error) throw error;
      
      if (order.items) {
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);
        
        if (deleteError) throw deleteError;
        
        const orderItems = order.items.map(item => mapOrderItemToDbOrderItem(item, id));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        
        if (itemsError) throw itemsError;
      }
      
      setOrders(orders.map(o => {
        if (o.id === id) {
          return {
            ...o,
            ...order,
            items: order.items || o.items
          };
        }
        return o;
      }));
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar encomenda');
      throw error;
    }
  };
  
  const deleteOrder = async (id: string) => {
    try {
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
      
      if (itemsError) throw itemsError;
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setOrders(orders.filter(o => o.id !== id));
      toast.success('Encomenda eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao eliminar encomenda');
      throw error;
    }
  };

  const addStockEntry = async (entry: Omit<StockEntry, 'id' | 'number' | 'createdAt'>) => {
    try {
      const { data: entryNumberData, error: entryNumberError } = await supabase
        .rpc('get_next_counter', { counter_id: 'entry' });
      
      if (entryNumberError) throw entryNumberError;
      
      const entryNumber = entryNumberData || `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const tempId = crypto.randomUUID();
      
      const itemsWithIds = entry.items.map(item => {
        if (!item.id) {
          return { 
            ...item, 
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      
      const optimisticEntry: StockEntry = {
        id: tempId,
        number: entryNumber,
        supplierId: entry.supplierId,
        supplierName: entry.supplierName,
        date: entry.date,
        invoiceNumber: entry.invoiceNumber || '',
        notes: entry.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: itemsWithIds
      };
      
      setStockEntries(prev => [optimisticEntry, ...prev]);
      
      const { data, error } = await supabase
        .from('stock_entries')
        .insert({
          number: entryNumber,
          supplier_id: entry.supplierId,
          supplier_name: entry.supplierName,
          date: entry.date,
          invoice_number: entry.invoiceNumber,
          notes: entry.notes
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (!data) throw new Error('Failed to add stock entry');
      
      const entryItems = itemsWithIds.map(item => mapStockEntryItemToDbStockEntryItem(item, data.id));
      
      const { error: itemsError } = await supabase
        .from('stock_entry_items')
        .insert(entryItems);
      
      if (itemsError) throw itemsError;
      
      for (const item of itemsWithIds) {
        try {
          console.log(`Incrementing stock for product ${item.productId} by ${item.quantity}`);
          
          // Update product stock by using direct arithmetic instead of raw function
          const { error: updateError } = await supabase
            .from('products')
            .select('current_stock')
            .eq('id', item.productId)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                return supabase
                  .from('products')
                  .update({ 
                    current_stock: data.current_stock + item.quantity 
                  })
                  .eq('id', item.productId);
              }
              return { error };
            });
            
          if (updateError) {
            console.error('Error updating product stock:', updateError);
          }
        } catch (error) {
          console.error('Error updating product stock:', error);
        }
      }
      
      const newEntry: StockEntry = {
        id: data.id,
        number: data.number,
        supplierId: data.supplier_id || '',
        supplierName: data.supplier_name,
        date: data.date,
        invoiceNumber: data.invoice_number || '',
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: itemsWithIds.map(item => ({
          ...item,
          id: item.id || crypto.randomUUID()
        }))
      };
      
      setStockEntries(prev => [
        ...prev.filter(e => e.id !== tempId),
        newEntry
      ]);
      
      await fetchProducts();
      
      toast.success('Entrada registada com sucesso');
      return newEntry;
    } catch (error) {
      console.error('Error adding stock entry:', error);
      toast.error('Erro ao adicionar entrada de stock');
      setStockEntries(prev => prev.filter(e => e.id !== crypto.randomUUID()));
      throw error;
    }
  };

  const updateStockEntry = async (id: string, entry: Partial<StockEntry>) => {
    try {
      const { error } = await supabase
        .from('stock_entries')
        .update({
          number: entry.number,
          supplier_id: entry.supplierId,
          supplier_name: entry.supplierName,
          date: entry.date,
          invoice_number: entry.invoiceNumber,
          notes: entry.notes
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setStockEntries(stockEntries.map(e => 
        e.id === id ? { ...e, ...entry } : e
      ));
    } catch (error) {
      console.error('Error updating stock entry:', error);
      toast.error('Erro ao atualizar entrada de stock');
      throw error;
    }
  };
  
  const deleteStockEntry = async (id: string) => {
    try {
      const entry = stockEntries.find(e => e.id === id);
      if (entry && entry.items) {
        for (const item of entry.items) {
          try {
            console.log(`Decrementing stock for product ${item.productId} by ${item.quantity}`);
            
            // Update product stock by using direct arithmetic instead of raw function
            const { error: updateError } = await supabase
              .from('products')
              .select('current_stock')
              .eq('id', item.productId)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  return supabase
                    .from('products')
                    .update({ 
                      current_stock: Math.max(0, data.current_stock - item.quantity) 
                    })
                    .eq('id', item.productId);
                }
                return { error };
              });
              
            if (updateError) {
              console.error('Error updating product stock:', updateError);
            }
          } catch (error) {
            console.error('Error updating product stock:', error);
          }
        }
      }
      
      const { error: itemsError } = await supabase
        .from('stock_entry_items')
        .delete()
        .eq('entry_id', id);
      
      if (itemsError) throw itemsError;
      
      const { error } = await supabase
        .from('stock_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStockEntries(stockEntries.filter(e => e.id !== id));
      await fetchProducts();
      toast.success('Entrada eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting stock entry:', error);
      toast.error('Erro ao eliminar entrada de stock');
      throw error;
    }
  };
  
  const addStockExit = async (exit: Omit<StockExit, 'id' | 'number' | 'createdAt'>) => {
    try {
      const { data: exitNumberData, error: exitNumberError } = await supabase
        .rpc('get_next_counter', { counter_id: 'exit' });
      
      if (exitNumberError) throw exitNumberError;
      
      const exitNumber = exitNumberData || `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const itemsWithIds = exit.items.map(item => {
        if (!item.id) {
          return { 
            ...item, 
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      
      const { data, error } = await supabase
        .from('stock_exits')
        .insert({
          number: exitNumber,
          client_id: exit.clientId,
          client_name: exit.clientName,
          date: exit.date,
          invoice_number: exit.invoiceNumber,
          notes: exit.notes,
          from_order_id: exit.fromOrderId,
          from_order_number: exit.fromOrderNumber,
          discount: exit.discount
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (!data) throw new Error('Failed to add stock exit');
      
      const exitItems = itemsWithIds.map(item => mapStockExitItemToDbStockExitItem(item, data.id));
      
      const { error: itemsError } = await supabase
        .from('stock_exit_items')
        .insert(exitItems);
      
      if (itemsError) throw itemsError;
      
      for (const item of itemsWithIds) {
        try {
          console.log(`Decrementing stock for product ${item.productId} by ${item.quantity}`);
          
          // Update product stock by using direct arithmetic instead of raw function
          const { error: updateError } = await supabase
            .from('products')
            .select('current_stock')
            .eq('id', item.productId)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                return supabase
                  .from('products')
                  .update({ 
                    current_stock: Math.max(0, data.current_stock - item.quantity) 
                  })
                  .eq('id', item.productId);
              }
              return { error };
            });
            
          if (updateError) {
            console.error('Error updating product stock:', updateError);
          }
        } catch (error) {
          console.error('Error updating product stock:', error);
        }
      }
      
      if (exit.fromOrderId) {
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({
            converted_to_stock_exit_id: data.id,
            converted_to_stock_exit_number: exitNumber
          })
          .eq('id', exit.fromOrderId);
        
        if (orderUpdateError) {
          console.error('Error updating order conversion status:', orderUpdateError);
        }
      }
      
      const newExit: StockExit = {
        id: data.id,
        number: data.number,
        clientId: data.client_id || '',
        clientName: data.client_name,
        date: data.date,
        invoiceNumber: data.invoice_number || '',
        notes: data.notes,
        fromOrderId: data.from_order_id,
        fromOrderNumber: data.from_order_number,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        discount: Number(data.discount || 0),
        items: itemsWithIds
      };
      
      await fetchProducts();
      await fetchOrders();
      setStockExits([newExit, ...stockExits]);
      toast.success('Saída registada com sucesso');
      return newExit;
    } catch (error) {
      console.error('Error adding stock exit:', error);
      toast.error('Erro ao adicionar saída de stock');
      throw error;
    }
  };
  
  const updateStockExit = async (id: string, exit: Partial<StockExit>) => {
    try {
      const { error } = await supabase
        .from('stock_exits')
        .update({
          number: exit.number,
          client_id: exit.clientId,
          client_name: exit.clientName,
          date: exit.date,
          invoice_number: exit.invoiceNumber,
          notes: exit.notes
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setStockExits(stockExits.map(e => 
        e.id === id ? { ...e, ...exit } : e
      ));
    } catch (error) {
      console.error('Error updating stock exit:', error);
      toast.error('Erro ao atualizar saída de stock');
      throw error;
    }
  };
  
  const deleteStockExit = async (id: string) => {
    try {
      const exit = stockExits.find(e => e.id === id);
      
      if (exit) {
        if (exit.items) {
          for (const item of exit.items) {
            try {
              console.log(`Incrementing stock for product ${item.productId} by ${item.quantity}`);
              
              // Update product stock by using direct arithmetic instead of raw function
              const { error: updateError } = await supabase
                .from('products')
                .select('current_stock')
                .eq('id', item.productId)
                .single()
                .then(({ data, error }) => {
                  if (!error && data) {
                    return supabase
                      .from('products')
                      .update({ 
                        current_stock: data.current_stock + item.quantity 
                      })
                      .eq('id', item.productId);
                  }
                  return { error };
                });
                
              if (updateError) {
                console.error('Error updating product stock:', updateError);
              }
            } catch (error) {
              console.error('Error updating product stock:', error);
            }
          }
        }
        
        if (exit.fromOrderId) {
          const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({
              converted_to_stock_exit_id: null,
              converted_to_stock_exit_number: null
            })
            .eq('id', exit.fromOrderId);
          
          if (orderUpdateError) {
            console.error('Error updating order conversion status:', orderUpdateError);
          }
        }
      }
      
      const { error: itemsError } = await supabase
        .from('stock_exit_items')
        .delete()
        .eq('exit_id', id);
      
      if (itemsError) throw itemsError;
      
      const { error } = await supabase
        .from('stock_exits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStockExits(stockExits.filter(e => e.id !== id));
      await fetchProducts();
      await fetchOrders();
      toast.success('Saída eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting stock exit:', error);
      toast.error('Erro ao eliminar saída de stock');
      throw error;
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...expense,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: expense.items.map(item => ({
        id: crypto.randomUUID(),
        expenseId: '',
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    };
    
    // Update the expense ID in items
    newExpense.items = newExpense.items.map(item => ({
      ...item,
      expenseId: newExpense.id
    }));
    
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = async (expense: Expense, id: string) => {
    const updatedExpense = {
      ...expense,
      updatedAt: new Date().toISOString()
    };
    setExpenses(expenses.map(e => e.id === id ? updatedExpense : e));
  };

  const deleteExpense = async (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const exportData = (dataType: ExportDataType): any[] => {
    switch (dataType) {
      case 'products':
        return products;
      case 'categories':
        return categories;
      case 'clients':
        return clients;
      case 'suppliers':
        return suppliers;
      case 'orders':
        return orders;
      case 'stockEntries':
        return stockEntries;
      case 'stockExits':
        return stockExits;
      case 'expenses':
        return expenses;
      case 'all':
        return [{
          products,
          categories,
          clients,
          suppliers,
          orders,
          stockEntries,
          stockExits,
          expenses
        }];
      default:
        return [];
    }
  };

  const importData = async (type: ExportDataType, data: string) => {
    let parsedData: any;

    switch (type) {
      case 'products':
        parsedData = JSON.parse(data);
        setProducts(parsedData);
        toast.success('Produtos importados com sucesso!');
        break;
      case 'categories':
        parsedData = JSON.parse(data);
        setCategories(parsedData);
        toast.success('Categorias importadas com sucesso!');
        break;
      case 'clients':
        parsedData = JSON.parse(data);
        setClients(parsedData);
        toast.success('Clientes importados com sucesso!');
        break;
      case 'suppliers':
        parsedData = JSON.parse(data);
        setSuppliers(parsedData);
        toast.success('Fornecedores importados com sucesso!');
        break;
      case 'orders':
        parsedData = JSON.parse(data);
        setOrders(parsedData);
        toast.success('Encomendas importadas com sucesso!');
        break;
      case 'stockEntries':
        parsedData = JSON.parse(data);
        setStockEntries(parsedData);
        toast.success('Entradas de stock importadas com sucesso!');
        break;
      case 'stockExits':
        parsedData = JSON.parse(data);
        setStockExits(parsedData);
        toast.success('Saídas de stock importadas com sucesso!');
        break;
      case 'expenses':
        parsedData = JSON.parse(data);
        setExpenses(parsedData);
        toast.success('Despesas importadas com sucesso!');
        break;
      case 'all':
        parsedData = JSON.parse(data);
        setProducts(parsedData.products);
        setCategories(parsedData.categories);
        setClients(parsedData.clients);
        setSuppliers(parsedData.suppliers);
        setOrders(parsedData.orders);
        setStockEntries(parsedData.stockEntries);
        setStockExits(parsedData.stockExits);
        setExpenses(parsedData.expenses);
        toast.success('Todos os dados importados com sucesso!');
        break;
      default:
        toast.error('Tipo de dados inválido');
    }
  };

  const updateData = (type: keyof DataState, data: any) => {
    switch (type) {
      case 'products':
        setProducts(data as Product[]);
        toast.success('Produtos atualizados com sucesso');
        break;
      case 'categories':
        setCategories(data as Category[]);
        toast.success('Categorias atualizadas com sucesso');
        break;
      case 'clients':
        setClients(data as Client[]);
        toast.success('Clientes atualizados com sucesso');
        break;
      case 'suppliers':
        setSuppliers(data as Supplier[]);
        toast.success('Fornecedores atualizados com sucesso');
        break;
      case 'orders':
        setOrders(data as Order[]);
        toast.success('Encomendas atualizadas com sucesso');
        break;
      case 'stockEntries':
        setStockEntries(data as StockEntry[]);
        toast.success('Entradas de stock atualizadas com sucesso');
        break;
      case 'stockExits':
        setStockExits(data as StockExit[]);
        toast.success('Saídas de stock atualizadas com sucesso');
        break;
      case 'expenses':
        setExpenses(data as Expense[]);
        toast.success('Despesas atualizadas com sucesso');
        break;
      default:
        toast.error('Tipo de dados inválido');
    }
  };

  const contextValue: DataContextType = {
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
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
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

</edits_to_apply>
