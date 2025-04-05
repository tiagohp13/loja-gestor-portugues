
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

const StockExitList = () => {
  const navigate = useNavigate();
  const { stockExits, products, clients } = useData();
  const [searchTerm, setSearchTerm] = useState('');

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gestorApp-gray">
                    Nenhuma saída encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredExits.map((exit) => {
                  const product = products.find(p => p.id === exit.productId);
                  const client = clients.find(c => c.id === exit.clientId);
                  
                  return (
                    <TableRow key={exit.id}>
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

export default StockExitList;
