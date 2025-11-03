import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/types";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { mapClient } from "./mappers";

const PAGE_SIZE = 25;

async function fetchPaginatedClients(page: number = 0): Promise<{ clients: Client[]; totalCount: number }> {
  const { count } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .is("deleted_at", null)
    .order("name")
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  
  if (error) throw error;
  return {
    clients: (data || []).map(mapClient),
    totalCount: count || 0,
  };
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
  const payload = toInsert(client);
  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function updateClient({ id, ...updates }: Partial<Client> & { id: string }) {
  const payload = toUpdate(updates);
  const { data, error } = await supabase
    .from("clients")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export function usePaginatedClients(page: number = 0) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clients-paginated", page],
    queryFn: () => fetchPaginatedClients(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: async () => {
      toast.success("Cliente eliminado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["clients-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar cliente"),
  });

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: async () => {
      toast.success("Cliente criado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["clients-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar cliente"),
  });

  const updateMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: async () => {
      toast.success("Cliente atualizado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["clients-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar cliente"),
  });

  return {
    clients: query.data?.clients || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteClient: deleteMutation.mutate,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
  };
}
