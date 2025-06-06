// src/pages/clientes/ClientList.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, History, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import RecordCount from '@/components/common/RecordCount';
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
import { useToast } from '@/hooks/use-toast';

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const { clients, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [totalsMap, setTotalsMap] = useState<Record<string, number>>({});
  const [isLoadingTotals, setIsLoadingTotals] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const loadTotals = async () => {
      setIsLoadingTotals(true);
      // initialize placeholders
      const initial: Record<string, number> = {};
      clients.forEach(c => { initial[c.id] = NaN; });
      setTotalsMap(initial);

      // fetch each total one by one
      for (const client of clients) {
        try {
          const total = await getClientTotalSpent(client.id);
          if (!mounted) return;
          setTotalsMap(prev => ({ ...prev, [client.id]: total }));
        } catch (err) {
          if (!mounted) return;
          console.error(`Erro ao buscar total de ${client.id}:`, err);
          setTotalsMap(prev => ({ ...prev, [client.id]: 0 }));
        }
      }

      if (mounted) setIsLoadingTotals(false);
    };

    loadTotals();
    return () => { mounted = false; };
  }, [clients, toast]);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const displayTotal = (id: string) => {
    if (isLoadingTotals) return <span className="text-gray-400">—</span>;
    const v = totalsMap[id];
    if (isNaN(v)) return <span className="text-gray-400">0</span>;
    return formatCurrency(v);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Clientes"
        description="Consultar e gerir todos os clientes"
        actions={
          <Button onClick={() => navigate('/clientes/novo')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
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
            onChange={e => setSearchTerm(e.target.value)}
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
                <TableHead>Valor Gasto</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gestorApp-gray">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map(client => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/clientes/${client.id}`)}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>{client.address || '-'}</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {displayTotal(client.id)}
                    </TableCell>
                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Histórico"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/clientes/${client.id}?tab=history`);
                          }}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Editar"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/clientes/editar/${client.id}`);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DeleteConfirmDialog
                          title="Eliminar Cliente"
                          description={`Tem a certeza que deseja eliminar o cliente "${client.name}"?`}
                          onDelete={() => deleteClient(client.id)}
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
