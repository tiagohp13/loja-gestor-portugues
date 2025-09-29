
import { StockEntryItem } from '@/types';

export const calculateItemTotal = (item: StockEntryItem): number => {
  return item.quantity * item.purchasePrice;
};

export const calculateTotal = (items: StockEntryItem[]): number => {
  return items.reduce((total, item) => total + calculateItemTotal(item), 0);
};

export const createInitialState = () => ({
  supplierId: '',
  items: [] as StockEntryItem[],
  date: new Date().toISOString().split('T')[0],
  invoiceNumber: '',
  notes: ''
});

export const mapApiDataToFormState = (data: any) => ({
  supplierId: data.supplier_id || '',
  items: (data.stock_entry_items || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id || '',
    productName: item.product_name || '',
    quantity: Number(item.quantity) || 0,
    purchasePrice: Number(item.purchase_price) || 0,
    discountPercent: Number(item.discount_percent) || 0
  })),
  date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  invoiceNumber: data.invoice_number || '',
  notes: data.notes || ''
});
