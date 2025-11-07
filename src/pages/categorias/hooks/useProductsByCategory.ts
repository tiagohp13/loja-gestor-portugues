import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct } from "@/hooks/queries/mappers";
import type { Product } from "@/types";

export function useProductsByCategory(categoryId?: string) {
  return useQuery({
    queryKey: ["productsByCategory", categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      // First fetch the category to get its name
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("name")
        .eq("id", categoryId)
        .is("deleted_at", null)
        .single();
      
      if (categoryError) throw categoryError;
      if (!categoryData) return [];
      
      // Then query products using the category name
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", categoryData.name)
        .is("deleted_at", null)
        .order("code", { ascending: true });
      
      if (error) throw error;
      
      // Apply natural sort for numeric codes
      const products = (data || []).map(mapProduct);
      return products.sort((a, b) => {
        const aNum = parseInt(a.code);
        const bNum = parseInt(b.code);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}
