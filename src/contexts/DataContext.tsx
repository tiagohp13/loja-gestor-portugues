
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Client, StockEntry, StockExit, Supplier, Category, Order } from '@/types';
import { 
  mapDbProductToProduct, 
  mapDbClientToClient, 
  mapDbStockEntryToStockEntry,
  mapDbStockExitToStockExit,
  mapDbSupplierToSupplier,
  mapDbCategoryToCategory,
  mapDbOrderToOrder
} from '@/utils/mappers';

interface DataContextType {
  products: Product[];
  clients: Client[];
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  suppliers: Supplier[];
  categories: Category[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | void>;
  deleteProduct: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client | void>;
  deleteClient: (id: string) => Promise<void>;
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'number' | 'createdAt'>) => Promise<StockEntry>;
  updateStockEntry: (id: string, updates: Partial<StockEntry>) => Promise<StockEntry | void>;
  deleteStockEntry: (id: string) => Promise<void>;
  addStockExit: (exit: Omit<StockExit, 'id' | 'number' | 'createdAt'>) => Promise<StockExit>;
  updateStockExit: (id: string, updates: Partial<StockExit>) => Promise<StockExit | void>;
  deleteStockExit: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<Supplier | void>;
  deleteSupplier: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category | void>;
  deleteCategory: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'number' | 'createdAt' | 'total'>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<Order | void>;
  deleteOrder: (id: string) => Promise<void>;
  convertOrderToStockExit: (orderId: string, invoiceNumber?: string) => Promise<StockExit>;
  
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setStockEntries: React.Dispatch<React.SetStateAction<StockEntry[]>>;
  setStockExits: React.Dispatch<React.SetStateAction<StockExit[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: React.ReactNode;
}

const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error("Error fetching products:", productsError);
        } else {
          setProducts(productsData?.map(mapDbProductToProduct) || []);
        }

        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (clientsError) {
          console.error("Error fetching clients:", clientsError);
        } else {
          setClients(clientsData?.map(mapDbClientToClient) || []);
        }

        // Fetch stock entries with items
        const { data: stockEntriesData, error: stockEntriesError } = await supabase
          .from('stock_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (stockEntriesError) {
          console.error("Error fetching stock entries:", stockEntriesError);
        } else {
          // For each entry, fetch its items
          const entriesWithItems = await Promise.all((stockEntriesData || []).map(async (entry) => {
            const { data: items } = await supabase
              .from('stock_entry_items')
              .select('*')
              .eq('entry_id', entry.id);
            
            return mapDbStockEntryToStockEntry(entry, items || []);
          }));
          
          setStockEntries(entriesWithItems);
        }

        // Fetch stock exits with items
        const { data: stockExitsData, error: stockExitsError } = await supabase
          .from('stock_exits')
          .select('*')
          .order('created_at', { ascending: false });

        if (stockExitsError) {
          console.error("Error fetching stock exits:", stockExitsError);
        } else {
          // For each exit, fetch its items
          const exitsWithItems = await Promise.all((stockExitsData || []).map(async (exit) => {
            const { data: items } = await supabase
              .from('stock_exit_items')
              .select('*')
              .eq('exit_id', exit.id);
            
            return mapDbStockExitToStockExit(exit, items || []);
          }));
          
          setStockExits(exitsWithItems);
        }

        // Fetch suppliers
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('*')
          .order('created_at', { ascending: false });

        if (suppliersError) {
          console.error("Error fetching suppliers:", suppliersError);
        } else {
          setSuppliers(suppliersData?.map(mapDbSupplierToSupplier) || []);
        }
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false });

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
        } else {
          setCategories(categoriesData?.map(mapDbCategoryToCategory) || []);
        }

        // Fetch orders with items
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
        } else {
          // For each order, fetch its items
          const ordersWithItems = await Promise.all((ordersData || []).map(async (order) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);
            
            return mapDbOrderToOrder(order, items || []);
          }));
          
          setOrders(ordersWithItems);
        }
      } catch (error) {
        console.error("Error during initial data fetch:", error);
      }
    };

    fetchData();
  }, []);

  // Generic function to handle database operations and state updates
  const handleDataChange = async <T,>(
    operation: 'insert' | 'update' | 'delete',
    tableName: string,
    data: any,
    setData: React.Dispatch<React.SetStateAction<T[]>>,
    idField: string = 'id'
  ): Promise<any> => {
    try {
      let response;
      let mappedResult;

      switch (operation) {
        case 'insert':
          response = await supabase
            .from(tableName)
            .insert([data])
            .select()
            .single();
          break;
        case 'update':
          response = await supabase
            .from(tableName)
            .update(data)
            .eq(idField, data[idField])
            .select()
            .single();
          break;
        case 'delete':
          response = await supabase
            .from(tableName)
            .delete()
            .eq(idField, data[idField]);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      if (response.error) {
        console.error(`Error during ${operation} operation on ${tableName}:`, response.error);
        throw response.error;
      }

      // Apply mapping based on the table
      if (operation !== 'delete' && response.data) {
        switch (tableName) {
          case 'products':
            mappedResult = mapDbProductToProduct(response.data);
            break;
          case 'clients':
            mappedResult = mapDbClientToClient(response.data);
            break;
          case 'stock_entries':
            // Fetch items for this entry
            const { data: entryItems } = await supabase
              .from('stock_entry_items')
              .select('*')
              .eq('entry_id', response.data.id);
            mappedResult = mapDbStockEntryToStockEntry(response.data, entryItems || []);
            break;
          case 'stock_exits':
            // Fetch items for this exit
            const { data: exitItems } = await supabase
              .from('stock_exit_items')
              .select('*')
              .eq('exit_id', response.data.id);
            mappedResult = mapDbStockExitToStockExit(response.data, exitItems || []);
            break;
          case 'suppliers':
            mappedResult = mapDbSupplierToSupplier(response.data);
            break;
          case 'categories':
            mappedResult = mapDbCategoryToCategory(response.data);
            break;
          case 'orders':
            // Fetch items for this order
            const { data: orderItems } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', response.data.id);
            mappedResult = mapDbOrderToOrder(response.data, orderItems || []);
            break;
          default:
            mappedResult = response.data;
        }
      }

      // Update local state based on the operation
      switch (operation) {
        case 'insert':
          setData((prev: any[]) => [...prev, mappedResult]);
          return mappedResult;
        case 'update':
          setData((prev: any[]) =>
            prev.map((item: any) => (item[idField] === mappedResult[idField] ? mappedResult : item))
          );
          return mappedResult;
        case 'delete':
          setData((prev: any[]) => prev.filter((item: any) => item[idField] !== data[idField]));
          break;
      }
    } catch (error) {
      console.error(`Error during ${operation} operation on ${tableName}:`, error);
      throw error;
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    return handleDataChange('insert', 'products', product, setProducts);
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | void> => {
    return handleDataChange('update', 'products', { ...updates, id }, setProducts);
  };

  const deleteProduct = async (id: string): Promise<void> => {
    return handleDataChange('delete', 'products', { id }, setProducts);
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    return handleDataChange('insert', 'clients', client, setClients);
  };

  const updateClient = async (id: string, updates: Partial<Client>): Promise<Client | void> => {
    return handleDataChange('update', 'clients', { ...updates, id }, setClients);
  };

  const deleteClient = async (id: string): Promise<void> => {
    return handleDataChange('delete', 'clients', { id }, setClients);
  };

  const addStockEntry = async (entry: Omit<StockEntry, 'id' | 'number' | 'createdAt'>): Promise<StockEntry> => {
    return handleDataChange('insert', 'stock_entries', entry, setStockEntries);
  };

  const updateStockEntry = async (id: string, updates: Partial<StockEntry>): Promise<StockEntry | void> => {
    return handleDataChange('update', 'stock_entries', { ...updates, id }, setStockEntries);
  };

  const deleteStockEntry = async (id: string): Promise<void> => {
    return handleDataChange('delete', 'stock_entries', { id }, setStockEntries);
  };

  const addStockExit = async (exit: Omit<StockExit, 'id' | 'number' | 'createdAt'>): Promise<StockExit> => {
    return handleDataChange('insert', 'stock_exits', exit, setStockExits);
  };

  const updateStockExit = async (id: string, updates: Partial<StockExit>): Promise<StockExit | void> => {
    return handleDataChange('update', 'stock_exits', { ...updates, id }, setStockExits);
  };

  const deleteStockExit = async (id: string): Promise<void> => {
    return handleDataChange('delete', 'stock_exits', { id }, setStockExits);
  };
   
  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> => {
    return handleDataChange('insert', 'suppliers', supplier, setSuppliers);
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<Supplier | void> => {
    return handleDataChange('update', 'suppliers', { ...updates, id }, setSuppliers);
  };

  const deleteSupplier = async (id: string): Promise<void> => {
    return handleDataChange('delete', 'suppliers', { id }, setSuppliers);
  };
  
  const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> => {
    return handleDataChange('insert', 'categories', category, setCategories);
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | void> => {
    return handleDataChange('update', 'categories', { ...updates, id }, setCategories);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    return handleDataChange('delete', 'categories', { id }, setCategories);
  };

  const addOrder = async (order: Omit<Order, 'id' | 'number' | 'createdAt' | 'total'>): Promise<Order> => {
     return handleDataChange('insert', 'orders', order, setOrders);
  };

  const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order | void> => {
    return handleDataChange('update', 'orders', { ...updates, id }, setOrders);
  };

  const deleteOrder = async (id: string): Promise<void> => {
    return handleDataChange('delete', 'orders', { id }, setOrders);
  };

  // Convert order to stock exit function
  const convertOrderToStockExit = async (orderId: string, invoiceNumber?: string): Promise<StockExit> => {
    try {
      // Buscar a encomenda
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId)
        .single();
        
      if (orderError || !order) {
        console.error("Error fetching order:", orderError);
        throw new Error("Não foi possível encontrar a encomenda");
      }
      
      if (order.converted_to_stock_exit_id) {
        throw new Error("Esta encomenda já foi convertida para venda");
      }
      
      // Verificar o stock dos produtos
      const insufficientStockProducts = [];
      
      for (const item of order.items) {
        // Buscar o produto para verificar o stock atual
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name, current_stock')
          .eq('id', item.product_id)
          .single();
          
        if (productError || !product) {
          console.error("Error fetching product:", productError);
          continue;
        }
        
        if (product.current_stock < item.quantity) {
          insufficientStockProducts.push(product.name);
        }
      }
      
      if (insufficientStockProducts.length > 0) {
        throw new Error(`Stock insuficiente para os produtos: ${insufficientStockProducts.join(", ")}`);
      }
      
      // Obter o próximo número de saída
      const targetYear = new Date(order.date).getFullYear();
      const { data: exitNumber, error: numberError } = await supabase
        .rpc('get_next_counter_by_year', { 
          counter_id: 'exit',
          target_year: targetYear
        });
        
      if (numberError || !exitNumber) {
        console.error("Error getting exit number:", numberError);
        throw new Error("Não foi possível gerar o número da venda");
      }
      
      // Notas: manter apenas a versão em português (remover versão em inglês)
      const notesText = `Convertida da encomenda ${order.number}`;
      
      // Criar a saída de stock
      const exitData = {
        client_id: order.client_id,
        client_name: order.client_name,
        date: order.date,
        number: exitNumber,
        from_order_id: order.id,
        from_order_number: order.number,
        notes: notesText,
        invoice_number: invoiceNumber || null
      };
      
      // Inserir a saída de stock
      const { data: exit, error: exitError } = await supabase
        .from('stock_exits')
        .insert(exitData)
        .select()
        .single();
        
      if (exitError || !exit) {
        console.error("Error creating stock exit:", exitError);
        throw new Error("Erro ao criar a saída de stock");
      }
      
      // Inserir os items da saída
      const exitItems = order.items.map(item => ({
        exit_id: exit.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        sale_price: item.sale_price,
        discount_percent: item.discount_percent || 0
      }));
      
      const { error: itemsError } = await supabase
        .from('stock_exit_items')
        .insert(exitItems);
        
      if (itemsError) {
        console.error("Error creating stock exit items:", itemsError);
        throw new Error("Erro ao criar os itens da saída de stock");
      }
      
      // Atualizar o stock dos produtos
      for (const item of order.items) {
        const { error: updateError } = await supabase
          .rpc('decrement_product_stock', {
            product_id: item.product_id,
            quantity: item.quantity
          });
          
        if (updateError) {
          console.error("Error updating product stock:", updateError);
        }
      }
      
      // Atualizar a encomenda
      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({
          converted_to_stock_exit_id: exit.id,
          converted_to_stock_exit_number: exit.number
        })
        .eq('id', orderId);
        
      if (updateOrderError) {
        console.error("Error updating order:", updateOrderError);
        throw new Error("Erro ao atualizar a encomenda");
      }
      
      // Atualizar o estado local
      setStockExits(prev => [...prev, exit]);
      setOrders(prev => prev.map(o => o.id === orderId 
        ? { ...o, converted_to_stock_exit_id: exit.id, converted_to_stock_exit_number: exit.number } 
        : o
      ));
      
      return exit;
    } catch (error) {
      console.error("Error converting order to stock exit:", error);
      throw error;
    }
  };

  const value: DataContextType = {
    products,
    clients,
    stockEntries,
    stockExits,
    suppliers,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    updateClient,
    deleteClient,
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    addStockExit,
    updateStockExit,
    deleteStockExit,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addCategory,
    updateCategory,
    deleteCategory,
    addOrder,
    updateOrder,
    deleteOrder,
    convertOrderToStockExit,
    setProducts,
    setClients,
    setStockEntries,
    setStockExits,
    setSuppliers,
    setCategories,
    setOrders
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export { DataProvider, useData };
