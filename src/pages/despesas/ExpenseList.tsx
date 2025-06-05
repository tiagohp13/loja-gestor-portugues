import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Edit, Trash2, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Expense } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    expenseId: string | null;
  }>({ open: false, expenseId: null });

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = expenses.filter(expense =>
        expense.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses(expenses);
    }
  }, [searchTerm, expenses]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`*, expense_items(*)`)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      if (expensesData) {
        const formattedExpenses: Expense[] = expensesData.map(expense => ({
          id: expense.id,
          number: expense.number,
          supplierId: expense.supplier_id || undefined,
          supplierName: expense.supplier_name,
          date: expense.date,
          notes: expense.notes || '',
          discount: Number(expense.discount || 0),
          createdAt: expense.created_at,
          updatedAt: expense.updated_at,
          items: (expense.expense_items || []).map((item: any) => ({
            id: item.id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            discountPercent: Number(item.discount_percent || 0),
            createdAt: item.created_at,
            updatedAt: item.updated_at
          })),
          total: (expense.expense_items || []).reduce((sum: number, item: any) => {
            const itemTotal = item.quantity * Number(item.unit_price);
            const itemDiscount = Number(item.discount_percent || 0);
            const discountAmount = itemTotal * (itemDiscount / 100);
            return sum + (itemTotal - discountAmount);
          }, 0) * (1 - Number(expense.discount || 0) / 100)
        }));

        setExpenses(formattedExpenses);
        setFilteredExpenses(formattedExpenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error: itemsError } = await supabase
        .from('expense_items')
        .delete()
        .eq('expense_id', expenseId);

      if (itemsError) throw itemsError;

      const { error: expenseError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (expenseError) throw expenseError;

      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      setFilteredExpenses(prev => prev.filter(e => e.id !== expenseId));
      toast.success('Despesa eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erro ao eliminar despesa');
    } finally {
      setDeleteDialog({ open: false, expenseId: null });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PageHeader title="Histórico de Despesas" description="Consulte e gerencie as suas despesas" />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gestorApp-blue mx-auto"></div>
            <p className="mt-2 text-gestorApp-gray">A carregar despesas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Histórico de Despesas" description="Consulte e gerencie as suas despesas" />
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gestorApp-blue">
            <Receipt className="w-5 h-5" />
            <span className="text-sm font-medium">Total de despesas: {filteredExpenses.length}</span>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray w-4 h-4" />
          <Input
            placeholder="Pesquisar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate('/despesas/nova')}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <div className="p-6">
              <EmptyState 
                title="Nenhuma despesa encontrada"
                description={searchTerm ? "Tente ajustar os filtros de pesquisa." : "Comece por adicionar uma nova despesa."}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">NÚMERO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">DATA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">FORNECEDOR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">TOTAL</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/despesas/${expense.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/despesas/${expense.id}`);
                          }}
                          className="text-sm font-medium text-gestorApp-blue hover:text-gestorApp-blue-dark underline"
                        >
                          {expense.number}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">{formatDate(expense.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">{expense.supplierName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark font-medium">{formatCurrency(expense.total || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/despesas/editar/${expense.id}`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ open: true, expenseId: expense.id });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, expenseId: null })}
        onDelete={() => {
          if (deleteDialog.expenseId) {
            handleDeleteExpense(deleteDialog.expenseId);
          }
        }}
        title="Eliminar Despesa"
        description="Tem a certeza que pretende eliminar esta despesa? Esta ação não pode ser desfeita."
        trigger={<div />}
      />
    </div>
  );
};

export default ExpenseList;
