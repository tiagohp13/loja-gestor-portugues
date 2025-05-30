
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
}) => {
  return (
    <Card className="cursor-pointer" onClick={() => onView(order.id)}>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gestorApp-gray mb-1">
                Número
              </p>
              <p className="font-bold text-gestorApp-blue">{order.number}</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gestorApp-gray mb-1">
                Data
              </p>
              <p>
                {format(new Date(order.date), "dd/MM/yyyy", { locale: pt })}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gestorApp-gray mb-1">
              Cliente
            </p>
            <p>{order.clientName}</p>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gestorApp-gray mb-1">
                Valor
              </p>
              <p className="font-medium">
                {formatCurrency(calculateOrderTotal(order))}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gestorApp-gray mb-1">
                Estado
              </p>
              {order.convertedToStockExitId ? (
                <StatusBadge variant="success" icon={ShoppingCart} className="inline-flex">
                  Convertida em Saída
                </StatusBadge>
              ) : (
                <StatusBadge variant="warning" className="inline-flex">
                  Pendente
                </StatusBadge>
              )}
            </div>
          </div>
          
          <div 
            className="flex justify-end space-x-2 mt-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => onEdit(e, order.id)}
                      disabled={order.convertedToStockExitId !== null}
                      className={order.convertedToStockExitId !== null ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                  </span>
                </TooltipTrigger>
                {order.convertedToStockExitId !== null && (
                  <TooltipContent>
                    <p>Não pode editar encomendas já convertidas em saída.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DeleteConfirmDialog
                      title="Eliminar Encomenda"
                      description="Tem a certeza que deseja eliminar esta encomenda?"
                      onDelete={() => onDelete(order.id)}
                      disabled={order.convertedToStockExitId !== null}
                      trigger={
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={order.convertedToStockExitId !== null}
                          className={order.convertedToStockExitId !== null ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      }
                    />
                  </span>
                </TooltipTrigger>
                {order.convertedToStockExitId !== null && (
                  <TooltipContent>
                    <p>Não pode eliminar encomendas já convertidas em saída.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderMobileCard;
