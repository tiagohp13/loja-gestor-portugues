import { Category, Product, Client, Supplier, Order, StockEntry, StockExit } from "@/types";

export function mapCategory(data: any): Category {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    productCount: data.product_count,
  };
}

export function mapProduct(data: any): Product {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    description: data.description,
    category: data.category,
    purchasePrice: data.purchase_price,
    salePrice: data.sale_price,
    currentStock: data.current_stock,
    minStock: data.min_stock,
    image: data.image,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export function mapClient(data: any): Client {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    taxId: data.tax_id,
    notes: data.notes,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    lastPurchaseDate: data.last_purchase_date,
    totalSpent: data.total_spent,
    purchaseCount: data.purchase_count,
  };
}

export function mapSupplier(data: any): Supplier {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    taxId: data.tax_id,
    paymentTerms: data.payment_terms,
    notes: data.notes,
    status: data.status,
    userId: data.user_id,
    totalSpent: data.total_spent,
    purchaseCount: data.purchase_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deletedAt: data.deleted_at,
  };
}

export function mapOrder(data: any): Order {
  const items = data.items?.map((item: any) => ({
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    salePrice: item.sale_price,
    discountPercent: item.discount_percent,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  })) || [];

  // Calculate total from items
  const subtotal = items.reduce((sum, item) => {
    const itemDiscount = item.discountPercent || 0;
    const itemTotal = item.quantity * item.salePrice * (1 - itemDiscount / 100);
    return sum + itemTotal;
  }, 0);

  // Apply global order discount
  const orderDiscount = data.discount || 0;
  const calculatedTotal = subtotal * (1 - orderDiscount / 100);
  
  // Use calculated total from items if available, otherwise fallback to total_amount from DB
  const total = items.length > 0 ? calculatedTotal : (data.total_amount || 0);

  return {
    id: data.id,
    clientId: data.client_id,
    clientName: data.client_name,
    date: data.date,
    discount: data.discount,
    notes: data.notes,
    status: data.status,
    number: data.number,
    orderType: data.order_type,
    expectedDeliveryDate: data.expected_delivery_date,
    expectedDeliveryTime: data.expected_delivery_time,
    deliveryLocation: data.delivery_location,
    convertedToStockExitId: data.converted_to_stock_exit_id,
    convertedToStockExitNumber: data.converted_to_stock_exit_number,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    items,
    total,
  };
}

export function mapStockEntry(data: any): StockEntry {
  return {
    id: data.id,
    supplierId: data.supplier_id,
    supplierName: data.supplier_name,
    date: data.date,
    invoiceNumber: data.invoice_number,
    notes: data.notes,
    status: data.status,
    number: data.number,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    items: data.items?.map((item: any) => ({
      id: item.id,
      entryId: item.entry_id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      purchasePrice: item.purchase_price,
      discountPercent: item.discount_percent,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) || [],
  };
}

export function mapStockExit(data: any): StockExit {
  const items = data.items?.map((item: any) => ({
    id: item.id,
    exitId: item.exit_id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    salePrice: item.sale_price,
    discountPercent: item.discount_percent,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  })) || [];

  // Calculate total from items
  const subtotal = items.reduce((sum, item) => {
    const itemDiscount = item.discountPercent || 0;
    const itemTotal = item.quantity * item.salePrice * (1 - itemDiscount / 100);
    return sum + itemTotal;
  }, 0);

  // Apply global exit discount
  const exitDiscount = data.discount || 0;
  const total = subtotal * (1 - exitDiscount / 100);

  return {
    id: data.id,
    clientId: data.client_id,
    clientName: data.client_name,
    date: data.date,
    invoiceNumber: data.invoice_number,
    discount: data.discount,
    notes: data.notes,
    status: data.status,
    number: data.number,
    fromOrderId: data.from_order_id,
    fromOrderNumber: data.from_order_number,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    items,
    total,
  };
}
