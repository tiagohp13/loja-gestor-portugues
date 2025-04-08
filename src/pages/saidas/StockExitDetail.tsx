
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Loader2, ArrowLeft, Pencil } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { StockExit } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const StockExitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits } = useData();
  
  const [exit, setExit] = useState<StockExit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExitDetails();
  }, [id]);

  const fetchExitDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      // First try to fetch from Supabase
      const { data: exitData, error: exitError } = await supabase
        .from('StockExits')
        .select('*')
        .eq('id', id)
        .single();
      
      if (exitError) {
        throw exitError;
      }
      
      if (!exitData) {
        throw new Error('Saída não encontrada');
      }
      
      // Fetch exit items
      const { data: itemsData, error: itemsError } = await supabase
        .from('StockExitsItems')
        .select('*')
        .eq('exitid', id);
      
      if (itemsError) {
        throw itemsError;
      }
      
      // Map the data to our expected format
      const mappedItems = (itemsData || []).map(item => ({
        productId: item.productid,
        productName: item.productname,
        quantity: item.quantity,
        salePrice: item.saleprice,
        discount: item.discount || 0
      }));
      
      const mappedExit: StockExit = {
        id: exitData.id,
        clientId: exitData.clientid,
        clientName: exitData.clientname,
        reason: exitData.reason,
        exitNumber: exitData.exitnumber,
        date: exitData.date,
        invoiceNumber: exitData.invoicenumber,
        notes: exitData.notes,
        status: exitData.status as "pending" | "completed" | "cancelled",
        discount: exitData.discount || 0,
        fromOrderId: exitData.fromorderid,
        createdAt: exitData.createdat,
        updatedAt: exitData.updatedat,
        items: mappedItems
      };
      
      setExit(mappedExit);
    } catch (error) {
      console.error('Error fetching exit details:', error);
      
      // Fallback to local data
      const foundExit = stockExits.find(e => e.id === id);
      
      if (foundExit) {
        setExit(foundExit);
      } else {
        toast.error('Saída não encontrada');
        navigate('/saidas/historico');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!exit) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Saída não encontrada</h2>
          <Button onClick={() => navigate('/saidas/historico')}>
            Voltar à lista
          </Button>
        </div>
      </div>
    );
  }

  // Calculate order subtotal
  const subtotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
  
  // Calculate discount amount
  const discountAmount = subtotal * (exit.discount / 100);
  
  // Calculate total with discount
  const total = subtotal - discountAmount;

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Detalhes da Saída" 
        description={`Saída #${exit.exitNumber || 'N/A'}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/saidas/editar/${exit.id}`)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={() => navigate("/saidas/historico")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Lista
            </Button>
          </div>
        }
      />
      
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informações da Saída</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Número</dt>
                <dd>{exit.exitNumber || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Data</dt>
                <dd>{formatDate(exit.date)}</dd>
              </div>
              {exit.clientName && (
                <div>
                  <dt className="font-medium text-gestorApp-gray-dark">Cliente</dt>
                  <dd>{exit.clientName}</dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Estado</dt>
                <dd>
                  <StatusBadge status={exit.status} />
                </dd>
              </div>
              {exit.fromOrderId && (
                <div className="col-span-2">
                  <dt className="font-medium text-gestorApp-gray-dark">Encomenda de Origem</dt>
                  <dd className="mt-1">
                    <Link 
                      to={`/encomendas/${exit.fromOrderId}`}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver encomenda
                    </Link>
                  </dd>
                </div>
              )}
              <div className="col-span-2">
                <dt className="font-medium text-gestorApp-gray-dark">Motivo</dt>
                <dd>{exit.reason}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-gestorApp-gray-dark">Notas</dt>
                <dd className="mt-1">{exit.notes || "Sem notas"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Subtotal</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Desconto</dt>
                <dd>{exit.discount}% ({formatCurrency(discountAmount)})</dd>
              </div>
              <div className="col-span-2 border-t pt-2 mt-2">
                <dt className="font-medium text-gestorApp-gray-dark">Total</dt>
                <dd className="text-xl font-bold text-gestorApp-blue mt-1">
                  {formatCurrency(total)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Produto</th>
                  <th className="text-right py-3 px-4 font-medium">Quantidade</th>
                  <th className="text-right py-3 px-4 font-medium">Preço Unit.</th>
                  <th className="text-right py-3 px-4 font-medium">Desconto</th>
                  <th className="text-right py-3 px-4 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {exit.items.map((item, index) => {
                  const itemDiscount = item.discount || 0;
                  const itemSubtotal = item.quantity * item.salePrice * (1 - itemDiscount / 100);
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.productName}</td>
                      <td className="text-right py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.salePrice)}</td>
                      <td className="text-right py-3 px-4">{itemDiscount}%</td>
                      <td className="text-right py-3 px-4">{formatCurrency(itemSubtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right py-3 px-4 font-medium">Subtotal</td>
                  <td className="text-right py-3 px-4">{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right py-3 px-4 font-medium">Desconto ({exit.discount}%)</td>
                  <td className="text-right py-3 px-4">{formatCurrency(discountAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right py-3 px-4 font-bold">Total</td>
                  <td className="text-right py-3 px-4 font-bold">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockExitDetail;
