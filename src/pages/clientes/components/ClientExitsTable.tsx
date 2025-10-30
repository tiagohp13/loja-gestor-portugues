
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateString } from '@/utils/formatting';
import { StockExit } from '@/types';

interface ClientExitsTableProps {
  exits: StockExit[];
}

const ClientExitsTable: React.FC<ClientExitsTableProps> = ({ exits }) => {
  const navigate = useNavigate();

  if (!exits || exits.length === 0) {
    return <p className="text-gray-500">Sem saídas registadas.</p>;
  }

  return (
    <div className="bg-card rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {exits.map((exit) => (
            <tr key={exit.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <button 
                  className="text-blue-600 hover:underline font-medium focus:outline-none"
                  onClick={() => navigate(`/saidas/${exit.id}`)}
                >
                  {exit.number}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(exit.date)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exit.invoiceNumber || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exit.items.reduce((total, item) => 
                  total + (item.quantity * item.salePrice * (1 - (item.discountPercent || 0) / 100)), 0).toFixed(2)} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientExitsTable;
