
import { useState, useMemo } from 'react';
import { StockEntry } from '@/types';
import { StockEntrySortField } from './stockEntryForm/types';
import { usePaginatedStockEntries } from '@/hooks/queries/usePaginatedStockEntries';

export const useStockEntries = (page: number = 0) => {
  const { stockEntries: localEntries, totalCount, totalPages, isLoading, deleteStockEntry } = usePaginatedStockEntries(page);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<StockEntrySortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredEntries = useMemo(() => {
    return localEntries.filter(entry => {
      const searchLower = searchTerm.toLowerCase();
      return (
        entry.number.toLowerCase().includes(searchLower) ||
        entry.supplierName.toLowerCase().includes(searchLower) ||
        entry.invoiceNumber?.toLowerCase().includes(searchLower) ||
        entry.notes?.toLowerCase().includes(searchLower)
      );
    });
  }, [localEntries, searchTerm]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'number':
          aValue = a.number;
          bValue = b.number;
          break;
        case 'supplier':
          aValue = a.supplierName;
          bValue = b.supplierName;
          break;
        case 'invoiceNumber':
          aValue = a.invoiceNumber || '';
          bValue = b.invoiceNumber || '';
          break;
        case 'value':
          aValue = calculateEntryTotal(a);
          bValue = calculateEntryTotal(b);
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredEntries, sortField, sortOrder]);

  const handleSortChange = (field: StockEntrySortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      deleteStockEntry(id);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const calculateEntryTotal = (entry: StockEntry) => {
    return entry.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.purchasePrice;
      const discountAmount = itemTotal * ((item.discountPercent || 0) / 100);
      return total + (itemTotal - discountAmount);
    }, 0);
  };

  return {
    entries: localEntries,
    filteredEntries,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    sortedEntries,
    handleSortChange,
    handleDeleteEntry,
    calculateEntryTotal,
    localEntries,
    totalCount,
    totalPages
  };
};
