import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatting';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceHistoryEntry {
  id: string;
  change_date: string;
  old_sale_price: number | null;
  new_sale_price: number | null;
  old_purchase_price: number | null;
  new_purchase_price: number | null;
  change_reason: string;
}

interface ProductPriceHistoryProps {
  productId: string;
}

export function ProductPriceHistory({ productId }: ProductPriceHistoryProps) {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceHistory();
  }, [productId]);

  const fetchPriceHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_price_history')
        .select('*')
        .eq('product_id', productId)
        .order('change_date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico de preços:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceChangeIcon = (oldPrice: number | null, newPrice: number | null) => {
    if (!oldPrice || !newPrice) return <Minus className="h-4 w-4" />;
    if (newPrice > oldPrice) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (newPrice < oldPrice) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeReasonLabel = (reason: string) => {
    const labels: { [key: string]: string } = {
      'manual_update': 'Atualização Manual',
      'product_update': 'Edição do Produto',
      'bulk_update': 'Atualização em Massa'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Preços</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">A carregar histórico...</span>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Preços</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhuma alteração de preço registada para este produto.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Preços</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Preço de Venda</TableHead>
              <TableHead>Preço de Custo</TableHead>
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {format(new Date(entry.change_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getPriceChangeIcon(entry.old_sale_price, entry.new_sale_price)}
                    <div className="flex flex-col">
                      {entry.old_sale_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(entry.old_sale_price)}
                        </span>
                      )}
                      {entry.new_sale_price && (
                        <span className="font-medium">
                          {formatCurrency(entry.new_sale_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getPriceChangeIcon(entry.old_purchase_price, entry.new_purchase_price)}
                    <div className="flex flex-col">
                      {entry.old_purchase_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(entry.old_purchase_price)}
                        </span>
                      )}
                      {entry.new_purchase_price && (
                        <span className="font-medium">
                          {formatCurrency(entry.new_purchase_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getChangeReasonLabel(entry.change_reason)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}