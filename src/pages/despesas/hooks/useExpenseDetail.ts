import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Expense } from "@/types";

async function fetchExpenseDetail(id: string): Promise<Expense | null> {
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select(`*, expense_items(*)`)
    .eq("id", id)
    .maybeSingle();

  if (expenseError) throw expenseError;
  if (!expenseData) return null;

  const formattedExpense: Expense = {
    id: expenseData.id,
    number: expenseData.number,
    supplierId: expenseData.supplier_id || undefined,
    supplierName: expenseData.supplier_name,
    date: expenseData.date,
    notes: expenseData.notes || "",
    discount: Number(expenseData.discount || 0),
    createdAt: expenseData.created_at,
    updatedAt: expenseData.updated_at,
    items: (expenseData.expense_items || []).map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      discountPercent: Number(item.discount_percent || 0),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
    total:
      (expenseData.expense_items || []).reduce((sum: number, item: any) => {
        const itemTotal = item.quantity * Number(item.unit_price);
        const itemDiscount = Number(item.discount_percent || 0);
        const discountAmount = itemTotal * (itemDiscount / 100);
        return sum + (itemTotal - discountAmount);
      }, 0) *
      (1 - Number(expenseData.discount || 0) / 100),
  };

  return formattedExpense;
}

export function useExpenseDetail() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: ["expense-detail", id],
    queryFn: () => fetchExpenseDetail(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    expense: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
