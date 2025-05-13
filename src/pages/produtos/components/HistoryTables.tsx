
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateString, formatCurrency } from '@/utils/formatting';

interface EntryItem {
  date: string;
  number: string;
  document: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ExitItem {
  date: string;
  number: string;
  document: string;
  clientId?: string;
  clientName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  exitId: string;
}

interface HistoryTablesProps {
  entriesForProduct: EntryItem[];
  exitsForProduct: ExitItem[];
  totalUnitsPurchased: number;
  totalAmountSpent: number;
  totalUnitsSold: number;
  totalAmountSold: number;
}

const HistoryTables: React.FC<HistoryTablesProps> = ({
  entriesForProduct,
  exitsForProduct,
  totalUnitsPurchased,
  totalAmountSpent,
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
    <>
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Entradas</h3>
        {entriesForProduct.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Entrada</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entriesForProduct.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateString(entry.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.document}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(entry.unitPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(entry.total)}</td>
                  </tr>
                ))}
                {entriesForProduct.length > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      Total de Unidades Compradas:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {totalUnitsPurchased}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      Total Gasto:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(totalAmountSpent)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Sem entradas registadas para este produto.</p>
        )}
      </div>
      
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Saídas</h3>
        {exitsForProduct.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Saída</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
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
    </>
  );
};

export default HistoryTables;
