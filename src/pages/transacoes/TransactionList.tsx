
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/utils/formatting';
import { Skeleton } from '@/components/ui/skeleton';
import { ListFilter, RefreshCcw, Plus, Receipt } from 'lucide-react';

// Alteramos a interface para aceitar string no type e adicionamos user_id
// que vem do banco de dados mas estava faltando na interface
interface Transaction {
  id: string;
  date: string;
  type: string; // Mudamos de 'income' | 'expense' para string
  amount: number;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const TransactionList: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      // Aplicar filtro por tipo se estiver definido
      if (filterType) {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setTransactions(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar transações:', err.message);
      setError('Não foi possível carregar as transações. Por favor, tente novamente.');
      toast({
        title: 'Erro',
        description: 'Falha ao carregar transações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type: string | null) => {
    setFilterType(type === filterType ? null : type);
  };

  // Função helper para verificar se o tipo é válido
  const isValidType = (type: string): boolean => {
    return type === 'income' || type === 'expense';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Transações"
        description="Gestão de movimentos financeiros"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => handleFilterChange('income')}
              className={filterType === 'income' ? 'bg-green-100' : ''}
            >
              Entradas
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFilterChange('expense')}
              className={filterType === 'expense' ? 'bg-red-100' : ''}
            >
              Saídas
            </Button>
            <Button variant="outline" onClick={fetchTransactions}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={() => navigate('/transacoes/nova')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </>
        }
      />

      <Card className="mt-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size={40} />
                <span className="ml-2 text-lg">A carregar transações...</span>
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchTransactions}>
                Tentar Novamente
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Sem transações</h3>
              <p className="text-gray-500 mb-4">
                {filterType
                  ? `Não existem transações do tipo ${
                      filterType === 'income' ? 'entrada' : 'saída'
                    }.`
                  : 'Não existem transações registadas.'}
              </p>
              <Button
                onClick={() => navigate('/transacoes/nova')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Forma Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>{transaction.reference_number || '-'}</TableCell>
                      <TableCell>{transaction.payment_method || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/transacoes/${transaction.id}`)}
                        >
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;
