
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';
import { CalendarClock, MapPin, Mail, Phone, FileText, CreditCard, Clock, DollarSign } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getSupplierTotalSpent } from '@/integrations/supabase/client';

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplier, getSupplierHistory, isLoading } = useData();
  const [supplierHistory, setSupplierHistory] = useState<{ entries: any[] }>({ entries: [] });
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);
  
  useEffect(() => {
    if (id) {
      const fetchSupplierData = async () => {
        const history = getSupplierHistory(id);
        if (history) {
          setSupplierHistory(history);
        }
        
        // Obter total gasto com o fornecedor
        setIsLoadingTotal(true);
        try {
          const spent = await getSupplierTotalSpent(id);
          setTotalSpent(spent);
        } catch (error) {
          console.error('Error fetching supplier total spent:', error);
        } finally {
          setIsLoadingTotal(false);
        }
      };
      
      fetchSupplierData();
    }
  }, [id, getSupplierHistory]);
  
  if (isLoading) return <LoadingSpinner />;
  
  const supplier = id ? getSupplier(id) : null;
  
  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Fornecedor não encontrado</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/fornecedores/consultar')}>
          Voltar à Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={supplier.name} 
        description="Detalhes do fornecedor"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/fornecedores/consultar')}>
              Voltar à Lista
            </Button>
            <Button onClick={() => navigate(`/fornecedores/editar/${id}`)}>
              Editar Fornecedor
            </Button>
          </div>
        }
      />
      
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Informações do Fornecedor</span>
              <StatusBadge status={supplier.status || 'active'} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p>{supplier.address}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Gasto</p>
                {isLoadingTotal ? (
                  <p>Calculando...</p>
                ) : (
                  <p className="font-semibold text-blue-600">{formatCurrency(totalSpent)}</p>
                )}
              </div>
            </div>
            
            {supplier.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">E-mail</p>
                  <p>{supplier.email}</p>
                </div>
              </div>
            )}
            
            {supplier.phone && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p>{supplier.phone}</p>
                </div>
              </div>
            )}
            
            {supplier.taxId && (
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">NIF</p>
                  <p>{supplier.taxId}</p>
                </div>
              </div>
            )}
            
            {supplier.paymentTerms && (
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Condições de Pagamento</p>
                  <p>{supplier.paymentTerms}</p>
                </div>
              </div>
            )}
            
            {supplier.notes && (
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Notas</p>
                  <p className="whitespace-pre-line">{supplier.notes}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <CalendarClock className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                <p>{formatDateString(supplier.createdAt)}</p>
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
              <p>Total de entradas: {supplierHistory.entries?.length || 0}</p>
              {!isLoadingTotal && (
                <p>Total gasto: {formatCurrency(totalSpent)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Entradas</h3>
        {supplierHistory.entries?.length > 0 ? (
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
                {supplierHistory.entries.map((entry) => (
                  <tr 
                    key={entry.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/entradas/${entry.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{entry.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(entry.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.invoiceNumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(entry.items.reduce((total, item) => 
                        total + (item.quantity * item.purchasePrice * (1 - (item.discountPercent || 0) / 100)), 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/entradas/${entry.id}`);
                      }}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Sem entradas registadas.</p>
        )}
      </div>
    </div>
  );
};

export default SupplierDetail;
