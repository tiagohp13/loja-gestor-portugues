
import { StockEntryItem } from '@/types';

export interface EntryDetails {
  supplierId: string;
  supplierName: string;
  date: string;
  invoiceNumber: string;
  notes: string;
}

export interface CurrentItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

export interface UseStockEntryFormReturn {
  entryDetails: EntryDetails;
  items: StockEntryItem[];
  currentItem: CurrentItem;
  searchTerm: string;
  selectedProductDisplay: string;
  isProductSearchOpen: boolean;
  isSupplierSearchOpen: boolean;
  supplierSearchTerm: string;
  entryDate: Date;
  calendarOpen: boolean;
  filteredProducts: Array<{
    id: string;
    name: string;
    code: string;
    currentStock: number;
  }>;
  filteredSuppliers: Array<{
    id: string;
    name: string;
  }>;
  totalValue: number;
  setEntryDetails: React.Dispatch<React.SetStateAction<EntryDetails>>;
  setCurrentItem: React.Dispatch<React.SetStateAction<CurrentItem>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedProductDisplay: React.Dispatch<React.SetStateAction<string>>;
  setIsProductSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSupplierSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSupplierSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEntryDate: React.Dispatch<React.SetStateAction<Date>>;
  handleEntryDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleItemChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: (value: string) => void;
  handleSupplierSearch: (value: string) => void;
  handleProductSelect: (productId: string) => void;
  handleSupplierSelect: (supplierId: string) => void;
  addItemToEntry: () => void;
  removeItem: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
