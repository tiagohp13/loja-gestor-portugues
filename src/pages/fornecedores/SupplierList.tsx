
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SupplierList = () => {
  const navigate = useNavigate();
  const { suppliers, deleteSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchTerm))
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este fornecedor?')) {
      deleteSupplier(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Fornecedores" 
        description="Consultar e gerir todos os fornecedores" 
        actions={
          <Button onClick={() => navigate('/fornecedores/novo')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
          <Input
            className="pl-10"
            placeholder="Pesquisar por nome, email ou telefone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Morada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gestorApp-gray">
                    Nenhum fornecedor encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>{supplier.address || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" title="Histórico">
                          <History className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Eliminar"
                          onClick={() => handleDelete(supplier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
