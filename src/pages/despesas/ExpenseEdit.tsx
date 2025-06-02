import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatting';
import { Expense, ExpenseItem } from '@/types';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const ExpenseEdit = () => {
  useScrollToTop();
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expenses, suppliers, updateExpense } = useData();
  
  const expense = expenses.find(e => e.id === id);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    date: '',
    notes: '',
    discount: 0,
  });

  const [items, setItems] = useState<Omit<ExpenseItem, 'id' | 'expenseId' | 'createdAt' | 'updatedAt'>[]>([]);
  const [newItem, setNewItem] = useState({
    productName: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        supplierId: expense.supplierId || '',
        supplierName: expense.supplierName,
        date: expense.date.split('T')[0],
        notes: expense.notes || '',
        discount: expense.discount || 0,
      });
      
      setItems(expense.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent || 0,
      })));
    }
  }, [expense]);

  if (!expense) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Despesa não encontrada</h1>
          <Button onClick={() => navigate('/despesas/historico')}>
            Voltar ao Histórico
          </Button>
        </div>
      </div>
    );
  }

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setFormData(prev => ({
      ...prev,
      supplierId,
      supplierName: supplier?.name || '',
    }));
  };

  const addItem = () => {
    if (!newItem.productName || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast.error('Por favor, preencha todos os campos do produto');
      return;
    }

    setItems(prev => [...prev, { ...newItem }]);
    setNewItem({
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
    });
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item: typeof newItem) => {
    const total = item.quantity * item.unitPrice;
    const discountAmount = total * (item.discountPercent || 0) / 100;
    return total - discountAmount;
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const discountAmount = itemsTotal * (formData.discount || 0) / 100;
    return itemsTotal - discountAmount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId || !formData.supplierName) {
      toast.error('Por favor, selecione um fornecedor');
      return;
    }

    if (items.length === 0) {
      toast.error('Por favor, adicione pelo menos um produto');
      return;
    }

    const updatedExpense: Expense = {
      ...expense,
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      date: formData.date,
      notes: formData.notes,
      discount: formData.discount,
      items: items.map((item, index) => ({
        id: expense.items[index]?.id || '',
        expenseId: expense.id,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        createdAt: expense.items[index]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    updateExpense(updatedExpense, expense.id);
    navigate('/despesas/historico');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title={`Editar Despesa ${expense.number}`} />
      
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/despesas/historico')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Histórico
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Despesa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Fornecedor *</Label>
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
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Desconto (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre a despesa..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
              <div>
                <Label>Produto *</Label>
                <Input
                  value={newItem.productName}
                  onChange={(e) => setNewItem(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Nome do produto"
                />
              </div>
              
              <div>
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div>
                <Label>Preço Unitário (€) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label>Desconto (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newItem.discountPercent}
                  onChange={(e) => setNewItem(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="flex items-end">
                <Button type="button" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>

            {items.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{item.discountPercent}%</TableCell>
                      <TableCell>{formatCurrency(calculateItemTotal(item))}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total da Despesa:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Atualizar Despesa
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/despesas/historico')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseEdit;
