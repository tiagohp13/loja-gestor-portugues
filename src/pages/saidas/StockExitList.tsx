
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

const StockExitList = () => {
  const navigate = useNavigate();
  const { stockExits, products, clients, deleteStockExit } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExit, setSelectedExit] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Sort exits by date (most recent first)
  const sortedExits = [...stockExits].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredExits = sortedExits.filter(exit => {
    const product = products.find(p => p.id === exit.productId);
    const client = clients.find(c => c.id === exit.clientId);
    
    return (
      (product && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product && product.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client && client.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleDeleteExit = (id: string) => {
    deleteStockExit(id);
  };

  const handleEditExit = (id: string) => {
    navigate(`/saidas/editar/${id}`);
  };

  const handleViewDetails = (id: string) => {
    setSelectedExit(id);
    setDetailsOpen(true);
  };

  const handleRowClick = (id: string) => {
    handleViewDetails(id);
  };

  const selectedExitData = selectedExit ? stockExits.find(exit => exit.id === selectedExit) : null;
  const selectedProduct = selectedExitData ? products.find(p => p.id === selectedExitData.productId) : null;
  const selectedClient = selectedExitData ? clients.find(c => c.id === selectedExitData.clientId) : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Saídas" 
        description="Consultar todas as saídas de stock" 
        actions={
          <Button onClick={() => navigate('/saidas/nova')}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Saída
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
          <Input
            className="pl-10"
            placeholder="Pesquisar por produto ou cliente"
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
                <TableHead>Cliente</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gestorApp-gray">
                    Nenhuma saída encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredExits.map((exit) => {
                  const product = products.find(p => p.id === exit.productId);
                  const client = clients.find(c => c.id === exit.clientId);
                  
                  return (
                    <TableRow 
                      key={exit.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(exit.id)}
                    >
                      <TableCell>{formatDateTime(exit.createdAt)}</TableCell>
                      <TableCell className="font-medium">
                        {product ? `${product.code} - ${product.name}` : 'Produto removido'}
                      </TableCell>
                      <TableCell>{client ? client.name : 'Cliente removido'}</TableCell>
                      <TableCell>{exit.quantity} unid.</TableCell>
                      <TableCell>{formatCurrency(exit.salePrice)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(exit.quantity * exit.salePrice)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Ver Detalhes"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(exit.id);
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
                              handleEditExit(exit.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DeleteConfirmDialog
                            title="Eliminar Saída"
                            description="Tem a certeza que deseja eliminar esta saída de stock? Esta ação é irreversível."
                            onDelete={() => handleDeleteExit(exit.id)}
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

      {/* Exit Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Saída</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre esta saída de stock
            </DialogDescription>
          </DialogHeader>
          
          {selectedExitData && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Data</p>
                <p>{formatDateTime(selectedExitData.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Produto</p>
                <p className="font-medium">{selectedProduct ? `${selectedProduct.code} - ${selectedProduct.name}` : 'Produto removido'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Cliente</p>
                <p>{selectedClient ? selectedClient.name : 'Cliente removido'}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantidade</p>
                  <p>{selectedExitData.quantity} unid.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Preço Unit.</p>
                  <p>{formatCurrency(selectedExitData.salePrice)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="font-medium">{formatCurrency(selectedExitData.quantity * selectedExitData.salePrice)}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setDetailsOpen(false);
                    handleEditExit(selectedExitData.id);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <DeleteConfirmDialog
                  title="Eliminar Saída"
                  description="Tem a certeza que deseja eliminar esta saída de stock? Esta ação é irreversível."
                  onDelete={() => {
                    handleDeleteExit(selectedExitData.id);
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

export default StockExitList;
