
import { 
  Product, Category, Client, Supplier, 
  Order, OrderItem, StockEntry, StockEntryItem,
  StockExit, StockExitItem
} from '../types';

// Database to Frontend mappers
export const mapDbProductToProduct = (data: any): Product => ({
  id: data.id,
  code: data.code,
  name: data.name,
  description: data.description || '',
  category: data.category || '',
  purchasePrice: Number(data.purchase_price),
  salePrice: Number(data.sale_price),
  currentStock: data.current_stock,
  minStock: data.min_stock,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  image: data.image,
  status: data.status
});

export const mapDbCategoryToCategory = (data: any): Category => ({
  id: data.id,
  name: data.name,
  description: data.description || '',
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  status: data.status,
  productCount: data.product_count || 0
});

export const mapDbClientToClient = (data: any): Client => ({
  id: data.id,
  name: data.name,
  email: data.email || '',
  phone: data.phone || '',
  address: data.address || '',
  taxId: data.tax_id || '',
  notes: data.notes || '',
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  status: data.status
});

export const mapDbSupplierToSupplier = (data: any): Supplier => ({
  id: data.id,
  name: data.name,
  email: data.email || '',
  phone: data.phone || '',
  address: data.address || '',
  taxId: data.tax_id || '',
  paymentTerms: data.payment_terms || '',
  notes: data.notes || '',
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  status: data.status
});

export const mapDbOrderItemToOrderItem = (data: any): OrderItem => ({
  id: data.id || '',
  productId: data.product_id || '',
  productName: data.product_name,
  quantity: data.quantity,
  salePrice: Number(data.sale_price),
  discountPercent: data.discount_percent ? Number(data.discount_percent) : undefined,
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString()
});

export const mapDbOrderToOrder = (data: any, items: any[] = []): Order => ({
  id: data.id,
  number: data.number,
  clientId: data.client_id || '',
  clientName: data.client_name || '',
  date: data.date,
  notes: data.notes || '',
  convertedToStockExitId: data.converted_to_stock_exit_id,
  convertedToStockExitNumber: data.converted_to_stock_exit_number,
  discount: Number(data.discount || 0),
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  items: items.map(mapDbOrderItemToOrderItem)
});

export const mapDbStockEntryItemToStockEntryItem = (data: any): StockEntryItem => ({
  id: data.id,
  productId: data.product_id || '',
  productName: data.product_name,
  quantity: data.quantity,
  purchasePrice: Number(data.purchase_price),
  discountPercent: data.discount_percent ? Number(data.discount_percent) : undefined,
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString()
});

export const mapDbStockEntryToStockEntry = (data: any, items: any[] = []): StockEntry => ({
  id: data.id,
  number: data.number,
  supplierId: data.supplier_id || '',
  supplierName: data.supplier_name,
  date: data.date,
  invoiceNumber: data.invoice_number || '',
  notes: data.notes || '',
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  items: items.map(mapDbStockEntryItemToStockEntryItem)
});

export const mapDbStockExitItemToStockExitItem = (data: any): StockExitItem => ({
  id: data.id,
  productId: data.product_id || '',
  productName: data.product_name,
  quantity: data.quantity,
  salePrice: Number(data.sale_price),
  discountPercent: data.discount_percent ? Number(data.discount_percent) : undefined,
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString()
});

export const mapDbStockExitToStockExit = (data: any, items: any[] = []): StockExit => ({
  id: data.id,
  number: data.number,
  clientId: data.client_id || '',
  clientName: data.client_name,
  date: data.date,
  invoiceNumber: data.invoice_number || '',
  notes: data.notes || '',
  fromOrderId: data.from_order_id,
  fromOrderNumber: data.from_order_number,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  discount: Number(data.discount || 0),
  items: items.map(mapDbStockExitItemToStockExitItem)
});

// Frontend to Database mappers
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
