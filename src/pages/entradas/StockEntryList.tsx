
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDateTime } from '@/utils/formatting';
import PageHeader from '@/components/ui/PageHeader';
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
  const { stockEntries, products, suppliers } = useData();
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Entradas" 
        description="Consultar todas as entradas de stock" 
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
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Nº Fatura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gestorApp-gray">
                    Nenhuma entrada encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => {
                  const product = products.find(p => p.id === entry.productId);
                  const supplier = suppliers.find(s => s.id === entry.supplierId);
                  
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDateTime(entry.createdAt)}</TableCell>
                      <TableCell className="font-medium">
                        {product ? `${product.code} - ${product.name}` : 'Produto removido'}
                      </TableCell>
                      <TableCell>{supplier ? supplier.name : 'Fornecedor removido'}</TableCell>
                      <TableCell>{entry.quantity} unid.</TableCell>
                      <TableCell>{formatCurrency(entry.purchasePrice)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(entry.quantity * entry.purchasePrice)}
                      </TableCell>
                      <TableCell>{entry.invoiceNumber || '-'}</TableCell>
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
