
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatting";

interface OrderTableProps {
  orders: Order[];
  onView: (id: string) => void;
  onEdit: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
  calculateOrderTotal: (order: Order) => number;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onView,
  onEdit,
  onDelete,
  calculateOrderTotal,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
            Nº Encomenda
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
            Data
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
            Cliente
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
            Valor
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
            Estado
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
                  Convertida em Saída
                </StatusBadge>
              ) : (
                <StatusBadge variant="warning">
                  Pendente
                </StatusBadge>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div onClick={(e) => e.stopPropagation()} className="flex justify-end space-x-2">
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OrderTable;
