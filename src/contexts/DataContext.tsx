import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, snakeToCamel, increment, decrement } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { 
  Product, Category, Client, Supplier, 
  Order, OrderItem, StockEntry, StockEntryItem,
  StockExit, StockExitItem, ExportDataType
} from '../types';

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
  createStockEntry: (entry: any) => Promise<StockEntry>;
  
  // Stock Exits
  stockExits: StockExit[];
  setStockExits: React.Dispatch<React.SetStateAction<StockExit[]>>;
  addStockExit: (exit: Omit<StockExit, 'id' | 'number' | 'createdAt'>) => Promise<StockExit>;
  updateStockExit: (id: string, exit: Partial<StockExit>) => Promise<void>;
  deleteStockExit: (id: string) => Promise<void>;
  
  // Export/Import
  exportData: (type: ExportDataType) => void;
  importData: (type: ExportDataType, data: string) => Promise<void>;
  updateData: <T extends keyof DataState>(type: T, data: DataState[T]) => void;
  
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
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
      items: order.items.map(item => ({
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent
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
        const formattedProducts = data.map(product => ({
          id: product.id,
          code: product.code,
          name: product.name,
          description: product.description || '',
          category: product.category || '',
          purchasePrice: Number(product.purchase_price),
          salePrice: Number(product.sale_price),
          currentStock: product.current_stock,
          minStock: product.min_stock,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          image: product.image,
          status: product.status
        }));
        
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
        const formattedCategories = data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || '',
          createdAt: category.created_at,
          updatedAt: category.updated_at,
          status: category.status,
          productCount: category.product_count || 0
        }));
        
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
        const formattedClients = data.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          taxId: client.tax_id || '',
          notes: client.notes || '',
          createdAt: client.created_at,
          updatedAt: client.updated_at,
          status: client.status
        }));
        
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
        const formattedSuppliers = data.map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          taxId: supplier.tax_id || '',
          paymentTerms: supplier.payment_terms || '',
          notes: supplier.notes || '',
          createdAt: supplier.created_at,
          updatedAt: supplier.updated_at,
          status: supplier.status
        }));
        
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
        const formattedOrders = data.map(order => ({
          id: order.id,
          number: order.number,
          clientId: order.client_id || '',
          clientName: order.client_name || '',
          date: order.date,
          notes: order.notes || '',
          convertedToStockExitId: order.converted_to_stock_exit_id,
          convertedToStockExitNumber: order.converted_to_stock_exit_number,
          discount: Number(order.discount || 0),
          items: order.order_items.map((item: any) => ({
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: Number(item.sale_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined
          }))
        }));
        
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
        const formattedEntries = data.map(entry => ({
          id: entry.id,
          number: entry.number,
          supplierId: entry.supplier_id || '',
          supplierName: entry.supplier_name,
          date: entry.date,
          invoiceNumber: entry.invoice_number || '',
          notes: entry.notes || '',
          createdAt: entry.created_at,
          items: entry.stock_entry_items?.map((item: any) => ({
            id: item.id,
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            purchasePrice: Number(item.purchase_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined
          })) || []
        }));
        
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
        const formattedExits = data.map(exit => ({
          id: exit.id,
          number: exit.number,
          clientId: exit.client_id || '',
          clientName: exit.client_name,
          date: exit.date,
          invoiceNumber: exit.invoice_number || '',
          notes: exit.notes || '',
          fromOrderId: exit.from_order_id,
          fromOrderNumber: exit.from_order_number,
          createdAt: exit.created_at,
          discount: Number(exit.discount || 0),
          items: exit.stock_exit_items?.map((item: any) => ({
            id: item.id,
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: Number(item.sale_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined
          })) || []
        }));
        
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
        const newProduct: Product = {
          id: data.id,
          code: data.code,
          name: data.name,
          description: data.description || '',
          category: data.category || '',
          purchasePrice: Number(data.purchase_price),
          salePrice: Number(data.sale_price),
          currentStock: data.current_stock,
          minStock: data.min_stock,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          image: data.image,
          status: data.status
        };
        
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
          status: category.status
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newCategory: Category = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          status: data.status,
          productCount: data.product_count || 0
        };
        
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
          status: category.status
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
        const newClient: Client = {
          id: data.id,
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          taxId: data.tax_id || '',
          notes: data.notes || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          status: data.status
        };
        
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
          status: supplier
