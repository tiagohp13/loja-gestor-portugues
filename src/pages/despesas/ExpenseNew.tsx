
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Supplier, ExpenseItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';

interface ExpenseFormData {
  supplierId: string;
  supplierName: string;
  date: string;
  notes: string;
  discount: number;
  items: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>[];
}

const ExpenseNew = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    discount: 0,
    items: []
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedSuppliers: Supplier[] = data.map(supplier => ({
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
      console.error('Error fetching suppliers:', error);
      toast.error('Erro ao carregar fornecedores');
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
    const itemsTotal = formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = itemTotal * (item.discountPercent / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);

    const generalDiscount = itemsTotal * (formData.discount / 100);
    return itemsTotal - generalDiscount;
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
      setIsLoading(true);

      // Get next expense number
      const { data: numberData, error: numberError } = await supabase
        .rpc('get_next_counter', { counter_id: 'expense' });

      if (numberError) throw numberError;

      const expenseNumber = numberData || `DES-${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Create expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          number: expenseNumber,
          supplier_id: formData.supplierId,
          supplier_name: formData.supplierName,
          date: formData.date,
          notes: formData.notes,
          discount: formData.discount
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense items
      const itemsToInsert = formData.items.map(item => ({
        expense_id: expenseData.id,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent
      }));

      const { error: itemsError } = await supabase
        .from('expense_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('Despesa criada com sucesso');
      navigate('/despesas/historico');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Erro ao criar despesa');
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

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Nova Despesa" 
        subtitle="Criar uma nova despesa interna"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Despesa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Fornecedor *</Label>
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
              <Label htmlFor="date">Data da Despesa *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionais sobre a despesa..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Itens da Despesa</CardTitle>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gestorApp-gray">
                <p>Nenhum item adicionado ainda.</p>
                <Button type="button" onClick={addItem} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unitário</TableHead>
                    <TableHead>Desconto (%)</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => {
                    const itemTotal = item.quantity * item.unitPrice;
                    const discountAmount = itemTotal * (item.discountPercent / 100);
                    const subtotal = itemTotal - discountAmount;

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.productName}
                            onChange={(e) => updateItem(index, 'productName', e.target.value)}
                            placeholder="Nome do produto"
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discountPercent}
                            onChange={(e) => updateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(subtotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {formData.items.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="discount">Desconto Geral (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div></div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gestorApp-blue">
                    Total: {formatCurrency(calculateTotal())}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/despesas/historico')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'A guardar...' : 'Guardar Despesa'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseNew;
