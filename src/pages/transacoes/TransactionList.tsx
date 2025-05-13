
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/formatting';
import { TransactionItem } from '../dashboard/hooks/utils/transactionUtils';
import { useData } from '@/contexts/DataContext';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { createAllTransactions } from '../dashboard/hooks/utils/transactionUtils';
import { ensureDate } from '../dashboard/hooks/utils/dateUtils';

const TransactionList = () => {
  const navigate = useNavigate();
  const { products, suppliers, clients, stockEntries, stockExits } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Create all transactions
  const allTransactions = createAllTransactions(stockEntries, stockExits, products, suppliers, clients);
  
  // Sort by date (most recent first)
  const sortedTransactions = [...allTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter transactions based on search term
  const filteredTransactions = sortedTransactions.filter(transaction => {
    const productName = transaction.product?.name?.toLowerCase() || '';
    const entityName = transaction.entity?.toLowerCase() || '';
    
    return productName.includes(searchTerm.toLowerCase()) || 
           entityName.includes(searchTerm.toLowerCase());
  });

  // Filtered by type
  const entryTransactions = filteredTransactions.filter(t => t.type === 'entry');
  const exitTransactions = filteredTransactions.filter(t => t.type === 'exit');

  const handleProductClick = (productId: string) => {
    navigate(`/produtos/${productId}`);
  };

  const handleEntityClick = (entityId: string, type: 'entry' | 'exit') => {
    if (type === 'entry') {
      navigate(`/fornecedores/${entityId}`);
    } else {
      navigate(`/clientes/${entityId}`);
    }
  };
  
  const handleBackClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Histórico de Transações"
        description="Lista de todas as entradas e saídas de stock"
        actions={
          <Button variant="outline" onClick={handleBackClick}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
          </Button>
        }
      />

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>Todas as Transações</CardTitle>
          <div className="relative w-full md:w-1/2 mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por produto ou entidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas ({filteredTransactions.length})</TabsTrigger>
              <TabsTrigger value="entry">Entradas ({entryTransactions.length})</TabsTrigger>
              <TabsTrigger value="exit">Saídas ({exitTransactions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ul className="space-y-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <li key={`${transaction.id}-${transaction.productId}`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <Button 
                          variant="link" 
                          className="font-medium p-0 h-auto text-gray-800 hover:text-blue-600 hover:underline transition-colors"
                          onClick={() => transaction.product && handleProductClick(transaction.product.id)}
                        >
                          {transaction.product?.name || "Produto removido"}
                        </Button>
                        <div className="text-sm text-gray-500">
                          {transaction.type === 'entry' ? 'Fornecedor' : 'Cliente'}: 
                          <Button 
                            variant="link" 
                            className="p-0 h-auto ml-1 text-gray-500 hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => transaction.entityId && handleEntityClick(transaction.entityId, transaction.type)}
                          >
                            {transaction.entity}
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={transaction.type === 'entry' ? 'text-red-500' : 'text-green-600'}>
                          {transaction.type === 'entry' ? '+ ' : '- '}
                          {transaction.quantity} unidades
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(ensureDate(transaction.date))}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-6 text-gray-500">
                    Nenhuma transação encontrada
                  </li>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="entry">
              <ul className="space-y-3">
                {entryTransactions.length > 0 ? (
                  entryTransactions.map((transaction) => (
                    <li key={`${transaction.id}-${transaction.productId}-entry`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <Button 
                          variant="link" 
                          className="font-medium p-0 h-auto text-gray-800 hover:text-blue-600 hover:underline transition-colors"
                          onClick={() => transaction.product && handleProductClick(transaction.product.id)}
                        >
                          {transaction.product?.name || "Produto removido"}
                        </Button>
                        <div className="text-sm text-gray-500">
                          Fornecedor: 
                          <Button 
                            variant="link" 
                            className="p-0 h-auto ml-1 text-gray-500 hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => transaction.entityId && handleEntityClick(transaction.entityId, 'entry')}
                          >
                            {transaction.entity}
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-500">
                          + {transaction.quantity} unidades
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(ensureDate(transaction.date))}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-6 text-gray-500">
                    Nenhuma entrada encontrada
                  </li>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="exit">
              <ul className="space-y-3">
                {exitTransactions.length > 0 ? (
                  exitTransactions.map((transaction) => (
                    <li key={`${transaction.id}-${transaction.productId}-exit`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <Button 
                          variant="link" 
                          className="font-medium p-0 h-auto text-gray-800 hover:text-blue-600 hover:underline transition-colors"
                          onClick={() => transaction.product && handleProductClick(transaction.product.id)}
                        >
                          {transaction.product?.name || "Produto removido"}
                        </Button>
                        <div className="text-sm text-gray-500">
                          Cliente: 
                          <Button 
                            variant="link" 
                            className="p-0 h-auto ml-1 text-gray-500 hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => transaction.entityId && handleEntityClick(transaction.entityId, 'exit')}
                          >
                            {transaction.entity}
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600">
                          - {transaction.quantity} unidades
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(ensureDate(transaction.date))}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-6 text-gray-500">
                    Nenhuma saída encontrada
                  </li>
                )}
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;
