
import { Client, StockExit, StockEntry, Supplier } from '@/types';

/**
 * Find the most frequent client based on purchase count
 */
export const findMostFrequentClient = (stockExits: StockExit[], clients: Client[]): Client | undefined => {
  const clientPurchases = stockExits.reduce((acc, exit) => {
    const { clientId } = exit;
    if (!acc[clientId]) {
      acc[clientId] = 0;
    }
    acc[clientId] += 1;
    return acc;
  }, {} as Record<string, number>);
  
  let mostFrequentClientId = '';
  let mostFrequentClientCount = 0;
  
  Object.entries(clientPurchases).forEach(([clientId, count]) => {
    if (count > mostFrequentClientCount) {
      mostFrequentClientId = clientId;
      mostFrequentClientCount = count;
    }
  });
  
  return clients.find(c => c.id === mostFrequentClientId);
};

/**
 * Find the most used supplier based on purchase count
 */
export const findMostUsedSupplier = (stockEntries: StockEntry[], suppliers: Supplier[]): Supplier | undefined => {
  const supplierPurchases = stockEntries.reduce((acc, entry) => {
    const { supplierId } = entry;
    if (!acc[supplierId]) {
      acc[supplierId] = 0;
    }
    acc[supplierId] += 1;
    return acc;
  }, {} as Record<string, number>);
  
  let mostUsedSupplierId = '';
  let mostUsedSupplierCount = 0;
  
  Object.entries(supplierPurchases).forEach(([supplierId, count]) => {
    if (count > mostUsedSupplierCount) {
      mostUsedSupplierId = supplierId;
      mostUsedSupplierCount = count;
    }
  });
  
  return suppliers.find(s => s.id === mostUsedSupplierId);
};
