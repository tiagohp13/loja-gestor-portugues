
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplierWithAddress } from '@/types';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import { Table } from '@/components/ui/table';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import StatusBadge from '@/components/common/StatusBadge';
import ClickableProductItem from '@/components/common/ClickableProductItem';

const StockEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockEntries, deleteStockEntry } = useData();
  const [stockEntry, setStockEntry] = useState<any | null>(null);
  const [supplier, setSupplier] = useState<SupplierWithAddress | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const entry = stockEntries.find(entry => entry.id === id);
      if (entry) {
        setStockEntry(entry);
        if (entry.supplier) {
          setSupplier(entry.supplier);
        }
      } else {
        toast.error('Entrada não encontrada');
        navigate('/entradas/historico');
      }
    }
  }, [id, stockEntries, navigate]);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (id) {
      deleteStockEntry(id);
      toast.success('Entrada eliminada com sucesso');
      navigate('/entradas/historico');
    }
  };

  if (!stockEntry) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Entrada: ${stockEntry?.number || ''}`}
        description="Detalhes da entrada de stock"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate('/entradas/historico')}
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
              onClick={() => navigate(`/entradas/editar/${id}`)}
            >
              Editar
            </Button>
          </>
        }
      />

      <Tabs defaultValue="details" className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Detalhes da Entrada</TabsTrigger>
          <TabsTrigger value="items">Produtos</TabsTrigger>
          {supplier && <TabsTrigger value="supplier">Fornecedor</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Entrada</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Referência</p>
                <p>{stockEntry.number}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Data</p>
                <p>{formatDateString(stockEntry.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Total</p>
                <p>{formatCurrency(stockEntry.total)}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Estado</p>
                <StatusBadge status={stockEntry.status} />
              </div>
              {stockEntry.notes && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium mb-1">Notas</p>
                  <p className="whitespace-pre-wrap">{stockEntry.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Recebidos</CardTitle>
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
                  {stockEntry.items && stockEntry.items.map((item: any) => (
                    <ClickableProductItem
                      key={item.id}
                      id={item.id}
                      productId={item.productId}
                      name={item.productName}
                      quantity={item.quantity}
                      price={item.purchasePrice}
                      total={item.quantity * item.purchasePrice}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right font-semibold">Total:</td>
                    <td className="text-right font-semibold">{formatCurrency(stockEntry.total)}</td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {supplier && (
          <TabsContent value="supplier" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Fornecedor</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Nome</p>
                  <p>{supplier.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p>{supplier.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Telefone</p>
                  <p>{supplier.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">NIF</p>
                  <p>{supplier.taxId || 'N/A'}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium mb-1">Morada</p>
                  <p>{supplier.address?.street}, {supplier.address?.postalCode} {supplier.address?.city}</p>
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
        title="Eliminar Entrada"
        description="Tem certeza que deseja eliminar esta entrada? Esta ação não pode ser desfeita."
        trigger={<></>}
      />
    </div>
  );
};

export default StockEntryDetail;
