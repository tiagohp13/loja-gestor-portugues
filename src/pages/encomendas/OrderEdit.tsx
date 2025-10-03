
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Save, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Client, OrderItem, Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils';
import { OrderTypeSelector } from './components/OrderTypeSelector';
import { DeliveryInformation } from './components/DeliveryInformation';
import { format, parseISO, startOfDay } from 'date-fns';

interface OrderFormData {
  clientId: string;
  clientName: string;
  date: string;
  notes: string;
  discount: number;
  items: OrderItem[];
  orderType: 'combined' | 'awaiting_stock';
  expectedDeliveryDate?: Date;
  expectedDeliveryTime?: string;
  deliveryLocation?: string;
}

const OrderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<OrderFormData>({
    clientId: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    discount: 0,
    items: [],
    orderType: 'combined',
    expectedDeliveryDate: undefined,
    expectedDeliveryTime: '',
    deliveryLocation: ''
  });

  useEffect(() => {
    fetchClients();
    fetchProducts();
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .neq('status', 'deleted')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedClients: Client[] = data.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          taxId: client.tax_id || '',
          notes: client.notes || '',
          createdAt: client.created_at,
          updatedAt: client.updated_at,
          status: client.status
        }));
        setClients(formattedClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'deleted')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedProducts: Product[] = data.map(product => ({
          id: product.id,
          code: product.code,
          name: product.name,
          description: product.description || '',
          category: product.category || '',
          purchasePrice: Number(product.purchase_price),
          salePrice: Number(product.sale_price),
          currentStock: Number(product.current_stock),
          minStock: Number(product.min_stock),
          image: product.image || '',
          status: product.status || 'active',
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  const fetchOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .single();
  
      if (orderError) {
        throw orderError;
      }
  
      if (orderData) {
        // Parse date strings correctly to avoid timezone issues
        const parsedDate = parseISO(orderData.date);
        const localDate = startOfDay(parsedDate);
        
        // Safely parse delivery date only if it exists
        let deliveryDate: Date | undefined = undefined;
        if (orderData.expected_delivery_date) {
          try {
            deliveryDate = startOfDay(parseISO(orderData.expected_delivery_date));
          } catch (e) {
            console.warn('Failed to parse delivery date:', e);
          }
        }
        
        const formattedOrder: OrderFormData = {
          clientId: orderData.client_id || '',
          clientName: orderData.client_name || '',
          date: format(localDate, 'yyyy-MM-dd'),
          notes: orderData.notes || '',
          discount: Number(orderData.discount || 0),
          orderType: (orderData.order_type as 'combined' | 'awaiting_stock') || 'combined',
          expectedDeliveryDate: deliveryDate,
          expectedDeliveryTime: orderData.expected_delivery_time || '',
          deliveryLocation: orderData.delivery_location || '',
          items: (orderData.order_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: Number(item.sale_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : 0,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }))
        };
        setFormData(formattedOrder);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Erro ao carregar encomenda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData({
      ...formData,
      clientId,
      clientName: client?.name || ''
    });
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: crypto.randomUUID(),
      productId: '',
      productName: '',
      quantity: 1,
      salePrice: 0,
      discountPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: keyof Omit<OrderItem, 'id' | 'createdAt' | 'updatedAt'>, value: string | number) => {
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

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const updatedItems = [...formData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        productId: product.id,
        productName: `${product.code} - ${product.name}`,
        salePrice: product.salePrice
      };
      setFormData({
        ...formData,
        items: updatedItems
      });
    }
    setProductSearchOpen({ ...productSearchOpen, [index]: false });
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.salePrice;
      const discountAmount = itemTotal * ((item.discountPercent || 0) / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);

    // Apply global discount
    const globalDiscountAmount = itemsTotal * ((formData.discount || 0) / 100);
    return itemsTotal - globalDiscountAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast.error('Por favor selecione um cliente');
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

      // Update order - only save delivery info for 'combined' orders
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          client_id: formData.clientId,
          client_name: formData.clientName,
          date: formData.date,
          notes: formData.notes,
          discount: formData.discount,
          order_type: formData.orderType,
          expected_delivery_date: formData.orderType === 'combined' && formData.expectedDeliveryDate 
            ? format(startOfDay(formData.expectedDeliveryDate), 'yyyy-MM-dd')
            : null,
          expected_delivery_time: formData.orderType === 'combined' ? formData.expectedDeliveryTime || null : null,
          delivery_location: formData.orderType === 'combined' ? formData.deliveryLocation || null : null
        })
        .eq('id', id);

      if (orderError) throw orderError;

      // Delete existing order items
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (deleteItemsError) throw deleteItemsError;

      // Create order items
      const itemsToInsert = formData.items.map(item => ({
        order_id: id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        sale_price: item.salePrice,
        discount_percent: item.discountPercent
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('Encomenda atualizada com sucesso');
      navigate('/encomendas/consultar');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao atualizar encomenda');
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
      <div className="flex justify-between items-center">
        <PageHeader title="Editar Encomenda" />
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/encomendas/consultar')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" form="order-edit-form" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'A guardar...' : 'Guardar Encomenda'}
          </Button>
        </div>
      </div>

      <form id="order-edit-form" onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Select value={formData.clientId} onValueChange={handleClientChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Data da Encomenda *</Label>
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
                placeholder="Notas adicionais sobre a encomenda..."
                rows={3}
              />
            </div>
            
            {/* Order Type */}
            <div className="md:col-span-2">
              <OrderTypeSelector 
                value={formData.orderType}
                onChange={(value) => {
                  // Clear delivery info when changing to 'awaiting_stock'
                  if (value === 'awaiting_stock') {
                    setFormData({ 
                      ...formData, 
                      orderType: value,
                      expectedDeliveryDate: undefined,
                      expectedDeliveryTime: '',
                      deliveryLocation: ''
                    });
                  } else {
                    setFormData({ ...formData, orderType: value });
                  }
                }}
              />
            </div>
            
            {/* Delivery Information */}
            <div className="md:col-span-2">
              <DeliveryInformation
                orderType={formData.orderType}
                expectedDeliveryDate={formData.expectedDeliveryDate}
                expectedDeliveryTime={formData.expectedDeliveryTime}
                deliveryLocation={formData.deliveryLocation}
                onDeliveryDateChange={(date) => setFormData({ ...formData, expectedDeliveryDate: date })}
                onDeliveryTimeChange={(time) => setFormData({ ...formData, expectedDeliveryTime: time })}
                onDeliveryLocationChange={(location) => setFormData({ ...formData, deliveryLocation: location })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Itens da Encomenda</CardTitle>
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
                    const itemTotal = item.quantity * item.salePrice;
                    const discountAmount = itemTotal * ((item.discountPercent || 0) / 100);
                    const subtotal = itemTotal - discountAmount;

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Popover open={productSearchOpen[index]} onOpenChange={(open) => setProductSearchOpen({ ...productSearchOpen, [index]: open })}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={productSearchOpen[index]}
                                className="w-full justify-between"
                              >
                                {item.productName || "Selecionar produto..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Pesquisar produto..." />
                                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                <CommandList>
                                  <CommandGroup>
                                    {products.map((product) => (
                                      <CommandItem
                                        key={product.id}
                                        value={`${product.code} ${product.name}`}
                                        onSelect={() => handleProductSelect(index, product.id)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            item.productId === product.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {product.code} - {product.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                            value={item.salePrice}
                            onChange={(e) => updateItem(index, 'salePrice', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discountPercent || 0}
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
              <div className="flex justify-end">
                <div className="text-2xl font-bold text-gestorApp-blue">
                  Total: {formatCurrency(calculateTotal())}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </form>
    </div>
  );
};

export default OrderEdit;
