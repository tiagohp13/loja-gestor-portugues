
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
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const StockEntryList = () => {
  const navigate = useNavigate();
  const { stockEntries, products, suppliers, deleteStockEntry } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Sort entries by date (most recent first)
  const sortedEntries = [...stockEntries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEntries = searchTerm 
    ? sortedEntries.filter(entry => {
        // Check if any item in the entry matches the search term
        const hasMatchingProduct = entry.items.some(item => {
          const product = products.find(p => p.id === item.productId);
          return (product && 
            (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             product.code.toLowerCase().includes(searchTerm.toLowerCase())));
        });
        
        const supplier = suppliers.find(s => s.id === entry.supplierId);
        
        return (
          hasMatchingProduct ||
          (supplier && supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.invoiceNumber && entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      })
    : sortedEntries;

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

  const handleProductSelect = (productCode: string) => {
    const product = products.find(p => p.code === productCode);
    if (product) {
      setSearchTerm(product.code + ' - ' + product.name);
    }
    setSearchOpen(false);
  };

  const selectedEntryData = selectedEntry ? stockEntries.find(entry => entry.id === selectedEntry) : null;
  const selectedSupplier = selectedEntryData ? suppliers.find(s => s.id === selectedEntryData.supplierId) : null;

  // Helper function to ensure we're working with Date objects
  const ensureDate = (dateInput: string | Date): Date => {
    return dateInput instanceof Date ? dateInput : new Date(dateInput);
  };

  // Helper function to calculate total for an entry
  const calculateEntryTotal = (entry: typeof stockEntries[0]) => {
    return entry.items.reduce((total, item) => total + (item.quantity * item.purchasePrice), 0);
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
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
                <Input
                  className="pl-10"
                  placeholder="Pesquisar por produto, fornecedor ou nº fatura"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={() => setSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[calc(100vw-4rem)] max-w-lg" align="start">
              <Command>
                <CommandInput 
                  placeholder="Pesquisar produto por nome ou código..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                  <CommandGroup heading="Produtos">
                    {filteredProducts.map((product) => (
                      <CommandItem 
                        key={product.id} 
                        value={`${product.code} - ${product.name}`}
                        onSelect={() => handleProductSelect(product.code)}
                      >
                        <span className="font-medium">{product.code}</span>
                        <span className="mx-2">-</span>
                        <span>{product.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Nº Fatura</TableHead>
                <TableHead>Total Itens</TableHead>
                <TableHead>Valor Total</TableHead>
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
                  const supplier = suppliers.find(s => s.id === entry.supplierId);
                  const totalItems = entry.items.reduce((sum, item) => sum + item.quantity, 0);
                  const totalValue = calculateEntryTotal(entry);
                  
                  // Get the first product to display
                  const firstItem = entry.items[0];
                  const firstProduct = firstItem ? products.find(p => p.id === firstItem.productId) : null;
                  const productDisplay = firstProduct 
                    ? `${firstProduct.code} - ${firstProduct.name}${entry.items.length > 1 ? ` e mais ${entry.items.length - 1}` : ''}`
                    : 'Produto removido';
                  
                  return (
                    <TableRow 
                      key={entry.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(entry.id)}
                    >
                      <TableCell>{formatDateTime(ensureDate(entry.createdAt))}</TableCell>
                      <TableCell className="font-medium">{productDisplay}</TableCell>
                      <TableCell>{supplier ? supplier.name : 'Fornecedor removido'}</TableCell>
                      <TableCell>{entry.invoiceNumber || 'N/A'}</TableCell>
                      <TableCell>{totalItems} unid.</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(totalValue)}
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
                <p className="text-sm font-medium text-gray-500">Fornecedor</p>
                <p>{selectedSupplier ? selectedSupplier.name : 'Fornecedor removido'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Nº Fatura</p>
                <p>{selectedEntryData.invoiceNumber || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Produtos</p>
                <div className="border rounded-md overflow-hidden mt-2">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Produto</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Qtd</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Preço</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedEntryData.items.map((item, index) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <tr key={index} className="text-sm">
                            <td className="px-3 py-2">{product ? `${product.code} - ${product.name}` : 'Produto removido'}</td>
                            <td className="px-3 py-2">{item.quantity}</td>
                            <td className="px-3 py-2">{formatCurrency(item.purchasePrice)}</td>
                            <td className="px-3 py-2">{formatCurrency(item.quantity * item.purchasePrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="font-medium text-sm">
                        <td className="px-3 py-2" colSpan={3}>Total</td>
                        <td className="px-3 py-2">{formatCurrency(calculateEntryTotal(selectedEntryData))}</td>
                      </tr>
                    </tfoot>
                  </table>
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
