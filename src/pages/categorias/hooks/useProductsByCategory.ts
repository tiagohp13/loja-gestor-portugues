import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct } from "@/hooks/queries/mappers";
import type { Product } from "@/types";

export function useProductsByCategory(categoryId?: string) {
  return useQuery({
    queryKey: ["productsByCategory", categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", categoryId)
        .is("deleted_at", null)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []).map(mapProduct);
    },
    staleTime: 5 * 60 * 1000,
  });
}
