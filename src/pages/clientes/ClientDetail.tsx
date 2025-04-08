
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Trash2 } from 'lucide-react';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, deleteClient, getClientHistory, products } = useData();
  const client = getClient(id as string);
  
  if (!client) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Cliente não encontrado</h2>
          <Button onClick={() => navigate('/clientes/consultar')}>
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }
  
  const clientHistory = getClientHistory(client.id);
  // Get all client related transactions
  const allClientTransactions = [
    ...clientHistory.orders,
    ...clientHistory.stockExits
  ];
  
  const handleDelete = () => {
    deleteClient(client.id);
    navigate('/clientes/consultar');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={client.name} 
        description={client.email}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/clientes/consultar')}>
              Voltar à Lista
            </Button>
            <DeleteConfirmDialog
              title="Eliminar Cliente"
              description="Tem certeza que deseja eliminar este cliente? Esta ação não pode ser desfeita."
              onDelete={handleDelete}
              trigger={
                <Button 
                  variant="destructive" 
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </Button>
              }
            />
          </div>
        }
      />
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gestorApp-gray">Nome</p>
                <p className="font-medium">{client.name}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Telefone</p>
                <p className="font-medium">{client.phone || "Não definido"}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">NIF</p>
                <p className="font-medium">{client.taxId || "Não definido"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gestorApp-gray">Morada</p>
                <p className="font-medium">{client.address || "Não definida"}</p>
              </div>
              {client.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gestorApp-gray">Observações</p>
                  <p className="font-medium">{client.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gestorApp-gray">Data de Criação</p>
                <p className="font-medium">{formatDate(new Date(client.createdAt))}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Última Atualização</p>
                <p className="font-medium">{formatDate(new Date(client.updatedAt))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {allClientTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-left">Produto</th>
                    <th className="px-4 py-2 text-left">Quantidade</th>
                    <th className="px-4 py-2 text-right">Preço Unitário</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allClientTransactions.map(exit => {
                    const product = products.find(p => p.id === exit.productId);
                    
                    return (
                      <tr key={exit.id} className="border-b hover:bg-gestorApp-gray-light">
                        <td className="px-4 py-2">{formatDate(new Date(exit.createdAt))}</td>
                        <td className="px-4 py-2">
                          {product 
                            ? `${product.code} - ${product.name}` 
                            : exit.productName || "Desconhecido"}
                        </td>
                        <td className="px-4 py-2">{exit.quantity} unidades</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(exit.salePrice)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(exit.quantity * exit.salePrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gestorApp-gray">Nenhuma compra registada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetail;
