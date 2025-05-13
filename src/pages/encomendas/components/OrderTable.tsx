
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart, ArrowUp, ArrowDown } from "lucide-react";
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

interface OrderTableProps {
  orders: Order[];
  onView: (id: string) => void;
  onEdit: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
  calculateOrderTotal: (order: Order) => number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onView,
  onEdit,
  onDelete,
  calculateOrderTotal,
  sortField = 'date',
  sortOrder = 'desc',
  onSortChange = () => {},
}) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange('number')}
            >
              Nº Encomenda {getSortIcon('number')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange('date')}
            >
              Data {getSortIcon('date')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange('clientName')}
            >
              Cliente {getSortIcon('clientName')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange('value')}
            >
              Valor {getSortIcon('value')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange('status')}
            >
              Estado {getSortIcon('status')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr 
              key={order.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onView(order.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
                {order.number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                {format(new Date(order.date), "dd/MM/yyyy", { locale: pt })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                {order.clientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                {formatCurrency(calculateOrderTotal(order))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                {order.convertedToStockExitId ? (
                  <StatusBadge variant="success" icon={ShoppingCart}>
                    Convertida em Venda
                  </StatusBadge>
                ) : (
                  <StatusBadge variant="warning">
                    Pendente
                  </StatusBadge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div onClick={(e) => e.stopPropagation()} className="flex justify-end space-x-2">
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
                            <Edit className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {order.convertedToStockExitId !== null && (
                        <TooltipContent>
                          <p>Não pode editar encomendas já convertidas em venda.</p>
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
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                disabled={order.convertedToStockExitId !== null}
                                className={order.convertedToStockExitId !== null ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                            disabled={order.convertedToStockExitId !== null}
                          />
                        </span>
                      </TooltipTrigger>
                      {order.convertedToStockExitId !== null && (
                        <TooltipContent>
                          <p>Não pode eliminar encomendas já convertidas em venda.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
