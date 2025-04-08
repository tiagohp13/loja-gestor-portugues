
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const OrderConverting = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { findOrder, findProduct, findClient, updateOrder } = useData();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const generateStockExitNumber = async (): Promise<string> => {
    const prefix = 'SAI';
    const randomNumber = Math.floor(Math.random() * 100000);
    const exitNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
    return exitNumber;
  };

  const handleConvert = async () => {
    if (!order || !id) {
      toast.error('Dados da encomenda não encontrados');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const client = findClient(order.clientId);
      const exitId = uuidv4();
      const exitNumber = await generateStockExitNumber();
      const now = new Date().toISOString();
      
      // Create a new stock exit in Supabase
      const { error: exitError } = await supabase
        .from('StockExits')
        .insert({
          id: exitId,
          clientid: order.clientId,
          clientname: client?.name || order.clientName,
          reason: `Encomenda ${order.orderNumber}`,
          exitnumber: exitNumber,
          date: now,
          invoicenumber: invoiceNumber,
          notes: order.notes,
          status: 'completed',
          discount: 0,
          fromorderid: id,
          createdat: now,
          updatedat: now
        });
      
      if (exitError) {
        console.error('Error creating stock exit:', exitError);
        throw exitError;
      }
      
      // Insert exit items
      if (order.items && order.items.length > 0) {
        const exitItems = order.items.map((item: any) => ({
          exitid: exitId,
          productid: item.productId,
          productname: item.productName,
          quantity: item.quantity,
          saleprice: item.salePrice,
          discount: item.discount || 0
        }));
        
        const { error: itemsError } = await supabase
          .from('StockExitsItems')
          .insert(exitItems);
        
        if (itemsError) {
          console.error('Error creating exit items:', itemsError);
        }
      }
      
      // Update order status in Supabase
      const { error: updateError } = await supabase
        .from('Encomendas')
        .update({
          status: 'completed',
          convertedtostockexitid: exitId,
          updatedat: now
        })
        .eq('id', id);
      
      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw updateError;
      }
      
      // Update order in local state
      updateOrder(id, {
        status: 'completed',
        convertedToStockExitId: exitId
      });
      
      toast.success('Encomenda convertida em saída de stock com sucesso!');
      navigate('/saidas/historico');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao converter encomenda em saída de stock');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    total + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 0);

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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item: any, index: number) => {
                    const product = findProduct(item.productId);
                    const discount = item.discount || 0;
                    const subtotal = item.quantity * item.salePrice * (1 - discount / 100);
                    
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
                          {discount}%
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
          <Button onClick={handleConvert} disabled={isSubmitting}>
            {isSubmitting ? "Processando..." : "Converter em Saída de Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConverting;
