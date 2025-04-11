
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientWithAddress } from '@/types';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import StatusBadge from '@/components/common/StatusBadge';
import ClickableProductItem from '@/components/common/ClickableProductItem';

const StockExitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits, deleteStockExit, clients } = useData();
  const [stockExit, setStockExit] = useState<any | null>(null);
  const [client, setClient] = useState<ClientWithAddress | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (id) {
      const exit = stockExits.find(exit => exit.id === id);
      if (exit) {
        setStockExit(exit);
        
        // Calculate total
        if (exit.items && exit.items.length > 0) {
          const sum = exit.items.reduce((acc, item) => acc + (item.quantity * item.salePrice), 0);
          setTotalValue(sum);
        }
        
        // Check if the exit has a clientId and fetch the corresponding client
        if (exit.clientId) {
          const foundClient = clients.find(c => c.id === exit.clientId);
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
        toast.error('Saída não encontrada');
        navigate('/saidas/historico');
      }
    }
  }, [id, stockExits, navigate, clients]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Exit Information Card */}
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
              <p className="font-semibold">{formatCurrency(totalValue)}</p>
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

        {/* Client Information Card, only shown if client exists */}
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
          <CardTitle>Produtos Vendidos</CardTitle>
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
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">Total da Saída:</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(totalValue)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

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
