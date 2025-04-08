
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
  const { orders, stockExits, convertOrderToStockExit } = useData();
  
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
  
  // Calculate total value from all items
  const totalValue = order.items.reduce((total, item) => total + (item.quantity * item.salePrice), 0);
  
  // If order was converted, find the related stock exit
  const relatedStockExit = order.convertedToStockExitId 
    ? stockExits.find(exit => exit.id === order.convertedToStockExitId) 
    : null;
  
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
            {!order.convertedToStockExitId && (
              <Button onClick={handleConvertToStockExit}>
                <Truck className="mr-2 h-4 w-4" /> Converter em Saída
              </Button>
            )}
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
              
              <div className="border rounded-md mt-2 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => {
                      const subtotal = item.quantity * item.salePrice;
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {item.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.salePrice.toFixed(2)} €
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {subtotal.toFixed(2)} €
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
              {order.convertedToStockExitId ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                  <p className="text-green-800 font-medium">Esta encomenda já foi convertida em saída de stock.</p>
                  <p className="text-sm text-green-600 mt-1">
                    ID da saída: {order.convertedToStockExitId}
                  </p>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => navigate(`/saidas/historico`)}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Ver Saídas de Stock
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={handleConvertToStockExit}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Converter em Saída de Stock
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
