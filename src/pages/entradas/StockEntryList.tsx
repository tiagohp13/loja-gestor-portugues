import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const StockEntryList = () => {
  const navigate = useNavigate();
  const { stockEntries, products, suppliers, deleteStockEntry, setStockEntries } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('StockEntries')
          .select(`
            *,
            StockEntriesItems(*)
          `)
          .order('createdat', { ascending: false });

        if (error) {
          console.error("Error fetching stock entries:", error);
          return;
        }

        if (data) {
          // Map the database fields to match our StockEntry type
          const mappedEntries = data.map(entry => ({
            id: entry.id,
            supplierId: entry.supplierid,
            supplierName: entry.suppliername,
            number: entry.entrynumber,
            invoiceNumber: entry.invoicenumber,
            notes: entry.notes,
            date: entry.date,
            createdAt: entry.createdat,
            items: entry.StockEntriesItems.map((item: any) => ({
              productId: item.productid,
              productName: item.productname,
              quantity: item.quantity,
              purchasePrice: item.purchaseprice,
              discountPercent: item.discount
            }))
          }));
          
          // Update the state with the mapped entries
          setStockEntries(mappedEntries);
        }
      } catch (error) {
        console.error("Error in fetchEntries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [setStockEntries]);

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
          (entry.invoiceNumber && entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.number && entry.number.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      })
    : sortedEntries;

  const handleDeleteEntry = (id: string) => {
    deleteStockEntry(id);
    if (detailsOpen) {
      setDetailsOpen(false);
    }
  };

  const handleEditEntry = (id: string) => {
    navigate(`/entradas/editar/${id}`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/entradas/editar/${id}`);
  };

  const handleRowClick = (id: string) => {
    navigate(`/entradas/editar/${id}`);
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

  const ensureDate = (dateInput: string | Date): Date => {
    return dateInput instanceof Date ? dateInput : new Date(dateInput);
  };

  const calculateEntryTotal = (entry: typeof stockEntries[0]) => {
    return entry.items.reduce((total, item) => total + (item.quantity * item.purchasePrice), 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Histórico de Entradas" 
          description="A carregar dados..." 
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          Carregando entradas de stock...
        </div>
      </div>
    );
  }

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
                  placeholder="Pesquisar por produto, fornecedor, nº entrada ou nº fatura"
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
                <TableHead>Nº Entrada</TableHead>
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
                      <TableCell className="font-medium">
                        <span className="text-gestorApp-blue">{entry.number}</span>
                      </TableCell>
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
    </div>
  );
};

export default StockEntryList;
