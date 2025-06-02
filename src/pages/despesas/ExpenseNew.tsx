
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/formatting';

const ExpenseNew = () => {
  const navigate = useNavigate();
  const {
    suppliers,
    addExpense
  } = useData();

  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    date: new Date(),
    notes: '',
    discount: 0,
    items: [] as Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
    }>
  });

  const [newItem, setNewItem] = useState({
    productName: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setFormData({
      ...formData,
      supplierId,
      supplierName: supplier?.name || ''
    });
  };

  const addItem = () => {
    if (!newItem.productName.trim()) return;

    const item = {
      productName: newItem.productName,
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice || 0,
      discountPercent: newItem.discountPercent || 0
    };

    setFormData({
      ...formData,
      items: [...formData.items, item]
    });

    setNewItem({
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateItemTotal = (item: any) => {
    const baseTotal = item.quantity * item.unitPrice;
    const discountAmount = baseTotal * (item.discountPercent || 0) / 100;
    return baseTotal - discountAmount;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = subtotal * (formData.discount || 0) / 100;
    return subtotal - discountAmount;
  };

  const handleSubmit = () => {
    if (!formData.supplierName || formData.items.length === 0) {
      return;
    }

    const expense = {
      number: `DES-${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      date: formData.date.toISOString(),
      notes: formData.notes,
      discount: formData.discount,
      items: formData.items.map(item => ({
        id: crypto.randomUUID(),
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    };

    addExpense(expense);
    navigate('/despesas/historico');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Nova Despesa" 
        description="Registar uma nova despesa"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da Despesa */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Despesa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Fornecedor *</Label>
                  <Select value={formData.supplierId} onValueChange={handleSupplierChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fornecedor" />
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
                  <Label>Data da Despesa</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(formData.date, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, date });
                            setIsCalendarOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre a despesa..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Adicionar Item */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="productName">Produto/Serviço</Label>
                  <Input
                    id="productName"
                    value={newItem.productName}
                    onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                    placeholder="Nome do produto..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="unitPrice">Preço Unitário (€)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="discountPercent">Desconto (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={newItem.discountPercent}
                    onChange={(e) => setNewItem({ ...newItem, discountPercent: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Itens */}
          {formData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Itens da Despesa</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto/Serviço</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unitário</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{item.discountPercent}%</TableCell>
                        <TableCell>{formatCurrency(calculateItemTotal(item))}</TableCell>
                        <TableCell>
                          <Button
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumo */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Despesa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              
              <div>
                <Label htmlFor="discount">Desconto Geral (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={!formData.supplierName || formData.items.length === 0}
                >
                  Registar Despesa
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/despesas/historico')}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpenseNew;
