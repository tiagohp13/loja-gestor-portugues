
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateTime, formatDateString } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';
import { CalendarClock, MapPin, Mail, Phone, FileText, CreditCard } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, getClientHistory, isLoading } = useData();
  const [clientHistory, setClientHistory] = useState<{ orders: any[], exits: any[] }>({ orders: [], exits: [] });
  
  useEffect(() => {
    if (id) {
      const history = getClientHistory(id);
      if (history) {
        setClientHistory(history);
      }
    }
  }, [id, getClientHistory]);
  
  if (isLoading) return <LoadingSpinner />;
  
  const client = id ? getClient(id) : null;
  
  if (!client) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/clientes/consultar')}>
          Voltar à Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={client.name} 
        description="Detalhes do cliente"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/clientes/consultar')}>
              Voltar à Lista
            </Button>
            <Button onClick={() => navigate(`/clientes/editar/${id}`)}>
              Editar Cliente
            </Button>
          </div>
        }
      />
      
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Informações do Cliente</span>
              <StatusBadge status={client.status || 'active'} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p>{client.address}</p>
                </div>
              </div>
            )}
            
            {client.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">E-mail</p>
                  <p>{client.email}</p>
                </div>
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p>{client.phone}</p>
                </div>
              </div>
            )}
            
            {client.taxId && (
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">NIF</p>
                  <p>{client.taxId}</p>
                </div>
              </div>
            )}
            
            {client.notes && (
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Notas</p>
                  <p className="whitespace-pre-line">{client.notes}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <CalendarClock className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                <p>{formatDateString(client.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Total de encomendas: {clientHistory.orders?.length || 0}</p>
              <p>Total de saídas: {clientHistory.exits?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Encomendas</h3>
        {clientHistory.orders?.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientHistory.orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(order.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items.reduce((total, item) => 
                        total + (item.quantity * item.salePrice * (1 - (item.discountPercent || 0) / 100)), 0).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={order.convertedToStockExitId ? "default" : "secondary"}>
                        {order.convertedToStockExitId ? "Convertida" : "Pendente"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" onClick={() => navigate(`/encomendas/detalhe/${order.id}`)}>Ver</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Sem encomendas registadas.</p>
        )}
      </div>
      
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Saídas</h3>
        {clientHistory.exits?.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientHistory.exits.map((exit) => (
                  <tr key={exit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exit.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(exit.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exit.invoiceNumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exit.items.reduce((total, item) => 
                        total + (item.quantity * item.salePrice * (1 - (item.discountPercent || 0) / 100)), 0).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" onClick={() => navigate(`/saidas/detalhe/${exit.id}`)}>Ver</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Sem saídas registadas.</p>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;
