
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatting';
import { TransactionItem } from '../hooks/utils/transactionUtils';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="entry">Entradas</TabsTrigger>
            <TabsTrigger value="exit">Saídas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ul className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <li key={`${transaction.id}-${transaction.productId}`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Button 
                        variant="link" 
                        className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                        onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                      >
                        {transaction.product?.name || "Produto removido"}
                      </Button>
                      <div className="text-sm text-gestorApp-gray">
                        {transaction.type === 'entry' ? 'Fornecedor' : 'Cliente'}: 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-gestorApp-gray hover:text-blue-600"
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
                      <div className={transaction.type === 'entry' ? 'text-purple-600' : 'text-gestorApp-blue'}>
                        {transaction.type === 'entry' ? '+ ' : '- '}
                        {transaction.quantity} unidades
                      </div>
                      <div className="text-sm text-gestorApp-gray">
                        {formatDate(ensureDate(transaction.date))}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center py-6 text-gestorApp-gray">
                  Nenhuma transação encontrada
                </li>
              )}
            </ul>
          </TabsContent>
          
          <TabsContent value="entry">
            <ul className="space-y-3">
              {recentTransactions
                .filter(t => t.type === 'entry')
                .map((transaction) => (
                  <li key={`${transaction.id}-${transaction.productId}-entry`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Button 
                        variant="link" 
                        className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                        onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                      >
                        {transaction.product?.name || "Produto removido"}
                      </Button>
                      <div className="text-sm text-gestorApp-gray">
                        Fornecedor: 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-gestorApp-gray hover:text-blue-600"
                          onClick={() => transaction.entityId && navigateToSupplierDetail(transaction.entityId)}
                        >
                          {transaction.entity}
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-600">
                        + {transaction.quantity} unidades
                      </div>
                      <div className="text-sm text-gestorApp-gray">
                        {formatDate(ensureDate(transaction.date))}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </TabsContent>
          
          <TabsContent value="exit">
            <ul className="space-y-3">
              {recentTransactions
                .filter(t => t.type === 'exit')
                .map((transaction) => (
                  <li key={`${transaction.id}-${transaction.productId}-exit`} className="flex justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Button 
                        variant="link" 
                        className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                        onClick={() => transaction.product && navigateToProductDetail(transaction.product.id)}
                      >
                        {transaction.product?.name || "Produto removido"}
                      </Button>
                      <div className="text-sm text-gestorApp-gray">
                        Cliente: 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-gestorApp-gray hover:text-blue-600"
                          onClick={() => transaction.entityId && navigateToClientDetail(transaction.entityId)}
                        >
                          {transaction.entity}
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gestorApp-blue">
                        - {transaction.quantity} unidades
                      </div>
                      <div className="text-sm text-gestorApp-gray">
                        {formatDate(ensureDate(transaction.date))}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
