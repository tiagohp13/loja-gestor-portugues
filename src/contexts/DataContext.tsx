
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import * as mockData from '../data/mockData';
import { supabase, snakeToCamel } from '@/integrations/supabase/client';
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
  
  setStockEntries: (entries: StockEntry[]) => void;
  
  isLoading: boolean;
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

// Helper functions to convert between our app data format and Supabase data format
const mapProductFromSupabase = (item: any): Product => ({
  id: item.id,
  code: item.code,
  name: item.name,
  description: item.description || '',
  category: item.category || '',
  purchasePrice: item.purchase_price,
  salePrice: item.sale_price,
  currentStock: item.current_stock,
  minStock: item.min_stock,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  image: item.image,
  status: item.status
});

const mapCategoryFromSupabase = (item: any): Category => ({
  id: item.id,
  name: item.name,
  description: item.description || '',
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  status: item.status,
  productCount: item.product_count
});

const mapClientFromSupabase = (item: any): Client => ({
  id: item.id,
  name: item.name,
  email: item.email || '',
  phone: item.phone || '',
  address: item.address || '',
  taxId: item.tax_id || '',
  notes: item.notes || '',
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  status: item.status
});

const mapSupplierFromSupabase = (item: any): Supplier => ({
  id: item.id,
  name: item.name,
  email: item.email || '',
  phone: item.phone || '',
  address: item.address || '',
  taxId: item.tax_id || '',
  paymentTerms: item.payment_terms || '',
  notes: item.notes || '',
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  status: item.status
});

const mapOrderFromSupabase = async (item: any): Promise<Order> => {
  // Fetch order items
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', item.id);
  
  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    throw itemsError;
  }
  
  const orderItems: OrderItem[] = itemsData.map(itemData => ({
    productId: itemData.product_id,
    productName: itemData.product_name,
    quantity: itemData.quantity,
    salePrice: itemData.sale_price,
    discountPercent: itemData.discount_percent
  }));
  
  return {
    id: item.id,
    number: item.number,
    clientId: item.client_id,
    clientName: item.client_name,
    items: orderItems,
    date: item.date,
    notes: item.notes,
    convertedToStockExitId: item.converted_to_stock_exit_id,
    convertedToStockExitNumber: item.converted_to_stock_exit_number,
    discount: item.discount
  };
};

const mapStockEntryFromSupabase = async (item: any): Promise<StockEntry> => {
  // Fetch stock entry items
  const { data: itemsData, error: itemsError } = await supabase
    .from('stock_entry_items')
    .select('*')
    .eq('entry_id', item.id);
  
  if (itemsError) {
    console.error('Error fetching stock entry items:', itemsError);
    throw itemsError;
  }
  
  const entryItems: StockEntryItem[] = itemsData.map(itemData => ({
    productId: itemData.product_id,
    productName: itemData.product_name,
    quantity: itemData.quantity,
    purchasePrice: itemData.purchase_price,
    discountPercent: itemData.discount_percent
  }));
  
  return {
    id: item.id,
    number: item.number,
    supplierId: item.supplier_id,
    supplierName: item.supplier_name,
    items: entryItems,
    date: item.date,
    invoiceNumber: item.invoice_number,
    notes: item.notes,
    createdAt: item.created_at
  };
};

const mapStockExitFromSupabase = async (item: any): Promise<StockExit> => {
  // Fetch stock exit items
  const { data: itemsData, error: itemsError } = await supabase
    .from('stock_exit_items')
    .select('*')
    .eq('exit_id', item.id);
  
  if (itemsError) {
    console.error('Error fetching stock exit items:', itemsError);
    throw itemsError;
  }
  
  const exitItems: StockExitItem[] = itemsData.map(itemData => ({
    productId: itemData.product_id,
    productName: itemData.product_name,
    quantity: itemData.quantity,
    salePrice: itemData.sale_price,
    discountPercent: itemData.discount_percent
  }));
  
  return {
    id: item.id,
    number: item.number,
    clientId: item.client_id,
    clientName: item.client_name,
    items: exitItems,
    date: item.date,
    invoiceNumber: item.invoice_number,
    notes: item.notes,
    createdAt: item.created_at,
    fromOrderId: item.from_order_id,
    fromOrderNumber: item.from_order_number,
    discount: item.discount
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data from Supabase when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
        
        if (productsError) throw productsError;
        setProducts(productsData.map(mapProductFromSupabase));
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData.map(mapCategoryFromSupabase));
        
        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*');
        
        if (clientsError) throw clientsError;
        setClients(clientsData.map(mapClientFromSupabase));
        
        // Fetch suppliers
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('*');
        
        if (suppliersError) throw suppliersError;
        setSuppliers(suppliersData.map(mapSupplierFromSupabase));
        
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*');
        
        if (ordersError) throw ordersError;
        const mappedOrders = await Promise.all(ordersData.map(mapOrderFromSupabase));
        setOrders(mappedOrders);
        
        // Fetch stock entries
        const { data: entriesData, error: entriesError } = await supabase
          .from('stock_entries')
          .select('*');
        
        if (entriesError) throw entriesError;
        const mappedEntries = await Promise.all(entriesData.map(mapStockEntryFromSupabase));
        setStockEntries(mappedEntries);
        
        // Fetch stock exits
        const { data: exitsData, error: exitsError } = await supabase
          .from('stock_exits')
          .select('*');
        
        if (exitsError) throw exitsError;
        const mappedExits = await Promise.all(exitsData.map(mapStockExitFromSupabase));
        setStockExits(mappedExits);
        
        // If no data is found, initialize with mock data
        if (productsData.length === 0) {
          console.log('No products in database, initializing with mock data');
          
          // Initialize products
          for (const product of mockData.products) {
            const { data, error } = await supabase
              .from('products')
              .insert([{
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
              }]);
            
            if (error) console.error('Error inserting product:', error);
          }
          
          // Initialize categories
          for (const category of mockData.categories) {
            const { data, error } = await supabase
              .from('categories')
              .insert([{
                name: category.name,
                description: category.description,
                status: category.status,
                product_count: category.productCount
              }]);
            
            if (error) console.error('Error inserting category:', error);
          }
          
          // Initialize clients
          for (const client of mockData.clients) {
            const { data, error } = await supabase
              .from('clients')
              .insert([{
                name: client.name,
                email: client.email,
                phone: client.phone,
                address: client.address,
                tax_id: client.taxId,
                notes: client.notes,
                status: client.status
              }]);
            
            if (error) console.error('Error inserting client:', error);
          }
          
          // Initialize suppliers
          for (const supplier of mockData.suppliers) {
            const { data, error } = await supabase
              .from('suppliers')
              .insert([{
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                tax_id: supplier.taxId,
                payment_terms: supplier.paymentTerms,
                notes: supplier.notes,
                status: supplier.status
              }]);
            
            if (error) console.error('Error inserting supplier:', error);
          }
          
          // Fetch again to get the updated data
          await fetchData();
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        toast.error('Erro ao carregar dados. Usando dados locais temporariamente.');
        
        // Fallback to mock data if there's an error
        setProducts(mockData.products as Product[]);
        setCategories(mockData.categories as Category[]);
        setClients(mockData.clients as Client[]);
        setSuppliers(mockData.suppliers as Supplier[]);
        setStockEntries(convertOldStockEntriesToNew(mockData.stockEntries as any[]));
        setStockExits(convertOldStockExitsToNew(mockData.stockExits as any[], mockData.orders as any[] || []));
        setOrders(convertOldOrdersToNew(mockData.orders || [], mockData.stockExits as any[]));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const codeExists = products.some(p => p.code.toLowerCase() === product.code.toLowerCase());
    if (codeExists) {
      toast.error(`O código de produto "${product.code}" já existe. Use um código único.`);
      throw new Error(`Product code "${product.code}" already exists. Use a unique code.`);
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
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
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newProduct = mapProductFromSupabase(data);
      setProducts([...products, newProduct]);
      toast.success('Produto adicionado com sucesso!');
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erro ao adicionar produto');
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    if (product.code) {
      const codeExists = products.some(p => p.code.toLowerCase() === product.code?.toLowerCase() && p.id !== id);
      if (codeExists) {
        toast.error(`O código de produto "${product.code}" já existe. Use um código único.`);
        throw new Error(`Product code "${product.code}" already exists. Use a unique code.`);
      }
    }
    
    try {
      const updateData: any = {};
      if (product.code) updateData.code = product.code;
      if (product.name) updateData.name = product.name;
      if (product.description !== undefined) updateData.description = product.description;
      if (product.category !== undefined) updateData.category = product.category;
      if (product.purchasePrice !== undefined) updateData.purchase_price = product.purchasePrice;
      if (product.salePrice !== undefined) updateData.sale_price = product.salePrice;
      if (product.currentStock !== undefined) updateData.current_stock = product.currentStock;
      if (product.minStock !== undefined) updateData.min_stock = product.minStock;
      if (product.image !== undefined) updateData.image = product.image;
      if (product.status !== undefined) updateData.status = product.status;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedProduct = mapProductFromSupabase(data);
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      toast.success('Produto atualizado com sucesso!');
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
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
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          description: category.description,
          status: category.status,
          product_count: category.productCount || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newCategory = mapCategoryFromSupabase(data);
      setCategories([...categories, newCategory]);
      toast.success('Categoria adicionada com sucesso!');
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erro ao adicionar categoria');
      throw error;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const updateData: any = {};
      if (category.name) updateData.name = category.name;
      if (category.description !== undefined) updateData.description = category.description;
      if (category.status !== undefined) updateData.status = category.status;
      if (category.productCount !== undefined) updateData.product_count = category.productCount;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedCategory = mapCategoryFromSupabase(data);
      setCategories(categories.map(c => c.id === id ? updatedCategory : c));
      toast.success('Categoria atualizada com sucesso!');
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    const usedInProducts = products.some(product => product.category === id);
    
    if (usedInProducts) {
      toast.error('Não é possível excluir uma categoria que está em uso.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
      throw error;
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          tax_id: client.taxId,
          notes: client.notes,
          status: client.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newClient = mapClientFromSupabase(data);
      setClients([...clients, newClient]);
      toast.success('Cliente adicionado com sucesso!');
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Erro ao adicionar cliente');
      throw error;
    }
  };

  const updateClient = async (id: string, client: Partial<Client>) => {
    try {
      const updateData: any = {};
      if (client.name) updateData.name = client.name;
      if (client.email !== undefined) updateData.email = client.email;
      if (client.phone !== undefined) updateData.phone = client.phone;
      if (client.address !== undefined) updateData.address = client.address;
      if (client.taxId !== undefined) updateData.tax_id = client.taxId;
      if (client.notes !== undefined) updateData.notes = client.notes;
      if (client.status !== undefined) updateData.status = client.status;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedClient = mapClientFromSupabase(data);
      setClients(clients.map(c => c.id === id ? updatedClient : c));
      toast.success('Cliente atualizado com sucesso!');
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erro ao atualizar cliente');
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    const usedInExit = stockExits.some(exit => exit.clientId === id);
    const usedInOrder = orders.some(order => order.clientId === id);
    
    if (usedInExit || usedInOrder) {
      toast.error('Não é possível excluir um cliente que possui movimentações.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setClients(clients.filter(c => c.id !== id));
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erro ao excluir cliente');
      throw error;
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          tax_id: supplier.taxId,
          payment_terms: supplier.paymentTerms,
          notes: supplier.notes,
          status: supplier.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newSupplier = mapSupplierFromSupabase(data);
      setSuppliers([...suppliers, newSupplier]);
      toast.success('Fornecedor adicionado com sucesso!');
      return newSupplier;
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Erro ao adicionar fornecedor');
      throw error;
    }
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    try {
      const updateData: any = {};
      if (supplier.name) updateData.name = supplier.name;
      if (supplier.email !== undefined) updateData.email = supplier.email;
      if (supplier.phone !== undefined) updateData.phone = supplier.phone;
      if (supplier.address !== undefined) updateData.address = supplier.address;
      if (supplier.taxId !== undefined) updateData.tax_id = supplier.taxId;
      if (supplier.paymentTerms !== undefined) updateData.payment_terms = supplier.paymentTerms;
      if (supplier.notes !== undefined) updateData.notes = supplier.notes;
      if (supplier.status !== undefined) updateData.status = supplier.status;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedSupplier = mapSupplierFromSupabase(data);
      setSuppliers(suppliers.map(s => s.id === id ? updatedSupplier : s));
      toast.success('Fornecedor atualizado com sucesso!');
      return updatedSupplier;
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Erro ao atualizar fornecedor');
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    const usedInEntry = stockEntries.some(entry => entry.supplierId === id);
    
    if (usedInEntry) {
      toast.error('Não é possível excluir um fornecedor que possui movimentações.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast.success('Fornecedor excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Erro ao excluir fornecedor');
      throw error;
    }
  };

  const addStockEntry = async (entry: Omit<StockEntry, 'id' | 'createdAt' | 'number'>) => {
    try {
      const newEntryNumber = await getNextEntryNumber();
      
      // Insert the stock entry first
      const { data: entryData, error: entryError } = await supabase
        .from('stock_entries')
        .insert([{
          number: newEntryNumber,
          supplier_id: entry.supplierId,
          supplier_name: entry.supplierName,
          date: entry.date,
          invoice_number: entry.invoiceNumber,
          notes: entry.notes
        }])
        .select()
        .single();
      
      if (entryError) throw entryError;
      
      // Then insert the entry items
      for (const item of entry.items) {
        const { error: itemError } = await supabase
          .from('stock_entry_items')
          .insert([{
            entry_id: entryData.id,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            purchase_price: item.purchasePrice,
            discount_percent: item.discountPercent
          }]);
        
        if (itemError) throw itemError;
        
        // Update product stock
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            current_stock: supabase.rpc('increment', { inc: item.quantity }),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.productId);
        
        if (updateError) throw updateError;
        
        // Update local product data
        setProducts(products.map(product => 
          product.id === item.productId 
            ? { ...product, currentStock: product.currentStock + item.quantity }
            : product
        ));
      }
      
      // Fetch the complete entry with items
      const newEntry = await mapStockEntryFromSupabase(entryData);
      setStockEntries([...stockEntries, newEntry]);
      toast.success('Entrada de stock registada com sucesso!');
      return newEntry;
    } catch (error) {
      console.error('Error adding stock entry:', error);
      toast.error('Erro ao adicionar entrada de stock');
      throw error;
    }
  };

  const updateStockEntry = async (id: string, entry: Partial<StockEntry>) => {
    try {
      const oldEntry = stockEntries.find(e => e.id === id);
      
      if (!oldEntry) {
        toast.error('Entrada não encontrada.');
        return;
      }
      
      // Update the entry first
      const updateData: any = {};
      if (entry.supplierName !== undefined) updateData.supplier_name = entry.supplierName;
      if (entry.supplierId !== undefined) updateData.supplier_id = entry.supplierId;
      if (entry.date !== undefined) updateData.date = entry.date;
      if (entry.invoiceNumber !== undefined) updateData.invoice_number = entry.invoiceNumber;
      if (entry.notes !== undefined) updateData.notes = entry.notes;
      
      updateData.updated_at = new Date().toISOString();
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('stock_entries')
          .update(updateData)
          .eq('id', id);
        
        if (updateError) throw updateError;
      }
      
      // Update items if provided
      if (entry.items) {
        // Revert old item quantities
        for (const oldItem of oldEntry.items) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              current_stock: supabase.rpc('decrement', { dec: oldItem.quantity }),
              updated_at: new Date().toISOString()
            })
            .eq('id', oldItem.productId);
          
          if (stockError) throw stockError;
          
          // Update local product data
          setProducts(products.map(product => 
            product.id === oldItem.productId 
              ? { ...product, currentStock: product.currentStock - oldItem.quantity }
              : product
          ));
        }
        
        // Delete old items
        const { error: deleteError } = await supabase
          .from('stock_entry_items')
          .delete()
          .eq('entry_id', id);
        
        if (deleteError) throw deleteError;
        
        // Insert new items
        for (const item of entry.items) {
          const { error: insertError } = await supabase
            .from('stock_entry_items')
            .insert([{
              entry_id: id,
              product_id: item.productId,
              product_name: item.productName,
              quantity: item.quantity,
              purchase_price: item.purchasePrice,
              discount_percent: item.discountPercent
            }]);
          
          if (insertError) throw insertError;
          
          // Update product stock
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              current_stock: supabase.rpc('increment', { inc: item.quantity }),
              updated_at: new Date().toISOString()
            })
            .eq('id', item.productId);
          
          if (stockError) throw stockError;
          
          // Update local product data
          setProducts(products.map(product => 
            product.id === item.productId 
              ? { ...product, currentStock: product.currentStock + item.quantity }
              : product
          ));
        }
      }
      
      // Fetch the updated entry with items
      const { data: updatedEntryData, error: fetchError } = await supabase
        .from('stock_entries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const updatedEntry = await mapStockEntryFromSupabase(updatedEntryData);
      setStockEntries(stockEntries.map(e => e.id === id ? updatedEntry : e));
      toast.success('Entrada de stock atualizada com sucesso!');
      return updatedEntry;
    } catch (error) {
      console.error('Error updating stock entry:', error);
      toast.error('Erro ao atualizar entrada de stock');
      throw error;
    }
  };

  const deleteStockEntry = async (id: string) => {
    try {
      const entry = stockEntries.find(e => e.id === id);
      
      if (!entry) {
        toast.error('Entrada não encontrada.');
        return;
      }
      
      let canDelete = true;
      
      // Check if deleting would result in negative stock
      for (const item of entry.items) {
        const product = products.find(p => p.id === item.productId);
        if (product && product.currentStock < item.quantity) {
          canDelete = false;
          break;
        }
      }
      
      if (!canDelete) {
        toast.error('Não é possível excluir esta entrada. O stock ficaria negativo.');
        return;
      }
      
      // Update product stock quantities
      for (const item of entry.items) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            current_stock: supabase.rpc('decrement', { dec: item.quantity }),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.productId);
        
        if (stockError) throw stockError;
        
        // Update local product data
        setProducts(products.map(p => 
          p.id === item.productId 
            ? { ...p, currentStock: p.currentStock - item.quantity }
            : p
        ));
      }
      
      // Delete the entry items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('stock_entry_items')
        .delete()
        .eq('entry_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete the entry itself
      const { error: entryError } = await supabase
        .from('stock_entries')
        .delete()
        .eq('id', id);
      
      if (entryError) throw entryError;
      
      setStockEntries(stockEntries.filter(e => e.id !== id));
      toast.success('Entrada de stock excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting stock entry:', error);
      toast.error('Erro ao excluir entrada de stock');
      throw error;
    }
  };

  const addStockExit = async (exit: Omit<StockExit, 'id' | 'createdAt' | 'number'>) => {
    try {
      let hasEnoughStock = true;
      
      // Check stock availability
      for (const item of exit.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.currentStock < item.quantity) {
          hasEnoughStock = false;
          toast.error(`Stock insuficiente para ${item.productName}. Disponível: ${product?.currentStock || 0} unidades.`);
        }
      }
      
      if (!hasEnoughStock) return;
      
      const newExitNumber = await getNextExitNumber();
      
      // Insert the stock exit first
      const { data: exitData, error: exitError } = await supabase
        .from('stock_exits')
        .insert([{
          number: newExitNumber,
          client_id: exit.clientId,
          client_name: exit.clientName,
          date: exit.date,
          invoice_number: exit.invoiceNumber,
          notes: exit.notes,
          from_order_id: exit.fromOrderId,
          from_order_number: exit.fromOrderNumber,
          discount: exit.discount
        }])
        .select()
        .single();
      
      if (exitError) throw exitError;
      
      // Then insert the exit items
      for (const item of exit.items) {
        const { error: itemError } = await supabase
          .from('stock_exit_items')
          .insert([{
            exit_id: exitData.id,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            sale_price: item.salePrice,
            discount_percent: item.discountPercent
          }]);
        
        if (itemError) throw itemError;
        
        // Update product stock
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            current_stock: supabase.rpc('decrement', { dec: item.quantity }),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.productId);
        
        if (updateError) throw updateError;
        
        // Update local product data
        setProducts(products.map(product => 
          product.id === item.productId 
            ? { ...product, currentStock: product.currentStock - item.quantity }
            : product
        ));
      }
      
      // If this exit is from an order, update the order
      if (exit.fromOrderId) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            converted_to_stock_exit_id: exitData.id,
            converted_to_stock_exit_number: newExitNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', exit.fromOrderId);
        
        if (orderError) throw orderError;
        
        // Update local order data
        setOrders(orders.map(order => 
          order.id === exit.fromOrderId 
            ? { 
                ...order, 
                convertedToStockExitId: exitData.id,
                convertedToStockExitNumber: newExitNumber 
              }
            : order
        ));
      }
      
      // Fetch the complete exit with items
      const newExit = await mapStockExitFromSupabase(exitData);
      setStockExits([...stockExits, newExit]);
      toast.success('Saída de stock registada com sucesso!');
      return newExit;
    } catch (error) {
      console.error('Error adding stock exit:', error);
      toast.error('Erro ao adicionar saída de stock');
      throw error;
    }
  };

  const updateStockExit = async (id: string, exit: Partial<StockExit>) => {
    try {
      const oldExit = stockExits.find(e => e.id === id);
      
      if (!oldExit) {
        toast.error('Saída não encontrada.');
        return;
      }
      
      // Update the exit first
      const updateData: any = {};
      if (exit.clientName !== undefined) updateData.client_name = exit.clientName;
      if (exit.clientId !== undefined) updateData.client_id = exit.clientId;
      if (exit.date !== undefined) updateData.date = exit.date;
      if (exit.invoiceNumber !== undefined) updateData.invoice_number = exit.invoiceNumber;
      if (exit.notes !== undefined) updateData.notes = exit.notes;
      if (exit.discount !== undefined) updateData.discount = exit.discount;
      
      updateData.updated_at = new Date().toISOString();
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('stock_exits')
          .update(updateData)
          .eq('id', id);
        
        if (updateError) throw updateError;
      }
      
      // Update items if provided
      if (exit.items) {
        // Revert old item quantities
        for (const oldItem of oldExit.items) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              current_stock: supabase.rpc('increment', { inc: oldItem.quantity }),
              updated_at: new Date().toISOString()
            })
            .eq('id', oldItem.productId);
          
          if (stockError) throw stockError;
          
          // Update local product data
          setProducts(products.map(product => 
            product.id === oldItem.productId 
              ? { ...product, currentStock: product.currentStock + oldItem.quantity }
              : product
          ));
        }
        
        // Check if we have enough stock for the new items
        let hasEnoughStock = true;
        
        for (const newItem of exit.items) {
          const product = products.find(p => p.id === newItem.productId);
          const oldItemIndex = oldExit.items.findIndex(item => item.productId === newItem.productId);
          const oldQuantity = oldItemIndex >= 0 ? oldExit.items[oldItemIndex].quantity : 0;
          
          const adjustedCurrentStock = product ? product.currentStock + oldQuantity : 0;
          
          if (!product || adjustedCurrentStock < newItem.quantity) {
            hasEnoughStock = false;
            toast.error(`Stock insuficiente para ${newItem.productName}. Disponível: ${adjustedCurrentStock} unidades.`);
          }
        }
        
        if (!hasEnoughStock) return;
        
        // Delete old items
        const { error: deleteError } = await supabase
          .from('stock_exit_items')
          .delete()
          .eq('exit_id', id);
        
        if (deleteError) throw deleteError;
        
        // Insert new items
        for (const item of exit.items) {
          const { error: insertError } = await supabase
            .from('stock_exit_items')
            .insert([{
              exit_id: id,
              product_id: item.productId,
              product_name: item.productName,
              quantity: item.quantity,
              sale_price: item.salePrice,
              discount_percent: item.discountPercent
            }]);
          
          if (insertError) throw insertError;
          
          // Update product stock
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              current_stock: supabase.rpc('decrement', { dec: item.quantity }),
              updated_at: new Date().toISOString()
            })
            .eq('id', item.productId);
          
          if (stockError) throw stockError;
          
          // Update local product data
          setProducts(products.map(product => 
            product.id === item.productId 
              ? { ...product, currentStock: product.currentStock - item.quantity }
              : product
          ));
        }
      }
      
      // Fetch the updated exit with items
      const { data: updatedExitData, error: fetchError } = await supabase
        .from('stock_exits')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const updatedExit = await mapStockExitFromSupabase(updatedExitData);
      setStockExits(stockExits.map(e => e.id === id ? updatedExit : e));
      toast.success('Saída de stock atualizada com sucesso!');
      return updatedExit;
    } catch (error) {
      console.error('Error updating stock exit:', error);
      toast.error('Erro ao atualizar saída de stock');
      throw error;
    }
  };

  const deleteStockExit = async (id: string) => {
    try {
      const exit = stockExits.find(e => e.id === id);
      
      if (!exit) {
        toast.error('Saída não encontrada.');
        return;
      }
      
      // If this exit is from an order, update the order
      if (exit.fromOrderId) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            converted_to_stock_exit_id: null,
            converted_to_stock_exit_number: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', exit.fromOrderId);
        
        if (orderError) throw orderError;
        
        // Update local order data
        setOrders(orders.map(order => 
          order.id === exit.fromOrderId 
            ? { ...order, convertedToStockExitId: undefined, convertedToStockExitNumber: undefined }
            : order
        ));
      }
      
      // Update product stock quantities
      for (const item of exit.items) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            current_stock: supabase.rpc('increment', { inc: item.quantity }),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.productId);
        
        if (stockError) throw stockError;
        
        // Update local product data
        setProducts(products.map(p => 
          p.id === item.productId 
            ? { ...p, currentStock: p.currentStock + item.quantity }
            : p
        ));
      }
      
      // Delete the exit items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('stock_exit_items')
        .delete()
        .eq('exit_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete the exit itself
      const { error: exitError } = await supabase
        .from('stock_exits')
        .delete()
        .eq('id', id);
      
      if (exitError) throw exitError;
      
      setStockExits(stockExits.filter(e => e.id !== id));
      toast.success('Saída de stock excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting stock exit:', error);
      toast.error('Erro ao excluir saída de stock');
      throw error;
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'number'>) => {
    try {
      const newOrderNumber = await getNextOrderNumber();
      
      // Insert the order first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          number: newOrderNumber,
          client_id: order.clientId,
          client_name: order.clientName,
          date: order.date,
          notes: order.notes,
          discount: order.discount
        }])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Then insert the order items
      for (const item of order.items) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert([{
            order_id: orderData.id,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            sale_price: item.salePrice,
            discount_percent: item.discountPercent
          }]);
        
        if (itemError) throw itemError;
      }
      
      // Fetch the complete order with items
      const newOrder = await mapOrderFromSupabase(orderData);
      setOrders([...orders, newOrder]);
      toast.success('Encomenda registada com sucesso!');
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Erro ao adicionar encomenda');
      throw error;
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      const existingOrder = orders.find(o => o.id === id);
      
      if (!existingOrder) {
        toast.error('Encomenda não encontrada.');
        return;
      }
      
      if (existingOrder.convertedToStockExitId) {
        toast.error('Não é possível editar uma encomenda já convertida em saída de stock.');
        return;
      }
      
      // Update the order first
      const updateData: any = {};
      if (order.clientName !== undefined) updateData.client_name = order.clientName;
      if (order.clientId !== undefined) updateData.client_id = order.clientId;
      if (order.date !== undefined) updateData.date = order.date;
      if (order.notes !== undefined) updateData.notes = order.notes;
      if (order.discount !== undefined) updateData.discount = order.discount;
      
      updateData.updated_at = new Date().toISOString();
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', id);
        
        if (updateError) throw updateError;
      }
      
      // Update items if provided
      if (order.items) {
        // Delete old items
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);
        
        if (deleteError) throw deleteError;
        
        // Insert new items
        for (const item of order.items) {
          const { error: insertError } = await supabase
            .from('order_items')
            .insert([{
              order_id: id,
              product_id: item.productId,
              product_name: item.productName,
              quantity: item.quantity,
              sale_price: item.salePrice,
              discount_percent: item.discountPercent
            }]);
          
          if (insertError) throw insertError;
        }
      }
      
      // Fetch the updated order with items
      const { data: updatedOrderData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const updatedOrder = await mapOrderFromSupabase(updatedOrderData);
      setOrders(orders.map(o => o.id === id ? updatedOrder : o));
      toast.success('Encomenda atualizada com sucesso!');
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar encomenda');
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const existingOrder = orders.find(o => o.id === id);
      
      if (!existingOrder) {
        toast.error('Encomenda não encontrada.');
        return;
      }
      
      if (existingOrder.convertedToStockExitId) {
        toast.error('Não é possível excluir uma encomenda já convertida em saída de stock.');
        return;
      }
      
      // Delete the order items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete the order itself
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (orderError) throw orderError;
      
      setOrders(orders.filter(o => o.id !== id));
      toast.success('Encomenda excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir encomenda');
      throw error;
    }
  };

  const convertOrderToStockExit = async (orderId: string) => {
    try {
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
      
      // Check stock availability
      for (const item of order.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.currentStock < item.quantity) {
          hasEnoughStock = false;
          toast.error(`Stock insuficiente para ${item.productName}. Disponível: ${product?.currentStock || 0} unidades.`);
        }
      }
      
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
          salePrice: item.salePrice,
          discountPercent: item.discountPercent
        })),
        date: new Date().toISOString().split('T')[0],
        fromOrderId: order.id,
        fromOrderNumber: order.number,
        discount: order.discount
      };
      
      await addStockExit(stockExit);
      
      return 'success';
    } catch (error) {
      console.error('Error converting order to stock exit:', error);
      throw error;
    }
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
      
      if (!clientPurchases[exit.clientId || '']) {
        const client = clients.find(c => c.id === exit.clientId);
        clientPurchases[exit.clientId || ''] = {
          clientId: exit.clientId || '',
          name: client?.name || exit.clientName,
          purchaseCount: 0,
          totalSpent: 0,
          lastPurchaseDate: ''
        };
      }
      
      const exitTotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      clientPurchases[exit.clientId || ''].purchaseCount++;
      clientPurchases[exit.clientId || ''].totalSpent += exitTotal;
      
      if (!clientPurchases[exit.clientId || ''].lastPurchaseDate || 
          new Date(exit.date) > new Date(clientPurchases[exit.clientId || ''].lastPurchaseDate)) {
        clientPurchases[exit.clientId || ''].lastPurchaseDate = exit.date;
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
      
      getBusinessAnalytics,
      
      setStockEntries,
      
      isLoading
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
