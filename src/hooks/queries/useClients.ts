import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/types";
import { mapClient } from "./mappers";

async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .is("deleted_at", null)
    .order("name");
  
  if (error) throw error;
  return (data || []).map(mapClient);
}

async function deleteClient(id: string) {
  const { error } = await supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

async function createClient(client: Omit<Client, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("clients")
    .insert(client)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function updateClient({ id, ...updates }: Partial<Client> & { id: string }) {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getClientById(id: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  
  if (error) throw error;
  return data ? mapClient(data) : null;
}

export function useClientsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    staleTime: 1000 * 60 * 10, // 10 minutes - aggressive caching for dashboard performance
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("Cliente eliminado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar cliente"),
  });

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Cliente criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar cliente"),
  });

  const updateMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar cliente"),
  });

  return {
    clients: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteClient: deleteMutation.mutate,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
  };
}

export function useClientQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getClientById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
