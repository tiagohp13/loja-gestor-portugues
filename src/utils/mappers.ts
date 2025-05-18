
import { 
  Product, Client, StockEntry, StockExit, Supplier, Category, Order, 
  StockEntryItem, StockExitItem, OrderItem 
} from '@/types';
import { Database } from '@/integrations/supabase/types';

type DbProduct = Database['public']['Tables']['products']['Row'];
type DbClient = Database['public']['Tables']['clients']['Row'];
type DbStockEntry = Database['public']['Tables']['stock_entries']['Row'];
type DbStockExit = Database['public']['Tables']['stock_exits']['Row'];
type DbSupplier = Database['public']['Tables']['suppliers']['Row'];
type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbOrder = Database['public']['Tables']['orders']['Row'];
type DbStockEntryItem = Database['public']['Tables']['stock_entry_items']['Row'];
type DbStockExitItem = Database['public']['Tables']['stock_exit_items']['Row'];
type DbOrderItem = Database['public']['Tables']['order_items']['Row'];

export function mapDbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    code: dbProduct.code,
    name: dbProduct.name,
    description: dbProduct.description || '',
    category: dbProduct.category || '',
    purchasePrice: dbProduct.purchase_price,
    salePrice: dbProduct.sale_price,
    currentStock: dbProduct.current_stock,
    minStock: dbProduct.min_stock,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    image: dbProduct.image,
    status: dbProduct.status
  };
}

export function mapDbClientToClient(dbClient: DbClient): Client {
  return {
    id: dbClient.id,
    name: dbClient.name,
    email: dbClient.email || '',
    phone: dbClient.phone || '',
    address: dbClient.address || '',
    taxId: dbClient.tax_id || '',
    notes: dbClient.notes || '',
    createdAt: dbClient.created_at,
    updatedAt: dbClient.updated_at,
    status: dbClient.status
  };
}

export function mapDbStockEntryItemToStockEntryItem(dbItem: DbStockEntryItem): StockEntryItem {
  return {
    id: dbItem.id,
    productId: dbItem.product_id || '',
    productName: dbItem.product_name,
    quantity: dbItem.quantity,
    purchasePrice: dbItem.purchase_price,
    discountPercent: dbItem.discount_percent
  };
}

export function mapDbStockEntryToStockEntry(dbEntry: DbStockEntry, items: DbStockEntryItem[] = []): StockEntry {
  return {
    id: dbEntry.id,
    number: dbEntry.number,
    supplierId: dbEntry.supplier_id || '',
    supplierName: dbEntry.supplier_name,
    items: items.map(mapDbStockEntryItemToStockEntryItem),
    invoiceNumber: dbEntry.invoice_number,
    notes: dbEntry.notes,
    date: dbEntry.date,
    createdAt: dbEntry.created_at,
    total: calculateEntryTotal(items)
  };
}

export function mapDbStockExitItemToStockExitItem(dbItem: DbStockExitItem): StockExitItem {
  return {
    id: dbItem.id,
    productId: dbItem.product_id || '',
    productName: dbItem.product_name,
    quantity: dbItem.quantity,
    salePrice: dbItem.sale_price,
    discountPercent: dbItem.discount_percent
  };
}

export function mapDbStockExitToStockExit(dbExit: DbStockExit, items: DbStockExitItem[] = []): StockExit {
  return {
    id: dbExit.id,
    number: dbExit.number,
    clientId: dbExit.client_id || '',
    clientName: dbExit.client_name,
    items: items.map(mapDbStockExitItemToStockExitItem),
    date: dbExit.date,
    invoiceNumber: dbExit.invoice_number,
    notes: dbExit.notes,
    fromOrderId: dbExit.from_order_id,
    fromOrderNumber: dbExit.from_order_number,
    createdAt: dbExit.created_at,
    discount: dbExit.discount,
    total: calculateExitTotal(items)
  };
}

export function mapDbSupplierToSupplier(dbSupplier: DbSupplier): Supplier {
  return {
    id: dbSupplier.id,
    name: dbSupplier.name,
    email: dbSupplier.email || '',
    phone: dbSupplier.phone || '',
    address: dbSupplier.address || '',
    taxId: dbSupplier.tax_id || '',
    paymentTerms: dbSupplier.payment_terms || '',
    notes: dbSupplier.notes || '',
    createdAt: dbSupplier.created_at,
    updatedAt: dbSupplier.updated_at,
    status: dbSupplier.status
  };
}

export function mapDbCategoryToCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description || '',
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
    status: dbCategory.status,
    productCount: dbCategory.product_count
  };
}

export function mapDbOrderItemToOrderItem(dbItem: DbOrderItem): OrderItem {
  return {
    productId: dbItem.product_id || '',
    productName: dbItem.product_name,
    quantity: dbItem.quantity,
    salePrice: dbItem.sale_price,
    discountPercent: dbItem.discount_percent
  };
}

export function mapDbOrderToOrder(dbOrder: DbOrder, items: DbOrderItem[] = []): Order {
  return {
    id: dbOrder.id,
    number: dbOrder.number,
    clientId: dbOrder.client_id || '',
    clientName: dbOrder.client_name || '',
    items: items,
    date: dbOrder.date,
    notes: dbOrder.notes,
    convertedToStockExitId: dbOrder.converted_to_stock_exit_id,
    convertedToStockExitNumber: dbOrder.converted_to_stock_exit_number,
    discount: dbOrder.discount,
    total: calculateOrderTotal(items)
  };
}

function calculateEntryTotal(items: DbStockEntryItem[]): number {
  return items.reduce((total, item) => {
    const quantity = item.quantity || 0;
    const price = item.purchase_price || 0;
    const discount = item.discount_percent ? item.discount_percent / 100 : 0;
    return total + (quantity * price * (1 - discount));
  }, 0);
}

function calculateExitTotal(items: DbStockExitItem[]): number {
  return items.reduce((total, item) => {
    const quantity = item.quantity || 0;
    const price = item.sale_price || 0;
    const discount = item.discount_percent ? item.discount_percent / 100 : 0;
    return total + (quantity * price * (1 - discount));
  }, 0);
}

function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    const quantity = item.quantity || 0;
    const price = item.salePrice || 0;
    const discount = item.discountPercent ? item.discountPercent / 100 : 0;
    return total + (quantity * price * (1 - discount));
  }, 0);
}
