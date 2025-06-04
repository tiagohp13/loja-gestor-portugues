
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ArrowLeft, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Expense } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchExpenseDetail(id);
    }
  }, [id]);

  const fetchExpenseDetail = async (expenseId: string) => {
    try {
      setIsLoading(true);
      
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_items(*)
        `)
        .eq('id', expenseId)
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
      toast.error('Erro ao carregar despesa');
    } finally {
      setIsLoading(false);
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gestorApp-gray mb-4">Esta despesa não existe ou foi removida.</p>
              <Button onClick={() => navigate('/despesas')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Histórico
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/despesas')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <PageHeader 
        title={`Despesa ${expense.number}`}
        description={`Detalhes da despesa de ${formatDate(expense.date)}`}
      />

      {/* Informações da Despesa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Informações da Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <dt className="text-gray-500 font-medium">Número</dt>
                <dd className="font-semibold">{expense.number}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <dt className="text-gray-500 font-medium">Data</dt>
                <dd className="font-semibold">{formatDate(expense.date)}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <dt className="text-gray-500 font-medium">Fornecedor</dt>
                <dd className="font-semibold">{expense.supplierName}</dd>
              </div>
              {expense.discount > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <dt className="text-gray-500 font-medium">Desconto</dt>
                  <dd className="font-semibold">{expense.discount}%</dd>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b">
                <dt className="text-gray-500 font-medium">Total</dt>
                <dd className="font-bold text-lg text-gestorApp-blue">{formatCurrency(expense.total || 0)}</dd>
              </div>
              {expense.notes && (
                <div className="pt-2">
                  <dt className="text-gray-500 font-medium mb-2">Observações</dt>
                  <dd className="text-sm bg-gray-50 p-3 rounded">{expense.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => navigate(`/despesas/${expense.id}/editar`)}
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Despesa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itens da Despesa */}
      <Card>
        <CardHeader>
          <CardTitle>Itens da Despesa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    PRODUTO/SERVIÇO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    QUANTIDADE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    PREÇO UNITÁRIO
                  </th>
                  {expense.items.some(item => item.discountPercent > 0) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      DESCONTO
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expense.items.map((item) => {
                  const itemTotal = item.quantity * item.unitPrice;
                  const discountAmount = itemTotal * (item.discountPercent / 100);
                  const finalTotal = itemTotal - discountAmount;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      {expense.items.some(item => item.discountPercent > 0) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                          {item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark text-right font-medium">
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
  );
};

export default ExpenseDetail;
