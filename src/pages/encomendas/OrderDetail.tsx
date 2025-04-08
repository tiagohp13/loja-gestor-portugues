
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Loader2, ArrowLeft, Pencil, Ban, ArrowRightLeft } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency } from '@/utils/formatting';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Order } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder } = useData();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      // First try to fetch from Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('Encomendas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (orderError) {
        throw orderError;
      }
      
      if (!orderData) {
        throw new Error('Encomenda não encontrada');
      }
      
      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('EncomendasItems')
        .select('*')
        .eq('encomendaid', id);
      
      if (itemsError) {
        throw itemsError;
      }
      
      // Map the data to our expected format
      const mappedItems = (itemsData || []).map(item => ({
        productId: item.productid,
        productName: item.productname,
        quantity: item.quantity,
        salePrice: item.saleprice,
        discount: item.discount || 0
      }));
      
      const mappedOrder: Order = {
        id: orderData.id,
        clientId: orderData.clientid,
        clientName: orderData.clientname,
        orderNumber: orderData.ordernumber,
        date: orderData.date,
        notes: orderData.notes,
        status: orderData.status as "pending" | "completed" | "cancelled",
        discount: orderData.discount || 0,
        convertedToStockExitId: orderData.convertedtostockexitid,
        createdAt: orderData.createdat,
        updatedAt: orderData.updatedat,
        items: mappedItems
      };
      
      setOrder(mappedOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      
      // Fallback to local data
      const foundOrder = orders.find(o => o.id === id);
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        toast.error('Encomenda não encontrada');
        navigate('/encomendas/consultar');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      await updateOrder(order.id, { status: 'cancelled' });
      
      // Update in Supabase
      const { error } = await supabase
        .from('Encomendas')
        .update({ 
          status: 'cancelled',
          updatedat: new Date().toISOString()
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast.success('Encomenda cancelada com sucesso');
      
      // Update local state
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Erro ao cancelar encomenda');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Encomenda não encontrada</h2>
        <Button onClick={() => navigate("/encomendas/consultar")}>
          Voltar à Lista de Encomendas
        </Button>
      </div>
    </div>;
  }

  // Calculate order subtotal
  const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
  
  // Calculate discount amount
  const discountAmount = subtotal * (order.discount / 100);
  
  // Calculate total with discount
  const total = subtotal - discountAmount;

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Detalhes da Encomenda" 
        description={`Encomenda #${order.orderNumber || 'N/A'}`}
        actions={
          <div className="flex gap-2">
            {order.status !== 'cancelled' && !order.convertedToStockExitId && (
              <>
                <Button variant="outline" onClick={() => navigate(`/encomendas/editar/${order.id}`)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                {order.status !== 'completed' && (
                  <Button variant="outline" onClick={() => navigate(`/encomendas/converter/${order.id}`)}>
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Transformar em Saída
                  </Button>
                )}
                <Button variant="outline" onClick={handleCancelOrder} className="text-red-500 hover:bg-red-50">
                  <Ban className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => navigate("/encomendas/consultar")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Lista
            </Button>
          </div>
        }
      />
      
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informações da Encomenda</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Número</dt>
                <dd>{order.orderNumber || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Data</dt>
                <dd>{order.date}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Cliente</dt>
                <dd>{order.clientName}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Estado</dt>
                <dd>
                  <StatusBadge status={order.status} />
                </dd>
              </div>
              {order.convertedToStockExitId && (
                <div className="col-span-2">
                  <dt className="font-medium text-gestorApp-gray-dark">Saída de Stock</dt>
                  <dd className="mt-1">
                    <Link 
                      to={`/saidas/${order.convertedToStockExitId}`}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver saída
                    </Link>
                  </dd>
                </div>
              )}
              <div className="col-span-2">
                <dt className="font-medium text-gestorApp-gray-dark">Notas</dt>
                <dd className="mt-1">{order.notes || "Sem notas"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Subtotal</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Desconto</dt>
                <dd>{order.discount}% ({formatCurrency(discountAmount)})</dd>
              </div>
              <div className="col-span-2 border-t pt-2 mt-2">
                <dt className="font-medium text-gestorApp-gray-dark">Total</dt>
                <dd className="text-xl font-bold text-gestorApp-blue mt-1">
                  {formatCurrency(total)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Produto</th>
                  <th className="text-right py-3 px-4 font-medium">Quantidade</th>
                  <th className="text-right py-3 px-4 font-medium">Preço Unit.</th>
                  <th className="text-right py-3 px-4 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{item.productName}</td>
                    <td className="text-right py-3 px-4">{item.quantity}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(item.salePrice)}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(item.quantity * item.salePrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right py-3 px-4 font-medium">Subtotal</td>
                  <td className="text-right py-3 px-4">{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right py-3 px-4 font-medium">Desconto ({order.discount}%)</td>
                  <td className="text-right py-3 px-4">{formatCurrency(discountAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right py-3 px-4 font-bold">Total</td>
                  <td className="text-right py-3 px-4 font-bold">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
