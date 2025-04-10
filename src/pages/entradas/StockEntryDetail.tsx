
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, FileText, Calendar, User, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const StockEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockEntries, isLoading } = useData();
  
  if (isLoading) return <LoadingSpinner />;
  
  const entry = stockEntries.find(entry => entry.id === id);
  
  if (!entry) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Entrada não encontrada" 
          description="A entrada que procura não existe ou foi removida"
          actions={
            <Button onClick={() => navigate('/entradas/historico')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Histórico
            </Button>
          }
        />
      </div>
    );
  }
  
  const totalItems = entry.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={`Entrada ${entry.number}`}
        description="Detalhes da entrada de stock"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/entradas/historico')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Histórico
            </Button>
            <Button onClick={() => navigate(`/entradas/editar/${entry.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Editar Entrada
            </Button>
          </div>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gestorApp-gray-dark mb-2">Informações da Entrada</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gestorApp-gray">Número</p>
                  <p className="text-gestorApp-blue font-medium">{entry.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gestorApp-gray">Data</p>
                  <p>{formatDateString(entry.date)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gestorApp-gray">Fornecedor</p>
                  <p className="font-medium">{entry.supplierName}</p>
                </div>
                {entry.invoiceNumber && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gestorApp-gray">Nº Fatura</p>
                    <p>{entry.invoiceNumber}</p>
                  </div>
                )}
              </div>
            </div>
            
            {entry.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gestorApp-gray-dark mb-2">Notas</h3>
                <p className="text-gestorApp-gray-dark p-3 border border-gray-200 rounded-md bg-gray-50">{entry.notes}</p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gestorApp-gray-dark mb-2">Produtos</h3>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">Produto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">Qtd.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">Preço</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entry.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.purchasePrice)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(item.quantity * item.purchasePrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-gray-dark">
                      Total: {totalItems} items
                    </td>
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
                      Valor total: {formatCurrency(totalValue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockEntryDetail;
