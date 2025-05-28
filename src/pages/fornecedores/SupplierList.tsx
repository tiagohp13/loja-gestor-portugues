import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import RecordCount from '@/components/common/RecordCount';
import { Search, Plus, Truck } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const SupplierList = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { suppliers, deleteSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSupplier = (id: string) => {
    navigate(`/fornecedores/${id}`);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/fornecedores/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteSupplier(id);
  };

  const handleAddSupplier = () => {
    navigate('/fornecedores/novo');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Fornecedores" 
        description="Consultar e gerir todos os fornecedores" 
      />
      
      <RecordCount 
        title="Total de fornecedores"
        count={suppliers.length}
        icon={Truck}
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-start">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por nome, email ou telefone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddSupplier}>
            <Plus className="h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Telefone</th>
                <th className="text-left p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => (
                <tr 
                  key={supplier.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewSupplier(supplier.id)}
                >
                  <td className="p-3 font-medium">{supplier.name}</td>
                  <td className="p-3">{supplier.email}</td>
                  <td className="p-3">{supplier.phone}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handleEdit(supplier.id, e)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(supplier.id);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum fornecedor encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
