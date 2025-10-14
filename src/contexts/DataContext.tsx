// ✅ DataProvider.tsx (versão atualizada)

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

interface DataContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  getProductHistory: (id: string) => { entries: StockEntry[]; exits: StockExit[] };

  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategory: (id: string) => Category | undefined;

  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addClient: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  getClientHistory: (id: string) => { orders: Order[]; exits: StockExit[] };

  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => Promise<Supplier>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplier: (id: string) => Supplier | undefined;
  getSupplierHistory: (id: string) => { entries: StockEntry[] };

  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Omit<Order, "id" | "number">) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  findOrder: (id: string) => Order | undefined;
  findProduct: (id: string) => Product | undefined;
  findClient: (id: string) => Client | undefined;
  convertOrderToStockExit: (orderId: string, invoiceNumber?: string) => Promise<StockExit | undefined>;

  stockEntries: StockEntry[];
  setStockEntries: React.Dispatch<React.SetStateAction<StockEntry[]>>;
  addStockEntry: (entry: Omit<StockEntry, "id" | "number" | "createdAt">) => Promise<StockEntry>;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => Promise<void>;
  deleteStockEntry: (id: string) => Promise<void>;

  stockExits: StockExit[];
  setStockExits: React.Dispatch<React.SetStateAction<StockExit[]>>;
  addStockExit: (exit: Omit<StockExit, "id" | "number" | "createdAt">) => Promise<StockExit>;
  updateStockExit: (id: string, exit: Partial<StockExit>) => Promise<void>;
  deleteStockExit: (id: string) => Promise<void>;

  exportData: (type: ExportDataType) => void;
  importData: (type: ExportDataType, data: string) => Promise<void>;
  updateData: <T extends keyof DataState>(type: T, data: DataState[T]) => void;

  getBusinessAnalytics: () => any;

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

  // --- (todas as funções fetch, analytics e helpers mantêm-se iguais) ---

  // ✅ Função corrigida
  const addOrder = async (order: Omit<Order, "id" | "number">) => {
    try {
      const { data: orderNumberData, error: orderNumberError } = await supabase.rpc("get_next_counter", {
        counter_id: "order",
      });

      if (orderNumberError) throw orderNumberError;

      const orderNumber =
        orderNumberData ||
        `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`;

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
          // ✅ novos campos de entrega
          expected_delivery_date: order.expectedDeliveryDate || null,
          expected_delivery_time: order.expectedDeliveryTime || null,
          delivery_location: order.deliveryLocation || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add order");

      const orderItems = order.items.map((item) => mapOrderItemToDbOrderItem(item, data.id));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) throw itemsError;

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

      setOrders([newOrder, ...orders]);
      return newOrder;
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error("Erro ao adicionar encomenda");
      throw error;
    }
  };

  // --- (restante código igual ao teu atual) ---

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
