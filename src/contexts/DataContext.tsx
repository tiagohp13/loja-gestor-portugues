
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, snakeToCamel } from '@/integrations/supabase/client';
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
  
  // Categories
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Clients
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  // Suppliers
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Orders
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Omit<Order, 'id' | 'number'>) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
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
  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>) => {
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
      throw error;
    }
  };
  
  const deleteOrder = async (id: string) => {
    try {
      // Check if order is already converted to a stock exit
      const order = orders.find(o => o.id === id);
      if (order?.convertedToStockExitId) {
        toast.error('Não é possível eliminar uma encomenda já convertida em saída de stock');
        return;
      }
      
      // Delete the order (order_items will be deleted automatically due to ON DELETE CASCADE constraint)
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.filter(o => o.id !== id));
      toast.success('Encomenda eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao eliminar encomenda');
      throw error;
    }
  };
  
  // CRUD functions for Stock Entries
  const addStockEntry = async (entry: Omit<StockEntry, 'id' | 'number' | 'createdAt'>) => {
    try {
      // Generate entry number
      const { data: entryNumberData, error: entryNumberError } = await supabase
        .rpc('get_next_counter', { counter_id: 'entry' });
      
      if (entryNumberError) throw entryNumberError;
      
      const entryNumber = entryNumberData || `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Insert the entry
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
      
      // Insert entry items
      const entryItems = entry.items.map(item => ({
        entry_id: data.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        purchase_price: item.purchasePrice,
        discount_percent: item.discountPercent
      }));
      
      const { error: itemsError } = await supabase
        .from('stock_entry_items')
        .insert(entryItems);
      
      if (itemsError) throw itemsError;
      
      // Update product stock
      for (const item of entry.items) {
        const { error: productError } = await supabase
          .from('products')
          .update({
            current_stock: supabase.rpc('increment', { inc: item.quantity })
          })
          .eq('id', item.productId);
        
        if (productError) {
          console.error('Error updating product stock:', productError);
        }
      }
      
      // Format the new entry
      const newEntry: StockEntry = {
        id: data.id,
        number: data.number,
        supplierId: data.supplier_id || '',
        supplierName: data.supplier_name,
        date: data.date,
        invoiceNumber: data.invoice_number || '',
        notes: data.notes || '',
        createdAt: data.created_at,
        items: entry.items
      };
      
      setStockEntries([newEntry, ...stockEntries]);
      return newEntry;
    } catch (error) {
      console.error('Error adding stock entry:', error);
      toast.error('Erro ao adicionar entrada de stock');
      throw error;
    }
  };
  
  const updateStockEntry = async (id: string, entry: Partial<StockEntry>) => {
    try {
      // Get the existing entry to calculate stock changes
      const existingEntry = stockEntries.find(e => e.id === id);
      if (!existingEntry) throw new Error('Entry not found');
      
      // Update entry data
      const { error } = await supabase
        .from('stock_entries')
        .update({
          supplier_id: entry.supplierId,
          supplier_name: entry.supplierName,
          date: entry.date,
          invoice_number: entry.invoiceNumber,
          notes: entry.notes
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update items if provided
      if (entry.items) {
        // Revert previous stock changes
        for (const item of existingEntry.items) {
          const { error: revertError } = await supabase
            .from('products')
            .update({
              current_stock: supabase.rpc('decrement', { dec: item.quantity })
            })
            .eq('id', item.productId);
          
          if (revertError) {
            console.error('Error reverting product stock:', revertError);
          }
        }
        
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('stock_entry_items')
          .delete()
          .eq('entry_id', id);
        
        if (deleteError) throw deleteError;
        
        // Add new items
        const entryItems = entry.items.map(item => ({
          entry_id: id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          purchase_price: item.purchasePrice,
          discount_percent: item.discountPercent
        }));
        
        const { error: itemsError } = await supabase
          .from('stock_entry_items')
          .insert(entryItems);
        
        if (itemsError) throw itemsError;
        
        // Apply new stock changes
        for (const item of entry.items) {
          const { error: productError } = await supabase
            .from('products')
            .update({
              current_stock: supabase.rpc('increment', { inc: item.quantity })
            })
            .eq('id', item.productId);
          
          if (productError) {
            console.error('Error updating product stock:', productError);
          }
        }
      }
      
      // Update local state
      setStockEntries(stockEntries.map(e => {
        if (e.id === id) {
          return {
            ...e,
            ...entry,
            items: entry.items || e.items
          };
        }
        return e;
      }));
    } catch (error) {
      console.error('Error updating stock entry:', error);
      toast.error('Erro ao atualizar entrada de stock');
      throw error;
    }
  };
  
  const deleteStockEntry = async (id: string) => {
    try {
      // Get the existing entry to revert stock changes
      const existingEntry = stockEntries.find(e => e.id === id);
      if (!existingEntry) throw new Error('Entry not found');
      
      // Revert stock changes
      for (const item of existingEntry.items) {
        const { data: product } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', item.productId)
          .single();
        
        if (product) {
          const newStock = Math.max(0, product.current_stock - item.quantity);
          
          const { error: productError } = await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', item.productId);
          
          if (productError) {
            console.error('Error reverting product stock:', productError);
          }
        }
      }
      
      // Delete the entry (stock_entry_items will be deleted automatically due to ON DELETE CASCADE constraint)
      const { error } = await supabase
        .from('stock_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setStockEntries(stockEntries.filter(e => e.id !== id));
      toast.success('Entrada de stock eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting stock entry:', error);
      toast.error('Erro ao eliminar entrada de stock');
      throw error;
    }
  };
  
  // CRUD functions for Stock Exits
  const addStockExit = async (exit: Omit<StockExit, 'id' | 'number' | 'createdAt'>) => {
    try {
      // Generate exit number
      const { data: exitNumberData, error: exitNumberError } = await supabase
        .rpc('get_next_counter', { counter_id: 'exit' });
      
      if (exitNumberError) throw exitNumberError;
      
      const exitNumber = exitNumberData || `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Insert the exit
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
      
      // Insert exit items
      const exitItems = exit.items.map(item => ({
        exit_id: data.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        sale_price: item.salePrice,
        discount_percent: item.discountPercent
      }));
      
      const { error: itemsError } = await supabase
        .from('stock_exit_items')
        .insert(exitItems);
      
      if (itemsError) throw itemsError;
      
      // Update product stock
      for (const item of exit.items) {
        const { error: productError } = await supabase
          .from('products')
          .update({
            current_stock: supabase.rpc('decrement', { dec: item.quantity })
          })
          .eq('id', item.productId);
        
        if (productError) {
          console.error('Error updating product stock:', productError);
        }
      }
      
      // Update order if it's a conversion
      if (exit.fromOrderId) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            converted_to_stock_exit_id: data.id,
            converted_to_stock_exit_number: exitNumber
          })
          .eq('id', exit.fromOrderId);
        
        if (orderError) {
          console.error('Error updating order status:', orderError);
        }
        
        // Update local state for orders
        setOrders(orders.map(order => {
          if (order.id === exit.fromOrderId) {
            return {
              ...order,
              convertedToStockExitId: data.id,
              convertedToStockExitNumber: exitNumber
            };
          }
          return order;
        }));
      }
      
      // Format the new exit
      const newExit: StockExit = {
        id: data.id,
        number: data.number,
        clientId: data.client_id || '',
        clientName: data.client_name,
        date: data.date,
        invoiceNumber: data.invoice_number || '',
        notes: data.notes || '',
        fromOrderId: data.from_order_id,
        fromOrderNumber: data.from_order_number,
        createdAt: data.created_at,
        discount: Number(data.discount || 0),
        items: exit.items
      };
      
      setStockExits([newExit, ...stockExits]);
      return newExit;
    } catch (error) {
      console.error('Error adding stock exit:', error);
      toast.error('Erro ao adicionar saída de stock');
      throw error;
    }
  };
  
  const updateStockExit = async (id: string, exit: Partial<StockExit>) => {
    try {
      // Get the existing exit to calculate stock changes
      const existingExit = stockExits.find(e => e.id === id);
      if (!existingExit) throw new Error('Exit not found');
      
      // Update exit data
      const { error } = await supabase
        .from('stock_exits')
        .update({
          client_id: exit.clientId,
          client_name: exit.clientName,
          date: exit.date,
          invoice_number: exit.invoiceNumber,
          notes: exit.notes,
          discount: exit.discount
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update items if provided
      if (exit.items) {
        // Revert previous stock changes
        for (const item of existingExit.items) {
          const { error: revertError } = await supabase
            .from('products')
            .update({
              current_stock: supabase.rpc('increment', { inc: item.quantity })
            })
            .eq('id', item.productId);
          
          if (revertError) {
            console.error('Error reverting product stock:', revertError);
          }
        }
        
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('stock_exit_items')
          .delete()
          .eq('exit_id', id);
        
        if (deleteError) throw deleteError;
        
        // Add new items
        const exitItems = exit.items.map(item => ({
          exit_id: id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          sale_price: item.salePrice,
          discount_percent: item.discountPercent
        }));
        
        const { error: itemsError } = await supabase
          .from('stock_exit_items')
          .insert(exitItems);
        
        if (itemsError) throw itemsError;
        
        // Apply new stock changes
        for (const item of exit.items) {
          const { error: productError } = await supabase
            .from('products')
            .update({
              current_stock: supabase.rpc('decrement', { dec: item.quantity })
            })
            .eq('id', item.productId);
          
          if (productError) {
            console.error('Error updating product stock:', productError);
          }
        }
      }
      
      // Update local state
      setStockExits(stockExits.map(e => {
        if (e.id === id) {
          return {
            ...e,
            ...exit,
            items: exit.items || e.items
          };
        }
        return e;
      }));
    } catch (error) {
      console.error('Error updating stock exit:', error);
      toast.error('Erro ao atualizar saída de stock');
      throw error;
    }
  };
  
  const deleteStockExit = async (id: string) => {
    try {
      // Get the existing exit to revert stock changes
      const existingExit = stockExits.find(e => e.id === id);
      if (!existingExit) throw new Error('Exit not found');
      
      // Revert stock changes
      for (const item of existingExit.items) {
        const { data: product } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', item.productId)
          .single();
        
        if (product) {
          const newStock = product.current_stock + item.quantity;
          
          const { error: productError } = await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', item.productId);
          
          if (productError) {
            console.error('Error reverting product stock:', productError);
          }
        }
      }
      
      // Reset converted status in the original order if this is a converted exit
      if (existingExit.fromOrderId) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            converted_to_stock_exit_id: null,
            converted_to_stock_exit_number: null
          })
          .eq('id', existingExit.fromOrderId);
        
        if (orderError) {
          console.error('Error resetting order status:', orderError);
        }
        
        // Update local state for orders
        setOrders(orders.map(order => {
          if (order.id === existingExit.fromOrderId) {
            return {
              ...order,
              convertedToStockExitId: undefined,
              convertedToStockExitNumber: undefined
            };
          }
          return order;
        }));
      }
      
      // Delete the exit (stock_exit_items will be deleted automatically due to ON DELETE CASCADE constraint)
      const { error } = await supabase
        .from('stock_exits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setStockExits(stockExits.filter(e => e.id !== id));
      toast.success('Saída de stock eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting stock exit:', error);
      toast.error('Erro ao eliminar saída de stock');
      throw error;
    }
  };
  
  // Export/Import functions
  const exportData = (type: ExportDataType) => {
    try {
      let dataToExport;
      
      switch (type) {
        case 'products':
          dataToExport = products;
          break;
        case 'categories':
          dataToExport = categories;
          break;
        case 'clients':
          dataToExport = clients;
          break;
        case 'suppliers':
          dataToExport = suppliers;
          break;
        case 'orders':
          dataToExport = orders;
          break;
        case 'stockEntries':
          dataToExport = stockEntries;
          break;
        case 'stockExits':
          dataToExport = stockExits;
          break;
        default:
          throw new Error(`Invalid export type: ${type}`);
      }
      
      const jsonData = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      toast.success(`Dados exportados com sucesso: ${type}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(`Erro ao exportar dados: ${type}`);
    }
  };
  
  const importData = async (type: ExportDataType, jsonData: string) => {
    try {
      let parsedData;
      
      try {
        parsedData = JSON.parse(jsonData);
      } catch (parseError) {
        toast.error('Formato de dados inválido. Por favor, forneça um arquivo JSON válido.');
        return;
      }
      
      if (!Array.isArray(parsedData)) {
        toast.error('Os dados importados devem ser uma lista.');
        return;
      }
      
      setIsLoading(true);
      
      switch (type) {
        case 'products':
          if (parsedData.length === 0) break;
          
          for (const item of parsedData) {
            const product = {
              code: item.code,
              name: item.name,
              description: item.description || '',
              category: item.category || '',
              purchasePrice: item.purchasePrice,
              salePrice: item.salePrice,
              currentStock: item.currentStock,
              minStock: item.minStock,
              image: item.image,
              status: item.status
            };
            
            const { data: existingProduct } = await supabase
              .from('products')
              .select('id')
              .eq('code', product.code)
              .maybeSingle();
            
            if (existingProduct) {
              await updateProduct(existingProduct.id, product);
            } else {
              await addProduct(product);
            }
          }
          break;
          
        case 'categories':
          if (parsedData.length === 0) break;
          
          for (const item of parsedData) {
            const category = {
              name: item.name,
              description: item.description || '',
              status: item.status
            };
            
            const { data: existingCategory } = await supabase
              .from('categories')
              .select('id')
              .eq('name', category.name)
              .maybeSingle();
            
            if (existingCategory) {
              await updateCategory(existingCategory.id, category);
            } else {
              await addCategory(category);
            }
          }
          break;
          
        case 'clients':
          if (parsedData.length === 0) break;
          
          for (const item of parsedData) {
            const client = {
              name: item.name,
              email: item.email || '',
              phone: item.phone || '',
              address: item.address || '',
              taxId: item.taxId || '',
              notes: item.notes || '',
              status: item.status
            };
            
            const { data: existingClient } = await supabase
              .from('clients')
              .select('id')
              .eq('name', client.name)
              .maybeSingle();
            
            if (existingClient) {
              await updateClient(existingClient.id, client);
            } else {
              await addClient(client);
            }
          }
          break;
          
        case 'suppliers':
          if (parsedData.length === 0) break;
          
          for (const item of parsedData) {
            const supplier = {
              name: item.name,
              email: item.email || '',
              phone: item.phone || '',
              address: item.address || '',
              taxId: item.taxId || '',
              paymentTerms: item.paymentTerms || '',
              notes: item.notes || '',
              status: item.status
            };
            
            const { data: existingSupplier } = await supabase
              .from('suppliers')
              .select('id')
              .eq('name', supplier.name)
              .maybeSingle();
            
            if (existingSupplier) {
              await updateSupplier(existingSupplier.id, supplier);
            } else {
              await addSupplier(supplier);
            }
          }
          break;
          
        // Add similar cases for orders, stockEntries, and stockExits if needed
        
        default:
          toast.info(`Importação de ${type} em desenvolvimento. Estará disponível em breve.`);
          break;
      }
      
      toast.success(`Dados importados com sucesso: ${type}`);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error(`Erro ao importar dados: ${type}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DataContext.Provider
      value={{
        // Products
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        
        // Categories
        categories,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        
        // Clients
        clients,
        setClients,
        addClient,
        updateClient,
        deleteClient,
        
        // Suppliers
        suppliers,
        setSuppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        
        // Orders
        orders,
        setOrders,
        addOrder,
        updateOrder,
        deleteOrder,
        
        // Stock Entries
        stockEntries,
        setStockEntries,
        addStockEntry,
        updateStockEntry,
        deleteStockEntry,
        
        // Stock Exits
        stockExits,
        setStockExits,
        addStockExit,
        updateStockExit,
        deleteStockExit,
        
        // Export/Import
        exportData,
        importData,
        
        // Loading state
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
