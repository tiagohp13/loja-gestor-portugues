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
  
  // Stock Exits
  stockExits: StockExit[];
  setStockExits: React.Dispatch<React.SetStateAction<StockExit[]>>;
  addStockExit: (exit: Omit<StockExit, 'id' | 'number' | 'createdAt'>) => Promise<StockExit>;
  updateStockExit: (id: string, exit: Partial<StockExit>) => Promise<void>;
  deleteStockExit: (id: string) => Promise<void>;
  
  // Export/Import
  exportData: (type: ExportDataType) => void;
  importData: (type: ExportDataType, data: string) => Promise<void>;
  
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
  };
  
  // Loading state
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
  // State hooks
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch all data on mount
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
  
  // HELPER FUNCTIONS FOR FINDING AND GETTING ITEMS
  
  // Product helpers
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
  
  // Category helpers
  const getCategory = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };
  
  // Client helpers
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
  
  // Supplier helpers
  const getSupplier = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };
  
  const getSupplierHistory = (id: string) => {
    const supplierEntries = stockEntries.filter(entry => entry.supplierId === id);
    
    return { entries: supplierEntries };
  };
  
  // Order helpers
  const findOrder = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };
  
  // Business Analytics
  const getBusinessAnalytics = () => {
    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalClients: clients.length,
      totalSuppliers: suppliers.length,
      totalOrders: orders.length,
      totalStockEntries: stockEntries.length,
      totalStockExits: stockExits.length,
      lowStockProducts: products.filter(p => p.currentStock <= p.minStock)
    };
  };
  
  // Convert order to stock exit
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
      items: order.items
    };
    
    return await addStockExit(stockExit);
  };
  
  // Fetch functions
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
    try {
      const { data, error } = await supabase
        .from('stock_entries')
        .select(`
          *,
          stock_entry_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedEntries = data.map(entry => ({
          id: entry.id,
          number: entry.number,
          supplierId: entry.supplier_id || '',
          supplierName: entry.supplier_name,
          date: entry.date,
          invoiceNumber: entry.invoice_number || '',
          notes: entry.notes || '',
          createdAt: entry.created_at,
          items: entry.stock_entry_items.map((item: any) => ({
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            purchasePrice: Number(item.purchase_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined
          }))
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
          items: exit.stock_exit_items.map((item: any) => ({
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: Number(item.sale_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined
          }))
        }));
        
        setStockExits(formattedExits);
      }
    } catch (error) {
      console.error('Error fetching stock exits:', error);
      toast.error('Erro ao carregar saídas de stock');
    }
  };
  
  // CRUD functions for Products
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
      
      // Update local state
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
      
      // Update local state
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao eliminar produto');
      throw error;
    }
  };
  
  // CRUD functions for Categories
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
      
      // Update local state
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
      
      // Update local state
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao eliminar categoria');
      throw error;
    }
  };
  
  // CRUD functions for Clients
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
      
      // Update local state
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
      
      // Update local state
      setClients(clients.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erro ao eliminar cliente');
      throw error;
    }
  };
  
  // CRUD functions for Suppliers
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
        const newSupplier: Supplier = {
          id: data.id,
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          taxId: data.tax_id || '',
          paymentTerms: data.payment_terms || '',
          notes: data.notes || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          status: data.status
        };
        
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
      
      // Update local state
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
      
      // Update local state
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Erro ao eliminar fornecedor');
      throw error;
    }
  };
  
  // CRUD functions for Orders
  const addOrder = async (order: Omit<Order, 'id' | 'number'>) => {
    try {
      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('get_next_counter', { counter_id: 'order' });
      
      if (orderNumberError) throw orderNumberError;
      
      const orderNumber = orderNumberData || `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Insert the order
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
      
      // Insert order items
      const orderItems = order.items.map(item => ({
        order_id: data.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        sale_price: item.salePrice,
        discount_percent: item.discountPercent
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Format the new order
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
      // Update order data
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
      
      // Update items if provided
      if (order.items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);
        
        if (deleteError) throw deleteError;
        
        // Add new items
        const orderItems = order.items.map(item => ({
          order_id: id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          sale_price: item.salePrice,
          discount_percent: item.discountPercent
        }));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        
        if (itemsError) throw itemsError;
      }
      
      // Update local state
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
      throw
