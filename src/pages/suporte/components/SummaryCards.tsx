import React from 'react';

interface SummaryCardsProps {
  stats: {
    totalSales: number;
    totalSpent: number;
    profit: number;
    profitMargin: number; // em percentual (ex.: 72.48 para 72.48%)
  };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const { totalSales, totalSpent, profit, profitMargin } = stats;

  // Formata valores como € X,XX
  const formatCurrency = (value: number) =>
    `€ ${value.toFixed(2).replace('.', ',')}`;

  // Formata percentual X,XX%
  const formatPercent = (value: number) =>
    `${value.toFixed(2).replace('.', ',')}%`;

  // Define a cor do indicador (positivo/negativo)
  const getIndicatorColor = (num: number) =>
    num >= 0 ? 'text-gestorSuccess' : 'text-gestorDanger';

  const getIndicatorIcon = (num: number) =>
    num >= 0 ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-1 inline-block"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-1 inline-block"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total de Vendas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md p-4 flex flex-col justify-between min-h-[120px]">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Total de Vendas
        </span>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-gestorBlue">
            {formatCurrency(totalSales)}
          </span>
          <span
            className={`flex items-center text-sm font-medium ${getIndicatorColor(
              totalSales - totalSpent
            )}`}
          >
            {getIndicatorIcon(totalSales - totalSpent)}
            {formatPercent(
              totalSales === 0 ? 0 : ((totalSales - totalSpent) / totalSales) * 100
            )}
          </span>
        </div>
      </div>

      {/* Total Gasto */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md p-4 flex flex-col justify-between min-h-[120px]">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Gasto
        </span>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-gestorBlue">
            {formatCurrency(totalSpent)}
          </span>
          <span className="flex items-center text-sm font-medium text-gestorSuccess">
            {getIndicatorIcon(-totalSpent)}
            {/* Se quiser indicar variação, modifique conforme necessidade */}
            {/* Aqui, apenas mostro seta negativa para gastos */}
            <span>{formatPercent(0)}</span>
          </span>
        </div>
      </div>

      {/* Lucro */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md p-4 flex flex-col justify-between min-h-[120px]">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Lucro
        </span>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-gestorBlue">
            {formatCurrency(profit)}
          </span>
          <span
            className={`flex items-center text-sm font-medium ${getIndicatorColor(
              profit
            )}`}
          >
            {getIndicatorIcon(profit)}
            {formatPercent(profit === 0 ? 0 : (profit / totalSales) * 100)}
          </span>
        </div>
      </div>

      {/* Margem de Lucro */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md p-4 flex flex-col justify-between min-h-[120px]">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Margem de Lucro
        </span>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-gestorBlue">
            {formatPercent(profitMargin)}
          </span>
          <span
            className={`flex items-center text-sm font-medium ${getIndicatorColor(
              profitMargin
            )}`}
          >
            {getIndicatorIcon(profitMargin)}
            {/* Se for indicar variação, calcule aqui */}
            <span>{formatPercent(0)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
