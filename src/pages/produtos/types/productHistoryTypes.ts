
export interface EntryItem {
  id?: string;
  entryId?: string;
  date: string;
  number: string;
  document: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ExitItem {
  date: string;
  number: string;
  document: string;
  clientId?: string;
  clientName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  exitId: string;
}
