
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const OrderConverting = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { findOrder, findProduct, findClient, convertOrderToStockExit } = useData();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const orderData = findOrder(id);
      if (orderData) {
        // Check if order is already converted
        if (orderData.convertedToStockExitId) {
          toast.error('Esta encomenda já foi convertida em saída de stock');
          navigate('/encomendas/consultar');
          return;
        }
        
        setOrder(orderData);
      } else {
        toast.error('Encomenda não encontrada');
        navigate('/encomendas/consultar');
      }
    }
  }, [id, findOrder, navigate]);

  const handleConvert = async () => {
    if (!order) {
      toast.error('Dados da encomenda não encontrados');
      return;
    }
    
    try {
      setIsLoading(true);
      // Use the context function to convert order to stock exit
      await convertOrderToStockExit(id as string, invoiceNumber);
      
      toast.success('Encomenda convertida em saída de stock!');
      navigate('/saidas/historico');
    } catch (error) {
      console.error('Erro ao converter encomenda:', error);
      toast.error('Erro ao converter encomenda');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Encomenda não encontrada</h2>
          <Button onClick={() => navigate('/encomendas/consultar')}>
            Voltar à lista de encomendas
          </Button>
        </div>
      </div>
    );
  }

  const client = findClient(order.clientId);
  const totalValue = order.items.reduce((total: number, item: any) => 
    total + (item.quantity * item.salePrice), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Converter Encomenda em Saída de Stock"
        description="Registar a saída de stock correspondente a esta encomenda"
        actions={
          <Button variant="outline" onClick={() => navigate('/encomendas/consultar')}>
            Voltar à Lista de Encomendas
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gestorApp-gray-dark">Cliente</p>
            <p className="font-medium">{client?.name || order.clientName}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gestorApp-gray-dark">Produtos</p>
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
                  {order.items.map((item: any, index: number) => {
                    const product = findProduct(item.productId);
                    const subtotal = item.quantity * item.salePrice;
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {product?.name || item.productName}
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
          </div>
          
          <div>
            <p className="text-sm font-medium text-gestorApp-gray-dark">Valor Total</p>
            <p className="font-medium text-lg">{totalValue.toFixed(2)} €</p>
          </div>
          
          <div>
            <label htmlFor="invoiceNumber" className="text-sm font-medium text-gestorApp-gray-dark">
              Número da Fatura (Opcional)
            </label>
            <Input
              id="invoiceNumber"
              placeholder="Insira o número da fatura"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={() => navigate('/encomendas/consultar')}>
            Cancelar
          </Button>
          <Button onClick={handleConvert}>Converter em Saída de Stock</Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConverting;
