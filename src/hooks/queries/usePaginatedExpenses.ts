import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { camelToSnake } from "@/integrations/supabase/utils/formatUtils";

const PAGE_SIZE = 25;

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

async function fetchPaginatedExpenses(page: number = 0): Promise<{ expenses: Expense[]; totalCount: number }> {
  const { count } = await supabase
    .from("expenses")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data: expensesData, error: expensesError } = await supabase
    .from("expenses")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (expensesError) throw expensesError;

  if (!expensesData || expensesData.length === 0) {
    return {
      expenses: [],
      totalCount: count || 0,
    };
  }

  // Fetch all items in a single query
  const expenseIds = expensesData.map(expense => expense.id);
  const { data: allItemsData, error: itemsError } = await supabase
    .from("expense_items")
    .select("*")
    .in("expense_id", expenseIds);

  if (itemsError) throw itemsError;

  // Group items by expense_id
  const itemsByExpenseId = (allItemsData || []).reduce((acc, item) => {
    if (!acc[item.expense_id!]) {
      acc[item.expense_id!] = [];
    }
    acc[item.expense_id!].push(item);
    return acc;
  }, {} as Record<string, typeof allItemsData>);

  // Map expenses with their items
  const expenses = expensesData.map((expense) => {
    const items = (itemsByExpenseId[expense.id] || []).map((item: any) => ({
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
  });

  return {
    expenses,
    totalCount: count || 0,
  };
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

export function usePaginatedExpenses(page: number = 0) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["expenses-paginated", page],
    queryFn: () => fetchPaginatedExpenses(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: async () => {
      toast.success("Despesa eliminada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["expenses-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar despesa"),
  });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: async () => {
      toast.success("Despesa criada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["expenses-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar despesa"),
  });

  const updateMutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: async () => {
      toast.success("Despesa atualizada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["expenses-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar despesa"),
  });

  return {
    expenses: query.data?.expenses || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteExpense: deleteMutation.mutate,
    createExpense: createMutation.mutate,
    updateExpense: updateMutation.mutate,
  };
}
