
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientWithAddress, Order, StockExit } from '@/types';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import StatusBadge from '@/components/common/StatusBadge';
import ClickableProductItem from '@/components/common/ClickableProductItem';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, clients, stockExits } = useData();
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<ClientWithAddress | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [relatedStockExit, setRelatedStockExit] = useState<StockExit | null>(null);

  useEffect(() => {
    if (id) {
      const fetchedOrder = orders.find(o => o.id === id);
      if (fetchedOrder) {
        console.log("Order found:", fetchedOrder);
        setOrder(fetchedOrder);
        
        // Calculate order total
        if (fetchedOrder.items && fetchedOrder.items.length > 0) {
          const sum = fetchedOrder.items.reduce((acc, item) => acc + (item.quantity * item.salePrice), 0);
          setTotalValue(sum);
        }

        // Find related stock exit
        if (fetchedOrder.convertedToStockExitId) {
          console.log("Looking for related stock exit:", fetchedOrder.convertedToStockExitId);
          const exit = stockExits.find(e => e.id === fetchedOrder.convertedToStockExitId);
          if (exit) {
            console.log("Related stock exit found:", exit);
            setRelatedStockExit(exit);
          } else {
            console.log("Related stock exit not found");
          }
        }
        
        // Find client
        if (fetchedOrder.clientId) {
          const foundClient = clients.find(c => c.id === fetchedOrder.clientId);
          if (foundClient) {
            // Create a ClientWithAddress object from the client data
            const clientWithAddress: ClientWithAddress = {
              ...foundClient,
              address: foundClient.address ? {
                street: foundClient.address,
                postalCode: '',
                city: ''
              } : undefined
            };
            setClient(clientWithAddress);
          }
        }
      } else {
        toast({
          title: "Erro",
          description: "Encomenda não encontrada",
          variant: "destructive",
        });
        navigate('/encomendas/consultar');
      }
    }
  }, [id, orders, clients, navigate, stockExits]);

  const handleConvertToStockExit = () => {
    if (order) {
      navigate(`/encomendas/${id}/converter`);
    }
  };

  const handleViewStockExit = () => {
    if (relatedStockExit) {
      navigate(`/saidas/${relatedStockExit.id}`);
    }
  };

  if (!order) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Encomenda: ${order.number}`}
        description="Detalhes da encomenda"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate('/encomendas/consultar')}
            >
              Voltar à Lista
            </Button>
            {!order.convertedToStockExitId ? (
              <Button
                onClick={handleConvertToStockExit}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Converter para Venda
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Order Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Número</p>
              <p>{order.number}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Data</p>
              <p>{formatDateString(order.date)}</p>
            </div>
            {order.convertedToStockExitId && (
              <div>
                <p className="text-sm font-medium mb-1">Nº Venda</p>
                <p>
                  <a 
                    className="text-gestorApp-blue hover:underline cursor-pointer"
                    onClick={handleViewStockExit}
                  >
                    {order.convertedToStockExitNumber || relatedStockExit?.number}
                  </a>
                </p>
              </div>
            )}
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm font-medium mb-1">Estado</p>
              {order.convertedToStockExitId ? (
                <StatusBadge variant="success" icon={ShoppingCart}>
                  Convertida em Saída 
                  <ArrowRight className="ml-1 h-4 w-4" />
                </StatusBadge>
              ) : (
                <StatusBadge variant="warning">
                  Pendente
                </StatusBadge>
              )}
            </div>
            {order.notes && (
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium mb-1">Notas</p>
                <p className="whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Information Card */}
        {client && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Nome</p>
                <p>{client.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Email</p>
                <p>{client.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Telefone</p>
                <p>{client.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">NIF</p>
                <p>{client.taxId || 'N/A'}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium mb-1">Morada</p>
                <p>{client.address ? client.address.street : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products Table Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Produtos Encomendados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items && order.items.map((item) => (
                <ClickableProductItem
                  key={item.id}
                  id={item.id}
                  productId={item.productId}
                  name={item.productName}
                  quantity={item.quantity}
                  price={item.salePrice}
                  total={item.quantity * item.salePrice}
                />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">Total da Encomenda:</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(totalValue)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
