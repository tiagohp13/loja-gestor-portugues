
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, History, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import RecordCount from '@/components/common/RecordCount';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { validatePermission } from '@/utils/permissionUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClientTotalSpent } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatting';
import { calculateClientTag } from '@/utils/clientTags';
import ClientTag from '@/components/common/ClientTag';
import { useClientTags } from '@/hooks/useClientTags';

const ClientList = () => {
  const navigate = useNavigate();
  const { clients, deleteClient, stockExits } = useData();
  const { config: tagConfig } = useClientTags();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [clientsWithSpent, setClientsWithSpent] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientTotals = async () => {
      setIsLoading(true);
      try {
        const clientsWithTotals = await Promise.all(
          clients.map(async (client) => {
            const totalSpent = await getClientTotalSpent(client.id);
            return {
              ...client,
              totalSpent
            };
          })
        );
        setClientsWithSpent(clientsWithTotals);
      } catch (error) {
        console.error('Error fetching client totals:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os valores gastos pelos clientes",
          variant: "destructive",
        });
        setClientsWithSpent(clients.map(client => ({ ...client, totalSpent: 0 })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientTotals();
  }, [clients]);

  const filteredClients = clientsWithSpent.filter(client => 
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
    if (!validatePermission(canEdit, 'editar clientes')) return;
    navigate(`/clientes/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    if (!validatePermission(canDelete, 'eliminar clientes')) return;
    deleteClient(id);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Clientes" 
        description="Consultar e gerir todos os clientes" 
        actions={
          canCreate && (
            <Button onClick={() => {
              if (!validatePermission(canCreate, 'criar clientes')) return;
              navigate('/clientes/novo');
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          )
        }
      />
      
      <RecordCount 
        title="Total de clientes"
        count={clients.length}
        icon={Users}
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
                <TableHead>Etiqueta</TableHead>
                <TableHead>Valor Gasto</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gestorApp-gray">
                    A carregar dados...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gestorApp-gray">
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
                    <TableCell>
                      <ClientTag tag={calculateClientTag(client, stockExits, tagConfig)} />
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {formatCurrency(client.totalSpent)}
                    </TableCell>
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
                        {canEdit && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Editar"
                            onClick={(e) => handleEdit(client.id, e)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && (
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
                        )}
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
