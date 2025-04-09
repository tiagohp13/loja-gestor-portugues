
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Plus, Eye, Edit, Trash2, ClipboardList } from 'lucide-react';
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
import { supabase, addToDeletedCache, filterDeletedItems } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StockExit } from '@/types';

const StockExitList = () => {
  const navigate = useNavigate();
  const { stockExits, products, clients, deleteStockExit, setStockExits } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExit, setSelectedExit] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localExits, setLocalExits] = useState<StockExit[]>([]);

  // Add filteredProducts variable
  const filteredProducts = products.filter(product => 
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add filteredExits variable
  const filteredExits = localExits.filter(exit => 
    exit.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exit.items.some(item => {
      const product = products.find(p => p.id === item.productId);
      return product && (
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
  );

  useEffect(() => {
    const fetchExits = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching stock exits directly in StockExitList component...");
        
        const { data, error } = await supabase
          .from('stock_exits')
          .select(`
            *,
            stock_exit_items(*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching stock exits:", error);
          toast.error("Erro ao carregar saídas de stock");
          return;
        }

        if (data) {
          console.log("Stock exits data received:", data);
          
          const mappedExits = data.map(exit => ({
            id: exit.id,
            clientId: exit.client_id,
            clientName: exit.client_name,
            number: exit.number,
            invoiceNumber: exit.invoice_number,
            notes: exit.notes,
            date: exit.date,
            createdAt: exit.created_at,
            fromOrderId: exit.from_order_id,
            fromOrderNumber: exit.from_order_number,
            discount: exit.discount || 0,
            items: exit.stock_exit_items.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              productName: item.product_name,
              quantity: item.quantity,
              salePrice: item.sale_price,
              discountPercent: item.discount_percent
            }))
          }));
          
          const filteredExits = filterDeletedItems('stock_exits', mappedExits);
          
          setLocalExits(filteredExits);
          setStockExits(filteredExits);
        }
      } catch (error) {
        console.error("Error in fetchExits:", error);
        toast.error("Erro ao carregar saídas de stock");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExits();
  }, [setStockExits]);

  useEffect(() => {
    const channel = supabase.channel('stock_exits_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_exits' }, 
        (payload) => {
          console.log('Stock exit change detected:', payload);
          
          if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = payload.old.id;
            addToDeletedCache('stock_exits', deletedId);
            
            setLocalExits(prev => prev.filter(exit => exit.id !== deletedId));
            setStockExits(prev => prev.filter(exit => exit.id !== deletedId));
            return;
          }
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setIsLoading(true);
            
            supabase
              .from('stock_exits')
              .select(`
                *,
                stock_exit_items(*)
              `)
              .order('created_at', { ascending: false })
              .then(({ data, error }) => {
                setIsLoading(false);
                
                if (error) {
                  console.error("Error fetching stock exits after change:", error);
                  return;
                }
                
                if (data) {
                  console.log("Updated stock exits received:", data);
                  
                  const mappedExits = data.map(exit => ({
                    id: exit.id,
                    clientId: exit.client_id,
                    clientName: exit.client_name,
                    number: exit.number,
                    invoiceNumber: exit.invoice_number,
                    notes: exit.notes,
                    date: exit.date,
                    createdAt: exit.created_at,
                    fromOrderId: exit.from_order_id,
                    fromOrderNumber: exit.from_order_number,
                    discount: exit.discount || 0,
                    items: exit.stock_exit_items.map((item: any) => ({
                      id: item.id,
                      productId: item.product_id,
                      productName: item.product_name,
                      quantity: item.quantity,
                      salePrice: item.sale_price,
                      discountPercent: item.discount_percent
                    }))
                  }));
                  
                  const filteredExits = filterDeletedItems('stock_exits', mappedExits);
                  
                  setLocalExits(filteredExits);
                  setStockExits(filteredExits);
                }
              });
          }
        }
      )
      .subscribe();
      
    const itemsChannel = supabase.channel('stock_exit_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_exit_items' }, 
        (payload) => {
          console.log('Stock exit item change detected:', payload);
          
          supabase
            .from('stock_exits')
            .select(`
              *,
              stock_exit_items(*)
            `)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching stock exits after item change:", error);
                return;
              }
              
              if (data) {
                console.log("Updated stock exits after item change:", data);
                
                const mappedExits = data.map(exit => ({
                  id: exit.id,
                  clientId: exit.client_id,
                  clientName: exit.client_name,
                  number: exit.number,
                  invoiceNumber: exit.invoice_number,
                  notes: exit.notes,
                  date: exit.date,
                  createdAt: exit.created_at,
                  fromOrderId: exit.from_order_id,
                  fromOrderNumber: exit.from_order_number,
                  discount: exit.discount || 0,
                  items: exit.stock_exit_items.map((item: any) => ({
                    id: item.id,
                    productId: item.product_id,
                    productName: item.product_name,
                    quantity: item.quantity,
                    salePrice: item.sale_price,
                    discountPercent: item.discount_percent
                  }))
                }));
                
                const filteredExits = filterDeletedItems('stock_exits', mappedExits);
                
                setLocalExits(filteredExits);
                setStockExits(filteredExits);
              }
            });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(itemsChannel);
    };
  }, [setStockExits]);

  const handleDeleteExit = async (id: string) => {
    try {
      addToDeletedCache('stock_exits', id);
      
      setLocalExits(prev => prev.filter(exit => exit.id !== id));
      
      await deleteStockExit(id);
      
      if (detailsOpen) {
        setDetailsOpen(false);
      }
    } catch (error) {
      console.error("Error in handleDeleteExit:", error);
      toast.error("Erro ao eliminar saída de stock");
    }
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

  const handleProductSelect = (productCode: string) => {
    const product = products.find(p => p.code === productCode);
    if (product) {
      setSearchTerm(product.code + ' - ' + product.name);
    }
    setSearchOpen(false);
  };

  const selectedExitData = selectedExit ? filteredExits.find(exit => exit.id === selectedExit) : null;
  const selectedClient = selectedExitData ? clients.find(c => c.id === selectedExitData.clientId) : null;

  const calculateExitTotal = (exit: StockExit) => {
    return exit.items.reduce((total, item) => total + (item.quantity * item.salePrice), 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Histórico de Saídas" 
          description="A carregar dados..." 
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          Carregando saídas de stock...
        </div>
      </div>
    );
  }

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
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
                <Input
                  className="pl-10"
                  placeholder="Pesquisar por número, produto ou cliente"
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
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total Itens</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gestorApp-gray">
                    Nenhuma saída encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredExits.map((exit) => {
                  const client = clients.find(c => c.id === exit.clientId);
                  const totalItems = exit.items.reduce((sum, item) => sum + item.quantity, 0);
                  const totalValue = calculateExitTotal(exit);
                  
                  const firstItem = exit.items[0];
                  const firstProduct = firstItem ? products.find(p => p.id === firstItem.productId) : null;
                  const productDisplay = firstProduct 
                    ? `${firstProduct.code} - ${firstProduct.name}${exit.items.length > 1 ? ` e mais ${exit.items.length - 1}` : ''}`
                    : 'Produto removido';
                  
                  return (
                    <TableRow 
                      key={exit.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(exit.id)}
                    >
                      <TableCell className="font-medium text-gestorApp-blue">
                        {exit.number}
                      </TableCell>
                      <TableCell>{formatDateTime(new Date(exit.createdAt))}</TableCell>
                      <TableCell className="font-medium">{productDisplay}</TableCell>
                      <TableCell>{client ? client.name : 'Cliente removido'}</TableCell>
                      <TableCell>{totalItems} unid.</TableCell>
                      <TableCell className="font-medium">{formatCurrency(totalValue)}</TableCell>
                      <TableCell>
                        {exit.fromOrderId && exit.fromOrderNumber && (
                          <Link 
                            to={`/encomendas/${exit.fromOrderId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center text-gestorApp-blue hover:underline"
                          >
                            <ClipboardList className="w-3 h-3 mr-1" />
                            {exit.fromOrderNumber}
                          </Link>
                        )}
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
                <p className="text-sm font-medium text-gray-500">Número</p>
                <p className="font-medium text-gestorApp-blue">{selectedExitData.number}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Data</p>
                <p>{formatDateTime(new Date(selectedExitData.createdAt))}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Cliente</p>
                <p>{selectedClient ? selectedClient.name : 'Cliente removido'}</p>
              </div>
              
              {selectedExitData.fromOrderId && selectedExitData.fromOrderNumber && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-800">
                    Esta saída foi criada a partir de uma encomenda
                  </p>
                  <Link 
                    to={`/encomendas/${selectedExitData.fromOrderId}`}
                    className="text-xs text-blue-600 hover:underline flex items-center"
                    onClick={() => setDetailsOpen(false)}
                  >
                    <ClipboardList className="w-3 h-3 mr-1" />
                    {selectedExitData.fromOrderNumber}
                  </Link>
                </div>
              )}
              
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
                      {selectedExitData.items.map((item, index) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <tr key={index} className="text-sm">
                            <td className="px-3 py-2">{product ? `${product.code} - ${product.name}` : 'Produto removido'}</td>
                            <td className="px-3 py-2">{item.quantity}</td>
                            <td className="px-3 py-2">{formatCurrency(item.salePrice)}</td>
                            <td className="px-3 py-2">{formatCurrency(item.quantity * item.salePrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="font-medium text-sm">
                        <td className="px-3 py-2" colSpan={3}>Total</td>
                        <td className="px-3 py-2">{formatCurrency(calculateExitTotal(selectedExitData))}</td>
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
