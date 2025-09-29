import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export interface SortableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  dataType?: 'text' | 'number' | 'date' | 'currency';
}

export const useSortableTable = (initialSort?: SortState) => {
  const [sortState, setSortState] = useState<SortState>(
    initialSort || { column: null, direction: null }
  );

  const handleSort = (column: string) => {
    setSortState(prev => {
      if (prev.column === column) {
        // Cycle through: asc -> desc -> null
        const newDirection: SortDirection = 
          prev.direction === 'asc' ? 'desc' : 
          prev.direction === 'desc' ? null : 'asc';
        
        return {
          column: newDirection ? column : null,
          direction: newDirection
        };
      } else {
        // New column, start with ascending
        return {
          column,
          direction: 'asc'
        };
      }
    });
  };

  const getSortIcon = (column: string) => {
    if (sortState.column !== column) return null;
    return sortState.direction;
  };

  // Generate Supabase order clause
  const getSupabaseOrder = () => {
    if (!sortState.column || !sortState.direction) {
      return null;
    }
    
    return {
      column: sortState.column,
      ascending: sortState.direction === 'asc'
    };
  };

  return {
    sortState,
    handleSort,
    getSortIcon,
    getSupabaseOrder
  };
};