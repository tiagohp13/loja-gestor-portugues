import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { camelToSnake } from "@/integrations/supabase/utils/formatUtils";

interface Expense {
  id: string;
  number: string;
  supplierId?: string;
  supplierName: string;
  date: string;
  notes?: string;
  items: ExpenseItem[];
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ExpenseItem {
  id?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
}

async function fetchExpenses(): Promise<Expense[]> {
  const { data: expensesData, error: expensesError } = await supabase
    .from("expenses")
    .select("id, number, supplier_id, supplier_name, date, notes, discount, status, user_id, created_at, updated_at, deleted_at")
    .is("deleted_at", null)
    .order("date", { ascending: false });

  if (expensesError) throw expensesError;

  const expenses = await Promise.all(
    (expensesData || []).map(async (expense) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from("expense_items")
        .select("id, expense_id, product_name, quantity, unit_price, discount_percent, created_at, updated_at")
        .eq("expense_id", expense.id);

      if (itemsError) throw itemsError;

      const items = (itemsData || []).map((item: any) => ({
        id: item.id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        discountPercent: Number(item.discount_percent || 0),
      }));

      const total = items.reduce((sum, item) => {
        const subtotal = item.quantity * item.unitPrice;
        const discount = subtotal * ((item.discountPercent || 0) / 100);
        return sum + (subtotal - discount);
      }, 0);

      return {
        id: expense.id,
        number: expense.number,
        supplierId: expense.supplier_id,
        supplierName: expense.supplier_name,
        date: expense.date,
        notes: expense.notes,
        items,
        total,
        createdAt: expense.created_at,
        updatedAt: expense.updated_at,
      };
    })
  );

  return expenses;
}

async function deleteExpense(id: string) {
  const { error } = await supabase
    .from("expenses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

async function createExpense(expense: any) {
  const { items, ...expenseData } = expense;
  
  const expensePayload = toInsert(expenseData);
  
  const { data: newExpense, error } = await supabase
    .from("expenses")
    .insert(expensePayload)
    .select()
    .single();
  
  if (error) throw error;
  
  if (items && items.length > 0) {
    const itemsWithExpenseId = items.map((item: any) => ({
      ...camelToSnake(item),
      expense_id: newExpense.id,
    }));
    
    const { error: itemsError } = await supabase
      .from("expense_items")
      .insert(itemsWithExpenseId);
    
    if (itemsError) throw itemsError;
  }
  
  return newExpense;
}

async function updateExpense({ id, items, ...updates }: any) {
  const updatePayload = toUpdate(updates);
  
  const { error } = await supabase
    .from("expenses")
    .update(updatePayload)
    .eq("id", id);
  
  if (error) throw error;
  
  if (items !== undefined) {
    const { error: deleteError } = await supabase
      .from("expense_items")
      .delete()
      .eq("expense_id", id);
    
    if (deleteError) throw deleteError;
    
    if (items.length > 0) {
      const itemsWithExpenseId = items.map((item: any) => ({
        ...camelToSnake(item),
        expense_id: id,
      }));
      
      const { error: insertError } = await supabase
        .from("expense_items")
        .insert(itemsWithExpenseId);
      
      if (insertError) throw insertError;
    }
  }
  
  return id;
}

export function useExpensesQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: async () => {
      toast.success("Despesa eliminada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar despesa"),
  });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: async () => {
      toast.success("Despesa criada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar despesa"),
  });

  const updateMutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: async () => {
      toast.success("Despesa atualizada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar despesa"),
  });

  return {
    expenses: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteExpense: deleteMutation.mutate,
    createExpense: createMutation.mutate,
    updateExpense: updateMutation.mutate,
  };
}
