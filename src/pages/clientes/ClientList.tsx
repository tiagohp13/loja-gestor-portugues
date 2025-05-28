import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import RecordCount from '@/components/common/RecordCount';
import { Search, Plus, Users } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const ClientList = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { clients, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClient = (id: string) => {
    navigate(`/clientes/${id}`);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/clientes/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
  };

  const handleAddClient = () => {
    navigate('/clientes/novo');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Clientes" 
        description="Consultar e gerir todos os clientes" 
      />
      
      <RecordCount 
        title="Total de clientes"
        count={clients.length}
        icon={Users}
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
          
          <Button onClick={handleAddClient}>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Telefone</th>
                <th className="text-left p-3">Cidade</th>
                <th className="text-left p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr 
                  key={client.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewClient(client.id)}
                >
                  <td className="p-3 font-medium">{client.name}</td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{client.phone}</td>
                  <td className="p-3">{client.city}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handleEdit(client.id, e)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.id);
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
          
          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientList;
