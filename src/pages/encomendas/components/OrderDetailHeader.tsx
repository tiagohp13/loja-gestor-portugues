
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, ShoppingCart, Pencil } from 'lucide-react';
import { Order, StockExit } from '@/types';
import { exportToPdf } from '@/utils/pdfExport';

interface OrderDetailHeaderProps {
  order: Order;
  relatedStockExit: StockExit | null;
}

const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({ order, relatedStockExit }) => {
  const navigate = useNavigate();
  const isPending = !order.convertedToStockExitId;

  const handleConvertToStockExit = () => {
    navigate(`/encomendas/${order.id}/converter`);
  };

  const handleEditOrder = () => {
    navigate(`/encomendas/editar/${order.id}`);
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
          {/* Button 1: Export to PDF (always visible) */}
          <Button 
            variant="outline" 
            onClick={handleExportToPdf}
          >
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            Exportar para PDF
          </Button>
          
          {/* Button 2: Convert to Sale (only visible if pending) */}
          {isPending && (
            <Button
              onClick={handleConvertToStockExit}
              className="text-white bg-blue-500 hover:bg-blue-600"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Converter para Venda
            </Button>
          )}
          
          {/* Button 3: Edit (only visible if pending) */}
          {isPending && (
            <Button
              variant="secondary"
              onClick={handleEditOrder}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          
          {/* Button 4: Back to List (always visible) */}
          <Button
            variant="outline"
            onClick={() => navigate('/encomendas/consultar')}
          >
            Voltar à Lista
          </Button>
        </>
      }
    />
  );
};

export default OrderDetailHeader;
