import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getSupplierTotalSpent } from '@/integrations/supabase/client';
import { useData } from '../../contexts/DataContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, MapPin, Mail, Phone, FileText, CreditCard } from 'lucide-react';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplier, isLoading } = useData();
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
  }, [id, getSupplier, getSupplierTotalSpent]);

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

        {/* Additional cards can be added here */}
      </div>
    </div>
  );
};

export default SupplierDetail;
