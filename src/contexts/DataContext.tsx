import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, snakeToCamel, camelToSnake, withUserData } from '@/integrations/supabase/client';
import { 
  Product, 
  Category, 
  Client, 
  Supplier, 
  Order, 
  StockEntry, 
  StockExit, 
  ExportDataType,
  StockEntryItem,
  StockExitItem,
  OrderItem
} from '@/types';
import { toast } from '@/hooks/use-toast';

interface DataContextType {
  // Data arrays
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  
  // Loading states
  isLoading: boolean;
  
  // CRUD operations for products
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  
  // CRUD operations for categories
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  
  // CRUD operations for clients
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  
  // CRUD operations for suppliers
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // CRUD operations for orders
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  convertOrderToStockExit: (orderId: string) => Promise<StockExit>;
  
  // CRUD operations for stock entries
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StockEntry>;
  updateStockEntry: (id: string, updatedEntry: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StockEntry>;
  deleteStockEntry: (id: string) => Promise<void>;
  
  // CRUD operations for stock exits
  addStockExit: (exit: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StockExit>;
  updateStockExit: (id: string, exit: Partial<StockExit>) => Promise<StockExit>;
  deleteStockExit: (id: string) => Promise<void>;
  
  // Data management
  refreshData: () => Promise<void>;
  exportData: (type: ExportDataType) => void;
  importData: (type: ExportDataType, jsonData: string) => Promise<void>;
  updateData: (type: string, data: any[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch functions
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData = snakeToCamel(data || []) as Product[];
      setProducts(formattedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData = snakeToCamel(data || []) as Category[];
      setCategories(formattedData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive"
      });
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData = snakeToCamel(data || []) as Client[];
      setClients(formattedData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive"
      });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData = snakeToCamel(data || []) as Supplier[];
      setSuppliers(formattedData);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar fornecedores",
        variant: "destructive"
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      const formattedOrders = (ordersData || []).map(order => ({
        ...snakeToCamel(order),
        items: snakeToCamel(order.order_items || [])
      })) as Order[];
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar encomendas",
        variant: "destructive"
      });
    }
  };

  const fetchStockEntries = async () => {
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('stock_entries')
        .select(`
          *,
          stock_entry_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (entriesError) throw entriesError;
      
      const formattedEntries = (entriesData || []).map(entry => ({
        ...snakeToCamel(entry),
        items: snakeToCamel(entry.stock_entry_items || [])
      })) as StockEntry[];
      
      setStockEntries(formattedEntries);
    } catch (error) {
      console.error('Error fetching stock entries:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar entradas de stock",
        variant: "destructive"
      });
    }
  };

  const fetchStockExits = async () => {
    try {
      const { data: exitsData, error: exitsError } = await supabase
        .from('stock_exits')
        .select(`
          *,
          stock_exit_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (exitsError) throw exitsError;
      
      const formattedExits = (exitsData || []).map(exit => ({
        ...snakeToCamel(exit),
        items: snakeToCamel(exit.stock_exit_items || [])
      })) as StockExit[];
      
      setStockExits(formattedExits);
    } catch (error) {
      console.error('Error fetching stock exits:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar saídas de stock",
        variant: "destructive"
      });
    }
  };

  // CRUD operations for products
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    try {
      const productData = await withUserData(product);
      const snakeCaseData = camelToSnake(productData);
      
      const { data, error } = await supabase
        .from('products')
        .insert(snakeCaseData)
        .select()
        .single();
      
      if (error) throw error;
      
      const newProduct = snakeToCamel(data) as Product;
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
    try {
      const snakeCaseData = camelToSnake(product);
      
      const { data, error } = await supabase
        .from('products')
        .update(snakeCaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedProduct = snakeToCamel(data) as Product;
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // CRUD operations for categories
  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    try {
      const categoryData = await withUserData(category);
      const snakeCaseData = camelToSnake(categoryData);
      
      const { data, error } = await supabase
        .from('categories')
        .insert(snakeCaseData)
        .select()
        .single();
      
      if (error) throw error;
      
      const newCategory = snakeToCamel(data) as Category;
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
    try {
      const snakeCaseData = camelToSnake(category);
      
      const { data, error } = await supabase
        .from('categories')
        .update(snakeCaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedCategory = snakeToCamel(data) as Category;
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // CRUD operations for clients
  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    try {
      const clientData = await withUserData(client);
      const snakeCaseData = camelToSnake(clientData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert(snakeCaseData)
        .select()
        .single();
      
      if (error) throw error;
      
      const newClient = snakeToCamel(data) as Client;
      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
    try {
      const snakeCaseData = camelToSnake(client);
      
      const { data, error } = await supabase
        .from('clients')
        .update(snakeCaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedClient = snakeToCamel(data) as Client;
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  // CRUD operations for suppliers
  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    try {
      const supplierData = await withUserData(supplier);
      const snakeCaseData = camelToSnake(supplierData);
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert(snakeCaseData)
        .select()
        .single();
      
      if (error) throw error;
      
      const newSupplier = snakeToCamel(data) as Supplier;
      setSuppliers(prev => [newSupplier, ...prev]);
      return newSupplier;
    } catch (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
    try {
      const snakeCaseData = camelToSnake(supplier);
      
      const { data, error } = await supabase
        .from('suppliers')
        .update(snakeCaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedSupplier = snakeToCamel(data) as Supplier;
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
      return updatedSupplier;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  };

  const deleteSupplier = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  };

  // CRUD operations for orders
  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    try {
      // Generate order number
      const { data: counterData, error: counterError } = await supabase
        .rpc('get_next_counter', { counter_id: 'order' });
        
      if (counterError) {
        console.error("Error generating order number:", counterError);
        throw new Error("Erro ao gerar número da encomenda");
      }
      
      const orderNumber = counterData || `ENC-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      const orderData = await withUserData({
        ...order,
        number: orderNumber
      });
      
      const { items, ...orderWithoutItems } = orderData;
      const snakeCaseOrderData = camelToSnake(orderWithoutItems);
      
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(snakeCaseOrderData)
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Insert order items
      const itemsToInsert = items.map((item: OrderItem) => ({
        order_id: orderResult.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        sale_price: item.salePrice,
        discount_percent: item.discountPercent || 0
      }));
      
      const { data: itemsResult, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)
        .select();
      
      if (itemsError) throw itemsError;
      
      const newOrder = {
        ...snakeToCamel(orderResult),
        items: snakeToCamel(itemsResult || [])
      } as Order;
      
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>): Promise<Order> => {
    try {
      const { items, ...orderWithoutItems } = order;
      const snakeCaseData = camelToSnake(orderWithoutItems);
      
      const { data, error } = await supabase
        .from('orders')
        .update(snakeCaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);
        
        // Insert new items
        const itemsToInsert = items.map((item: OrderItem) => ({
          order_id: id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          sale_price: item.salePrice,
          discount_percent: item.discountPercent || 0
        }));
        
        const { data: itemsResult, error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert)
          .select();
        
        if (itemsError) throw itemsError;
      }
      
      const updatedOrder = {
        ...snakeToCamel(data),
        items: items ? snakeToCamel(items) : orders.find(o => o.id === id)?.items || []
      } as Order;
      
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  const convertOrderToStockExit = async (orderId: string): Promise<StockExit> => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');
      
      // Generate stock exit number
      const { data: counterData, error: counterError } = await supabase
        .rpc('get_next_counter', { counter_id: 'exit' });
        
      if (counterError) {
        console.error("Error generating exit number:", counterError);
        throw new Error("Erro ao gerar número da saída");
      }
      
      const exitNumber = counterData || `VEN-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      const stockExitData = await withUserData({
        number: exitNumber,
        clientId: order.clientId,
        clientName: order.clientName || '',
        date: new Date().toISOString(),
        fromOrderId: orderId,
        fromOrderNumber: order.number,
        notes: order.notes,
        discount: order.discount,
        total: order.total
      });
      
      const snakeCaseExitData = camelToSnake(stockExitData);
      
      const { data: exitResult, error: exitError } = await supabase
        .from('stock_exits')
        .insert(snakeCaseExitData)
        .select()
        .single();
      
      if (exitError) throw exitError;
      
      // Insert stock exit items
      const itemsToInsert = order.items.map((item: OrderItem) => ({
        exit_id: exitResult.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        sale_price: item.salePrice,
        discount_percent: item.discountPercent || 0
      }));
      
      const { data: itemsResult, error: itemsError } = await supabase
        .from('stock_exit_items')
        .insert(itemsToInsert)
        .select();
      
      if (itemsError) throw itemsError;
      
      // Update order to mark as converted
      await supabase
        .from('orders')
        .update({
          converted_to_stock_exit_id: exitResult.id,
          converted_to_stock_exit_number: exitNumber
        })
        .eq('id', orderId);
      
      const newStockExit = {
        ...snakeToCamel(exitResult),
        items: snakeToCamel(itemsResult || [])
      } as StockExit;
      
      setStockExits(prev => [newStockExit, ...prev]);
      await fetchOrders(); // Refresh orders to show conversion
      
      return newStockExit;
    } catch (error) {
      console.error('Error converting order to stock exit:', error);
      throw error;
    }
  };

  // CRUD operations for stock entries
  const addStockEntry = async (entry: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockEntry> => {
    try {
      // Generate entry number
      const { data: counterData, error: counterError } = await supabase
        .rpc('get_next_counter', { counter_id: 'entry' });
        
      if (counterError) {
        console.error("Error generating entry number:", counterError);
        throw new Error("Erro ao gerar número da entrada");
      }
      
      const entryNumber = counterData || `COMP-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      const entryData = await withUserData({
        ...entry,
        number: entryNumber
      });
      
      const { items, ...entryWithoutItems } = entryData;
      const snakeCaseEntryData = camelToSnake(entryWithoutItems);
      
      const { data: entryResult, error: entryError } = await supabase
        .from('stock_entries')
        .insert(snakeCaseEntryData)
        .select()
        .single();
      
      if (entryError) throw entryError;
      
      // Insert stock entry items
      const itemsToInsert = items.map((item: StockEntryItem) => ({
        entry_id: entryResult.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        purchase_price: item.purchasePrice,
        discount_percent: item.discountPercent || 0
      }));
      
      const { data: itemsResult, error: itemsError } = await supabase
        .from('stock_entry_items')
        .insert(itemsToInsert)
        .select();
      
      if (itemsError) throw itemsError;
      
      const newStockEntry = {
        ...snakeToCamel(entryResult),
        items: snakeToCamel(itemsResult || [])
      } as StockEntry;
      
      setStockEntries(prev => [newStockEntry, ...prev]);
      return newStockEntry;
    } catch (error) {
      console.error('Error adding stock entry:', error);
      throw error;
    }
  };

  const updateStockEntry = async (id: string, updatedEntry: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Update the main stock entry
      const { data: entryData, error: entryError } = await supabase
        .from('stock_entries')
        .update({
          supplier_id: updatedEntry.supplierId,
          supplier_name: updatedEntry.supplierName,
          date: updatedEntry.date,
          invoice_number: updatedEntry.invoiceNumber,
          notes: updatedEntry.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (entryError) {
        console.error('Error updating stock entry:', entryError);
        throw entryError;
      }

      // Delete existing items for this entry
      const { error: deleteError } = await supabase
        .from('stock_entry_items')
        .delete()
        .eq('entry_id', id);

      if (deleteError) {
        console.error('Error deleting existing items:', deleteError);
        throw deleteError;
      }

      // Insert new items
      const itemsToInsert = updatedEntry.items.map(item => ({
        entry_id: id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        purchase_price: item.purchasePrice,
        discount_percent: item.discountPercent || 0
      }));

      const { error: itemsError } = await supabase
        .from('stock_entry_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error inserting updated items:', itemsError);
        throw itemsError;
      }

      // Refresh stock entries data
      await fetchStockEntries();
      
      return { ...entryData, items: updatedEntry.items };
    } catch (error) {
      console.error('Error in updateStockEntry:', error);
      throw error;
    }
  };

  const deleteStockEntry = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('stock_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStockEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting stock entry:', error);
      throw error;
    }
  };

  // CRUD operations for stock exits
  const addStockExit = async (exit: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockExit> => {
    try {
      // Generate exit number
      const { data: counterData, error: counterError } = await supabase
        .rpc('get_next_counter', { counter_id: 'exit' });
        
      if (counterError) {
        console.error("Error generating exit number:", counterError);
        throw new Error("Erro ao gerar número da saída");
      }
      
      const exitNumber = counterData || `VEN-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      const exitData = await withUserData({
        ...exit,
        number: exitNumber
      });
      
      const { items, ...exitWithoutItems } = exitData;
      const snakeCaseExitData = camelToSnake(exitWithoutItems);
      
      const { data: exitResult, error: exitError } = await supabase
        .from('stock_exits')
        .insert(snakeCaseExitData)
        .select()
        .single();
      
      if (exitError) throw exitError;
      
      // Insert stock exit items
      const itemsToInsert = items.map((item: StockExitItem) => ({
        exit_id: exitResult.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        sale_price: item.salePrice,
        discount_percent: item.discountPercent || 0
      }));
      
      const { data: itemsResult, error: itemsError } = await supabase
        .from('stock_exit_items')
        .insert(itemsToInsert)
        .select();
      
      if (itemsError) throw itemsError;
      
      const newStockExit = {
        ...snakeToCamel(exitResult),
        items: snakeToCamel(itemsResult || [])
      } as StockExit;
      
      setStockExits(prev => [newStockExit, ...prev]);
      return newStockExit;
    } catch (error) {
      console.error('Error adding stock exit:', error);
      throw error;
    }
  };

  const updateStockExit = async (id: string, exit: Partial<StockExit>): Promise<StockExit> => {
    try {
      const { items, ...exitWithoutItems } = exit;
      const snakeCaseData = camelToSnake(exitWithoutItems);
      
      const { data, error } = await supabase
        .from('stock_exits')
        .update(snakeCaseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('stock_exit_items')
          .delete()
          .eq('exit_id', id);
        
        // Insert new items
        const itemsToInsert = items.map((item: StockExitItem) => ({
          exit_id: id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          sale_price: item.salePrice,
          discount_percent: item.discountPercent || 0
        }));
        
        const { data: itemsResult, error: itemsError } = await supabase
          .from('stock_exit_items')
          .insert(itemsToInsert)
          .select();
        
        if (itemsError) throw itemsError;
      }
      
      const updatedStockExit = {
        ...snakeToCamel(data),
        items: items ? snakeToCamel(items) : stockExits.find(e => e.id === id)?.items || []
      } as StockExit;
      
      setStockExits(prev => prev.map(e => e.id === id ? updatedStockExit : e));
      return updatedStockExit;
    } catch (error) {
      console.error('Error updating stock exit:', error);
      throw error;
    }
  };

  const deleteStockExit = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('stock_exits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStockExits(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting stock exit:', error);
      throw error;
    }
  };

  // Data management functions
  const refreshData = async () => {
    setIsLoading(true);
    try {
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
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (type: ExportDataType) => {
    let dataToExport;
    let filename;
    
    switch (type) {
      case 'products':
        dataToExport = products;
        filename = 'produtos.json';
        break;
      case 'categories':
        dataToExport = categories;
        filename = 'categorias.json';
        break;
      case 'clients':
        dataToExport = clients;
        filename = 'clientes.json';
        break;
      case 'suppliers':
        dataToExport = suppliers;
        filename = 'fornecedores.json';
        break;
      case 'orders':
        dataToExport = orders;
        filename = 'encomendas.json';
        break;
      case 'stockEntries':
        dataToExport = stockEntries;
        filename = 'entradas.json';
        break;
      case 'stockExits':
        dataToExport = stockExits;
        filename = 'saidas.json';
        break;
      case 'all':
        dataToExport = {
          products,
          categories,
          clients,
          suppliers,
          orders,
          stockEntries,
          stockExits
        };
        filename = 'todos_dados.json';
        break;
      default:
        return;
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sucesso",
      description: `Dados exportados para ${filename}`
    });
  };

  const importData = async (type: ExportDataType, jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      switch (type) {
        case 'products':
          if (Array.isArray(data)) {
            for (const item of data) {
              const { id, createdAt, updatedAt, ...productData } = item;
              await addProduct(productData);
            }
          }
          break;
        case 'categories':
          if (Array.isArray(data)) {
            for (const item of data) {
              const { id, createdAt, updatedAt, ...categoryData } = item;
              await addCategory(categoryData);
            }
          }
          break;
        case 'clients':
          if (Array.isArray(data)) {
            for (const item of data) {
              const { id, createdAt, updatedAt, ...clientData } = item;
              await addClient(clientData);
            }
          }
          break;
        case 'suppliers':
          if (Array.isArray(data)) {
            for (const item of data) {
              const { id, createdAt, updatedAt, ...supplierData } = item;
              await addSupplier(supplierData);
            }
          }
          break;
        case 'all':
          if (data.products) await importData('products', JSON.stringify(data.products));
          if (data.categories) await importData('categories', JSON.stringify(data.categories));
          if (data.clients) await importData('clients', JSON.stringify(data.clients));
          if (data.suppliers) await importData('suppliers', JSON.stringify(data.suppliers));
          break;
      }
      
      toast({
        title: "Sucesso",
        description: "Dados importados com sucesso"
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Erro",
        description: "Erro ao importar dados",
        variant: "destructive"
      });
    }
  };

  const updateData = (type: string, data: any[]) => {
    switch (type) {
      case 'products':
        setProducts(data);
        break;
      case 'categories':
        setCategories(data);
        break;
      case 'clients':
        setClients(data);
        break;
      case 'suppliers':
        setSuppliers(data);
        break;
      case 'orders':
        setOrders(data);
        break;
      case 'stockEntries':
        setStockEntries(data);
        break;
      case 'stockExits':
        setStockExits(data);
        break;
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    products,
    categories,
    clients,
    suppliers,
    orders,
    stockEntries,
    stockExits,
    isLoading,
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
    convertOrderToStockExit,
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    addStockExit,
    updateStockExit,
    deleteStockExit,
    refreshData,
    exportData,
    importData,
    updateData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
