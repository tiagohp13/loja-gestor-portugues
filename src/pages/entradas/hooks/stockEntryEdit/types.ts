
import { StockEntryItem } from '@/types';

export interface StockEntryFormState {
  supplierId: string;
  items: StockEntryItem[];
  date: string;
  invoiceNumber: string;
  notes: string;
}

export interface UseStockEntryEditProps {
  id?: string;
}

export interface UseStockEntryEditReturn {
  entry: StockEntryFormState;
  isNewEntry: boolean;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSupplierChange: (value: string) => void;
  handleItemChange: (index: number, field: keyof StockEntryItem, value: any) => void;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  calculateItemTotal: (item: StockEntryItem) => number;
  calculateTotal: () => number;
}
