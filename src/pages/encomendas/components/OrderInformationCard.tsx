
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateString } from '@/utils/formatting';
import { Order, StockExit } from '@/types';
import { ShoppingCart } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

interface OrderInformationCardProps {
  order: Order;
  relatedStockExit: StockExit | null;
}

const OrderInformationCard: React.FC<OrderInformationCardProps> = ({ order, relatedStockExit }) => {
  const navigate = useNavigate();
  
  const handleViewStockExit = () => {
    if (relatedStockExit) {
      navigate(`/saidas/${relatedStockExit.id}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Encomenda</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-1">Número</p>
          <p>{order.number}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Data</p>
          <p>{formatDateString(order.date)}</p>
        </div>
        {order.convertedToStockExitId && (
          <div>
            <p className="text-sm font-medium mb-1">Nº Venda</p>
            <p>
              <a 
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={handleViewStockExit}
              >
                {order.convertedToStockExitNumber || relatedStockExit?.number}
              </a>
            </p>
          </div>
        )}
        <div className="col-span-1 md:col-span-2">
          <p className="text-sm font-medium mb-1">Estado</p>
          {order.convertedToStockExitId ? (
            <StatusBadge variant="success" icon={ShoppingCart}>
              Convertida em Saída
            </StatusBadge>
          ) : (
            <StatusBadge variant="warning">
              Pendente
            </StatusBadge>
          )}
        </div>
        {order.notes && (
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm font-medium mb-1">Notas</p>
            <p className="whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderInformationCard;
