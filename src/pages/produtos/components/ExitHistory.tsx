import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import { ExitItem } from '../types/productHistoryTypes';

interface ExitHistoryProps {
  exitsForProduct: ExitItem[];
  totalUnitsSold: number;
  totalAmountSold: number;
}

const ExitHistory: React.FC<ExitHistoryProps> = ({
  exitsForProduct,
  totalUnitsSold,
  totalAmountSold
}) => {
  const navigate = useNavigate();

  const handleNavigateToClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/clientes/${clientId}`);
  };

  const handleNavigateToExit = (exitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/saidas/${exitId}`);
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Histórico de Saídas</h3>
      {exitsForProduct.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 tracking-wider">Nº Saída</th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 tracking-wider">Fatura</th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 tracking-wider">Quantidade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 tracking-wider">Preço Unit.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exitsForProduct.map((exit, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(exit.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={(e) => handleNavigateToExit(exit.exitId, e)}
                      className="text-blue-500 hover:underline cursor-pointer"
                    >
                      {exit.number}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exit.document}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {exit.clientId ? (
                      <button 
                        onClick={(e) => handleNavigateToClient(exit.clientId!, e)}
                        className="text-blue-500 hover:underline cursor-pointer"
                      >
                        {exit.clientName}
                      </button>
                    ) : (
                      <span className="text-gray-500">{exit.clientName}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exit.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(exit.unitPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(exit.total)}</td>
                </tr>
              ))}
              {exitsForProduct.length > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    Total de Unidades Vendidas:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {totalUnitsSold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    Total Vendido:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(totalAmountSold)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">Sem saídas registadas para este produto.</p>
      )}
    </div>
  );
};

export default ExitHistory;
