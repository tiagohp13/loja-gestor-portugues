import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { formatDateTime, formatCurrency } from '@/utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Package, Users, Building2, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react';

interface DeletedRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  recordType: string;
  recordNumber: string;
}

const DeletedRecordModal: React.FC<DeletedRecordModalProps> = ({
  isOpen,
  onClose,
  recordId,
  recordType,
  recordNumber
}) => {
  const [recordData, setRecordData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && recordId) {
      fetchRecordData();
    }
  }, [isOpen, recordId, recordType]);

  const fetchRecordData = async () => {
    setIsLoading(true);
    try {
      let data = null;

      switch (recordType) {
        case 'products':
          const { data: product } = await supabase
            .from('products')
            .select('id, code, name, description, category, purchase_price, sale_price, current_stock, min_stock, image, status, user_id, created_at, updated_at, deleted_at')
            .eq('id', recordId)
            .single();
          data = product;
          break;

        case 'clients':
          const { data: client } = await supabase
            .from('clients')
            .select('id, name, email, phone, address, tax_id, notes, status, last_purchase_date, user_id, created_at, updated_at, deleted_at')
            .eq('id', recordId)
            .single();
          data = client;
          break;

        case 'suppliers':
          const { data: supplier } = await supabase
            .from('suppliers')
            .select('id, name, email, phone, address, tax_id, payment_terms, notes, status, user_id, created_at, updated_at, deleted_at')
            .eq('id', recordId)
            .single();
          data = supplier;
          break;

        case 'orders':
          const { data: order } = await supabase
            .from('orders')
            .select(`
              *,
              order_items(*)
            `)
            .eq('id', recordId)
            .single();
          data = order;
          break;

        case 'stock_entries':
          const { data: entry } = await supabase
            .from('stock_entries')
            .select(`
              *,
              stock_entry_items(*)
            `)
            .eq('id', recordId)
            .single();
          data = entry;
          break;

        case 'stock_exits':
          const { data: exit } = await supabase
            .from('stock_exits')
            .select(`
              *,
              stock_exit_items(*)
            `)
            .eq('id', recordId)
            .single();
          data = exit;
          break;

        case 'expenses':
          const { data: expense } = await supabase
            .from('expenses')
            .select(`
              *,
              expense_items(*)
            `)
            .eq('id', recordId)
            .single();
          data = expense;
          break;
      }

      setRecordData(data);
    } catch (error) {
      console.error('Error fetching record data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Informações do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Código:</span> {recordData.code}
            </div>
            <div>
              <span className="font-semibold">Nome:</span> {recordData.name}
            </div>
            <div>
              <span className="font-semibold">Categoria:</span> {recordData.category || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Stock Atual:</span> {recordData.current_stock}
            </div>
            <div>
              <span className="font-semibold">Preço de Compra:</span> {formatCurrency(recordData.purchase_price)}
            </div>
            <div>
              <span className="font-semibold">Preço de Venda:</span> {formatCurrency(recordData.sale_price)}
            </div>
          </div>
          {recordData.description && (
            <div className="pt-2">
              <span className="font-semibold">Descrição:</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">{recordData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderClientDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Nome:</span> {recordData.name}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {recordData.email || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Telefone:</span> {recordData.phone || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">NIF:</span> {recordData.tax_id || 'N/A'}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Morada:</span> {recordData.address || 'N/A'}
            </div>
          </div>
          {recordData.notes && (
            <div className="pt-2">
              <span className="font-semibold">Notas:</span>
              <p className="text-sm mt-1">{recordData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSupplierDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informações do Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Nome:</span> {recordData.name}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {recordData.email || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Telefone:</span> {recordData.phone || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">NIF:</span> {recordData.tax_id || 'N/A'}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Morada:</span> {recordData.address || 'N/A'}
            </div>
          </div>
          {recordData.notes && (
            <div className="pt-2">
              <span className="font-semibold">Notas:</span>
              <p className="text-sm mt-1">{recordData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderOrderDetails = () => {
    const total = recordData.order_items?.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.sale_price;
      const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
      return sum + (itemTotal - discount);
    }, 0) || 0;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Informações da Encomenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Número:</span> {recordData.number}
              </div>
              <div>
                <span className="font-semibold">Cliente:</span> {recordData.client_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Data:</span> {formatDateTime(recordData.date)}
              </div>
              <div>
                <span className="font-semibold">Total:</span> {formatCurrency(total)}
              </div>
            </div>
            {recordData.notes && (
              <div className="pt-2">
                <span className="font-semibold">Notas:</span>
                <p className="text-sm mt-1">{recordData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {recordData.order_items && recordData.order_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordData.order_items.map((item: any) => {
                    const itemTotal = item.quantity * item.sale_price;
                    const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.sale_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(itemTotal - discount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderStockEntryDetails = () => {
    const total = recordData.stock_entry_items?.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.purchase_price;
      const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
      return sum + (itemTotal - discount);
    }, 0) || 0;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Informações da Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Número:</span> {recordData.number}
              </div>
              <div>
                <span className="font-semibold">Fornecedor:</span> {recordData.supplier_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Data:</span> {formatDateTime(recordData.date)}
              </div>
              <div>
                <span className="font-semibold">Total:</span> {formatCurrency(total)}
              </div>
              {recordData.invoice_number && (
                <div className="col-span-2">
                  <span className="font-semibold">Nº Fatura:</span> {recordData.invoice_number}
                </div>
              )}
            </div>
            {recordData.notes && (
              <div className="pt-2">
                <span className="font-semibold">Notas:</span>
                <p className="text-sm mt-1">{recordData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {recordData.stock_entry_items && recordData.stock_entry_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordData.stock_entry_items.map((item: any) => {
                    const itemTotal = item.quantity * item.purchase_price;
                    const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.purchase_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(itemTotal - discount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderStockExitDetails = () => {
    const total = recordData.stock_exit_items?.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.sale_price;
      const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
      return sum + (itemTotal - discount);
    }, 0) || 0;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Informações da Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Número:</span> {recordData.number}
              </div>
              <div>
                <span className="font-semibold">Cliente:</span> {recordData.client_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Data:</span> {formatDateTime(recordData.date)}
              </div>
              <div>
                <span className="font-semibold">Total:</span> {formatCurrency(total)}
              </div>
              {recordData.invoice_number && (
                <div className="col-span-2">
                  <span className="font-semibold">Nº Fatura:</span> {recordData.invoice_number}
                </div>
              )}
            </div>
            {recordData.notes && (
              <div className="pt-2">
                <span className="font-semibold">Notas:</span>
                <p className="text-sm mt-1">{recordData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {recordData.stock_exit_items && recordData.stock_exit_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordData.stock_exit_items.map((item: any) => {
                    const itemTotal = item.quantity * item.sale_price;
                    const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.sale_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(itemTotal - discount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderExpenseDetails = () => {
    const total = recordData.expense_items?.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.unit_price;
      const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
      return sum + (itemTotal - discount);
    }, 0) || 0;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Informações da Despesa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Número:</span> {recordData.number}
              </div>
              <div>
                <span className="font-semibold">Fornecedor:</span> {recordData.supplier_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Data:</span> {formatDateTime(recordData.date)}
              </div>
              <div>
                <span className="font-semibold">Total:</span> {formatCurrency(total)}
              </div>
            </div>
            {recordData.notes && (
              <div className="pt-2">
                <span className="font-semibold">Notas:</span>
                <p className="text-sm mt-1">{recordData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {recordData.expense_items && recordData.expense_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Itens</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordData.expense_items.map((item: any) => {
                    const itemTotal = item.quantity * item.unit_price;
                    const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(itemTotal - discount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      );
    }

    if (!recordData) {
      return <div className="text-center py-8">Registo não encontrado</div>;
    }

    switch (recordType) {
      case 'products':
        return renderProductDetails();
      case 'clients':
        return renderClientDetails();
      case 'suppliers':
        return renderSupplierDetails();
      case 'orders':
        return renderOrderDetails();
      case 'stock_entries':
        return renderStockEntryDetails();
      case 'stock_exits':
        return renderStockExitDetails();
      case 'expenses':
        return renderExpenseDetails();
      default:
        return <div>Tipo de registo não suportado</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Registo Apagado: {recordNumber}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default DeletedRecordModal;
