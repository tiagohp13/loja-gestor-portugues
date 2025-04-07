
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ClientList = () => {
  const navigate = useNavigate();
  const { clients, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  const handleViewClient = (id: string) => {
    navigate(`/clientes/${id}`);
  };

  const handleViewHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/clientes/${id}?tab=history`);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/clientes/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Clientes" 
        description="Consultar e gerir todos os clientes" 
        actions={
          <Button onClick={() => navigate('/clientes/novo')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
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
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gestorApp-gray">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewClient(client.id)}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>{client.address || '-'}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Histórico"
                          onClick={(e) => handleViewHistory(client.id, e)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Editar"
                          onClick={(e) => handleEdit(client.id, e)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DeleteConfirmDialog
                          title="Eliminar Cliente"
                          description={`Tem a certeza que deseja eliminar o cliente "${client.name}"?`}
                          onDelete={() => handleDelete(client.id)}
                          trigger={
                            <Button variant="outline" size="sm" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
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

export default ClientList;
