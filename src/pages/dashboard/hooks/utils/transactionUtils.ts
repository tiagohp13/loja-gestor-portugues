
import { Product, Client, StockEntry, StockExit, Supplier } from '@/types';

export type TransactionItem = {
  id: string;
  type: 'entry' | 'exit';
  productId: string;
  product?: Product;
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
  return [
    ...stockEntries.flatMap(entry => entry.items.map(item => ({
      id: entry.id,
      type: 'entry' as const,
      productId: item.productId,
      product: products.find(p => p.id === item.productId),
      entity: entry.supplierName || suppliers.find(s => s.id === entry.supplierId)?.name || 'Desconhecido',
      entityId: entry.supplierId,
      quantity: item.quantity,
      date: entry.date,
      value: item.quantity * item.purchasePrice
    }))),
    ...stockExits.flatMap(exit => exit.items.map(item => ({
      id: exit.id,
      type: 'exit' as const,
      productId: item.productId,
      product: products.find(p => p.id === item.productId),
      entity: exit.clientName || clients.find(c => c.id === exit.clientId)?.name || 'Desconhecido',
      entityId: exit.clientId,
      quantity: item.quantity,
      date: exit.date,
      value: item.quantity * item.salePrice
    })))
  ];
};

/**
 * Gets the most recent transactions
 */
export const getRecentTransactions = (allTransactions: TransactionItem[], limit: number = 5): TransactionItem[] => {
  return allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};
