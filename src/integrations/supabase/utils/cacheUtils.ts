
// Store deleted IDs temporarily to prevent reappearance through real-time updates
const deletedItemsCache: { [table: string]: Set<string> } = {
  stock_entries: new Set<string>(),
  stock_exits: new Set<string>(),
  orders: new Set<string>()
};

/**
 * Add an ID to the deleted items cache
 */
export const addToDeletedCache = (table: string, id: string) => {
  if (!deletedItemsCache[table]) {
    deletedItemsCache[table] = new Set<string>();
  }
  deletedItemsCache[table].add(id);
};

/**
 * Check if an ID is in the deleted items cache
 */
export const isInDeletedCache = (table: string, id: string): boolean => {
  if (!deletedItemsCache[table]) {
    return false;
  }
  return deletedItemsCache[table].has(id);
};

/**
 * Clear an ID from the deleted items cache (use this after successful deletion)
 */
export const removeFromDeletedCache = (table: string, id: string) => {
  if (deletedItemsCache[table]) {
    deletedItemsCache[table].delete(id);
  }
};

/**
 * Filter an array to remove items that are in the deleted cache
 */
export const filterDeletedItems = <T extends { id: string }>(table: string, items: T[]): T[] => {
  if (!deletedItemsCache[table]) {
    return items;
  }
  return items.filter(item => !deletedItemsCache[table].has(item.id));
};
