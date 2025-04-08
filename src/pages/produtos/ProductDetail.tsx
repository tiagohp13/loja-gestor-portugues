
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';
import { StockEntryItem, StockExitItem } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, getProductHistory, isLoading } = useData();
  const [productHistory, setProductHistory] = useState<{ entries: any[], exits: any[] }>({ entries: [], exits: [] });
  
  useEffect(() => {
    if (id) {
      const history = getProductHistory(id);
      if (history) {
        setProductHistory(history);
      }
    }
  }, [id, getProductHistory]);
  
  if (isLoading) return <LoadingSpinner />;
  
  const product = id ? getProduct(id) : null;
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/produtos')}>
          Voltar ao Catálogo
        </Button>
      </div>
    );
  }
  
  const stockPercentage = Math.min(100, Math.max(0, (product.currentStock / (product.minStock * 2)) * 100));
  
  // Get stock movement for this product from entries and exits
  const entriesForProduct = productHistory.entries
    .flatMap(entry => entry.items
      .filter((item: StockEntryItem) => item.productId === id)
      .map((item: StockEntryItem) => ({
        date: entry.date,
        number: entry.number,
        document: entry.invoiceNumber || '-',
        supplierName: entry.supplierName,
        quantity: item.quantity,
        unitPrice: item.purchasePrice,
        total: item.quantity * item.purchasePrice
      }))
    );
  
  const exitsForProduct = productHistory.exits
    .flatMap(exit => exit.items
      .filter((item: StockExitItem) => item.productId === id)
      .map((item: StockExitItem) => ({
        date: exit.date,
        number: exit.number,
        document: exit.invoiceNumber || '-',
        clientName: exit.clientName,
        quantity: item.quantity,
        unitPrice: item.salePrice,
        total: item.quantity * item.salePrice
      }))
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={product.name} 
        description={`Código: ${product.code}`}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/produtos')}>
              Voltar ao Catálogo
            </Button>
            <Button onClick={() => navigate(`/produtos/editar/${id}`)}>
              Editar Produto
            </Button>
          </div>
        }
      />
      
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Detalhes do Produto</span>
              <StatusBadge status={product.status || 'active'} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Descrição</p>
                <p>{product.description || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Categoria</p>
                <p>{product.category || '-'}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Preço de Compra</p>
                <p className="text-lg font-semibold">{formatCurrency(product.purchasePrice)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Preço de Venda</p>
                <p className="text-lg font-semibold">{formatCurrency(product.salePrice)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium text-gray-500">Data de Criação</p>
              <p>{formatDateString(product.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{product.currentStock}</p>
              <p className="text-sm text-gray-500">Unidades em Stock</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Stock Mínimo: {product.minStock}</span>
                <span className="font-medium">
                  {product.currentStock < product.minStock ? (
                    <Badge variant="destructive">Abaixo do Mínimo</Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </span>
              </div>
              <Progress value={stockPercentage} className={`h-2 ${stockPercentage < 50 ? 'bg-red-200' : 'bg-green-200'}`} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Entradas</h3>
        {entriesForProduct.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Entrada</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entriesForProduct.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(entry.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.document}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(entry.unitPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(entry.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Sem entradas registadas para este produto.</p>
        )}
      </div>
      
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Saídas</h3>
        {exitsForProduct.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Saída</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exitsForProduct.map((exit, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(exit.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exit.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exit.document}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exit.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exit.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(exit.unitPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(exit.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Sem saídas registadas para este produto.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
