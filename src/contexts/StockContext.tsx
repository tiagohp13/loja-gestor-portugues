import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/errorUtils";
import { StockEntry, StockExit } from "../types";
import {
  mapDbStockEntryToStockEntry,
  mapDbStockExitToStockExit,
  mapStockEntryItemToDbStockEntryItem,
  mapStockExitItemToDbStockExitItem,
} from "../utils/mappers";

interface StockContextType {
  stockEntries: StockEntry[];
  stockExits: StockExit[];
  setStockEntries: React.Dispatch<React.SetStateAction<StockEntry[]>>;
  setStockExits: React.Dispatch<React.SetStateAction<StockExit[]>>;
  addStockEntry: (entry: Omit<StockEntry, "id" | "number" | "createdAt">) => Promise<StockEntry>;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => Promise<void>;
  deleteStockEntry: (id: string) => Promise<void>;
  addStockExit: (exit: Omit<StockExit, "id" | "number" | "createdAt">) => Promise<StockExit>;
  updateStockExit: (id: string, exit: Partial<StockExit>) => Promise<void>;
  deleteStockExit: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshStock: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
};

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStockEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_entries")
        .select(
          `
          *,
          stock_entry_items(*)
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedEntries = data.map((entry) => {
          const items = entry.stock_entry_items || [];
          return mapDbStockEntryToStockEntry(entry, items);
        });

        setStockEntries(formattedEntries);
      }
    } catch (error) {
      console.error("Error fetching stock entries:", error);
      toast.error("Erro ao carregar entradas de stock");
    }
  };

  const fetchStockExits = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_exits")
        .select(
          `
          *,
          stock_exit_items(*)
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedExits = data.map((exit) => {
          const items = exit.stock_exit_items || [];
          return mapDbStockExitToStockExit(exit, items);
        });

        setStockExits(formattedExits);
      }
    } catch (error) {
      console.error("Error fetching stock exits:", error);
      toast.error("Erro ao carregar saídas de stock");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStockEntries(), fetchStockExits()]);
      setIsLoading(false);
    };

    fetchData();

    // Realtime subscriptions
    const entriesChannel = supabase
      .channel("public:stock_entries")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_entries" }, () => {
        fetchStockEntries();
      })
      .subscribe();

    const exitsChannel = supabase
      .channel("public:stock_exits")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_exits" }, () => {
        fetchStockExits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(entriesChannel);
      supabase.removeChannel(exitsChannel);
    };
  }, []);

  const addStockEntry = useCallback(async (entry: Omit<StockEntry, "id" | "number" | "createdAt">) => {
    try {
      const currentYear = new Date().getFullYear();
      const { data: entryNumberData, error: entryNumberError } = await supabase.rpc("get_next_counter_by_year", {
        counter_type: "stock_entries",
        p_year: currentYear
      });

      if (entryNumberError) throw entryNumberError;

      const entryNumber = `ENT-${currentYear}/${String(entryNumberData || 1).padStart(3, "0")}`;

      const itemsWithIds = entry.items.map((item) => {
        if (!item.id) {
          return {
            ...item,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });

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

      const { error: itemsError } = await supabase.from("stock_entry_items").insert(entryItems);

      if (itemsError) throw itemsError;

      // Update product stock
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
                  .update({
                    current_stock: data.current_stock + item.quantity,
                  })
                  .eq("id", item.productId);
              }
              return { error };
            });

          if (updateError) {
            console.error("Error updating product stock:", updateError);
          }
        } catch (error) {
          console.error("Error updating product stock:", error);
        }
      }

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
      toast.error(getUserFriendlyError(error, "Não foi possível criar a compra"));
      throw error;
    }
  }, []);

  const updateStockEntry = useCallback(async (id: string, entry: Partial<StockEntry>) => {
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

      setStockEntries(stockEntries.map((e) => (e.id === id ? { ...e, ...entry } : e)));
      toast.success("Compra atualizada com sucesso");
    } catch (error) {
      console.error("Error updating stock entry:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível atualizar a compra"));
      throw error;
    }
  }, [stockEntries]);

  const deleteStockEntry = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.rpc("soft_delete_record", {
        table_name: "stock_entries",
        record_id: id,
      });

      if (error) throw error;

      setStockEntries(stockEntries.filter((e) => e.id !== id));
      toast.success("Compra eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting stock entry:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível eliminar a compra"));
      throw error;
    }
  }, [stockEntries]);

  const addStockExit = useCallback(async (exit: Omit<StockExit, "id" | "number" | "createdAt">) => {
    try {
      const currentYear = new Date().getFullYear();
      const { data: exitNumberData, error: exitNumberError } = await supabase.rpc("get_next_counter_by_year", {
        counter_type: "stock_exits",
        p_year: currentYear
      });

      if (exitNumberError) throw exitNumberError;

      const exitNumber = `SAI-${currentYear}/${String(exitNumberData || 1).padStart(3, "0")}`;

      const itemsWithIds = exit.items.map((item) => {
        if (!item.id) {
          return {
            ...item,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });

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

      const { error: itemsError } = await supabase.from("stock_exit_items").insert(exitItems);

      if (itemsError) throw itemsError;

      // Update product stock
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
                  .update({
                    current_stock: Math.max(0, data.current_stock - item.quantity),
                  })
                  .eq("id", item.productId);
              }
              return { error };
            });

          if (updateError) {
            console.error("Error updating product stock:", updateError);
          }
        } catch (error) {
          console.error("Error updating product stock:", error);
        }
      }

      // Update order conversion status if applicable
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

      toast.success("Venda criada com sucesso");

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

      return newExit;
    } catch (error) {
      console.error("Error adding stock exit:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível criar a venda"));
      throw error;
    }
  }, []);

  const updateStockExit = useCallback(async (id: string, exit: Partial<StockExit>) => {
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

      setStockExits(stockExits.map((e) => (e.id === id ? { ...e, ...exit } : e)));
      toast.success("Venda atualizada com sucesso");
    } catch (error) {
      console.error("Error updating stock exit:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível atualizar a venda"));
      throw error;
    }
  }, [stockExits]);

  const deleteStockExit = useCallback(async (id: string) => {
    try {
      const stockExit = stockExits.find((e) => e.id === id);

      const { error } = await supabase.rpc("soft_delete_record", {
        table_name: "stock_exits",
        record_id: id,
      });

      if (error) throw error;

      // Restore order if needed
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
        }
      }

      setStockExits(stockExits.filter((e) => e.id !== id));
      toast.success("Venda eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting stock exit:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível eliminar a venda"));
      throw error;
    }
  }, [stockExits]);

  const refreshStock = useCallback(async () => {
    await Promise.all([fetchStockEntries(), fetchStockExits()]);
  }, []);

  const contextValue = useMemo(() => ({
    stockEntries,
    stockExits,
    setStockEntries,
    setStockExits,
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    addStockExit,
    updateStockExit,
    deleteStockExit,
    isLoading,
    refreshStock,
  }), [stockEntries, stockExits, addStockEntry, updateStockEntry, deleteStockEntry, addStockExit, updateStockExit, deleteStockExit, isLoading, refreshStock]);

  return (
    <StockContext.Provider value={contextValue}>
      {children}
    </StockContext.Provider>
  );
};
