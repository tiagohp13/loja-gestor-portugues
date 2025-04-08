
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Loader2, ArrowLeft, Pencil } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { StockEntry } from '@/types';
import { toast } from 'sonner';

const StockEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockEntries } = useData();
  
  const [entry, setEntry] = useState<StockEntry | null>(null);

  useEffect(() => {
    if (id) {
      const foundEntry = stockEntries.find(e => e.id === id);
      if (foundEntry) {
        setEntry(foundEntry);
      } else {
        toast.error("Entrada não encontrada");
        navigate("/entradas/historico");
      }
    }
  }, [id, stockEntries, navigate]);

  if (!entry) {
    return <div className="flex justify-center items-center h-96">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  // Calculate entry total with item discounts
  const total = entry.items && entry.items.length > 0 
    ? entry.items.reduce(
        (sum, item) => sum + (item.quantity * item.purchasePrice * (1 - (item.discount || 0) / 100)), 
        0
      )
    : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Detalhes da Entrada" 
        description={`Entrada #${entry.entryNumber || 'N/A'}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/entradas/editar/${entry.id}`)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={() => navigate("/entradas/historico")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Lista
            </Button>
          </div>
        }
      />
      
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informações da Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Número</dt>
                <dd>{entry.entryNumber || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Data</dt>
                <dd>{entry.date}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Fornecedor</dt>
                <dd>{entry.supplierName}</dd>
              </div>
              <div>
                <dt className="font-medium text-gestorApp-gray-dark">Estado</dt>
                <dd>{entry.status}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-gestorApp-gray-dark">Notas</dt>
                <dd className="mt-1">{entry.notes || "Sem notas"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm">
              <div>
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
                {entry.items && entry.items.map((item, index) => {
                  const itemDiscount = item.discount || 0;
                  const subtotal = item.quantity * item.purchasePrice * (1 - itemDiscount / 100);
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.productName}</td>
                      <td className="text-right py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.purchasePrice)}</td>
                      <td className="text-right py-3 px-4">{itemDiscount > 0 ? `${itemDiscount}%` : "-"}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
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

export default StockEntryDetail;
