
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplierWithAddress } from '@/types';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import StatusBadge from '@/components/common/StatusBadge';
import ClickableProductItem from '@/components/common/ClickableProductItem';

const StockEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockEntries, deleteStockEntry, suppliers } = useData();
  const [stockEntry, setStockEntry] = useState<any | null>(null);
  const [supplier, setSupplier] = useState<SupplierWithAddress | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (id) {
      const entry = stockEntries.find(entry => entry.id === id);
      if (entry) {
        setStockEntry(entry);
        
        // Calculate total
        if (entry.items && entry.items.length > 0) {
          const sum = entry.items.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);
          setTotalValue(sum);
        }
        
        // Check if the entry has a supplierId and fetch the corresponding supplier
        if (entry.supplierId) {
          const foundSupplier = suppliers.find(s => s.id === entry.supplierId);
          if (foundSupplier) {
            // Create a SupplierWithAddress object from the supplier data
            const supplierWithAddress: SupplierWithAddress = {
              ...foundSupplier,
              address: foundSupplier.address ? {
                street: foundSupplier.address,
                postalCode: '',
                city: ''
              } : undefined
            };
            setSupplier(supplierWithAddress);
          }
        }
      } else {
        toast.error('Entrada não encontrada');
        navigate('/entradas/historico');
      }
    }
  }, [id, stockEntries, navigate, suppliers]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Entry Information Card */}
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
              <p className="font-semibold">{formatCurrency(totalValue)}</p>
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

        {/* Supplier Information Card */}
        {supplier && (
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
                <p>{supplier.address ? supplier.address.street : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products Table Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Produtos Recebidos</CardTitle>
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
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">Total da Entrada:</TableCell>
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
        title="Eliminar Entrada"
        description="Tem certeza que deseja eliminar esta entrada? Esta ação não pode ser desfeita."
        trigger={<></>}
      />
    </div>
  );
};

export default StockEntryDetail;
