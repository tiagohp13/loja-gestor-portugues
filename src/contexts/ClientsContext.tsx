import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/errorUtils";
import { Client } from "../types";
import { mapDbClientToClient } from "../utils/mappers";

interface ClientsContextType {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addClient: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  findClient: (id: string) => Client | undefined;
  isLoading: boolean;
  refreshClients: () => Promise<void>;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return context;
};

export const ClientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;

      if (data) {
        const formattedClients = data.map(mapDbClientToClient);
        setClients(formattedClients);
      }
    } catch (error) {
      // Error handled by toast
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();

    // Realtime subscription
    const channel = supabase
      .channel("public:clients")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
        fetchClients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getClient = useCallback((id: string): Client | undefined => {
    return clients.find((client) => client.id === id);
  }, [clients]);

  const findClient = useCallback((id: string): Client | undefined => {
    return clients.find((client) => client.id === id);
  }, [clients]);

  const addClient = useCallback(async (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
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

      if (data) {
        const newClient = mapDbClientToClient(data);
        setClients([...clients, newClient]);
        toast.success("Cliente criado com sucesso");
        return newClient;
      }

      throw new Error("Failed to add client");
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível criar o cliente"));
      throw error;
    }
  }, [clients]);

  const updateClient = useCallback(async (id: string, client: Partial<Client>) => {
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

      setClients(clients.map((c) => (c.id === id ? { ...c, ...client } : c)));
      toast.success("Cliente atualizado com sucesso");
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível atualizar o cliente"));
      throw error;
    }
  }, [clients]);

  const deleteClient = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.rpc("soft_delete_record", {
        table_name: "clients",
        record_id: id,
      });

      if (error) throw error;

      setClients(clients.filter((c) => c.id !== id));
      toast.success("Cliente eliminado com sucesso");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível eliminar o cliente"));
      throw error;
    }
  }, [clients]);

  const refreshClients = useCallback(async () => {
    await fetchClients();
  }, []);

  const contextValue = useMemo(() => ({
    clients,
    setClients,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    findClient,
    isLoading,
    refreshClients,
  }), [clients, addClient, updateClient, deleteClient, getClient, findClient, isLoading, refreshClients]);

  return (
    <ClientsContext.Provider value={contextValue}>
      {children}
    </ClientsContext.Provider>
  );
};
