
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatDateString } from '@/utils/formatting';
import { Order } from '@/types';

interface ClientOrdersTableProps {
  orders: Order[];
}

const ClientOrdersTable: React.FC<ClientOrdersTableProps> = ({ orders }) => {
  const navigate = useNavigate();

  if (!orders || orders.length === 0) {
    return <p className="text-gray-500">Sem encomendas registadas.</p>;
  }

  return (
    <div className="bg-card rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <button 
                  className="text-blue-600 hover:underline font-medium focus:outline-none"
                  onClick={() => navigate(`/encomendas/${order.id}`)}
                >
                  {order.number}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(order.date)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.items.reduce((total, item) => 
                  total + (item.quantity * item.salePrice * (1 - (item.discountPercent || 0) / 100)), 0).toFixed(2)} €
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={order.convertedToStockExitId ? "default" : "secondary"}>
                  {order.convertedToStockExitId ? "Convertida" : "Pendente"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientOrdersTable;
