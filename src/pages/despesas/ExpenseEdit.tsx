
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Expense, Supplier, ExpenseItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ExpenseEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    date: '',
    notes: '',
    items: [] as Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>[]
  });

  useEffect(() => {
    if (id) {
      fetchExpenseAndSuppliers();
    }
  }, [id]);

  const fetchExpenseAndSuppliers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch expense details
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_items(*)
        `)
        .eq('id', id)
        .single();

      if (expenseError) throw expenseError;

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (suppliersError) throw suppliersError;

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
          total: 0
        };

        setExpense(formattedExpense);
        setFormData({
          supplierId: formattedExpense.supplierId || '',
          supplierName: formattedExpense.supplierName,
          date: formattedExpense.date,
          notes: formattedExpense.notes,
          items: formattedExpense.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent
          }))
        });
      }

      if (suppliersData) {
        const formattedSuppliers: Supplier[] = suppliersData.map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          taxId: supplier.tax_id || '',
          paymentTerms: supplier.payment_terms || '',
          notes: supplier.notes || '',
          createdAt: supplier.created_at,
          updatedAt: supplier.updated_at,
          status: supplier.status
        }));
        setSuppliers(formattedSuppliers);
      }
    } catch (error) {
      console.error('Error fetching expense details:', error);
      toast.error('Erro ao carregar detalhes da despesa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setFormData({
      ...formData,
      supplierId,
      supplierName: supplier?.name || ''
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productName: '',
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0
        }
      ]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: keyof Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = itemTotal * (item.discountPercent / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      toast.error('Por favor selecione um fornecedor');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Por favor adicione pelo menos um item');
      return;
    }

    if (formData.items.some(item => !item.productName.trim())) {
      toast.error('Por favor preencha o nome de todos os produtos');
      return;
    }

    try {
      setIsSaving(true);

      // Update expense
      const { error: expenseError } = await supabase
        .from('expenses')
        .update({
          supplier_id: formData.supplierId,
          supplier_name: formData.supplierName,
          date: formData.date,
          notes: formData.notes
        })
        .eq('id', id);

      if (expenseError) throw expenseError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('expense_items')
        .delete()
        .eq('expense_id', id);

      if (deleteError) throw deleteError;

      // Create new expense items
      const itemsToInsert = formData.items.map(item => ({
        expense_id: id,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent
      }));

      const { error: itemsError } = await supabase
        .from('expense_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('Despesa atualizada com sucesso');
      navigate(`/despesas/${id}`);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Erro ao atualizar despesa');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
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
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/despesas/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Despesa {expense.number}</h1>
            <p className="text-muted-foreground">Atualize os dados da despesa</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Select value={formData.supplierId} onValueChange={handleSupplierChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionais..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Itens da Despesa</CardTitle>
                  <Button type="button" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                      <div className="col-span-4">
                        <Label>Nome do Produto</Label>
                        <Input
                          value={item.productName}
                          onChange={(e) => updateItem(index, 'productName', e.target.value)}
                          placeholder="Nome do produto"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Preço Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Desconto (%)</Label>
                        <Input
                          type="number"
                          value={item.discountPercent}
                          onChange={(e) => updateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label>Total</Label>
                        <div className="text-sm font-medium py-2">
                          {formatCurrency(item.quantity * item.unitPrice * (1 - item.discountPercent / 100))}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Total Card */}
            <Card>
              <CardHeader>
                <CardTitle>Total da Despesa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(calculateTotal())}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'A guardar...' : 'Guardar Alterações'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/despesas/${id}`)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseEdit;
