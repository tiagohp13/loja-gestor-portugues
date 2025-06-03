
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { StockEntrySortField } from '../hooks/stockEntryForm/types';

type SortOrder = 'asc' | 'desc';

interface StockEntryTableHeaderProps {
  sortField: StockEntrySortField;
  sortOrder: SortOrder;
  onSortChange: (field: StockEntrySortField) => void;
}

const StockEntryTableHeader: React.FC<StockEntryTableHeaderProps> = ({ 
  sortField, 
  sortOrder, 
  onSortChange 
}) => {
  const getSortIcon = (field: StockEntrySortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ArrowUp className="inline h-4 w-4 ml-1" /> : 
      <ArrowDown className="inline h-4 w-4 ml-1" />;
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
          onClick={() => onSortChange('number')}
        >
          Nº Compra {getSortIcon('number')}
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
          onClick={() => onSortChange('date')}
        >
          Data {getSortIcon('date')}
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
          onClick={() => onSortChange('supplier')}
        >
          Fornecedor {getSortIcon('supplier')}
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
          onClick={() => onSortChange('invoiceNumber')}
        >
          Nº Fatura {getSortIcon('invoiceNumber')}
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
          onClick={() => onSortChange('value')}
        >
          Valor {getSortIcon('value')}
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
          Ações
        </th>
      </tr>
    </thead>
  );
};

export default StockEntryTableHeader;
