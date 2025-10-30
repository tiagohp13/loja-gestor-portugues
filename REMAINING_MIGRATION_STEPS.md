# Remaining Context Migration Steps

## Summary
The DataContext has been successfully split into separate contexts. However, ~60 files still need to be updated to use the new hooks.

## Already Fixed ✅
- Dashboard.tsx
- useDashboardOptimized.ts
- useDashboardData.ts
- Suporte.tsx
- All Category files
- ClientList.tsx, ClientNew.tsx, ClientEdit.tsx
- Settings.tsx

## Critical Error in useDashboardOptimized.ts
**Current error**: `Cannot read properties of undefined (reading 'length')` at line 139

**Cause**: The `products`, `orders`, `stockExits`, `stockEntries`, `clients` arrays are undefined because they're trying to call `.length` on undefined values.

**Fix**: Line 216 in `useDashboardOptimized.ts` already imports the correct hooks, so the arrays should be defined. The issue must be in how the query is set up. The arrays might be undefined during initial render before the contexts have loaded.

**Solution**: Add guards for undefined arrays in the queryKey:
```typescript
queryKey: [
  'dashboard-all-data', 
  products?.length || 0, 
  orders?.length || 0, 
  stockExits?.length || 0, 
  stockEntries?.length || 0,
  clients?.length || 0
],
```

## Patterns for Remaining Files

### Pattern 1: Client Files
**Files affected**: 
- `useClientDetail.ts`
- `ClientDetail.tsx`  
- `ClientInfoCard.tsx`
- `ClientInsights.tsx`

**Change needed**:
```typescript
// OLD:
import { useData } from '@/contexts/DataContext';
const { clients, getClient, stockExits, isLoading } = useData();

// NEW:
import { useClients } from '@/contexts/ClientsContext';
import { useStock } from '@/contexts/StockContext';
const { clients, isLoading } = useClients();
const { stockExits } = useStock();
const getClient = (id: string) => clients.find(c => c.id === id);
```

### Pattern 2: Product Files
**Files affected**:
- `ProductDetail.tsx`
- `ProductEdit.tsx`
- `ProductList.tsx`
- `ProductNew.tsx`
- `useProductDetail.ts`
- `useProductHistory.ts`

**Change needed**:
```typescript
// OLD:
import { useData } from '@/contexts/DataContext';
const { products, getProduct, categories, updateProduct, deleteProduct, addProduct, orders, isLoading } = useData();

// NEW:
import { useProducts } from '@/contexts/ProductsContext';
import { useCategories } from '@/contexts/CategoriesContext';
import { useOrders } from '@/contexts/OrdersContext';
const { products, updateProduct, deleteProduct, addProduct, isLoading } = useProducts();
const { categories } = useCategories();
const { orders } = useOrders();
const getProduct = (id: string) => products.find(p => p.id === id);
```

### Pattern 3: Supplier Files
**Files affected**:
- `SupplierEdit.tsx`
- `SupplierList.tsx`
- `SupplierNew.tsx`
- `useSupplierDetail.ts`

**Change needed**:
```typescript
// OLD:
import { useData } from '@/contexts/DataContext';
const { suppliers, getSupplier, updateSupplier, deleteSupplier, addSupplier } = useData();

// NEW:
import { useSuppliers } from '@/contexts/SuppliersContext';
const { suppliers, updateSupplier, deleteSupplier, addSupplier } = useSuppliers();
const getSupplier = (id: string) => suppliers.find(s => s.id === id);
```

### Pattern 4: Order Files
**Files affected**:
- `OrderList.tsx`
- `OrderDetailHeader.tsx`
- `useOrderDetail.ts`
- `useOrderForm.ts`

**Change needed**:
```typescript
// OLD:
import { useData } from '@/contexts/DataContext';
const { orders, clients, products, stockExits, deleteOrder, addOrder, isLoading } = useData();

// NEW:
import { useOrders } from '@/contexts/OrdersContext';
import { useClients } from '@/contexts/ClientsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useStock } from '@/contexts/StockContext';
const { orders, deleteOrder, addOrder, isLoading } = useOrders();
const { clients } = useClients();
const { products } = useProducts();
const { stockExits } = useStock();
```

### Pattern 5: Stock Entry Files
**Files affected**:
- `StockEntryNew.tsx`
- `StockEntryEditForm.tsx`
- `useStockEntries.ts`
- `useStockEntryDetail.ts`
- `useStockEntryEdit.ts`
- `useStockEntryForm.ts`

**Change needed**:
```typescript
// OLD:
import { useData } from '@/contexts/DataContext';
const { stockEntries, suppliers, products, addStockEntry, deleteStockEntry } = useData();

// NEW:
import { useStock } from '@/contexts/StockContext';
import { useSuppliers } from '@/contexts/SuppliersContext';
import { useProducts } from '@/contexts/ProductsContext';
const { stockEntries, addStockEntry, deleteStockEntry } = useStock();
const { suppliers } = useSuppliers();
const { products } = useProducts();
```

### Pattern 6: Stock Exit Files
**Files affected**:
- `StockExitEdit.tsx`
- `StockExitList.tsx`
- `useExitState.ts`
- `useFilters.ts`
- `useStockExit.ts`
- `useStockExitDetail.ts`

**Change needed**:
```typescript
// OLD:
import { useData } from '@/contexts/DataContext';
const { stockExits, clients, products, addStockExit, updateStockExit, deleteStockExit } = useData();

// NEW:
import { useStock } from '@/contexts/StockContext';
import { useClients } from '@/contexts/ClientsContext';
import { useProducts } from '@/contexts/ProductsContext';
const { stockExits, addStockExit, updateStockExit, deleteStockExit } = useStock();
const { clients } = useClients();
const { products } = useProducts();
```

### Pattern 7: Support Files
**Files affected**:
- `useSupportData.ts`

**Change needed**:
```typescript
// OLD:
import { useData } from '@/contexts/DataContext';
const { clients, suppliers, categories, products } = useData();

// NEW:
import { useClients } from '@/contexts/ClientsContext';
import { useSuppliers } from '@/contexts/SuppliersContext';
import { useCategories } from '@/contexts/CategoriesContext';
import { useProducts } from '@/contexts/ProductsContext';
const { clients } = useClients();
const { suppliers } = useSuppliers();
const { categories } = useCategories();
const { products } = useProducts();
```

### Pattern 8: Dashboard Optimized Hook
**File**: `useDashboardDataOptimized.ts`

**Change needed**:
```typescript
// OLD:
import { useData } from '@/contexts/DataContext';
const { products, stockEntries, stockExits, orders } = useData();

// NEW:
import { useProducts } from '@/contexts/ProductsContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useStock } from '@/contexts/StockContext';
const { products } = useProducts();
const { orders } = useOrders();
const { stockEntries, stockExits } = useStock();
```

## Quick Fix Script
All files follow the same pattern. Here's a pseudo-code for the migration:

1. Identify what data the file uses from `useData()`
2. Import the appropriate new context hooks
3. Call each hook separately
4. For `getX` functions (getClient, getProduct, etc.), create them as: `const getX = (id: string) => xs.find(x => x.id === id)`

## Priority Order
Fix in this order for fastest results:
1. ✅ CRITICAL: Fix queryKey in `useDashboardOptimized.ts` (line 216) - add null guards
2. All Client files (to fix client pages)
3. All Product files (to fix product pages)
4. All Order files (to fix order pages)
5. All Stock files (to fix stock pages)
6. All Supplier files (to fix supplier pages)
7. Support files (to fix support page)
8. Dashboard Optimized hook
