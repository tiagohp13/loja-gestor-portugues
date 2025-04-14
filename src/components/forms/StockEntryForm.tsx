
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Form validation schema
const formSchema = z.object({
  supplierId: z.string().min(1, { message: 'Selecione um fornecedor' }),
  date: z.date(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

interface ItemRow {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

interface StockEntryFormProps {
  onSubmit: (data: any) => Promise<void>;
  type?: 'purchase' | 'consumption';
}

const StockEntryForm: React.FC<StockEntryFormProps> = ({ onSubmit, type = 'purchase' }) => {
  const navigate = useNavigate();
  const { suppliers, products } = useData();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: '',
      date: new Date(),
      invoiceNumber: '',
      notes: '',
    },
  });
  
  const addItem = () => {
    if (items.length < products.length) {
      setItems([
        ...items,
        {
          id: crypto.randomUUID(),
          productId: '',
          productName: '',
          quantity: 1,
          purchasePrice: 0,
        },
      ]);
    } else {
      toast.error('Todos os produtos já foram adicionados');
    }
  };
  
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const updateItem = (id: string, field: keyof ItemRow, value: any) => {
    setItems(
      items.map(item => {
        if (item.id === id) {
          if (field === 'productId') {
            const product = products.find(p => p.id === value);
            return {
              ...item,
              productId: value,
              productName: product?.name || '',
              purchasePrice: product?.purchasePrice || 0,
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };
  
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.purchasePrice), 0);
  };
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }
    
    // Check if all products have been selected
    const invalidItem = items.find(item => !item.productId);
    if (invalidItem) {
      toast.error('Selecione um produto para cada item');
      return;
    }
    
    try {
      setLoading(true);
      const supplierName = suppliers.find(s => s.id === values.supplierId)?.name || '';
      
      await onSubmit({
        ...values,
        supplierName,
        items,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getUsedProductIds = () => {
    return items.map(item => item.productId).filter(id => id);
  };
  
  const availableProducts = products.filter(
    product => !getUsedProductIds().includes(product.id) || !items.find(item => item.productId === product.id)
  );
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fornecedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? formatDateString(field.value) : 'Selecione uma data'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número Fatura</FormLabel>
                    <FormControl>
                      <Input placeholder="Inserir número da fatura" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Produtos</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={availableProducts.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unitário</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          Nenhum produto adicionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Select
                              value={item.productId || "placeholder-value"}
                              onValueChange={(value) => updateItem(item.id, 'productId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Only add an item if there's a valid product ID */}
                                {item.productId && (
                                  <SelectItem key={item.productId} value={item.productId}>
                                    {item.productName}
                                  </SelectItem>
                                )}
                                {availableProducts
                                  .filter(p => p.id !== item.productId)
                                  .map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.purchasePrice}
                              onChange={(e) => updateItem(item.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.quantity * item.purchasePrice)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 text-right">
                <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-900">{formatCurrency(calculateTotal())}</span></p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione notas ou observações"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4 border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(type === 'consumption' ? '/consumo/consultar' : '/entradas/historico')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'A guardar...' : type === 'consumption' ? 'Registar Consumo' : 'Registar Entrada'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default StockEntryForm;
