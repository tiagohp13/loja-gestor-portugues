# Context Migration Guide

## Migration Summary

All files using the old `useData()` hook need to be updated to use the new separated context hooks.

## New Context Hooks

```typescript
import { useProducts } from '@/contexts/ProductsContext';
import { useCategories } from '@/contexts/CategoriesContext';
import { useClients } from '@/contexts/ClientsContext';
import { useSuppliers } from '@/contexts/SuppliersContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useStock } from '@/contexts/StockContext';
import { useData } from '@/contexts/DataContext'; // Only for cross-cutting concerns
```

## What Each Context Provides

### ProductsContext
- `products` - array of products
- `addProduct(product)` - add new product
- `updateProduct(id, product)` - update product
- `deleteProduct(id)` - delete product
- `isLoading` - loading state

### CategoriesContext
- `categories` - array of categories
- `addCategory(category)` - add new category
- `updateCategory(id, category)` - update category
- `deleteCategory(id)` - delete category
- `isLoading` - loading state

### ClientsContext
- `clients` - array of clients
- `addClient(client)` - add new client
- `updateClient(id, client)` - update client
- `deleteClient(id)` - delete client
- `isLoading` - loading state

### SuppliersContext
- `suppliers` - array of suppliers
- `addSupplier(supplier)` - add new supplier
- `updateSupplier(id, supplier)` - update supplier
- `deleteSupplier(id)` - delete supplier
- `isLoading` - loading state

### OrdersContext
- `orders` - array of orders
- `addOrder(order)` - add new order
- `updateOrder(id, order)` - update order
- `deleteOrder(id)` - delete order
- `setOrders(orders)` - set orders array
- `isLoading` - loading state

### StockContext
- `stockEntries` - array of stock entries
- `stockExits` - array of stock exits
- `addStockEntry(entry)` - add new entry
- `addStockExit(exit)` - add new exit
- `updateStockEntry(id, entry)` - update entry
- `updateStockExit(id, exit)` - update exit
- `deleteStockEntry(id)` - delete entry
- `deleteStockExit(id)` - delete exit
- `isLoading` - loading state

### DataContext (Cross-cutting concerns only)
- `getProductHistory(id)` - get product history
- `getClientHistory(id)` - get client history
- `getSupplierHistory(id)` - get supplier history
- `convertOrderToStockExit(orderId, invoiceNumber)` - convert order
- `exportData(type)` - export data
- `getBusinessAnalytics()` - get analytics

## Files That Need Updating

### Completed ✅
- Dashboard.tsx
- useDashboardOptimized.ts
- useDashboardData.ts
- Suporte.tsx
- CategoryDetail.tsx
- CategoryList.tsx
- CategoryNew.tsx
- CategoryEdit.tsx
- CategoryProductsModal.tsx
- ClientList.tsx
- ClientNew.tsx
- ClientEdit.tsx
- Settings.tsx (partially - needs importData removed)

### In Progress 🔄
All remaining files below need to be updated to use the new hooks.

