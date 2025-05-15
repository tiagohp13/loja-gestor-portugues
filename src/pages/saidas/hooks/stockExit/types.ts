
export interface ExitDetails {
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  notes: string;
  discount: number;
}

export interface ExitItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  discountPercent?: number;
}

export interface UseExitStateReturn {
  exitDetails: ExitDetails;
  items: ExitItem[];
  currentItem: ExitItem;
  searchTerm: string;
  clientSearchTerm: string;
  selectedProductDisplay: string;
  isProductSearchOpen: boolean;
  isClientSearchOpen: boolean;
  exitDate: Date;
  calendarOpen: boolean;
  setExitDetails: React.Dispatch<React.SetStateAction<ExitDetails>>;
  setItems: React.Dispatch<React.SetStateAction<ExitItem[]>>;
  setCurrentItem: React.Dispatch<React.SetStateAction<ExitItem>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setClientSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedProductDisplay: React.Dispatch<React.SetStateAction<string>>;
  setIsProductSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsClientSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setExitDate: React.Dispatch<React.SetStateAction<Date>>;
  setCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
