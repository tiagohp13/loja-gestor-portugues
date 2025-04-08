import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product, Category, Client, Supplier, Order, OrderItem, StockEntry, StockEntryItem, StockExit, StockExitItem } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface DataContextType {
  products: Product[];
  categories: Category[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getProductHistory: (id: string) => { entries: StockEntry[], exits: StockExit[] };
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => Category | undefined;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  getClientHistory: (id: string) => { orders: Order[], stockExits: StockExit[] };
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;
  getSupplierHistory: (id: string) => { entries: StockEntry[] };
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderNumber'>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  findOrder: (id: string) => Order | undefined;
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'entryNumber'>) => Promise<StockEntry>;
  updateStockEntry: (id: string, updates: Partial<StockEntry>) => void;
  deleteStockEntry: (id: string) => void;
  addStockExit: (exit: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'exitNumber'>) => Promise<StockExit>;
  updateStockExit: (id: string, updates: Partial<StockExit>) => void;
  deleteStockExit: (id: string) => void;
  updateProductStock: (productId: string, quantityChange: number) => void;
  findProduct: (id: string) => Product | undefined;
  findClient: (id: string) => Client | undefined;
  convertOrderToStockExit: (orderId: string) => void;
  getBusinessAnalytics: () => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productsData = localStorage.getItem('products');
      if (productsData) {
        setProducts(JSON.parse(productsData));
      }
      
      const categoriesData = localStorage.getItem('categories');
      if (categoriesData) {
        setCategories(JSON.parse(categoriesData));
      }
      
      const clientsData = localStorage.getItem('clients');
      if (clientsData) {
        setClients(JSON.parse(clientsData));
      }
      
      const suppliersData = localStorage.getItem('suppliers');
      if (suppliersData) {
        setSuppliers(JSON.parse(suppliersData));
      }
      
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        setOrders(JSON.parse(ordersData));
      }
      
      const stockEntriesData = localStorage.getItem('stockEntries');
      if (stockEntriesData) {
        setStockEntries(JSON.parse(stockEntriesData));
      }
      
      const stockExitsData = localStorage.getItem('stockExits');
      if (stockExitsData) {
        setStockExits(JSON.parse(stockExitsData));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  };

  const saveData = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  const generateOrderNumber = async (): Promise<string> => {
    const prefix = 'ORD';
    const randomNumber = Math.floor(Math.random() * 100000);
    const orderNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
    return orderNumber;
  };
  
  const generateStockEntryNumber = async (): Promise<string> => {
    const prefix = 'ENT';
    const randomNumber = Math.floor(Math.random() * 100000);
    const entryNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
    return entryNumber;
  };
  
  const generateStockExitNumber = async (): Promise<string> => {
    const prefix = 'SAI';
    const randomNumber = Math.floor(Math.random() * 100000);
    const exitNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
    return exitNumber;
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const newProduct: Product = {
      id: uuidv4(),
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // For now, just log this - we'll fix once the tables are created in Supabase
      console.log('Would save product to Supabase:', newProduct);
      // We're commenting out the Supabase calls as the tables don't exist yet
      /*
      const { error } = await supabase
        .from('products')
        .insert({
          id: newProduct.id,
          code: newProduct.code,
          name: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          purchase_price: newProduct.purchasePrice,
          sale_price: newProduct.salePrice,
          current_stock: newProduct.currentStock,
          min_stock: newProduct.minStock,
          supplier_id: newProduct.supplierId,
          supplier_name: newProduct.supplierName,
          created_at: newProduct.createdAt,
          updated_at: newProduct.updatedAt
        });
      
      if (error) {
        console.error('Error saving product to Supabase:', error);
        throw error;
      }
      
      console.log('Product saved successfully to Supabase');
      */
    } catch (error) {
      console.error('Error saving product:', error);
      console.warn('Only saving locally due to error with Supabase');
    }
    
    setProducts(prev => [newProduct, ...prev]);
    saveData('products', [...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updates, updatedAt: new Date().toISOString() } : product
    );
    setProducts(updatedProducts);
    saveData('products', updatedProducts);
  };

  const deleteProduct = (id: string) => {
    const filteredProducts = products.filter(product => product.id !== id);
    setProducts(filteredProducts);
    saveData('products', filteredProducts);
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const newCategory: Category = {
      id: uuidv4(),
      ...category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // We're commenting out the Supabase calls as the tables don't exist yet
      console.log('Would save category to Supabase:', newCategory);
      /*
      const { error } = await supabase
        .from('categories')
        .insert({
          id: newCategory.id,
          name: newCategory.name,
          description: newCategory.description,
          created_at: newCategory.createdAt,
          updated_at: newCategory.updatedAt
        });
      
      if (error) {
        console.error('Error saving category to Supabase:', error);
        throw error;
      }
      
      console.log('Category saved successfully to Supabase');
      */
    } catch (error) {
      console.error('Error saving category:', error);
      console.warn('Only saving locally due to error with Supabase');
    }
    
    setCategories(prev => [newCategory, ...prev]);
    saveData('categories', [...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(category =>
      category.id === id ? { ...category, ...updates, updatedAt: new Date().toISOString() } : category
    );
    setCategories(updatedCategories);
    saveData('categories', updatedCategories);
  };

  const deleteCategory = (id: string) => {
    const filteredCategories = categories.filter(category => category.id !== id);
    setCategories(filteredCategories);
    saveData('categories', filteredCategories);
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const newClient: Client = {
      id: uuidv4(),
      ...client,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const { error } = await supabase
        .from('Clientes')
        .insert({
          id: newClient.id,
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          address: newClient.address,
          taxId: newClient.taxId,
          notes: newClient.notes,
          created_at: newClient.createdAt
        });
      
      if (error) {
        console.error('Error saving client to Supabase:', error);
        throw error;
      }
      
      console.log('Client saved successfully to Supabase');
    } catch (error) {
      console.error('Error saving client:', error);
      console.warn('Only saving locally due to error with Supabase');
    }
    
    setClients(prev => [newClient, ...prev]);
    saveData('clients', [...clients, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updatedClients = clients.map(client =>
      client.id === id ? { ...client, ...updates, updatedAt: new Date().toISOString() } : client
    );
    setClients(updatedClients);
    saveData('clients', updatedClients);
  };

  const deleteClient = (id: string) => {
    const filteredClients = clients.filter(client => client.id !== id);
    setClients(filteredClients);
    saveData('clients', filteredClients);
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const newSupplier: Supplier = {
      id: uuidv4(),
      ...supplier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // We're commenting out the Supabase calls as the tables don't exist yet
      console.log('Would save supplier to Supabase:', newSupplier);
      /*
      const { error } = await supabase
        .from('suppliers')
        .insert({
          id: newSupplier.id,
          name: newSupplier.name,
          email: newSupplier.email,
          phone: newSupplier.phone,
          address: newSupplier.address,
          tax_id: newSupplier.taxId,
          notes: newSupplier.notes,
          created_at: newSupplier.createdAt,
          updated_at: newSupplier.updatedAt
        });
      
      if (error) {
        console.error('Error saving supplier to Supabase:', error);
        throw error;
      }
      
      console.log('Supplier saved successfully to Supabase');
      */
    } catch (error) {
      console.error('Error saving supplier:', error);
      console.warn('Only saving locally due to error with Supabase');
    }
    
    setSuppliers(prev => [newSupplier, ...prev]);
    saveData('suppliers', [...suppliers, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const updatedSuppliers = suppliers.map(supplier =>
      supplier.id === id ? { ...supplier, ...updates, updatedAt: new Date().toISOString() } : supplier
    );
    setSuppliers(updatedSuppliers);
    saveData('suppliers', updatedSuppliers);
  };

  const deleteSupplier = (id: string) => {
    const filteredSuppliers = suppliers.filter(supplier => supplier.id !== id);
    setSuppliers(filteredSuppliers);
    saveData('suppliers', filteredSuppliers);
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderNumber'>): Promise<Order> => {
    const orderNumber = await generateOrderNumber();
    
    const newOrder: Order = {
      id: uuidv4(),
      ...order,
      orderNumber: orderNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const { error } = await supabase
        .from('Encomendas')
        .insert({
          id: newOrder.id,
          ordernumber: newOrder.orderNumber,
          clientid: newOrder.clientId,
          clientname: newOrder.clientName,
          date: newOrder.date,
          notes: newOrder.notes,
          status: newOrder.status,
          discount: newOrder.discount,
          createdat: newOrder.createdAt,
          updatedat: newOrder.updatedAt
        });
      
      if (error) {
        console.error('Error saving order to Supabase:', error);
        throw error;
      }
      
      // Insert order items
      if (newOrder.items && newOrder.items.length > 0) {
        const orderItems = newOrder.items.map(item => ({
          encomendaid: newOrder.id,
          productid: item.productId,
          productname: item.productName,
          quantity: item.quantity,
          saleprice: item.salePrice
        }));
        
        const { error: itemsError } = await supabase
          .from('EncomendasItems')
          .insert(orderItems);
        
        if (itemsError) {
          console.error('Error saving order items to Supabase:', itemsError);
          // Continue even with errors to save other items
        }
      }
      
      console.log('Order saved successfully to Supabase');
    } catch (error) {
      console.error('Error saving order:', error);
      console.warn('Only saving locally due to error with Supabase');
    }
    
    setOrders(prev => [newOrder, ...prev]);
    saveData('orders', [...orders, newOrder]);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const updatedOrders = orders.map(order =>
      order.id === id ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
    );
    setOrders(updatedOrders);
    saveData('orders', updatedOrders);
  };

  const deleteOrder = (id: string) => {
    const filteredOrders = orders.filter(order => order.id !== id);
    setOrders(filteredOrders);
    saveData('orders', filteredOrders);
  };

  const addStockEntry = async (entry: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'entryNumber'>): Promise<StockEntry> => {
    const entryNumber = await generateStockEntryNumber();
    
    const newEntry: StockEntry = {
      id: uuidv4(),
      ...entry,
      entryNumber: entryNumber,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const { error } = await supabase
        .from('StockEntries')
        .insert({
          id: newEntry.id,
          supplierid: newEntry.supplierId,
          suppliername: newEntry.supplierName,
          entrynumber: newEntry.entryNumber,
          date: newEntry.date,
          invoicenumber: newEntry.invoiceNumber,
          notes: newEntry.notes,
          status: newEntry.status,
          discount: newEntry.discount,
          createdat: newEntry.createdAt,
          updatedat: newEntry.updatedAt
        });
      
      if (error) {
        console.error('Error saving entry to Supabase:', error);
        throw error;
      }
      
      // Insert entry items
      if (newEntry.items && newEntry.items.length > 0) {
        const entryItems = newEntry.items.map(item => ({
          entryid: newEntry.id,
          productid: item.productId,
          productname: item.productName,
          quantity: item.quantity,
          purchaseprice: item.purchasePrice
        }));
        
        const { error: itemsError } = await supabase
          .from('StockEntriesItems')
          .insert(entryItems);
        
        if (itemsError) {
          console.error('Error saving entry items to Supabase:', itemsError);
          // Continue even with errors to save other items
        }
      }
      
      console.log('Entry saved successfully to Supabase');
    } catch (error) {
      console.error('Error saving entry:', error);
      console.warn('Only saving locally due to error with Supabase');
    }
    
    // Update product stock quantities (positive for entries)
    newEntry.items.forEach(item => {
      updateProductStock(item.productId, item.quantity);
    });
    
    // Save to local state
    setStockEntries(prev => [newEntry, ...prev]);
    saveData('stockEntries', [...stockEntries, newEntry]);
    return newEntry;
  };

  const updateStockEntry = (id: string, updates: Partial<StockEntry>) => {
    const updatedStockEntries = stockEntries.map(entry =>
      entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
    );
    setStockEntries(updatedStockEntries);
    saveData('stockEntries', updatedStockEntries);
  };

  const deleteStockEntry = (id: string) => {
    const filteredStockEntries = stockEntries.filter(entry => entry.id !== id);
    setStockEntries(filteredStockEntries);
    saveData('stockEntries', filteredStockEntries);
  };

  const addStockExit = async (exitData: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'exitNumber'>) => {
    const exitNumber = await generateStockExitNumber();
    
    const newExit: StockExit = {
      id: uuidv4(),
      ...exitData,
      exitNumber: exitNumber,
      status: 'completed',
      discount: exitData.discount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      console.log('Saving exit to Supabase:', newExit);
      
      // Insert basic exit data
      const { error } = await supabase
        .from('StockExits')
        .insert({
          id: newExit.id,
          clientid: newExit.clientId,
          clientname: newExit.clientName,
          reason: newExit.reason,
          exitnumber: newExit.exitNumber,
          date: newExit.date,
          invoicenumber: newExit.invoiceNumber,
          notes: newExit.notes,
          status: newExit.status,
          discount: newExit.discount,
          fromorderid: newExit.fromOrderId,
          createdat: newExit.createdAt,
          updatedat: newExit.updatedAt
        });
      
      if (error) {
        console.error('Error saving exit to Supabase:', error);
        throw error;
      }
      
      // Insert exit items
      if (newExit.items && newExit.items.length > 0) {
        const exitItems = newExit.items.map(item => ({
          exitid: newExit.id,
          productid: item.productId,
          productname: item.productName,
          quantity: item.quantity,
          saleprice: item.salePrice,
          discount: item.discount || 0
        }));
        
        const { error: itemsError } = await supabase
          .from('StockExitsItems')
          .insert(exitItems);
        
        if (itemsError) {
          console.error('Error saving exit items to Supabase:', itemsError);
          // Continue even with errors to save other items
        }
      }
      
      console.log('Exit saved successfully to Supabase');
    } catch (error) {
      console.error('Error saving exit:', error);
      console.warn('Only saving locally due to error with Supabase');
    }
    
    // Update product stock quantities (negative for exits)
    newExit.items.forEach(item => {
      updateProductStock(item.productId, -item.quantity);
    });
    
    // Save to local state
    setStockExits(prev => [newExit, ...prev]);
    saveData('stockExits', [...stockExits, newExit]);
    return newExit;
  };

  const updateStockExit = (id: string, updates: Partial<StockExit>) => {
    const updatedStockExits = stockExits.map(exit =>
      exit.id === id ? { ...exit, ...updates, updatedAt: new Date().toISOString() } : exit
    );
    setStockExits(updatedStockExits);
    saveData('stockExits', updatedStockExits);
  };

  const deleteStockExit = (id: string) => {
    const filteredStockExits = stockExits.filter(exit => exit.id !== id);
    setStockExits(filteredStockExits);
    saveData('stockExits', filteredStockExits);
  };

  const updateProductStock = (productId: string, quantityChange: number) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        const newStock = product.currentStock + quantityChange;
        return { ...product, currentStock: newStock >= 0 ? newStock : 0, updatedAt: new Date().toISOString() };
      }
      return product;
    });
    setProducts(updatedProducts);
    saveData('products', updatedProducts);
  };

  const findProduct = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };
  
  const getProduct = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };
  
  const getProductHistory = (id: string): { entries: StockEntry[], exits: StockExit[] } => {
    const entries = stockEntries.filter(entry => entry.items.some(item => item.productId === id));
    const exits = stockExits.filter(exit => exit.items.some(item => item.productId === id));
    return { entries, exits };
  };

  const findClient = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };
  
  const getClient = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };
  
  const getClientHistory = (id: string): { orders: Order[], stockExits: StockExit[] } => {
    const clientOrders = orders.filter(order => order.clientId === id);
    const clientExits = stockExits.filter(exit => exit.clientId === id);
    return { orders: clientOrders, stockExits: clientExits };
  };

  const findSupplier = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };
  
  const getSupplier = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };
  
  const getSupplierHistory = (id: string): { entries: StockEntry[] } => {
    const entries = stockEntries.filter(entry => entry.supplierId === id);
    return { entries };
  };

  const findOrder = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };
  
  const findCategory = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };
  
  const getCategory = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };

  const convertOrderToStockExit = (orderId: string) => {
    const order = findOrder(orderId);
    if (!order) return;
    
    const client = findClient(order.clientId);
    
    // Create a new stock exit from the order
    const newExit: StockExit = {
      id: uuidv4(),
      clientId: order.clientId,
      clientName: client?.name || order.clientName,
      reason: `Encomenda ${order.orderNumber}`,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice,
        discount: item.discount || 0  // Make sure to include the discount
      })),
      date: new Date().toISOString(),
      notes: order.notes,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exitNumber: '',
      discount: order.discount,
      fromOrderId: order.id
    };
    
    // Generate a number for the exit
    generateStockExitNumber().then(async (exitNumber) => {
      newExit.exitNumber = exitNumber;
      
      try {
        // Insert converted exit data
        const { error } = await supabase
          .from('StockExits')
          .insert({
            id: newExit.id,
            clientid: newExit.clientId,
            clientname: newExit.clientName,
            reason: newExit.reason,
            exitnumber: newExit.exitNumber,
            date: newExit.date,
            invoicenumber: newExit.invoiceNumber,
            notes: newExit.notes,
            status: newExit.status,
            discount: newExit.discount,
            fromorderid: newExit.fromOrderId,
            createdat: newExit.createdAt,
            updatedat: newExit.updatedAt
          });
        
        if (error) {
          console.error('Error saving converted exit to Supabase:', error);
          throw error;
        }
        
        // Insert exit items
        if (newExit.items && newExit.items.length > 0) {
          const exitItems = newExit.items.map(item => ({
            exitid: newExit.id,
            productid: item.productId,
            productname: item.productName,
            quantity: item.quantity,
            saleprice: item.salePrice,
            discount: item.discount || 0
          }));
          
          const { error: itemsError } = await supabase
            .from('StockExitsItems')
            .insert(exitItems);
          
          if (itemsError) {
            console.error('Error saving converted exit items to Supabase:', itemsError);
            // Continue even with errors to save other items
          }
        }
        
        // Update order status
        const { error: updateError } = await supabase
          .from('Encomendas')
          .update({
            status: 'completed',
            convertedtostockexitid: newExit.id,
            updatedat: new Date().toISOString()
          })
          .eq('id', order.id);
        
        if (updateError) {
          console.error('Error updating order status in Supabase:', updateError);
          throw updateError;
        }
        
        console.log('Order to exit conversion registered successfully in Supabase');
      } catch (error) {
        console.error('Error registering conversion:', error);
        // Continue local conversion even if Supabase fails
        console.warn('Only local conversion due to error with Supabase');
      }
      
      // Update product stock quantities (negative for exits)
      newExit.items.forEach(item => {
        updateProductStock(item.productId, -item.quantity);
      });
      
      // Add the exit to the list
      setStockExits(prev => [newExit, ...prev]);
      saveData('stockExits', [...stockExits, newExit]);
      
      // Update the order to mark it as converted
      updateOrder(order.id, { 
        status: 'completed', 
        convertedToStockExitId: newExit.id 
      });
    });
  };

  const getBusinessAnalytics = () => {
    // Calculate total revenue
    const totalRevenue = stockExits.reduce((sum, exit) => {
      return sum + exit.items.reduce((itemSum, item) => itemSum + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 0);
    }, 0);
    
    // Calculate total cost
    const totalCost = stockEntries.reduce((sum, entry) => {
      return sum + entry.items.reduce((itemSum, item) => itemSum + (item.quantity * item.purchasePrice), 0);
    }, 0);
    
    // Calculate total profit
    const totalProfit = totalRevenue - totalCost;
    
    // Calculate profit margin
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // Calculate current stock value
    const currentStockValue = products.reduce((sum, product) => {
      return sum + (product.currentStock * product.purchasePrice);
    }, 0);
    
    // Find top selling products
    const productSales = stockExits.flatMap(exit => exit.items).reduce((acc, item) => {
      const { productId, quantity, salePrice } = item;
      if (!acc[productId]) {
        acc[productId] = {
          name: item.productName,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      acc[productId].totalQuantity += quantity;
      acc[productId].totalRevenue += quantity * salePrice;
      return acc;
    }, {} as Record<string, { name: string, totalQuantity: number, totalRevenue: number }>);
    
    const topSellingProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5)
      .map(([productId, data]) => ({
        id: productId,
        name: data.name,
        totalQuantity: data.totalQuantity,
        totalRevenue: data.totalRevenue
      }));
    
    // Find most profitable products
    const mostProfitableProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(([productId, data]) => ({
        id: productId,
        name: data.name,
        totalQuantity: data.totalQuantity,
        totalRevenue: data.totalRevenue
      }));
    
    // Top clients
    const clientSales = stockExits.reduce((acc, exit)
