
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, ShoppingCart } from 'lucide-react';
import { Order, StockExit } from '@/types';
import { exportToPdf } from '@/utils/pdfExport';

interface OrderDetailHeaderProps {
  order: Order;
  relatedStockExit: StockExit | null;
}

const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({ order, relatedStockExit }) => {
  const navigate = useNavigate();

  const handleConvertToStockExit = () => {
    navigate(`/encomendas/${order.id}/converter`);
  };

  const handleExportToPdf = async () => {
    if (order && order.number) {
      await exportToPdf({
        filename: order.number.replace('/', '-'),
        contentSelector: '.pdf-content',
        margin: 10
      });
    }
  };

  return (
    <PageHeader
      title={`Encomenda: ${order.number}`}
      description="Detalhes da encomenda"
      actions={
        <>
          <Button 
            variant="outline" 
            onClick={handleExportToPdf}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar para PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/encomendas/consultar')}
          >
            Voltar à Lista
          </Button>
          {!order.convertedToStockExitId ? (
            <Button
              onClick={handleConvertToStockExit}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Converter para Venda
            </Button>
          ) : null}
        </>
      }
    />
  );
};

export default OrderDetailHeader;
