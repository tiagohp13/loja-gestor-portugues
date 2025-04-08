
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Loader2, ArrowLeft, Pencil } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency } from '@/utils/formatting';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Order } from '@/types';
import { toast } from 'sonner';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders } = useData();
  
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find(o => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        toast.error("Encomenda não encontrada");
        navigate("/encomendas/consultar");
      }
    }
  }, [id, orders, navigate]);

  if (!order) {
    return <div className="flex justify-center items-center h-96">
      <Loader2 className="h-8 w-8 animate-spin" />
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
            <Button variant="outline" onClick={() => navigate(`/encomendas/editar/${order.id}`)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
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
