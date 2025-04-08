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
      if (productsData) setProducts(JSON.parse(productsData));

      const categoriesData = localStorage.getItem('categories');
      if (categoriesData) setCategories(JSON.parse(categoriesData));

      const clientsData = localStorage.getItem('clients');
      if (clientsData) setClients(JSON.parse(clientsData));

      const suppliersData = localStorage.getItem('suppliers');
      if (suppliersData) setSuppliers(JSON.parse(suppliersData));

      const ordersData = localStorage.getItem('orders');
      if (ordersData) setOrders(JSON.parse(ordersData));

      const stockEntriesData = localStorage.getItem('stockEntries');
      if (stockEntriesData) setStockEntries(JSON.parse(stockEntriesData));

      const stockExitsData = localStorage.getItem('stockExits');
      if (stockExitsData) setStockExits(JSON.parse(stockExitsData));
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  };

  const saveData = (key: string, data: any[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  const generateOrderNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'orders' });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating order number:", error);
      return `${new Date().getFullYear()}/???`;
    }
  };

  const generateStockEntryNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'stock_entries' });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating stock entry number:", error);
      return `${new Date().getFullYear()}/???`;
    }
  };

  const generateStockExitNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'stock_exits' });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating stock exit number:", error);
      return `${new Date().getFullYear()}/???`;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const newProduct: Product = {
      id: uuidv4(),
      ...productData,
      currentStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    saveData('products', updatedProducts);
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const newCategory: Category = {
      id: uuidv4(),
      ...categoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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
    const updatedCategories = categories.filter(category => category.id !== id);
    setCategories(updatedCategories);
    saveData('categories', updatedCategories);
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const newClient: Client = {
      id: uuidv4(),
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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
    const updatedClients = clients.filter(client => client.id !== id);
    setClients(updatedClients);
    saveData('clients', updatedClients);
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const newSupplier: Supplier = {
      id: uuidv4(),
      ...supplierData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
    setSuppliers(updatedSuppliers);
    saveData('suppliers', updatedSuppliers);
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderNumber'>) => {
    const orderNumber = await generateOrderNumber();
    
    const newOrder: Order = {
      id: uuidv4(),
      ...orderData,
      orderNumber: orderNumber,
      status: 'pending',
      discount: orderData.discount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      console.log('Guardando encomenda no Supabase:', newOrder);
      
      // Inserir dados básicos da encomenda
      const { error } = await supabase
        .from('Encomendas')
        .insert({
          id: newOrder.id,
          clientid: newOrder.clientId,
          clientname: newOrder.clientName,
          ordernumber: newOrder.orderNumber,
          date: newOrder.date,
          notes: newOrder.notes,
          status: newOrder.status,
          discount: newOrder.discount,
          createdat: newOrder.createdAt,
          updatedat: newOrder.updatedAt
        });
      
      if (error) {
        console.error('Erro ao salvar encomenda no Supabase:', error);
        throw error;
      }
      
      // Inserir itens da encomenda
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
          console.error('Erro ao salvar itens da encomenda no Supabase:', itemsError);
          // Continuar mesmo com erro para salvar outros itens
        }
      }
      
      console.log('Encomenda guardada com sucesso no Supabase');
    } catch (error) {
      console.error('Erro ao guardar encomenda:', error);
      // Continue saving locally even if Supabase fails
      console.warn('Salvando apenas localmente devido a erro no Supabase');
    }
    
    // Save to local state
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
    const updatedOrders = orders.filter(order => order.id !== id);
    setOrders(updatedOrders);
    saveData('orders', updatedOrders);
  };

  const addStockEntry = async (entryData: Omit<StockEntry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'entryNumber'>) => {
    const entryNumber = await generateStockEntryNumber();
    
    const newEntry: StockEntry = {
      id: uuidv4(),
      ...entryData,
      entryNumber: entryNumber,
      status: 'completed',
      discount: entryData.discount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      console.log('Guardando entrada no Supabase:', newEntry);
      
      // Inserir dados básicos da entrada
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
        console.error('Erro ao salvar entrada no Supabase:', error);
        throw error;
      }
      
      // Inserir itens da entrada
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
          console.error('Erro ao salvar itens da entrada no Supabase:', itemsError);
          // Continuar mesmo com erro para salvar outros itens
        }
      }
      
      console.log('Entrada guardada com sucesso no Supabase');
    } catch (error) {
      console.error('Erro ao guardar entrada:', error);
      // Continue saving locally even if Supabase fails
      console.warn('Salvando apenas localmente devido a erro no Supabase');
    }
    
    // Update product stock quantities
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
    const updatedStockEntries = stockEntries.filter(entry => entry.id !== id);
    setStockEntries(updatedStockEntries);
    saveData('stockEntries', updatedStockEntries);
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
      console.log('Guardando saída no Supabase:', newExit);
      
      // Inserir dados básicos da saída
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
        console.error('Erro ao salvar saída no Supabase:', error);
        throw error;
      }
      
      // Inserir itens da saída
      if (newExit.items && newExit.items.length > 0) {
        const exitItems = newExit.items.map(item => ({
          exitid: newExit.id,
          productid: newExit.productId,
          productname: newExit.productName,
          quantity: item.quantity,
          saleprice: item.salePrice,
          discount: item.discount || 0
        }));
        
        const { error: itemsError } = await supabase
          .from('StockExitsItems')
          .insert(exitItems);
        
        if (itemsError) {
          console.error('Erro ao salvar itens da saída no Supabase:', itemsError);
          // Continuar mesmo com erro para salvar outros itens
        }
      }
      
      console.log('Saída guardada com sucesso no Supabase');
    } catch (error) {
      console.error('Erro ao guardar saída:', error);
      // Continue saving locally even if Supabase fails
      console.warn('Salvando apenas localmente devido a erro no Supabase');
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
    const updatedStockExits = stockExits.filter(exit => exit.id !== id);
    setStockExits(updatedStockExits);
    saveData('stockExits', updatedStockExits);
  };

  const updateProductStock = (productId: string, quantityChange: number) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        const newStock = Math.max(0, product.currentStock + quantityChange);
        return { ...product, currentStock: newStock, updatedAt: new Date().toISOString() };
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

  const getProductHistory = (id: string) => {
    const productEntries = stockEntries.filter(
      entry => entry.items.some(item => item.productId === id)
    );
    
    const productExits = stockExits.filter(
      exit => exit.items.some(item => item.productId === id)
    );
    
    return { entries: productEntries, exits: productExits };
  };

  const findClient = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const getClient = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const getClientHistory = (id: string) => {
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

  const getSupplierHistory = (id: string) => {
    const supplierEntries = stockEntries.filter(entry => entry.supplierId === id);
    return { entries: supplierEntries };
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
        // Inserir dados da saída convertida
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
          console.error('Erro ao salvar saída convertida no Supabase:', error);
          throw error;
        }
        
        // Inserir itens da saída
        if (newExit.items && newExit.items.length > 0) {
          const exitItems = newExit.items.map(item => ({
            exitid: newExit.id,
            productid: newExit.productId,
            productname: newExit.productName,
            quantity: item.quantity,
            saleprice: item.salePrice
          }));
          
          const { error: itemsError } = await supabase
            .from('StockExitsItems')
            .insert(exitItems);
          
          if (itemsError) {
            console.error('Erro ao salvar itens da saída convertida no Supabase:', itemsError);
            // Continuar mesmo com erro para salvar outros itens
          }
        }
        
        // Atualizar status da encomenda
        const { error: updateError } = await supabase
          .from('Encomendas')
          .update({
            status: 'completed',
            convertedtostockexitid: newExit.id,
            updatedat: new Date().toISOString()
          })
          .eq('id', order.id);
        
        if (updateError) {
          console.error('Erro ao atualizar status da encomenda no Supabase:', updateError);
          throw updateError;
        }
        
        console.log('Conversão de encomenda para saída registrada com sucesso no Supabase');
      } catch (error) {
        console.error('Erro ao registrar conversão:', error);
        // Continue local conversion even if Supabase fails
        console.warn('Conversão apenas local devido a erro no Supabase');
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
    // Calculate total revenue, cost, and profit
    const totalRevenue = stockExits.reduce((sum, exit) => {
      const subtotal = exit.items.reduce((s, item) => s + (item.quantity * item.salePrice), 0);
      const discount = subtotal * (exit.discount / 100);
      return sum + (subtotal - discount);
    }, 0);
    
    const totalCost = stockEntries.reduce((sum, entry) => {
      const subtotal = entry.items.reduce((s, item) => s + (item.quantity * item.purchasePrice), 0);
      const discount = subtotal * (entry.discount / 100);
      return sum + (subtotal - discount);
    }, 0);
    
    // Calculate current stock value
    const currentStockValue = products.reduce((sum, product) => {
      return sum + (product.currentStock * product.purchasePrice);
    }, 0);
    
    // Top selling products
    const productSales: Record<string, { id: string, name: string, totalQuantity: number, totalRevenue: number }> = {};
    stockExits.forEach(exit => {
      exit.items.forEach(item => {
        if (!productSales[item.productId]) {
          const product = findProduct(item.productId);
          productSales[item.productId] = {
            id: item.productId,
            name: product?.name || item.productName,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        productSales[item.productId].totalQuantity += item.quantity;
        productSales[item.productId].totalRevenue += item.quantity * item.salePrice;
      });
    });
    
    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
    
    // Most profitable products
    const mostProfitableProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
    
    // Top clients
    const clientPurchases: Record<string, { id: string, name: string, totalSpent: number, purchaseCount: number }> = {};
    stockExits.forEach(exit => {
      if (!exit.clientId) return;
      
      if (!clientPurchases[exit.clientId]) {
        const client = findClient(exit.clientId);
        clientPurchases[exit.clientId] = {
          id: exit.clientId,
          name: client?.name || exit.clientName || 'Cliente Desconhecido',
          totalSpent: 0,
          purchaseCount: 0
        };
      }
      
      const subtotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      const discount = subtotal * (exit.discount / 100);
      const total = subtotal - discount;
      
      clientPurchases[exit.clientId].totalSpent += total;
      clientPurchases[exit.clientId].purchaseCount += 1;
    });
    
    const topClients = Object.values(clientPurchases)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    // Low stock products
    const lowStockProducts = products
      .filter(product => product.currentStock <= product.minStock)
      .map(product => ({
        id: product.id,
        code: product.code,
        name: product.name,
        currentStock: product.currentStock,
        minStock: product.minStock
      }))
      .sort((a, b) => (a.currentStock / a.minStock) - (b.currentStock / b.minStock));
    
    // Inactive clients
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveClients = clients.map(client => {
      const lastExit = stockExits
        .filter(exit => exit.clientId === client.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      return {
        id: client.id,
        name: client.name,
        lastPurchaseDate: lastExit ? lastExit.date : 'Nunca'
      };
    }).filter(client => {
      if (client.lastPurchaseDate === 'Nunca') return true;
      return new Date(client.lastPurchaseDate) < thirtyDaysAgo;
    });
    
    return {
      summary: {
        totalRevenue,
        totalCost,
        totalProfit: totalRevenue - totalCost,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
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
      orders,
      stockEntries,
      stockExits,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      getProductHistory,
      addCategory,
      updateCategory,
      deleteCategory,
      getCategory,
      addClient,
      updateClient,
      deleteClient,
      getClient,
      getClientHistory,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      getSupplier,
      getSupplierHistory,
      addOrder,
      updateOrder,
      deleteOrder,
      findOrder,
      addStockEntry,
      updateStockEntry,
      deleteStockEntry,
      addStockExit,
      updateStockExit,
      deleteStockExit,
      updateProductStock,
      findProduct,
      findClient,
      convertOrderToStockExit,
      getBusinessAnalytics,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const
