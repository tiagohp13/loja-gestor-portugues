
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { ClipboardList, ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '@/utils/formatting';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, findOrder, convertOrderToStockExit } = useData();
  
  const order = findOrder(id || '');
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Encomenda não encontrada" 
          description="A encomenda que procura não existe ou foi removida"
          actions={
            <Button onClick={() => navigate('/encomendas/consultar')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
            </Button>
          }
        />
      </div>
    );
  }
  
  const handleConvertToStockExit = async () => {
    try {
      await convertOrderToStockExit(order.id);
      navigate('/saidas/historico');
    } catch (error) {
      // Error is already handled in the context
    }
  };
  
  const handleEditOrder = () => {
    navigate(`/encomendas/editar/${order.id}`);
  };
  
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = order.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={`Encomenda ${order.number}`}
        description="Detalhes da encomenda"
        actions={
          <Button onClick={() => navigate('/encomendas/consultar')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gestorApp-gray-dark mb-2">Informações da Encomenda</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gestorApp-gray">Número</p>
                  <p className="text-gestorApp-blue font-medium">{order.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gestorApp-gray">Data</p>
                  <p>{format(new Date(order.date), 'dd/MM/yyyy', { locale: pt })}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gestorApp-gray">Cliente</p>
                  <p className="font-medium">{order.clientName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gestorApp-gray">Estado</p>
                  <div className="mt-1">
                    {order.convertedToStockExitId ? (
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 inline-block w-fit">
                          Convertida em Saída
                        </span>
                        {order.convertedToStockExitNumber && (
                          <div className="text-gestorApp-blue hover:underline text-sm">
                            <a 
                              href={`/saidas/${order.convertedToStockExitId}`}
                              className="text-gestorApp-blue hover:underline cursor-pointer"
                            >
                              {order.convertedToStockExitNumber}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {order.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gestorApp-gray-dark mb-2">Notas</h3>
                <p className="text-gestorApp-gray-dark p-3 border border-gray-200 rounded-md bg-gray-50">{order.notes}</p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gestorApp-gray-dark mb-2">Produtos</h3>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">Produto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">Qtd.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">Preço</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.salePrice)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.quantity * item.salePrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-gray-dark">
                      Total: {totalItems} items
                    </td>
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
                      Valor total: {formatCurrency(totalValue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              {!order.convertedToStockExitId && (
                <>
                  <Button onClick={handleEditOrder}>
                    <Edit className="mr-2 h-4 w-4" /> Editar Encomenda
                  </Button>
                  <Button onClick={handleConvertToStockExit}>
                    <ClipboardList className="mr-2 h-4 w-4" /> Converter em Saída
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
