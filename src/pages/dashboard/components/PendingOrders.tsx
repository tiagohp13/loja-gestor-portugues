import React from 'react';

interface Order {
  id: string;
  date: string; // “DD/MM/AAAA” ou ISO
  clientName: string;
  totalValue: number;
}

interface PendingOrdersProps {
  pendingOrders: Order[];
  navigateToOrderDetail: (id: string) => void;
  navigateToClientDetail: (id: string) => void;
}

const PendingOrders: React.FC<PendingOrdersProps> = ({
  pendingOrders,
  navigateToOrderDetail,
  navigateToClientDetail,
}) => {
  // Formata total como € X,XX
  const formatCurrency = (value: number) =>
    `€ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 max-h-[300px] overflow-y-auto">
      {/* Título ajustado para usar as mesmas classes dos outros */}
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-3">
        Encomendas Pendentes
      </h3>

      {pendingOrders.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Não há encomendas pendentes.
        </p>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase dark:text-gray-400">
              <th className="px-2 py-1">Nº Encomenda</th>
              <th className="px-2 py-1">Data</th>
              <th className="px-2 py-1">Cliente</th>
              <th className="px-2 py-1">Valor Total</th>
              <th className="px-2 py-1">Ação</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) => (
              <tr
                key={order.id}
                className="border-t last:border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <td
                  className="px-2 py-2 text-sm text-blue-500 underline"
                  onClick={() => navigateToOrderDetail(order.id)}
                >
                  {order.id}
                </td>
                <td className="px-2 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {order.date}
                </td>
                <td
                  className="px-2 py-2 text-sm text-blue-500 underline"
                  onClick={() => navigateToClientDetail(order.id)}
                >
                  {order.clientName}
                </td>
                <td className="px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {formatCurrency(order.totalValue)}
                </td>
                <td className="px-2 py-2 text-sm text-blue-500 underline">
                  Ver Detalhes
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingOrders;
