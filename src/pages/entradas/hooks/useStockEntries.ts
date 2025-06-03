
import { useState, useEffect } from 'react';
import { StockEntry } from '@/types';
import { useData } from '@/contexts/DataContext';
import { StockEntrySortField } from './stockEntryForm/types';

export const useStockEntries = () => {
  const { stockEntries: contextEntries, deleteStockEntry } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<StockEntrySortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [localEntries, setLocalEntries] = useState<StockEntry[]>([]);

  useEffect(() => {
    setLocalEntries(contextEntries);
  }, [contextEntries]);

  const filteredEntries = localEntries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.number.toLowerCase().includes(searchLower) ||
      entry.supplierName.toLowerCase().includes(searchLower) ||
      entry.invoiceNumber?.toLowerCase().includes(searchLower) ||
      entry.notes?.toLowerCase().includes(searchLower)
    );
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
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
      await deleteStockEntry(id);
      setLocalEntries(prev => prev.filter(entry => entry.id !== id));
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
    localEntries
  };
};
