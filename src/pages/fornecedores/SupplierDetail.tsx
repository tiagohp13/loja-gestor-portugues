
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Edit, Trash2 } from 'lucide-react';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplier, deleteSupplier, getSupplierHistory } = useData();
  const supplier = getSupplier(id as string);
  
  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Fornecedor não encontrado</h2>
          <Button onClick={() => navigate('/fornecedores/consultar')}>
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }
  
  const supplierHistory = getSupplierHistory(supplier.id);
  
  const handleEdit = () => {
    navigate(`/fornecedores/editar/${supplier.id}`);
  };
  
  const handleDelete = () => {
    deleteSupplier(supplier.id);
    navigate('/fornecedores/consultar');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={supplier.name} 
        description={supplier.email}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/fornecedores/consultar')}>
              Voltar à Lista
            </Button>
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
            <DeleteConfirmDialog
              title="Eliminar Fornecedor"
              description="Tem certeza que deseja eliminar este fornecedor? Esta ação não pode ser desfeita."
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
            <CardTitle>Detalhes do Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gestorApp-gray">Nome</p>
                <p className="font-medium">{supplier.name}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Email</p>
                <p className="font-medium">{supplier.email}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Telefone</p>
                <p className="font-medium">{supplier.phone || "Não definido"}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">NIF</p>
                <p className="font-medium">{supplier.taxId || "Não definido"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gestorApp-gray">Morada</p>
                <p className="font-medium">{supplier.address || "Não definida"}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Data de Criação</p>
                <p className="font-medium">{formatDate(new Date(supplier.createdAt))}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Última Atualização</p>
                <p className="font-medium">{formatDate(new Date(supplier.updatedAt))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          {supplierHistory.length > 0 ? (
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
                  {supplierHistory.map(entry => (
                    <tr key={entry.id} className="border-b hover:bg-gestorApp-gray-light">
                      <td className="px-4 py-2">{formatDate(new Date(entry.createdAt))}</td>
                      <td className="px-4 py-2">
                        {entry.product ? entry.product.name : entry.productName || "Desconhecido"}
                      </td>
                      <td className="px-4 py-2">{entry.quantity} unidades</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(entry.purchasePrice)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(entry.quantity * entry.purchasePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gestorApp-gray">Nenhuma entrega registada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierDetail;
