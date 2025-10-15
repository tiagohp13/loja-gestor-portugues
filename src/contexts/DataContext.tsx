import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Product, Category, Client, Supplier, Order, StockEntry, StockExit, ExportDataType } from "../types";
import {
  mapDbProductToProduct,
  mapDbCategoryToCategory,
  mapDbClientToClient,
  mapDbSupplierToSupplier,
  mapDbOrderToOrder,
  mapDbStockEntryToStockEntry,
  mapDbStockExitToStockExit,
  mapOrderItemToDbOrderItem,
  mapStockEntryItemToDbStockEntryItem,
  mapStockExitItemToDbStockExitItem,
} from "../utils/mappers";

interface DataContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  stockEntries: StockEntry[];
  setStockEntries: React.Dispatch<React.SetStateAction<StockEntry[]>>;
  stockExits: StockExit[];
  setStockExits: React.Dispatch<React.SetStateAction<StockExit[]>>;
  exportData: (type: ExportDataType) => void;
  importData: (type: ExportDataType, data: string) => Promise<void>;
  updateData: <T extends keyof DataState>(type: T, data: DataState[T]) => void;
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
  if (!context) throw new Error("useData must be used within a DataProvider");
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

  // 🔹 Carregamento inicial
  useEffect(() => {
    const fetchAll = async () => {
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
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 🔹 Subscrições realtime Supabase
  useEffect(() => {
    const subscribe = (table: string, callback: () => void) =>
      supabase
        .channel(`public:${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, callback)
        .subscribe();

    const subs = [
      subscribe("products", fetchProducts),
      subscribe("categories", fetchCategories),
      subscribe("clients", fetchClients),
      subscribe("suppliers", fetchSuppliers),
      subscribe("orders", fetchOrders),
      subscribe("stock_entries", fetchStockEntries),
      subscribe("stock_exits", fetchStockExits),
    ];

    return () => subs.forEach((s) => supabase.removeChannel(s));
  }, []);

  // 🔔 Notificações automáticas simples
  useEffect(() => {
    if (!products.length && !orders.length) return;

    // 1️⃣ Produtos com stock baixo
    const lowStock = products.filter((p) => p.currentStock <= p.minStock);
    const previousLowStock = JSON.parse(localStorage.getItem("lowStockProducts") || "[]");

    const newLowStock = lowStock.filter((p) => !previousLowStock.includes(p.id));
    if (newLowStock.length > 0) {
      newLowStock.forEach((p) => toast.warning(`Produto com stock baixo: ${p.name}`));
      localStorage.setItem("lowStockProducts", JSON.stringify(lowStock.map((p) => p.id)));
    }

    // 2️⃣ Novas encomendas pendentes
    const pendingOrders = orders.filter((o) => !o.convertedToStockExitId && o.status !== "deleted");
    const previousOrders = JSON.parse(localStorage.getItem("pendingOrders") || "[]");

    const newPending = pendingOrders.filter((o) => !previousOrders.includes(o.id));
    if (newPending.length > 0) {
      newPending.forEach((o) => toast.info(`Nova encomenda pendente: ${o.number}`));
      localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders.map((o) => o.id)));
    }
  }, [products, orders]);

  // 🔹 Funções de fetch
  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").is("deleted_at", null).order("name");
    if (error) {
      toast.error("Erro ao carregar produtos");
      return;
    }
    if (data) setProducts(data.map(mapDbProductToProduct));
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").is("deleted_at", null).order("name");
    if (error) return toast.error("Erro ao carregar categorias");
    if (data) setCategories(data.map(mapDbCategoryToCategory));
  };

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*").is("deleted_at", null).order("name");
    if (error) return toast.error("Erro ao carregar clientes");
    if (data) setClients(data.map(mapDbClientToClient));
  };

  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from("suppliers").select("*").is("deleted_at", null).order("name");
    if (error) return toast.error("Erro ao carregar fornecedores");
    if (data) setSuppliers(data.map(mapDbSupplierToSupplier));
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items(*)`)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) return toast.error("Erro ao carregar encomendas");
    if (data) setOrders(data.map((o) => mapDbOrderToOrder(o, o.order_items || [])));
  };

  const fetchStockEntries = async () => {
    const { data, error } = await supabase
      .from("stock_entries")
      .select(`*, stock_entry_items(*)`)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) return toast.error("Erro ao carregar entradas de stock");
    if (data) setStockEntries(data.map((e) => mapDbStockEntryToStockEntry(e, e.stock_entry_items || [])));
  };

  const fetchStockExits = async () => {
    const { data, error } = await supabase
      .from("stock_exits")
      .select(`*, stock_exit_items(*)`)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) return toast.error("Erro ao carregar saídas de stock");
    if (data) setStockExits(data.map((e) => mapDbStockExitToStockExit(e, e.stock_exit_items || [])));
  };

  // 🔹 Exportação de dados
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
          dataToExport = { products, categories, clients, suppliers, orders, stockEntries, stockExits };
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
    } catch (err) {
      console.error("Erro ao exportar dados:", err);
      toast.error("Erro ao exportar dados");
    }
  };

  // 🔹 Importação (placeholder)
  const importData = async (type: ExportDataType, data: string) => {
    toast.info(`Importação de ${type} recebida`);
  };

  // 🔹 Atualização direta
  const updateData = <T extends keyof DataState>(type: T, data: DataState[T]) => {
    switch (type) {
      case "products":
        setProducts(data as Product[]);
        break;
      case "categories":
        setCategories(data as Category[]);
        break;
      case "clients":
        setClients(data as Client[]);
        break;
      case "suppliers":
        setSuppliers(data as Supplier[]);
        break;
      case "orders":
        setOrders(data as Order[]);
        break;
      case "stockEntries":
        setStockEntries(data as StockEntry[]);
        break;
      case "stockExits":
        setStockExits(data as StockExit[]);
        break;
    }
    toast.success("Dados atualizados com sucesso");
  };

  const contextValue: DataContextType = {
    products,
    setProducts,
    categories,
    setCategories,
    clients,
    setClients,
    suppliers,
    setSuppliers,
    orders,
    setOrders,
    stockEntries,
    setStockEntries,
    stockExits,
    setStockExits,
    exportData,
    importData,
    updateData,
    isLoading,
    setIsLoading,
  };

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export default DataProvider;
