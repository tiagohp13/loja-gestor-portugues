
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Client, OrderItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';

interface OrderFormData {
  clientId: string;
  clientName: string;
  date: string;
  notes: string;
  discount: number;
  items: OrderItem[];
}

const OrderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    clientId: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    discount: 0,
    items: []
  });

  useEffect(() => {
    fetchClients();
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
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
        const formattedOrder: OrderFormData = {
          clientId: orderData.client_id || '',
          clientName: orderData.client_name || '',
          date: orderData.date,
          notes: orderData.notes || '',
          discount: Number(orderData.discount || 0),
          items: (orderData.order_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: Number(item.sale_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined,
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

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.salePrice;
      const discountAmount = itemTotal * (item.discountPercent / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);

    const generalDiscount = itemsTotal * (formData.discount / 100);
    return itemsTotal - generalDiscount;
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

      // Update order
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          client_id: formData.clientId,
          client_name: formData.clientName,
          date: formData.date,
          notes: formData.notes,
          discount: formData.discount
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
      navigate('/encomendas/historico');
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
      <PageHeader title="Editar Encomenda" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                type="text"
                value={formData.clientName}
                disabled
              />
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
          <Button type="button" variant="outline" onClick={() => navigate('/encomendas/historico')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'A guardar...' : 'Guardar Encomenda'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderEdit;
