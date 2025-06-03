
import { StockEntryItem } from '@/types';

export interface StockEntryFormState {
  supplierId: string;
  supplierName: string;
  date: string;
  invoiceNumber: string;
  notes: string;
  items: StockEntryItem[];
}

export interface UseStockEntryFormReturn {
  entryDetails: {
    supplierId: string;
    supplierName: string;
    invoiceNumber: string;
    notes: string;
  };
  items: StockEntryItem[];
  currentItem: StockEntryItem;
  searchTerm: string;
  selectedProductDisplay: string;
  isProductSearchOpen: boolean;
  isSupplierSearchOpen: boolean;
  supplierSearchTerm: string;
  entryDate: Date;
  calendarOpen: boolean;
  filteredProducts: any[];
  filteredSuppliers: any[];
  totalValue: number;
  isSubmitting: boolean;
  setEntryDetails: React.Dispatch<React.SetStateAction<any>>;
  setCurrentItem: React.Dispatch<React.SetStateAction<StockEntryItem>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedProductDisplay: React.Dispatch<React.SetStateAction<string>>;
  setIsProductSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSupplierSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSupplierSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEntryDate: React.Dispatch<React.SetStateAction<Date>>;
  handleEntryDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleItemChange: (field: string, value: any) => void;
  handleSearch: (value: string) => void;
  handleSupplierSearch: (value: string) => void;
  handleProductSelect: (productId: string) => void;
  handleSupplierSelect: (supplierId: string) => void;
  addItemToEntry: () => void;
  removeItem: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
