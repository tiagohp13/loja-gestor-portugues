import React from 'react';
import { TableHead } from './table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { SortDirection } from '@/hooks/useSortableTable';
import { cn } from '@/lib/utils';

interface SortableTableHeaderProps {
  column: string;
  label: string;
  sortDirection: SortDirection;
  onSort: (column: string) => void;
  sortable?: boolean;
  className?: string;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  column,
  label,
  sortDirection,
  onSort,
  sortable = true,
  className
}) => {
  const getSortIcon = () => {
    if (!sortable) return null;
    
    switch (sortDirection) {
      case 'asc':
        return <ChevronUp className="ml-2 h-4 w-4" />;
      case 'desc':
        return <ChevronDown className="ml-2 h-4 w-4" />;
      default:
        return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
  };

  return (
    <TableHead 
      className={cn(
        sortable && "cursor-pointer hover:bg-muted/50 transition-colors select-none",
        "font-semibold",
        className
      )}
      onClick={sortable ? () => onSort(column) : undefined}
    >
      <div className="flex items-center">
        {label}
        {getSortIcon()}
      </div>
    </TableHead>
  );
};

export default SortableTableHeader;