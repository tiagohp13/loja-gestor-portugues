
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateString } from '@/utils/formatting';
import { Order, StockExit } from '@/types';
import { ShoppingCart, Calendar, Clock, MapPin } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

interface OrderInformationCardProps {
  order: Order;
  relatedStockExit: StockExit | null;
}

const OrderInformationCard: React.FC<OrderInformationCardProps> = ({ order, relatedStockExit }) => {
  const navigate = useNavigate();
  
  // Debug log to check if notes are present
  console.log('Order data in OrderInformationCard:', { id: order.id, notes: order.notes });
  
  const handleViewStockExit = () => {
    if (relatedStockExit) {
      navigate(`/saidas/${relatedStockExit.id}`);
    }
  };
  
  // Get order type label
  const getOrderTypeLabel = (type?: string) => {
    if (!type) return 'Pendente – Combinada';
    return type === 'combined' ? 'Pendente – Combinada' : 'Pendente – A aguardar stock';
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
              {getOrderTypeLabel(order.orderType)}
            </StatusBadge>
          )}
        </div>
        
        {/* Show delivery information only for combined orders that are not converted */}
        {!order.convertedToStockExitId && order.orderType === 'combined' && (
          <div className="col-span-1 md:col-span-2 space-y-3 pt-2 border-t">
            <p className="text-sm font-semibold">Informações de Entrega</p>
            
            {order.expectedDeliveryDate && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data Prevista</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(order.expectedDeliveryDate), 'PPP', { locale: pt })}
                  </p>
                </div>
              </div>
            )}
            
            {order.expectedDeliveryTime && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Hora Prevista</p>
                  <p className="text-sm text-muted-foreground">{order.expectedDeliveryTime}</p>
                </div>
              </div>
            )}
            
            {order.deliveryLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Local de Entrega/Levantamento</p>
                  <p className="text-sm text-muted-foreground">{order.deliveryLocation}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
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
