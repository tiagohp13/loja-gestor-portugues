
import { Product, Client, StockEntry, StockExit, Supplier } from '@/types';

export type TransactionItem = {
  id: string;
  type: 'entry' | 'exit';
  productId: string;
  product: Product | undefined;  // Changed from optional to required to match Transaction type
  entity: string;
  entityId: string;
  quantity: number;
  date: string | Date;
  value: number;
};

/**
 * Creates a unified list of all transactions (entries and exits)
 */
export const createAllTransactions = (
  stockEntries: StockEntry[],
  stockExits: StockExit[],
  products: Product[],
  suppliers: Supplier[],
  clients: Client[]
): TransactionItem[] => {
  const transactions: TransactionItem[] = [];

  // Process stock entries if they exist and have items
  if (stockEntries && stockEntries.length > 0) {
    stockEntries.forEach(entry => {
      // Make sure entry.items exists before trying to map it
      if (entry && entry.items && Array.isArray(entry.items)) {
        entry.items.forEach(item => {
          if (item && item.productId) {
            transactions.push({
              id: entry.id,
              type: 'entry',
              productId: item.productId,
              product: products.find(p => p.id === item.productId),
              entity: entry.supplierName || (entry.supplierId ? suppliers.find(s => s.id === entry.supplierId)?.name : null) || 'Desconhecido',
              entityId: entry.supplierId || '',
              quantity: item.quantity || 0,
              date: entry.date,
              value: (item.quantity || 0) * (item.purchasePrice || 0)
            });
          }
        });
      }
    });
  }

  // Process stock exits if they exist and have items
  if (stockExits && stockExits.length > 0) {
    stockExits.forEach(exit => {
      // Make sure exit.items exists before trying to map it
      if (exit && exit.items && Array.isArray(exit.items)) {
        exit.items.forEach(item => {
          if (item && item.productId) {
            transactions.push({
              id: exit.id,
              type: 'exit',
              productId: item.productId,
              product: products.find(p => p.id === item.productId),
              entity: exit.clientName || (exit.clientId ? clients.find(c => c.id === exit.clientId)?.name : null) || 'Desconhecido',
              entityId: exit.clientId || '',
              quantity: item.quantity || 0,
              date: exit.date,
              value: (item.quantity || 0) * (item.salePrice || 0)
            });
          }
        });
      }
    });
  }

  return transactions;
};

/**
 * Gets the most recent transactions
 */
export const getRecentTransactions = (allTransactions: TransactionItem[], limit: number = 5): TransactionItem[] => {
  if (!allTransactions || !Array.isArray(allTransactions)) {
    return [];
  }

  return allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};
