
import { Product, Category, Client, Supplier, Order, OrderItem, StockEntry, StockEntryItem, StockExit, StockExitItem } from '../types';

export const mapDbProductToProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  userId: dbProduct.user_id,
  code: dbProduct.code,
  name: dbProduct.name,
  description: dbProduct.description,
  image: dbProduct.image,
  category: dbProduct.category,
  salePrice: Number(dbProduct.sale_price || 0),
  purchasePrice: Number(dbProduct.purchase_price || 0),
  currentStock: dbProduct.current_stock || 0,
  minStock: dbProduct.min_stock || 0,
  status: dbProduct.status,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at
});

export const mapDbCategoryToCategory = (dbCategory: any): Category => ({
  id: dbCategory.id,
  userId: dbCategory.user_id,
  name: dbCategory.name,
  description: dbCategory.description,
  status: dbCategory.status,
  productCount: dbCategory.product_count || 0,
  createdAt: dbCategory.created_at,
  updatedAt: dbCategory.updated_at
});

export const mapDbClientToClient = (dbClient: any): Client => ({
  id: dbClient.id,
  userId: dbClient.user_id,
  name: dbClient.name,
  email: dbClient.email,
  phone: dbClient.phone,
  address: dbClient.address,
  taxId: dbClient.tax_id,
  notes: dbClient.notes,
  status: dbClient.status,
  createdAt: dbClient.created_at,
  updatedAt: dbClient.updated_at
});

export const mapDbSupplierToSupplier = (dbSupplier: any): Supplier => ({
  id: dbSupplier.id,
  userId: dbSupplier.user_id,
  name: dbSupplier.name,
  email: dbSupplier.email,
  phone: dbSupplier.phone,
  address: dbSupplier.address,
  taxId: dbSupplier.tax_id,
  notes: dbSupplier.notes,
  paymentTerms: dbSupplier.payment_terms,
  status: dbSupplier.status,
  createdAt: dbSupplier.created_at,
  updatedAt: dbSupplier.updated_at
});

export const mapDbOrderToOrder = (dbOrder: any, dbOrderItems: any[]): Order => ({
  id: dbOrder.id,
  userId: dbOrder.user_id,
  number: dbOrder.number,
  clientId: dbOrder.client_id,
  clientName: dbOrder.client_name,
  date: dbOrder.date,
  notes: dbOrder.notes,
  discount: Number(dbOrder.discount || 0),
  total: 0, // Will be calculated
  convertedToStockExitId: dbOrder.converted_to_stock_exit_id,
  convertedToStockExitNumber: dbOrder.converted_to_stock_exit_number,
  createdAt: dbOrder.created_at,
  updatedAt: dbOrder.updated_at,
  items: dbOrderItems.map(mapDbOrderItemToOrderItem)
});

export const mapDbOrderItemToOrderItem = (dbOrderItem: any): OrderItem => ({
  id: dbOrderItem.id,
  orderId: dbOrderItem.order_id,
  productId: dbOrderItem.product_id,
  productName: dbOrderItem.product_name,
  quantity: dbOrderItem.quantity,
  salePrice: Number(dbOrderItem.sale_price || 0),
  discountPercent: Number(dbOrderItem.discount_percent || 0),
  createdAt: dbOrderItem.created_at,
  updatedAt: dbOrderItem.updated_at
});

export const mapDbStockEntryToStockEntry = (dbEntry: any, dbEntryItems: any[]): StockEntry => ({
  id: dbEntry.id,
  userId: dbEntry.user_id,
  number: dbEntry.number,
  supplierId: dbEntry.supplier_id,
  supplierName: dbEntry.supplier_name,
  date: dbEntry.date,
  invoiceNumber: dbEntry.invoice_number,
  notes: dbEntry.notes,
  discount: Number(dbEntry.discount || 0),
  createdAt: dbEntry.created_at,
  updatedAt: dbEntry.updated_at,
  items: dbEntryItems.map(mapDbStockEntryItemToStockEntryItem)
});

export const mapDbStockEntryItemToStockEntryItem = (dbItem: any): StockEntryItem => ({
  id: dbItem.id,
  entryId: dbItem.entry_id,
  productId: dbItem.product_id,
  productName: dbItem.product_name,
  quantity: dbItem.quantity,
  purchasePrice: Number(dbItem.purchase_price || 0),
  discountPercent: Number(dbItem.discount_percent || 0),
  createdAt: dbItem.created_at,
  updatedAt: dbItem.updated_at
});

export const mapDbStockExitToStockExit = (dbExit: any, dbExitItems: any[]): StockExit => ({
  id: dbExit.id,
  userId: dbExit.user_id,
  number: dbExit.number,
  clientId: dbExit.client_id,
  clientName: dbExit.client_name,
  date: dbExit.date,
  notes: dbExit.notes,
  discount: Number(dbExit.discount || 0),
  fromOrderId: dbExit.from_order_id,
  fromOrderNumber: dbExit.from_order_number,
  invoiceNumber: dbExit.invoice_number,
  createdAt: dbExit.created_at,
  updatedAt: dbExit.updated_at,
  items: dbExitItems.map(mapDbStockExitItemToStockExitItem)
});

export const mapDbStockExitItemToStockExitItem = (dbItem: any): StockExitItem => ({
  id: dbItem.id,
  exitId: dbItem.exit_id,
  productId: dbItem.product_id,
  productName: dbItem.product_name,
  quantity: dbItem.quantity,
  salePrice: Number(dbItem.sale_price || 0),
  discountPercent: Number(dbItem.discount_percent || 0),
  createdAt: dbItem.created_at,
  updatedAt: dbItem.updated_at
});

// Reverse mappers for database operations
export const mapOrderItemToDbOrderItem = (item: OrderItem, orderId: string) => ({
  order_id: orderId,
  product_id: item.productId,
  product_name: item.productName,
  quantity: item.quantity,
  sale_price: item.salePrice,
  discount_percent: item.discountPercent
});

export const mapStockEntryItemToDbStockEntryItem = (item: StockEntryItem, entryId: string) => ({
  entry_id: entryId,
  product_id: item.productId,
  product_name: item.productName,
  quantity: item.quantity,
  purchase_price: item.purchasePrice,
  discount_percent: item.discountPercent
});

export const mapStockExitItemToDbStockExitItem = (item: StockExitItem, exitId: string) => ({
  exit_id: exitId,
  product_id: item.productId,
  product_name: item.productName,
  quantity: item.quantity,
  sale_price: item.salePrice,
  discount_percent: item.discountPercent
});
