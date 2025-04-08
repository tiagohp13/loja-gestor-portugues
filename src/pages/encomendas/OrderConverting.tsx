import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const OrderConverting = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { findOrder, findProduct, findClient, addStockExit, deleteOrder } = useData();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [orderData, setOrderData] = useState<{
    productId: string;
    productName: string | undefined;
    clientId: string;
    clientName: string | undefined;
    quantity: number;
    salePrice: number;
  } | null>(null);

  useEffect(() => {
    if (id) {
      const order = findOrder(id);
      if (order) {
        setOrderData({
          productId: order.productId,
          productName: order.productName,
          clientId: order.clientId,
          clientName: order.clientName,
          quantity: order.quantity,
          salePrice: order.salePrice,
        });
      } else {
        toast.error('Encomenda não encontrada');
        navigate('/encomendas/consultar');
      }
    }
  }, [id, findOrder, navigate]);

  const product = orderData ? findProduct(orderData.productId) : null;
  const client = orderData ? findClient(orderData.clientId) : null;

  const handleConvert = () => {
    if (!orderData) {
      toast.error('Dados da encomenda não encontrados');
      return;
    }

    if (!product) {
      toast.error('Produto não encontrado');
      return;
    }

    if (!client) {
      toast.error('Cliente não encontrado');
      return;
    }
    
    addStockExit({
      productId: orderData.productId,
      productName: product?.name || orderData.productName || '',
      clientId: orderData.clientId,
      clientName: client?.name || orderData.clientName || '',
      quantity: orderData.quantity,
      salePrice: orderData.salePrice,
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: invoiceNumber,
      createdAt: new Date().toISOString()
    });
    
    deleteOrder(id as string);
    toast.success('Encomenda convertida em saída de stock!');
    navigate('/saidas/historico');
  };

  if (!orderData) {
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
            <p className="text-sm font-medium text-gestorApp-gray-dark">Produto</p>
            <p className="font-medium">{product?.name || orderData.productName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gestorApp-gray-dark">Cliente</p>
            <p className="font-medium">{client?.name || orderData.clientName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gestorApp-gray-dark">Quantidade</p>
            <p className="font-medium">{orderData.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gestorApp-gray-dark">Preço Unitário</p>
            <p className="font-medium">{orderData.salePrice} €</p>
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
