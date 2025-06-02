
import { Product, Category, Client, Supplier, Order, OrderItem, StockEntry, StockEntryItem, StockExit, StockExitItem, ExpenseItem } from '../types';
import type { Database } from '@/integrations/supabase/types';

type DbProduct = Database['public']['Tables']['products']['Row'];
type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbClient = Database['public']['Tables']['clients']['Row'];
type DbSupplier = Database['public']['Tables']['suppliers']['Row'];
type DbOrder = Database['public']['Tables']['orders']['Row'];
type DbOrderItem = Database['public']['Tables']['order_items']['Row'];
type DbStockEntry = Database['public']['Tables']['stock_entries']['Row'];
type DbStockEntryItem = Database['public']['Tables']['stock_entry_items']['Row'];
type DbStockExit = Database['public']['Tables']['stock_exits']['Row'];
type DbStockExitItem = Database['public']['Tables']['stock_exit_items']['Row'];
type DbExpenseItem = Database['public']['Tables']['expense_items']['Row'];

export const mapDbProductToProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  userId: dbProduct.user_id || undefined,
  code: dbProduct.code,
  name: dbProduct.name,
  description: dbProduct.description || undefined,
  image: dbProduct.image || undefined,
  category: dbProduct.category || undefined,
  salePrice: Number(dbProduct.sale_price),
  purchasePrice: Number(dbProduct.purchase_price),
  currentStock: dbProduct.current_stock,
  minStock: dbProduct.min_stock,
  status: dbProduct.status || undefined,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at
});

export const mapDbCategoryToCategory = (dbCategory: DbCategory): Category => ({
  id: dbCategory.id,
  userId: dbCategory.user_id || undefined,
  name: dbCategory.name,
  description: dbCategory.description || undefined,
  status: dbCategory.status || undefined,
  productCount: dbCategory.product_count || undefined,
  createdAt: dbCategory.created_at,
  updatedAt: dbCategory.updated_at
});

export const mapDbClientToClient = (dbClient: DbClient): Client => ({
  id: dbClient.id,
  userId: dbClient.user_id || undefined,
  name: dbClient.name,
  email: dbClient.email || undefined,
  phone: dbClient.phone || undefined,
  address: dbClient.address || undefined,
  taxId: dbClient.tax_id || undefined,
  notes: dbClient.notes || undefined,
  status: dbClient.status || undefined,
  createdAt: dbClient.created_at,
  updatedAt: dbClient.updated_at
});

export const mapDbSupplierToSupplier = (dbSupplier: DbSupplier): Supplier => ({
  id: dbSupplier.id,
  userId: dbSupplier.user_id || undefined,
  name: dbSupplier.name,
  email: dbSupplier.email || undefined,
  phone: dbSupplier.phone || undefined,
  address: dbSupplier.address || undefined,
  taxId: dbSupplier.tax_id || undefined,
  notes: dbSupplier.notes || undefined,
  paymentTerms: dbSupplier.payment_terms || undefined,
  status: dbSupplier.status || undefined,
  createdAt: dbSupplier.created_at,
  updatedAt: dbSupplier.updated_at
});

export const mapDbOrderToOrder = (dbOrder: DbOrder, dbOrderItems: DbOrderItem[]): Order => ({
  id: dbOrder.id,
  userId: dbOrder.user_id || undefined,
  number: dbOrder.number,
  clientId: dbOrder.client_id || undefined,
  clientName: dbOrder.client_name || undefined,
  date: dbOrder.date,
  notes: dbOrder.notes || undefined,
  discount: Number(dbOrder.discount) || undefined,
  convertedToStockExitId: dbOrder.converted_to_stock_exit_id || undefined,
  convertedToStockExitNumber: dbOrder.converted_to_stock_exit_number || undefined,
  createdAt: dbOrder.created_at,
  updatedAt: dbOrder.updated_at,
  items: dbOrderItems.map(mapDbOrderItemToOrderItem)
});

export const mapDbOrderItemToOrderItem = (dbOrderItem: DbOrderItem): OrderItem => ({
  id: dbOrderItem.id,
  orderId: dbOrderItem.order_id || undefined,
  productId: dbOrderItem.product_id || undefined,
  productName: dbOrderItem.product_name,
  quantity: dbOrderItem.quantity,
  salePrice: Number(dbOrderItem.sale_price),
  discountPercent: Number(dbOrderItem.discount_percent) || undefined,
  createdAt: dbOrderItem.created_at,
  updatedAt: dbOrderItem.updated_at
});

export const mapDbStockEntryToStockEntry = (dbEntry: DbStockEntry, dbItems: DbStockEntryItem[]): StockEntry => ({
  id: dbEntry.id,
  userId: dbEntry.user_id || undefined,
  number: dbEntry.number,
  supplierId: dbEntry.supplier_id || '',
  supplierName: dbEntry.supplier_name,
  date: dbEntry.date,
  invoiceNumber: dbEntry.invoice_number || undefined,
  notes: dbEntry.notes || undefined,
  discount: Number(dbEntry.notes) || undefined,
  createdAt: dbEntry.created_at,
  updatedAt: dbEntry.updated_at,
  items: dbItems.map(mapDbStockEntryItemToStockEntryItem)
});

export const mapDbStockEntryItemToStockEntryItem = (dbItem: DbStockEntryItem): StockEntryItem => ({
  id: dbItem.id,
  entryId: dbItem.entry_id || undefined,
  productId: dbItem.product_id || '',
  productName: dbItem.product_name,
  quantity: dbItem.quantity,
  purchasePrice: Number(dbItem.purchase_price),
  discountPercent: Number(dbItem.discount_percent) || undefined,
  createdAt: dbItem.created_at,
  updatedAt: dbItem.updated_at
});

export const mapDbStockExitToStockExit = (dbExit: DbStockExit, dbItems: DbStockExitItem[]): StockExit => ({
  id: dbExit.id,
  userId: dbExit.user_id || undefined,
  number: dbExit.number,
  clientId: dbExit.client_id || undefined,
  clientName: dbExit.client_name,
  date: dbExit.date,
  notes: dbExit.notes || undefined,
  discount: Number(dbExit.discount) || undefined,
  fromOrderId: dbExit.from_order_id || undefined,
  fromOrderNumber: dbExit.from_order_number || undefined,
  invoiceNumber: dbExit.invoice_number || undefined,
  createdAt: dbExit.created_at,
  updatedAt: dbExit.updated_at,
  items: dbItems.map(mapDbStockExitItemToStockExitItem)
});

export const mapDbStockExitItemToStockExitItem = (dbItem: DbStockExitItem): StockExitItem => ({
  id: dbItem.id,
  exitId: dbItem.exit_id || undefined,
  productId: dbItem.product_id || '',
  productName: dbItem.product_name,
  quantity: dbItem.quantity,
  salePrice: Number(dbItem.sale_price),
  discountPercent: Number(dbItem.discount_percent) || undefined,
  createdAt: dbItem.created_at,
  updatedAt: dbItem.updated_at
});

// Reverse mappers for saving to database
export const mapOrderItemToDbOrderItem = (item: OrderItem, orderId: string) => ({
  order_id: orderId,
  product_id: item.productId,
  product_name: item.productName,
  quantity: item.quantity,
  sale_price: item.salePrice,
  discount_percent: item.discountPercent || 0
});

export const mapStockEntryItemToDbStockEntryItem = (item: StockEntryItem, entryId: string) => ({
  entry_id: entryId,
  product_id: item.productId,
  product_name: item.productName,
  quantity: item.quantity,
  purchase_price: item.purchasePrice,
  discount_percent: item.discountPercent || 0
});

export const mapStockExitItemToDbStockExitItem = (item: StockExitItem, exitId: string) => ({
  exit_id: exitId,
  product_id: item.productId,
  product_name: item.productName,
  quantity: item.quantity,
  sale_price: item.salePrice,
  discount_percent: item.discountPercent || 0
});

export const createStockEntryItem = (productId: string, productName: string, quantity: number, purchasePrice: number): StockEntryItem => ({
  id: crypto.randomUUID(),
  productId,
  productName,
  quantity,
  purchasePrice,
  discountPercent: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const createOrderItem = (productId: string, productName: string, quantity: number, salePrice: number): OrderItem => ({
  id: crypto.randomUUID(),
  productId,
  productName,
  quantity,
  salePrice,
  discountPercent: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const createExpenseItem = (productName: string, quantity: number, unitPrice: number): ExpenseItem => ({
  id: crypto.randomUUID(),
  productName,
  quantity,
  unitPrice,
  discountPercent: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
