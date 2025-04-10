
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientWithAddress } from '@/types';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import { Table } from '@/components/ui/table';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import StatusBadge from '@/components/common/StatusBadge';
import ClickableProductItem from '@/components/common/ClickableProductItem';

const StockExitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits, deleteStockExit } = useData();
  const [stockExit, setStockExit] = useState<any | null>(null);
  const [client, setClient] = useState<ClientWithAddress | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const exit = stockExits.find(exit => exit.id === id);
      if (exit) {
        setStockExit(exit);
        if (exit.client) {
          setClient(exit.client);
        }
      } else {
        toast.error('Saída não encontrada');
        navigate('/saidas/historico');
      }
    }
  }, [id, stockExits, navigate]);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (id) {
      deleteStockExit(id);
      toast.success('Saída eliminada com sucesso');
      navigate('/saidas/historico');
    }
  };

  if (!stockExit) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Saída: ${stockExit?.number || ''}`}
        description="Detalhes da saída de stock"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate('/saidas/historico')}
            >
              Voltar à Lista
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
            <Button
              onClick={() => navigate(`/saidas/editar/${id}`)}
            >
              Editar
            </Button>
          </>
        }
      />

      <Tabs defaultValue="details" className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Detalhes da Saída</TabsTrigger>
          <TabsTrigger value="items">Produtos</TabsTrigger>
          {client && <TabsTrigger value="client">Cliente</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Saída</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Referência</p>
                <p>{stockExit.number}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Data</p>
                <p>{formatDateString(stockExit.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Total</p>
                <p>{formatCurrency(stockExit.total)}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Estado</p>
                <StatusBadge status={stockExit.status} />
              </div>
              {stockExit.notes && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium mb-1">Notas</p>
                  <p className="whitespace-pre-wrap">{stockExit.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th className="text-center">Quantidade</th>
                    <th className="text-right">Preço Unit.</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stockExit.items && stockExit.items.map((item: any) => (
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
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right font-semibold">Total:</td>
                    <td className="text-right font-semibold">{formatCurrency(stockExit.total)}</td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {client && (
          <TabsContent value="client" className="space-y-4 mt-4">
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
                  <p>{client.address?.street}, {client.address?.postalCode} {client.address?.city}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={confirmDelete}
        title="Eliminar Saída"
        description="Tem certeza que deseja eliminar esta saída? Esta ação não pode ser desfeita."
        trigger={<></>}
      />
    </div>
  );
};

export default StockExitDetail;
