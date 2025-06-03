
import React from 'react';
import { StockEntry } from '@/types';
import EmptyState from '@/components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StockEntryTableHeader from './StockEntryTableHeader';
import StockEntryItem from './StockEntryItem';
import { StockEntrySortField } from '../hooks/stockEntryForm/types';

type SortOrder = 'asc' | 'desc';

interface StockEntryTableProps {
  entries: StockEntry[];
  sortField: StockEntrySortField;
  sortOrder: SortOrder;
  onSortChange: (field: StockEntrySortField) => void;
  onViewEntry: (id: string) => void;
  onEditEntry: (e: React.MouseEvent, id: string) => void;
  onDeleteEntry: (id: string) => void;
  calculateEntryTotal: (entry: StockEntry) => number;
}

const StockEntryTable: React.FC<StockEntryTableProps> = ({
  entries,
  sortField,
  sortOrder,
  onSortChange,
  onViewEntry,
  onEditEntry,
  onDeleteEntry,
  calculateEntryTotal
}) => {
  const navigate = useNavigate();
  
  if (entries.length === 0) {
    return (
      <EmptyState 
        title="Nenhuma compra encontrada"
        description="Não existem compras de stock registadas ou que correspondam à pesquisa."
        action={
          <Button onClick={() => navigate('/entradas/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Compra
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <StockEntryTableHeader 
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <StockEntryItem
              key={entry.id}
              entry={entry}
              onView={onViewEntry}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
              calculateEntryTotal={calculateEntryTotal}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockEntryTable;
