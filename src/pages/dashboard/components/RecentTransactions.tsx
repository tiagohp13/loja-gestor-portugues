
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatting';
import { TransactionItem } from '../hooks/utils/transactionUtils';
import { useNavigate } from 'react-router-dom';

interface RecentTransactionsProps {
  recentTransactions: TransactionItem[];
  navigateToProductDetail: (id: string) => void;
  navigateToClientDetail: (id: string) => void;
  navigateToSupplierDetail: (id: string) => void;
  ensureDate: (date: string | Date) => Date;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  recentTransactions,
  navigateToProductDetail,
  navigateToClientDetail,
  navigateToSupplierDetail,
  ensureDate
}) => {
  const navigate = useNavigate();
  
  // Limit the number of transactions to display
  const displayLimit = 6;
  
  const limitTransactions = (transactions: TransactionItem[]) => {
    return transactions.slice(0, displayLimit);
  };
  
  const filteredAllTransactions = limitTransactions(recentTransactions);
  const filteredEntryTransactions = limitTransactions(recentTransactions.filter(t => t.type === 'entry'));
  const filteredExitTransactions = limitTransactions(recentTransactions.filter(t => t.type === 'exit'));

  const handleViewAllTransactions = () => {
    navigate('/transacoes');
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>Transações Recentes</CardTitle>
        <Button 
          variant="link" 
          onClick={handleViewAllTransactions}
          className="text-blue-500 h-auto p-0 text-sm"
        >
          Ver todas
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="entry">Entradas</TabsTrigger>
            <TabsTrigger value="exit">Saídas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ul className="space-y-3">
              {filteredAllTransactions.length > 0 ? (
                filteredAllTransactions.map((transaction) => (
                  <li key={`${transaction.id}-${transaction.productId}`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Button 
                        variant="link" 
                        className="font-normal p-0 h-auto text-blue-500 hover:underline transition-colors"
                        onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                      >
                        {transaction.product?.name || "Produto removido"}
                      </Button>
                      <div className="text-sm text-gray-500">
                        {transaction.type === 'entry' ? 'Fornecedor' : 'Cliente'}: 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto ml-1 font-normal text-blue-500 hover:underline transition-colors"
                          onClick={() => transaction.entityId && (
                            transaction.type === 'entry' 
                              ? navigateToSupplierDetail(transaction.entityId)
                              : navigateToClientDetail(transaction.entityId)
                          )}
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
              {filteredEntryTransactions.length > 0 ? (
                filteredEntryTransactions.map((transaction) => (
                  <li key={`${transaction.id}-${transaction.productId}-entry`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Button 
                        variant="link" 
                        className="font-normal p-0 h-auto text-blue-500 hover:underline transition-colors"
                        onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                      >
                        {transaction.product?.name || "Produto removido"}
                      </Button>
                      <div className="text-sm text-gray-500">
                        Fornecedor: 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto ml-1 font-normal text-blue-500 hover:underline transition-colors"
                          onClick={() => transaction.entityId && navigateToSupplierDetail(transaction.entityId)}
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
              {filteredExitTransactions.length > 0 ? (
                filteredExitTransactions.map((transaction) => (
                  <li key={`${transaction.id}-${transaction.productId}-exit`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Button 
                        variant="link" 
                        className="font-normal p-0 h-auto text-blue-500 hover:underline transition-colors"
                        onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                      >
                        {transaction.product?.name || "Produto removido"}
                      </Button>
                      <div className="text-sm text-gray-500">
                        Cliente: 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto ml-1 font-normal text-blue-500 hover:underline transition-colors"
                          onClick={() => transaction.entityId && navigateToClientDetail(transaction.entityId)}
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
  );
};

export default RecentTransactions;
