import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Receipt, Calendar, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Expense } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchExpenseDetail();
    }
  }, [id]);

  const fetchExpenseDetail = async () => {
    try {
      setIsLoading(true);
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select(`*, expense_items(*)`)
        .eq('id', id)
        .single();

      if (expenseError) throw expenseError;

      if (expenseData) {
        const formattedExpense: Expense = {
          id: expenseData.id,
          number: expenseData.number,
          supplierId: expenseData.supplier_id || undefined,
          supplierName: expenseData.supplier_name,
          date: expenseData.date,
          notes: expenseData.notes || '',
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
            updatedAt: item.updated_at
          })),
          total: (expenseData.expense_items || []).reduce((sum: number, item: any) => {
            const itemTotal = item.quantity * Number(item.unit_price);
            const itemDiscount = Number(item.discount_percent || 0);
            const discountAmount = itemTotal * (itemDiscount / 100);
            return sum + (itemTotal - discountAmount);
          }, 0) * (1 - Number(expenseData.discount || 0) / 100)
        };
        setExpense(formattedExpense);
      }
    } catch (error) {
      console.error('Error fetching expense detail:', error);
      toast.error('Erro ao carregar detalhes da despesa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error: itemsError } = await supabase.from('expense_items').delete().eq('expense_id', expenseId);
      if (itemsError) throw itemsError;

      const { error: expenseError } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (expenseError) throw expenseError;

      toast.success('Despesa eliminada com sucesso');
      navigate('/despesas/historico');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erro ao eliminar despesa');
    } finally {
      setDeleteDialog(false);
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
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size={32} />
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6">
        <PageHeader title="Despesa não encontrada" description="A despesa solicitada não foi encontrada" />
        <div className="flex justify-center mt-8">
          <Button onClick={() => navigate('/despesas/historico')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Histórico
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Despesa {expense.number}</h1>
          <p className="text-muted-foreground">{expense.supplierName}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/despesas/editar/${expense.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={() => navigate('/despesas/historico')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Expense Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Itens da Despesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Unitário
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Desconto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expense.items.map(item => {
                      const itemTotal = item.quantity * item.unitPrice;
                      const discountAmount = itemTotal * (item.discountPercent / 100);
                      const finalTotal = itemTotal - discountAmount;
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.discountPercent}%
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(finalTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Expense Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detalhes da Despesa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Data:</span>
                <span className="text-sm font-medium">{formatDate(expense.date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Fornecedor:</span>
                <span className="text-sm font-medium">{expense.supplierName}</span>
              </div>

              {expense.discount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Desconto Geral:</span>
                  <Badge variant="secondary">{expense.discount}%</Badge>
                </div>
              )}

              {expense.notes && (
                <div>
                  <span className="text-sm text-gray-500">Notas:</span>
                  <p className="text-sm mt-1">{expense.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Card */}
          <Card>
            <CardHeader>
              <CardTitle>Total da Despesa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(expense.total || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
