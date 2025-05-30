
import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { StockEntryItem, StockExitItem } from '@/types';
import { EntryItem, ExitItem } from '../types/productHistoryTypes';

export const useProductHistory = (productId: string | undefined) => {
  const { getProductHistory } = useData();
  
  const productHistory = useMemo(() => {
    if (!productId) return { entries: [], exits: [] };
    return getProductHistory(productId) || { entries: [], exits: [] };
  }, [productId, getProductHistory]);
  
  // Get stock movement for this product from entries and exits
  const entriesForProduct = useMemo(() => {
    return productHistory.entries
      .flatMap(entry => entry.items
        .filter((item: StockEntryItem) => item.productId === productId)
        .map((item: StockEntryItem) => ({
          date: entry.date,
          number: entry.number,
          document: entry.invoiceNumber || '-',
          supplierName: entry.supplierName,
          quantity: item.quantity,
          unitPrice: item.purchasePrice,
          total: item.quantity * item.purchasePrice
        }))
      );
  }, [productHistory.entries, productId]);
  
  const exitsForProduct = useMemo(() => {
    return productHistory.exits
      .flatMap(exit => exit.items
        .filter((item: StockExitItem) => item.productId === productId)
        .map((item: StockExitItem) => ({
          date: exit.date,
          number: exit.number,
          document: exit.invoiceNumber || '-',
          clientId: exit.clientId,
          clientName: exit.clientName,
          quantity: item.quantity,
          unitPrice: item.salePrice,
          total: item.quantity * item.salePrice,
          exitId: exit.id
        }))
      );
  }, [productHistory.exits, productId]);
  
  // Calculate totals
  const totals = useMemo(() => {
    const totalUnitsSold = exitsForProduct.reduce((total, exit) => total + exit.quantity, 0);
    const totalUnitsPurchased = entriesForProduct.reduce((total, entry) => total + entry.quantity, 0);
    const totalAmountSpent = entriesForProduct.reduce((total, entry) => total + entry.total, 0);
    const totalAmountSold = exitsForProduct.reduce((total, exit) => total + exit.total, 0);
    
    return {
      totalUnitsSold,
      totalUnitsPurchased,
      totalAmountSpent,
      totalAmountSold
    };
  }, [entriesForProduct, exitsForProduct]);
  
  return {
    entriesForProduct,
    exitsForProduct,
    ...totals
  };
};
