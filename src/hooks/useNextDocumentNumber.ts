import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DocumentType = "stock_entries" | "stock_exits" | "orders" | "expenses" | "requisicoes";

const counterTypeMap: Record<DocumentType, string> = {
  stock_entries: "stock_entries",
  stock_exits: "stock_exits",
  orders: "orders",
  expenses: "expenses",
  requisicoes: "requisicoes",
};

const prefixMap: Record<DocumentType, string> = {
  stock_entries: "COMP",
  stock_exits: "VEND",
  orders: "ENC",
  expenses: "DESP",
  requisicoes: "REQ",
};

async function fetchNextNumber(type: DocumentType): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Use peek function to preview next number without incrementing
  const { data, error } = await supabase.rpc("peek_next_counter_by_year", {
    counter_type: counterTypeMap[type],
    p_year: currentYear,
  });

  if (error) throw error;

  const nextNumber = typeof data === 'number' ? data : (parseInt(String(data ?? "1"), 10) || 1);
  const prefix = prefixMap[type];
  
  return `${prefix}-${currentYear}/${String(nextNumber).padStart(3, "0")}`;
}

export function useNextDocumentNumber(type: DocumentType) {
  return useQuery({
    queryKey: ["next-document-number", type],
    queryFn: () => fetchNextNumber(type),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60, // 1 minute
  });
}
