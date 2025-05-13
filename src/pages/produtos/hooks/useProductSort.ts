
import { useState, useEffect } from 'react';

export type SortField = 'name' | 'code' | 'category' | 'currentStock' | 'salePrice';
export type SortDirection = 'asc' | 'desc';

// Function to naturally sort strings containing numbers
export const naturalSort = (a: string, b: string, direction: SortDirection = 'asc') => {
  // Function to convert a string part to number if possible
  const chunk = (s: string) => {
    return s.replace(/(\d+)/g, (match) => {
      // Pad numbers with leading zeros to ensure proper sorting
      // We pad to 10 digits which should be enough for most scenarios
      return match.padStart(10, '0');
    });
  };
  
  // Apply the direction to the comparison
  if (direction === 'asc') {
    return chunk(a).localeCompare(chunk(b), undefined, { numeric: true });
  } else {
    return chunk(b).localeCompare(chunk(a), undefined, { numeric: true });
  }
};

export const useProductSort = () => {
  const [sortField, setSortField] = useState<SortField>(() => {
    // Get sorting preference from localStorage or default to 'code'
    return (localStorage.getItem('productSortField') as SortField) || 'code';
  });
  
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    // Get direction preference from localStorage or default to 'asc'
    return (localStorage.getItem('productSortDirection') as SortDirection) || 'asc';
  });

  // Save sort preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('productSortField', sortField);
    localStorage.setItem('productSortDirection', sortDirection);
  }, [sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    setSortField,
    setSortDirection
  };
};
