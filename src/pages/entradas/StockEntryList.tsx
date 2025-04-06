
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDateTime } from '@/utils/formatting';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StockEntryList = () => {
  const navigate = useNavigate();
  const { stockEntries, products, suppliers, deleteStockEntry } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Sort entries by date (most recent first)
  const sortedEntries = [...stockEntries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredEntries = sortedEntries.filter(entry => {
    const product = products.find(p => p.id === entry.productId);
    const supplier = suppliers.find(s => s.id === entry.supplierId);
    
    return (
      (product && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product && product.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier && supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.invoiceNumber && entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleDeleteEntry = (id: string) => {
    deleteStockEntry(id);
  };

  const handleEditEntry = (id: string) => {
    navigate(`/entradas/editar/${id}`);
  };

  const handleViewDetails = (id: string) => {
    setSelectedEntry(id);
    setDetailsOpen(true);
  };

  const handleRowClick = (id: string) => {
    handleViewDetails(id);
  };

  const selectedEntryData = selectedEntry ? stockEntries.find(entry => entry.id === selectedEntry) : null;
  const selectedProduct = selectedEntryData ? products.find(p => p.id === selectedEntryData.productId) : null;
  const selectedSupplier = selectedEntryData ? suppliers.find(s => s.id === selectedEntryData.supplierId) : null;

  // Helper function to ensure we're working with Date objects
  const ensureDate = (dateInput: string | Date): Date => {
    return dateInput instanceof Date ? dateInput : new Date(dateInput);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Entradas" 
        description="Consultar todas as entradas em stock" 
        actions={
          <Button onClick={() => navigate('/entradas/nova')}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Entrada
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
          <Input
            className="pl-10"
            placeholder="Pesquisar por produto, fornecedor ou nº fatura"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Nº Fatura</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gestorApp-gray">
                    Nenhuma entrada encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => {
                  const product = products.find(p => p.id === entry.productId);
                  const supplier = suppliers.find(s => s.id === entry.supplierId);
                  
                  return (
                    <TableRow 
                      key={entry.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(entry.id)}
                    >
                      <TableCell>{formatDateTime(ensureDate(entry.createdAt))}</TableCell>
                      <TableCell className="font-medium">
                        {product ? `${product.code} - ${product.name}` : 'Produto removido'}
                      </TableCell>
                      <TableCell>{supplier ? supplier.name : 'Fornecedor removido'}</TableCell>
                      <TableCell>{entry.invoiceNumber || 'N/A'}</TableCell>
                      <TableCell>{entry.quantity} unid.</TableCell>
                      <TableCell>{formatCurrency(entry.purchasePrice)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(entry.quantity * entry.purchasePrice)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Ver Detalhes"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(entry.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Editar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEntry(entry.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DeleteConfirmDialog
                            title="Eliminar Entrada"
                            description="Tem a certeza que deseja eliminar esta entrada de stock? Esta ação é irreversível."
                            onDelete={() => handleDeleteEntry(entry.id)}
                            trigger={
                              <Button variant="outline" size="sm" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Entry Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Entrada</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre esta entrada de stock
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntryData && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Data</p>
                <p>{formatDateTime(ensureDate(selectedEntryData.createdAt))}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Produto</p>
                <p className="font-medium">{selectedProduct ? `${selectedProduct.code} - ${selectedProduct.name}` : 'Produto removido'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Fornecedor</p>
                <p>{selectedSupplier ? selectedSupplier.name : 'Fornecedor removido'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Nº Fatura</p>
                <p>{selectedEntryData.invoiceNumber || 'N/A'}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantidade</p>
                  <p>{selectedEntryData.quantity} unid.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Preço Unit.</p>
                  <p>{formatCurrency(selectedEntryData.purchasePrice)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="font-medium">{formatCurrency(selectedEntryData.quantity * selectedEntryData.purchasePrice)}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setDetailsOpen(false);
                    handleEditEntry(selectedEntryData.id);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <DeleteConfirmDialog
                  title="Eliminar Entrada"
                  description="Tem a certeza que deseja eliminar esta entrada de stock? Esta ação é irreversível."
                  onDelete={() => {
                    handleDeleteEntry(selectedEntryData.id);
                    setDetailsOpen(false);
                  }}
                  trigger={
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockEntryList;
