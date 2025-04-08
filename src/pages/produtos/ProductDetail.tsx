import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Trash2 } from 'lucide-react';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, deleteProduct, getProductHistory, clients, suppliers } = useData();
  const product = getProduct(id as string);
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Produto não encontrado</h2>
          <Button onClick={() => navigate('/produtos/consultar')}>
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }
  
  const { entries, exits } = getProductHistory(product.id);
  
  const handleDelete = () => {
    deleteProduct(product.id);
    navigate('/produtos/consultar');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={product.name} 
        description={`Código: ${product.code}`}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/produtos/consultar')}>
              Voltar à Lista
            </Button>
            <DeleteConfirmDialog
              title="Eliminar Produto"
              description="Tem certeza que deseja eliminar este produto? Esta ação não pode ser desfeita."
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gestorApp-gray">Nome</p>
                <p className="font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Código</p>
                <p className="font-medium">{product.code}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Categoria</p>
                <p className="font-medium">{product.category || "Não definida"}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Stock Atual</p>
                <p className="font-medium">{product.currentStock} unidades</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Preço de Compra</p>
                <p className="font-medium">{formatCurrency(product.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gestorApp-gray">Preço de Venda</p>
                <p className="font-medium">{formatCurrency(product.salePrice)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gestorApp-gray">Descrição</p>
                <p className="font-medium">{product.description || "Sem descrição"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gestorApp-gray">Data de Criação</p>
                <p className="font-medium">{formatDate(new Date(product.createdAt))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Imagem do Produto</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-64 w-auto object-contain" 
              />
            ) : (
              <div className="h-64 w-full bg-gestorApp-gray-light rounded-md flex items-center justify-center">
                <p className="text-gestorApp-gray">Sem imagem</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Movimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="entries">
            <TabsList className="mb-4">
              <TabsTrigger value="entries">Entradas ({entries.length})</TabsTrigger>
              <TabsTrigger value="exits">Saídas ({exits.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="entries">
              {entries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Data</th>
                        <th className="px-4 py-2 text-left">Fornecedor</th>
                        <th className="px-4 py-2 text-left">Quantidade</th>
                        <th className="px-4 py-2 text-right">Preço Unitário</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(entry => {
                        const supplier = suppliers.find(s => s.id === entry.supplierId);
                        
                        return (
                          <tr key={entry.id} className="border-b hover:bg-gestorApp-gray-light">
                            <td className="px-4 py-2">{formatDate(new Date(entry.createdAt))}</td>
                            <td className="px-4 py-2">
                              {supplier ? supplier.name : (entry.supplierName || "Desconhecido")}
                            </td>
                            <td className="px-4 py-2">{entry.quantity || 0} unidades</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(entry.purchasePrice || 0)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency((entry.purchasePrice || 0) * (entry.quantity || 0))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-gestorApp-gray">Nenhuma entrada registada</p>
              )}
            </TabsContent>
            
            <TabsContent value="exits">
              {exits.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Data</th>
                        <th className="px-4 py-2 text-left">Cliente</th>
                        <th className="px-4 py-2 text-left">Quantidade</th>
                        <th className="px-4 py-2 text-right">Preço Unitário</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exits.map(exit => {
                        const client = clients.find(c => c.id === exit.clientId);
                        
                        return (
                          <tr key={exit.id} className="border-b hover:bg-gestorApp-gray-light">
                            <td className="px-4 py-2">{formatDate(new Date(exit.createdAt))}</td>
                            <td className="px-4 py-2">
                              {client ? client.name : (exit.clientName || "Desconhecido")}
                            </td>
                            <td className="px-4 py-2">{exit.quantity || 0} unidades</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(exit.salePrice || 0)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency((exit.salePrice || 0) * (exit.quantity || 0))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-gestorApp-gray">Nenhuma saída registada</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetail;
