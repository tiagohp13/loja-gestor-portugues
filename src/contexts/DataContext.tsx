import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, snakeToCamel, increment, decrement } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import {
  Product,
  Category,
  Client,
  Supplier,
  Order,
  OrderItem,
  StockEntry,
  StockEntryItem,
  StockExit,
  StockExitItem,
  ExportDataType,
} from "../types";
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
  mapStockExitItemToDbStockExitItem,
} from "../utils/mappers";

/* ========================================================================================
 * Helpers internos (apenas para reduzir linhas/duplicação; sem alterar comportamento)
 * ======================================================================================*/

// Lista simples com deleted_at = null e orderBy
async function fetchList<TApp>(
  table: string,
  mapper: (row: any) => TApp,
  setState: (rows: TApp[]) => void,
  orderBy: string,
  errorLabelPt: string,
) {
  try {
    const { data, error } = await supabase.from(table).select("*").is("deleted_at", null).order(orderBy);
    if (error) throw error;
    if (data) setState(data.map(mapper));
  } catch (err) {
    console.error(`Error fetching ${table}:`, err);
    toast.error(`Erro ao carregar ${errorLabelPt}`);
  }
}

// Lista com relação de items (orders, entries, exits)
async function fetchListWithItems<TApp>(
  table: string,
  relation: string,
  mapper: (row: any, items: any[]) => TApp,
  setState: (rows: TApp[]) => void,
  orderBy: { column: string; ascending: boolean },
  errorLabelPt: string,
) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(
        `
        *,
        ${relation}(*)
      `,
      )
      .is("deleted_at", null)
      .order(orderBy.column, { ascending: orderBy.ascending });

    if (error) throw error;

    if (data) {
      const formatted = data.map((row) => mapper(row, row[relation] || []));
      setState(formatted);
    }
  } catch (err) {
    console.error(`Error fetching ${table}:`, err);
    toast.error(`Erro ao carregar ${errorLabelPt}`);
  }
}

// Soft delete centralizado (usa o teu RPC)
async function softDeleteRecord(table: string, id: string) {
  const { error } = await supabase.rpc("soft_delete_record", {
    table_name: table,
    record_id: id,
  });
  if (error) throw error;
}

// Próximo contador (mantém fallback como no original)
async function getNextCounter(counterId: "order" | "entry" | "exit") {
  const { data, error } = await supabase.rpc("get_next_counter", { counter_id: counterId });
  if (error) throw error;
  return (
    data ||
    `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  );
}

// Insert em massa
async function insertMany(table: string, rows: any[]) {
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw error;
}

// Subscrição genérica a alterações em tabela
function subscribeTable(table: string, onChange: () => void) {
  return supabase
    .channel(`public:${table}`)
    .on("postgres_changes", { event: "*", schema: "public", table }, onChange)
    .subscribe();
}

/* ========================================================================================
 * Tipos do contexto
 * ======================================================================================*/

interface DataContextType {
  // Products
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  getProductHistory: (id: string) => { entries: StockEntry[]; exits: StockExit[] };

  // Categories
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategory: (id: string) => Category | undefined;

  // Clients
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addClient: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  getClientHistory: (id: string) => { orders: Order[]; exits: StockExit[] };

  // Suppliers
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => Promise<Supplier>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplier: (id: string) => Supplier | undefined;
  getSupplierHistory: (id: string) => { entries: StockEntry[] };

  // Orders
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Omit<Order, "id" | "number">) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  findOrder: (id: string) => Order | undefined;
  findProduct: (id: string) => Product | undefined;
  findClient: (id: string) => Client | undefined;
  convertOrderToStockExit: (orderId: string, invoiceNumber?: string) => Promise<StockExit | undefined>;

  // Stock Entries
  stockEntries: StockEntry[];
  setStockEntries: React.Dispatch<React.SetStateAction<StockEntry[]>>;
  addStockEntry: (entry: Omit<StockEntry, "id" | "number" | "createdAt">) => Promise<StockEntry>;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => Promise<void>;
  deleteStockEntry: (id: string) => Promise<void>;

  // Stock Exits
  stockExits: StockExit[];
  setStockExits: React.Dispatch<React.SetStateAction<StockExit[]>>;
  addStockExit: (exit: Omit<StockExit, "id" | "number" | "createdAt">) => Promise<StockExit>;
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
    topSellingProducts: { id: string; name: string; totalQuantity: number; totalRevenue: number }[];
    mostProfitableProducts: { id: string; name: string; totalQuantity: number; totalRevenue: number }[];
    topClients: { id: string; name: string; purchaseCount: number; totalSpent: number; lastPurchaseDate: string }[];
    inactiveClients: {
      id: string;
      name: string;
      purchaseCount: number;
      totalSpent: number;
      lastPurchaseDate: string;
    }[];
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

/* ========================================================================================
 * Contexto
 * ======================================================================================*/

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
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

  /* -----------------------------------------------------------------------------
   * Fetch inicial
   * ---------------------------------------------------------------------------*/
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
          fetchStockExits(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  /* -----------------------------------------------------------------------------
   * Subscrições Realtime
   * ---------------------------------------------------------------------------*/
  useEffect(() => {
    const productsChannel = subscribeTable("products", fetchProducts);
    const categoriesChannel = subscribeTable("categories", fetchCategories);
    const clientsChannel = subscribeTable("clients", fetchClients);
    const suppliersChannel = subscribeTable("suppliers", fetchSuppliers);
    const ordersChannel = subscribeTable("orders", fetchOrders);
    const stockEntriesChannel = subscribeTable("stock_entries", fetchStockEntries);
    const stockExitsChannel = subscribeTable("stock_exits", fetchStockExits);
    const expensesChannel = subscribeTable("expenses", () => {
      // Mantém o comportamento original (apenas log)
      console.log("Expenses changed, triggering dashboard update");
    });

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(suppliersChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(stockEntriesChannel);
      supabase.removeChannel(stockExitsChannel);
      supabase.removeChannel(expensesChannel);
    };
  }, []);

  /* -----------------------------------------------------------------------------
   * Getters / helpers locais (mantêm assinaturas originais)
   * ---------------------------------------------------------------------------*/
  const getProduct = (id: string) => products.find((p) => p.id === id);
  const findProduct = (id: string) => products.find((p) => p.id === id);

  const getProductHistory = (id: string) => {
    const entries = stockEntries.filter((entry) => entry.items.some((item) => item.productId === id));
    const exits = stockExits.filter((exit) => exit.items.some((item) => item.productId === id));
    return { entries, exits };
  };

  const getCategory = (id: string) => categories.find((c) => c.id === id);

  const getClient = (id: string) => clients.find((c) => c.id === id);
  const findClient = (id: string) => clients.find((c) => c.id === id);

  const getClientHistory = (id: string) => {
    const clientOrders = orders.filter((o) => o.clientId === id);
    const clientExits = stockExits.filter((e) => e.clientId === id);
    return { orders: clientOrders, exits: clientExits };
  };

  const getSupplier = (id: string) => suppliers.find((s) => s.id === id);

  const getSupplierHistory = (id: string) => {
    const supplierEntries = stockEntries.filter((e) => e.supplierId === id);
    return { entries: supplierEntries };
  };

  const findOrder = (id: string) => orders.find((o) => o.id === id);

  /* -----------------------------------------------------------------------------
   * Business Analytics (sem alterações lógicas)
   * ---------------------------------------------------------------------------*/
  const getBusinessAnalytics = () => {
    const basicAnalytics = {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalClients: clients.length,
      totalSuppliers: suppliers.length,
      totalOrders: orders.length,
      totalStockEntries: stockEntries.length,
      totalStockExits: stockExits.length,
      lowStockProducts: products.filter((p) => p.currentStock <= p.minStock),
    };

    const totalRevenue = stockExits.reduce((sum, exit) => {
      const exitTotal = exit.items.reduce((itemSum, item) => {
        const itemPrice = item.salePrice * item.quantity;
        const discountAmount = item.discountPercent ? (itemPrice * item.discountPercent) / 100 : 0;
        return itemSum + (itemPrice - discountAmount);
      }, 0);

      const orderDiscount = exit.discount || 0;
      return sum + exitTotal * (1 - orderDiscount / 100);
    }, 0);

    const totalCost = stockEntries.reduce((sum, entry) => {
      return (
        sum +
        entry.items.reduce((itemSum, item) => {
          return itemSum + item.purchasePrice * item.quantity;
        }, 0)
      );
    }, 0);

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const currentStockValue = products.reduce((sum, product) => {
      return sum + product.purchasePrice * product.currentStock;
    }, 0);

    const productSales = products
      .map((product) => {
        const totalQuantity = stockExits.reduce((acc, exit) => {
          const productItems = exit.items.filter((item) => item.productId === product.id);
          return acc + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const totalRevenue = stockExits.reduce((acc, exit) => {
          const productItems = exit.items.filter((item) => item.productId === product.id);
          return (
            acc +
            productItems.reduce((itemSum, item) => {
              const itemTotal = item.salePrice * item.quantity;
              const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0;
              return itemSum + (itemTotal - discountAmount);
            }, 0)
          );
        }, 0);

        return { id: product.id, name: product.name, totalQuantity, totalRevenue };
      })
      .filter((p) => p.totalQuantity > 0)
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    const clientPurchases = clients
      .map((client) => {
        const clientExits = stockExits.filter((exit) => exit.clientId === client.id);
        const purchaseCount = clientExits.length;

        const totalSpent = clientExits.reduce((acc, exit) => {
          const exitTotal = exit.items.reduce((itemSum, item) => {
            const itemTotal = item.salePrice * item.quantity;
            const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0;
            return itemSum + (itemTotal - discountAmount);
          }, 0);

          const orderDiscount = exit.discount || 0;
          return acc + exitTotal * (1 - orderDiscount / 100);
        }, 0);

        let lastPurchaseDate = "Nunca";
        if (clientExits.length > 0) {
          const sortedExits = [...clientExits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          lastPurchaseDate = sortedExits[0].date;
        }

        return { id: client.id, name: client.name, purchaseCount, totalSpent, lastPurchaseDate };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveClients = clientPurchases
      .filter((client) => {
        if (client.lastPurchaseDate === "Nunca") return true;
        const lastPurchase = new Date(client.lastPurchaseDate);
        return lastPurchase < thirtyDaysAgo;
      })
      .sort((a, b) => {
        if (a.lastPurchaseDate === "Nunca" && b.lastPurchaseDate === "Nunca") return 0;
        if (a.lastPurchaseDate === "Nunca") return -1;
        if (b.lastPurchaseDate === "Nunca") return 1;
        return new Date(a.lastPurchaseDate).getTime() - new Date(b.lastPurchaseDate).getTime();
      });

    return {
      ...basicAnalytics,
      summary: { totalRevenue, totalCost, totalProfit, profitMargin, currentStockValue },
      topSellingProducts: productSales.slice(0, 5),
      mostProfitableProducts: [...productSales].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5),
      topClients: clientPurchases.slice(0, 5),
      inactiveClients,
    };
  };

  /* -----------------------------------------------------------------------------
   * Conversões
   * ---------------------------------------------------------------------------*/
  const convertOrderToStockExit = async (orderId: string, invoiceNumber?: string): Promise<StockExit | undefined> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    // Preserva exatamente os preços da encomenda, incluindo ofertas
    const stockExit: Omit<StockExit, "id" | "number" | "createdAt"> = {
      clientId: order.clientId,
      clientName: order.clientName || "",
      date: order.date, // usar a data da encomenda
      invoiceNumber: invoiceNumber || "",
      notes: `Converted from order ${order.number}`,
      fromOrderId: order.id,
      fromOrderNumber: order.number,
      discount: order.discount || 0,
      updatedAt: new Date().toISOString(),
      items: order.items.map((item) => ({
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice, // usar preço da encomenda
        discountPercent: item.discountPercent || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    return await addStockExit(stockExit);
  };

  /* -----------------------------------------------------------------------------
   * Fetchers (refatorados com helpers)
   * ---------------------------------------------------------------------------*/
  const fetchProducts = async () => fetchList("products", mapDbProductToProduct, setProducts, "name", "produtos");

  const fetchCategories = async () =>
    fetchList("categories", mapDbCategoryToCategory, setCategories, "name", "categorias");

  const fetchClients = async () => fetchList("clients", mapDbClientToClient, setClients, "name", "clientes");

  const fetchSuppliers = async () =>
    fetchList("suppliers", mapDbSupplierToSupplier, setSuppliers, "name", "fornecedores");

  const fetchOrders = async () =>
    fetchListWithItems(
      "orders",
      "order_items",
      (row, items) => mapDbOrderToOrder(row, items),
      setOrders,
      { column: "created_at", ascending: false },
      "encomendas",
    );

  const fetchStockEntries = async () =>
    fetchListWithItems(
      "stock_entries",
      "stock_entry_items",
      (row, items) => mapDbStockEntryToStockEntry(row, items),
      setStockEntries,
      { column: "created_at", ascending: false },
      "entradas de stock",
    );

  const fetchStockExits = async () =>
    fetchListWithItems(
      "stock_exits",
      "stock_exit_items",
      (row, items) => mapDbStockExitToStockExit(row, items),
      setStockExits,
      { column: "created_at", ascending: false },
      "saídas de stock",
    );

  /* -----------------------------------------------------------------------------
   * CRUD - Products
   * ---------------------------------------------------------------------------*/
  const addProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from("products")
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
          status: product.status,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add product");

      const newProduct = mapDbProductToProduct(data);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Erro ao adicionar produto");
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from("products")
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
          status: product.status,
        })
        .eq("id", id);

      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto");
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await softDeleteRecord("products", id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produto movido para a reciclagem");
    } catch (error) {
      console.error("Error soft deleting product:", error);
      toast.error("Erro ao apagar produto");
      throw error;
    }
  };

  /* -----------------------------------------------------------------------------
   * CRUD - Categories
   * ---------------------------------------------------------------------------*/
  const addCategory = async (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: category.name,
          description: category.description,
          status: category.status,
          product_count: category.productCount || 0,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add category");

      const newCategory = mapDbCategoryToCategory(data);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Erro ao adicionar categoria");
      throw error;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: category.name,
          description: category.description,
          status: category.status,
          product_count: category.productCount,
        })
        .eq("id", id);

      if (error) throw error;
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...category } : c)));
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Erro ao atualizar categoria");
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await softDeleteRecord("categories", id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Categoria movida para a reciclagem");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erro ao eliminar categoria");
      throw error;
    }
  };

  /* -----------------------------------------------------------------------------
   * CRUD - Clients
   * ---------------------------------------------------------------------------*/
  const addClient = async (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          tax_id: client.taxId,
          notes: client.notes,
          status: client.status,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add client");

      const newClient = mapDbClientToClient(data);
      setClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Erro ao adicionar cliente");
      throw error;
    }
  };

  const updateClient = async (id: string, client: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          tax_id: client.taxId,
          notes: client.notes,
          status: client.status,
        })
        .eq("id", id);

      if (error) throw error;
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...client } : c)));
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await softDeleteRecord("clients", id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Cliente movido para a reciclagem");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao eliminar cliente");
      throw error;
    }
  };

  /* -----------------------------------------------------------------------------
   * CRUD - Suppliers
   * ---------------------------------------------------------------------------*/
  const addSupplier = async (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          tax_id: supplier.taxId,
          payment_terms: supplier.paymentTerms,
          notes: supplier.notes,
          status: supplier.status,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add supplier");

      const newSupplier = mapDbSupplierToSupplier(data);
      setSuppliers((prev) => [...prev, newSupplier]);
      return newSupplier;
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Erro ao adicionar fornecedor");
      throw error;
    }
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from("suppliers")
        .update({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          tax_id: supplier.taxId,
          payment_terms: supplier.paymentTerms,
          notes: supplier.notes,
          status: supplier.status,
        })
        .eq("id", id);

      if (error) throw error;
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...supplier } : s)));
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Erro ao atualizar fornecedor");
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await softDeleteRecord("suppliers", id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success("Fornecedor movido para a reciclagem");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Erro ao eliminar fornecedor");
      throw error;
    }
  };

  /* -----------------------------------------------------------------------------
   * CRUD - Orders
   * ---------------------------------------------------------------------------*/
  const addOrder = async (order: Omit<Order, "id" | "number">) => {
    try {
      const orderNumber = await getNextCounter("order");

      // Inserção com campos de entrega (mantém original)
      const { data, error } = await supabase
        .from("orders")
        .insert({
          number: orderNumber,
          client_id: order.clientId,
          client_name: order.clientName,
          date: order.date,
          notes: order.notes,
          discount: order.discount,
          converted_to_stock_exit_id: order.convertedToStockExitId,
          converted_to_stock_exit_number: order.convertedToStockExitNumber,
          order_type: order.orderType || "combined",
          expected_delivery_date: order.expectedDeliveryDate || null,
          expected_delivery_time: order.expectedDeliveryTime || null,
          delivery_location: order.deliveryLocation || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add order");

      const orderItems = order.items.map((item) => mapOrderItemToDbOrderItem(item, data.id));
      await insertMany("order_items", orderItems);

      const newOrder: Order = {
        id: data.id,
        number: data.number,
        clientId: data.client_id || "",
        clientName: data.client_name || "",
        date: data.date,
        notes: data.notes || "",
        discount: Number(data.discount || 0),
        convertedToStockExitId: data.converted_to_stock_exit_id,
        convertedToStockExitNumber: data.converted_to_stock_exit_number,
        expectedDeliveryDate: data.expected_delivery_date || null,
        expectedDeliveryTime: data.expected_delivery_time || null,
        deliveryLocation: data.delivery_location || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: order.items,
        total: order.total,
      };

      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error("Erro ao adicionar encomenda");
      throw error;
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          client_id: order.clientId,
          client_name: order.clientName,
          date: order.date,
          notes: order.notes,
          discount: order.discount,
          converted_to_stock_exit_id: order.convertedToStockExitId,
          converted_to_stock_exit_number: order.convertedToStockExitNumber,
          order_type: order.orderType,
          expected_delivery_date: order.expectedDeliveryDate || null,
          expected_delivery_time: order.expectedDeliveryTime || null,
          delivery_location: order.deliveryLocation || null,
        })
        .eq("id", id);

      if (error) throw error;

      if (order.items) {
        const { error: deleteError } = await supabase.from("order_items").delete().eq("order_id", id);
        if (deleteError) throw deleteError;

        const orderItems = order.items.map((item) => mapOrderItemToDbOrderItem(item, id));
        await insertMany("order_items", orderItems);
      }

      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...order, items: order.items || o.items } : o)));
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erro ao atualizar encomenda");
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await softDeleteRecord("orders", id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Encomenda movida para a reciclagem");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erro ao eliminar encomenda");
      throw error;
    }
  };

  /* -----------------------------------------------------------------------------
   * CRUD - Stock Entries
   * ---------------------------------------------------------------------------*/
  const addStockEntry = async (entry: Omit<StockEntry, "id" | "number" | "createdAt">) => {
    try {
      const entryNumber = await getNextCounter("entry");

      const itemsWithIds = entry.items.map((item) =>
        item.id
          ? item
          : {
              ...item,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
      );

      const { data, error } = await supabase
        .from("stock_entries")
        .insert({
          number: entryNumber,
          supplier_id: entry.supplierId,
          supplier_name: entry.supplierName,
          date: entry.date,
          invoice_number: entry.invoiceNumber,
          notes: entry.notes,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add stock entry");

      const entryItems = itemsWithIds.map((item) => mapStockEntryItemToDbStockEntryItem(item, data.id));
      await insertMany("stock_entry_items", entryItems);

      // Atualização de stock (mantém lógica original)
      for (const item of itemsWithIds) {
        try {
          const { error: updateError } = await supabase
            .from("products")
            .select("current_stock")
            .eq("id", item.productId)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                return supabase
                  .from("products")
                  .update({ current_stock: data.current_stock + item.quantity })
                  .eq("id", item.productId);
              }
              return { error };
            });

          if (updateError) console.error("Error updating product stock:", updateError);
        } catch (err) {
          console.error("Error updating product stock:", err);
        }
      }

      await fetchProducts();
      toast.success("Entrada registada com sucesso");

      return {
        id: data.id,
        number: data.number,
        supplierId: data.supplier_id || "",
        supplierName: data.supplier_name,
        date: data.date,
        invoiceNumber: data.invoice_number || "",
        notes: data.notes || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: itemsWithIds,
        total: entry.total,
      };
    } catch (error) {
      console.error("Error adding stock entry:", error);
      toast.error("Erro ao adicionar entrada de stock");
      throw error;
    }
  };

  const updateStockEntry = async (id: string, entry: Partial<StockEntry>) => {
    try {
      const { error } = await supabase
        .from("stock_entries")
        .update({
          number: entry.number,
          supplier_id: entry.supplierId,
          supplier_name: entry.supplierName,
          date: entry.date,
          invoice_number: entry.invoiceNumber,
          notes: entry.notes,
        })
        .eq("id", id);

      if (error) throw error;
      setStockEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entry } : e)));
    } catch (error) {
      console.error("Error updating stock entry:", error);
      toast.error("Erro ao atualizar entrada de stock");
      throw error;
    }
  };

  const deleteStockEntry = async (id: string) => {
    try {
      await softDeleteRecord("stock_entries", id);
      setStockEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Compra movida para a reciclagem");
    } catch (error) {
      console.error("Error deleting stock entry:", error);
      toast.error("Erro ao eliminar entrada de stock");
      throw error;
    }
  };

  /* -----------------------------------------------------------------------------
   * CRUD - Stock Exits
   * ---------------------------------------------------------------------------*/
  const addStockExit = async (exit: Omit<StockExit, "id" | "number" | "createdAt">) => {
    try {
      const exitNumber = await getNextCounter("exit");

      const itemsWithIds = exit.items.map((item) =>
        item.id
          ? item
          : {
              ...item,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
      );

      const { data, error } = await supabase
        .from("stock_exits")
        .insert({
          number: exitNumber,
          client_id: exit.clientId,
          client_name: exit.clientName,
          date: exit.date,
          invoice_number: exit.invoiceNumber,
          notes: exit.notes,
          from_order_id: exit.fromOrderId,
          from_order_number: exit.fromOrderNumber,
          discount: exit.discount,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add stock exit");

      const exitItems = itemsWithIds.map((item) => mapStockExitItemToDbStockExitItem(item, data.id));
      await insertMany("stock_exit_items", exitItems);

      // Decremento de stock (mantém lógica original)
      for (const item of itemsWithIds) {
        try {
          const { error: updateError } = await supabase
            .from("products")
            .select("current_stock")
            .eq("id", item.productId)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                return supabase
                  .from("products")
                  .update({ current_stock: Math.max(0, data.current_stock - item.quantity) })
                  .eq("id", item.productId);
              }
              return { error };
            });

          if (updateError) console.error("Error updating product stock:", updateError);
        } catch (err) {
          console.error("Error updating product stock:", err);
        }
      }

      if (exit.fromOrderId) {
        const { error: orderUpdateError } = await supabase
          .from("orders")
          .update({
            converted_to_stock_exit_id: data.id,
            converted_to_stock_exit_number: exitNumber,
          })
          .eq("id", exit.fromOrderId);

        if (orderUpdateError) {
          console.error("Error updating order conversion status:", orderUpdateError);
        }
      }

      const newExit: StockExit = {
        id: data.id,
        number: data.number,
        clientId: data.client_id || "",
        clientName: data.client_name,
        date: data.date,
        invoiceNumber: data.invoice_number || "",
        notes: data.notes,
        fromOrderId: data.from_order_id,
        fromOrderNumber: data.from_order_number,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        discount: Number(data.discount || 0),
        items: itemsWithIds,
        total: exit.total,
      };

      await fetchProducts();
      await fetchOrders();
      setStockExits((prev) => [newExit, ...prev]);
      toast.success("Saída registada com sucesso");
      return newExit;
    } catch (error) {
      console.error("Error adding stock exit:", error);
      toast.error("Erro ao adicionar saída de stock");
      throw error;
    }
  };

  const updateStockExit = async (id: string, exit: Partial<StockExit>) => {
    try {
      const { error } = await supabase
        .from("stock_exits")
        .update({
          number: exit.number,
          client_id: exit.clientId,
          client_name: exit.clientName,
          date: exit.date,
          invoice_number: exit.invoiceNumber,
          notes: exit.notes,
        })
        .eq("id", id);

      if (error) throw error;
      setStockExits((prev) => prev.map((e) => (e.id === id ? { ...e, ...exit } : e)));
    } catch (error) {
      console.error("Error updating stock exit:", error);
      toast.error("Erro ao atualizar saída de stock");
      throw error;
    }
  };

  const deleteStockExit = async (id: string) => {
    try {
      // manter lógica de “restore” da encomenda associada
      const stockExit = stockExits.find((e) => e.id === id);

      await softDeleteRecord("stock_exits", id);

      if (stockExit?.fromOrderId) {
        const { error: updateOrderError } = await supabase
          .from("orders")
          .update({
            converted_to_stock_exit_id: null,
            converted_to_stock_exit_number: null,
          })
          .eq("id", stockExit.fromOrderId);

        if (updateOrderError) {
          console.error("Error restoring order:", updateOrderError);
        } else {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === stockExit.fromOrderId
                ? { ...o, convertedToStockExitId: null, convertedToStockExitNumber: null }
                : o,
            ),
          );
        }
      }

      setStockExits((prev) => prev.filter((e) => e.id !== id));
      toast.success("Venda movida para a reciclagem");
    } catch (error) {
      console.error("Error deleting stock exit:", error);
      toast.error("Erro ao eliminar saída de stock");
      throw error;
    }
  };

  /* -----------------------------------------------------------------------------
   * Utilitários adicionais
   * ---------------------------------------------------------------------------*/
  const updateProductStock = async (productId: string, quantity: number) => {
    const { data, error: fetchError } = await supabase
      .from("products")
      .select("current_stock")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("Error fetching product stock:", fetchError);
      throw fetchError;
    }

    const newStock = (data?.current_stock || 0) + quantity;
    const { error } = await supabase.from("products").update({ current_stock: newStock }).eq("id", productId);
    if (error) {
      console.error("Error updating product stock:", error);
      throw error;
    }
  };

  /* -----------------------------------------------------------------------------
   * Export/Import/Update (inalterado em comportamento)
   * ---------------------------------------------------------------------------*/
  const exportData = (type: ExportDataType) => {
    try {
      let dataToExport: any = {};

      switch (type) {
        case "products":
          dataToExport = products;
          break;
        case "categories":
          dataToExport = categories;
          break;
        case "clients":
          dataToExport = clients;
          break;
        case "suppliers":
          dataToExport = suppliers;
          break;
        case "orders":
          dataToExport = orders;
          break;
        case "stockEntries":
          dataToExport = stockEntries;
          break;
        case "stockExits":
          dataToExport = stockExits;
          break;
        case "expenses":
          dataToExport = [];
          break;
        case "all":
          dataToExport = {
            products,
            categories,
            clients,
            suppliers,
            orders,
            stockEntries,
            stockExits,
          };
          break;
        default:
          toast.error("Tipo de exportação inválido");
          return;
      }

      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `crm-${type}-backup-${timestamp}.json`;
      link.click();

      toast.success(`Exportação de ${type} concluída com sucesso!`);
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar dados");
    }
  };

  const importData = async (type: ExportDataType, data: string) => {
    // Mantém como no original (não implementado aqui)
  };

  const updateData = <T extends keyof DataState>(type: T, data: DataState[T]) => {
    switch (type) {
      case "products":
        setProducts(data as Product[]);
        toast.success("Produtos atualizados com sucesso");
        break;
      case "categories":
        setCategories(data as Category[]);
        toast.success("Categorias atualizadas com sucesso");
        break;
      case "clients":
        setClients(data as Client[]);
        toast.success("Clientes atualizados com sucesso");
        break;
      case "suppliers":
        setSuppliers(data as Supplier[]);
        toast.success("Fornecedores atualizados com sucesso");
        break;
      case "orders":
        setOrders(data as Order[]);
        toast.success("Encomendas atualizadas com sucesso");
        break;
      case "stockEntries":
        setStockEntries(data as StockEntry[]);
        toast.success("Entradas de stock atualizadas com sucesso");
        break;
      case "stockExits":
        setStockExits(data as StockExit[]);
        toast.success("Saídas de stock atualizadas com sucesso");
        break;
      default:
        toast.error("Tipo de dados inválido");
    }
  };

  /* -----------------------------------------------------------------------------
   * Context value
   * ---------------------------------------------------------------------------*/
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
    exportData,
    importData,
    updateData,
    getBusinessAnalytics,
    isLoading,
    setIsLoading,
  };

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export default DataProvider;
