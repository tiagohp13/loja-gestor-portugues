
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowLeft, Truck } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, convertOrderToStockExit } = useData();
  
  const order = orders.find(o => o.id === id);
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Detalhes da Encomenda" 
          description="A encomenda não foi encontrada"
          actions={
            <Button variant="outline" onClick={() => navigate('/encomendas/consultar')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
            </Button>
          }
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <p className="text-red-500">Encomenda não encontrada. O ID fornecido pode ser inválido.</p>
        </div>
      </div>
    );
  }
  
  const totalValue = order.quantity * order.salePrice;
  
  const handleConvertToStockExit = () => {
    try {
      convertOrderToStockExit(order.id);
      toast.success("Encomenda convertida em saída de stock com sucesso");
      navigate('/saidas/historico');
    } catch (error) {
      toast.error("Erro ao converter encomenda: " + (error as Error).message);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Detalhes da Encomenda" 
        description={`Encomenda de ${order.clientName}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/encomendas/consultar')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
            </Button>
            <Button onClick={handleConvertToStockExit}>
              <Truck className="mr-2 h-4 w-4" /> Converter em Saída
            </Button>
          </div>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gestorApp-blue">Informações da Encomenda</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gestorApp-gray">Data da Encomenda</p>
                <p className="font-medium">{format(new Date(order.date), 'dd MMMM yyyy', { locale: pt })}</p>
              </div>
              
              <div>
                <p className="text-sm text-gestorApp-gray">Cliente</p>
                <p className="font-medium">{order.clientName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gestorApp-gray">Produto</p>
                <p className="font-medium">{order.productName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gestorApp-gray">Quantidade</p>
                  <p className="font-medium">{order.quantity}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gestorApp-gray">Preço Unitário</p>
                  <p className="font-medium">{order.salePrice.toFixed(2)} €</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gestorApp-gray">Valor Total</p>
                <p className="font-medium text-lg text-gestorApp-blue">{totalValue.toFixed(2)} €</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gestorApp-blue">Notas</h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[150px]">
              {order.notes ? (
                <p>{order.notes}</p>
              ) : (
                <p className="text-gestorApp-gray italic">Nenhuma nota adicional</p>
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gestorApp-blue">Ações</h3>
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={handleConvertToStockExit}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Converter em Saída de Stock
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
