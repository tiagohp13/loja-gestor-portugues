import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Loader2, ArrowLeft, Pencil, Ban } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency } from '@/utils/formatting';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { StockExit } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const StockExitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits, updateStockExit } = useData();
  
  const [stockExit, setStockExit] = useState<StockExit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockExitDetails();
  }, [id]);

  const fetchStockExitDetails = async () => {
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
        throw new Error('Saída de stock não encontrada');
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
        discount: item.discount ?? 0 // Using nullish coalescing to set default to 0
      }));
      
      const mappedExit: StockExit = {
        id: exitData.id,
        clientId: exitData.clientid,
        clientName: exitData.clientname,
        reason: exitData.reason,
        exitNumber: exitData.exitnumber,
        date: exitData.date,
        notes: exitData.notes,
        status: exitData.status as "pending" | "completed" | "cancelled",
        discount: 0,
        fromOrderId: exitData.fromorderid,
        createdAt: exitData.createdat,
        updatedAt: exitData.updatedat,
        items: mappedItems
      };
      
      setStockExit(mappedExit);
    } catch (error) {
      console.error('Error fetching stock exit details:', error);
      
      // Fallback to local data
      const foundExit = stockExits.find(o => o.id === id);
      
      if (foundExit) {
        setStockExit(foundExit);
      } else {
        toast.error('Saída de stock não encontrada');
        navigate('/saidas/consultar');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelStockExit = async () => {
    if (!stockExit) return;
    
    try {
      await updateStockExit(stockExit.id, { status: 'cancelled' });
      
      // Update in Supabase
      const { error } = await supabase
        .from('StockExits')
        .update({ 
          status: 'cancelled',
          updatedat: new Date().toISOString()
        })
        .eq('id', stockExit.id);
      
      if (error) throw error;
      
      toast.success('Saída de stock cancelada com sucesso');
      
      // Update local state
      setStockExit(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (error) {
      console.error('Error cancelling stock exit:', error);
      toast.error('Erro ao cancelar saída de stock');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stockExit) {
    return <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Saída de stock não encontrada</h2>
        <Button onClick={() => navigate("/saidas/consultar")}>
          Voltar à Lista de Saídas
        </Button>
      </div>
    </div>;
  }

  // Calculate subtotal (sum of item prices)
  const subtotal = stockExit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
  
  // Calculate total with item discounts
  const total = stockExit.items.reduce((sum, item) => 
    sum + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Detalhes da Saída de Stock" 
        description={`Saída #${stockExit.exitNumber || 'N/A'}`}
        actions={
          <div className="flex gap-2">
            {stockExit.status !== 'cancelled' && (
              <>
                <Button variant="outline" onClick={() => navigate(`/saidas/editar/${stockExit.id}`)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" onClick={handleCancelStockExit} className="text-red-500 hover:bg-red-50">
                  <Ban className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => navigate("/saidas/consultar")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Lista
            </Button>
          </div>
        }
      />
      
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informações da Saída de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Número</dt>
                <dd>{stockExit.exitNumber || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Data</dt>
                <dd>{stockExit.date}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Cliente</dt>
                <dd>{stockExit.clientName || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Estado</dt>
                <dd>
                  <StatusBadge status={stockExit.status} />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-gestorApp-gray-dark">Notas</dt>
                <dd className="mt-1">{stockExit.notes || "Sem notas"}</dd>
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
              <div className="col-span-2 border-t pt-2 mt-2">
                <dt className="font-medium text-gestorApp-gray-dark">Total (com descontos)</dt>
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
                {stockExit.items.map((item, index) => {
                  const discount = item.discount || 0;
                  const subtotal = item.quantity * item.salePrice;
                  const discountedSubtotal = subtotal * (1 - discount / 100);
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.productName}</td>
                      <td className="text-right py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.salePrice)}</td>
                      <td className="text-right py-3 px-4">{discount}%</td>
                      <td className="text-right py-3 px-4">{formatCurrency(discountedSubtotal)}</td>
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
                  <td colSpan={4} className="text-right py-3 px-4 font-bold">Total com Descontos</td>
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
