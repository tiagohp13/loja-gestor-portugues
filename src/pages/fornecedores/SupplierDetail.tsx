import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getSupplierTotalSpent } from '@/integrations/supabase/client';
import { useSupplierDetail } from './hooks/useSupplierDetail';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, MapPin, Mail, Phone, FileText, CreditCard, ShoppingCart, Receipt } from 'lucide-react';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supplier, supplierEntries, supplierExpenses, isLoading } = useSupplierDetail();
  const [totalSpent, setTotalSpent] = useState<number>(0);
	const [isLoadingTotal, setIsLoadingTotal] = useState(true);

  useEffect(() => {
    const fetchSupplierData = async () => {
      if (id) {
        setIsLoadingTotal(true);
        try {
          const spent = await getSupplierTotalSpent(id);
          setTotalSpent(spent);
        } catch (error) {
          console.error('Error fetching supplier total spent:', error);
        } finally {
          setIsLoadingTotal(false);
        }
      }
    };

    fetchSupplierData();
  }, [id]);

  if (isLoading) return <LoadingSpinner />;

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
            <Button onClick={() => navigate(`/fornecedores/editar/${id}`)}>
              Editar Fornecedor
            </Button>
            <Button variant="outline" onClick={() => navigate('/fornecedores/consultar')}>
              Voltar à Lista
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
              <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Gasto</p>
                {isLoadingTotal ? (
                  <p>A carregar...</p>
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
                <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
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
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stock Entries */}
            {supplierEntries.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Compras ({supplierEntries.length})
                </h4>
                <div className="space-y-2">
                  {supplierEntries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/entradas/${entry.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{entry.number}</p>
                          <p className="text-xs text-gray-500">{formatDateString(entry.date)}</p>
                        </div>
                        {entry.invoice_number && (
                          <p className="text-xs text-gray-400">Fatura: {entry.invoice_number}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses */}
            {supplierExpenses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <Receipt className="h-4 w-4 mr-1" />
                  Despesas ({supplierExpenses.length})
                </h4>
                <div className="space-y-2">
                  {supplierExpenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/despesas/${expense.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{expense.number}</p>
                          <p className="text-xs text-gray-500">{formatDateString(expense.date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {supplierEntries.length === 0 && supplierExpenses.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum documento encontrado para este fornecedor.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDetail;
