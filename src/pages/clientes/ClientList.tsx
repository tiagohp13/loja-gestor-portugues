
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, History, Plus, Users } from 'lucide-react';
import { useClientsQuery } from '@/hooks/queries/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import RecordCount from '@/components/common/RecordCount';
import SortableTableHeader from '@/components/ui/SortableTableHeader';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { validatePermission } from '@/utils/permissionUtils';
import { useClientTags } from '@/hooks/useClientTags';
import { ptBR } from 'date-fns/locale';
import { checkClientDependencies } from '@/utils/dependencyUtils';
import { useSortableClients } from '@/hooks/useSortableClients';
import TopClientsSection from '@/components/clients/TopClientsSection';
import TableSkeleton from '@/components/ui/TableSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from '@/utils/formatting';
import { calculateClientTag } from '@/utils/clientTags';
import ClientTag from '@/components/common/ClientTag';
import { format } from 'date-fns';
import { useClientKpis } from './hooks/useClientKpis';
import ClientInsights from './components/ClientInsights';

const ClientList = () => {
  const navigate = useNavigate();
  const { deleteClient } = useClientsQuery();
  const { config: tagConfig } = useClientTags();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  // Use sortable clients hook
  const { clients, isLoading, handleSort, getSortIcon } = useSortableClients();
  
  // Calculate client KPIs using database fields
  const kpis = useClientKpis(clients, []);

  const handleViewAllTopClients = () => {
    // Ensure we sort by totalSpent in descending order
    // If already sorted by totalSpent ascending, clicking again will make it descending
    // If not sorted by totalSpent, first click will be ascending, so we need two clicks
    const currentSort = getSortIcon('totalSpent');
    if (currentSort === null) {
      // Not sorted by totalSpent, need to click twice to get descending
      handleSort('totalSpent'); // First click: ascending
      setTimeout(() => handleSort('totalSpent'), 100); // Second click: descending
    } else if (currentSort === 'asc') {
      // Already ascending, click once more to get descending
      handleSort('totalSpent');
    }
    // If already descending, no need to do anything
    
    // Scroll to the table
    setTimeout(() => {
      document.querySelector('.overflow-x-auto')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 200);
  };

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
    if (!validatePermission(canEdit, 'editar clientes')) return;
    navigate(`/clientes/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    if (!validatePermission(canDelete, 'eliminar clientes')) return;
    deleteClient(id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Clientes" 
          description="Consultar e gerir todos os clientes" 
        />
        <TableSkeleton title="A carregar clientes..." rows={5} columns={6} />
      </div>
    );
  }

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
      
      {/* Client Insights */}
      <ClientInsights
        inactiveClients90d={kpis.inactiveClients90d}
        newClients30d={kpis.newClients30d}
        top5Percentage={kpis.top5Percentage}
        avgSpentChange={kpis.avgSpentChange}
        totalClients={clients.length}
      />
      
      {/* Top 5 Clientes Section */}
      <TopClientsSection onViewAllClick={handleViewAllTopClients} />
      
      <div className="bg-card rounded-lg shadow p-6 mt-6">
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
                <SortableTableHeader
                  column="name"
                  label="Nome"
                  sortDirection={getSortIcon('name')}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  column="email"
                  label="Email"
                  sortDirection={getSortIcon('email')}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  column="phone"
                  label="Telefone"
                  sortDirection={getSortIcon('phone')}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  column="tag"
                  label="Etiqueta"
                  sortDirection={getSortIcon('tag')}
                  onSort={handleSort}
                  sortable={false}
                />
                <SortableTableHeader
                  column="lastPurchaseDate"
                  label="Última Compra"
                  sortDirection={getSortIcon('lastPurchaseDate')}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  column="totalSpent"
                  label="Valor Gasto"
                  sortDirection={getSortIcon('totalSpent')}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  column="actions"
                  label="Ações"
                  sortDirection={getSortIcon('actions')}
                  onSort={handleSort}
                  sortable={false}
                  className="text-right"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gestorApp-gray">
                    A carregar dados...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gestorApp-gray">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewClient(client.id)}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>
                      <ClientTag tag={calculateClientTag(client, [], tagConfig)} />
                    </TableCell>
                    <TableCell>
                      {client.lastPurchaseDate ? (
                        <span className="text-sm">
                          {format(new Date(client.lastPurchaseDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nunca</span>
                      )}
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
                            checkDependencies={() => checkClientDependencies(client.id)}
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
