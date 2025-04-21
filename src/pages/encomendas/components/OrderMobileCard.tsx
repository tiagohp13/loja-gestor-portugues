
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatting";

interface OrderMobileCardProps {
  order: Order;
  onView: (id: string) => void;
  onEdit: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
  calculateOrderTotal: (order: Order) => number;
}

const OrderMobileCard: React.FC<OrderMobileCardProps> = ({
  order,
  onView,
  onEdit,
  onDelete,
  calculateOrderTotal,
}) => (
  <div 
    key={order.id}
    className="bg-white rounded-lg shadow p-4 mb-4 cursor-pointer hover:bg-gray-50"
    onClick={() => onView(order.id)}
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-medium text-gestorApp-blue">{order.number}</h3>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => onEdit(e, order.id)}
          disabled={order.convertedToStockExitId !== null}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <DeleteConfirmDialog
          title="Eliminar Encomenda"
          description="Tem a certeza que deseja eliminar esta encomenda?"
          onDelete={() => onDelete(order.id)}
          trigger={
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-y-2 text-sm">
      <div className="text-gestorApp-gray">Data:</div>
      <div>{format(new Date(order.date), "dd/MM/yyyy", { locale: pt })}</div>
      <div className="text-gestorApp-gray">Cliente:</div>
      <div>{order.clientName}</div>
      <div className="text-gestorApp-gray">Valor:</div>
      <div>{formatCurrency(calculateOrderTotal(order))}</div>
      <div className="text-gestorApp-gray">Estado:</div>
      <div>
        {order.convertedToStockExitId ? (
          <StatusBadge variant="success" icon={ShoppingCart}>
            Convertida em Saída
          </StatusBadge>
        ) : (
          <StatusBadge variant="warning">Pendente</StatusBadge>
        )}
      </div>
    </div>
  </div>
);

export default OrderMobileCard;
