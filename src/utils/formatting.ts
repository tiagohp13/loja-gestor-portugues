
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatDateString = (date: Date | string): string => {
  return formatDate(date);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const generateFormattedOrderNumber = (counter: number): string => {
  const year = new Date().getFullYear();
  return `ENC-${year}/${counter.toString().padStart(3, '0')}`;
};

export const generateFormattedStockExitNumber = (counter: number): string => {
  const year = new Date().getFullYear();
  return `VEN-${year}/${counter.toString().padStart(3, '0')}`;
};

export const generateFormattedStockEntryNumber = (counter: number): string => {
  const year = new Date().getFullYear();
  return `COMP-${year}/${counter.toString().padStart(3, '0')}`;
};
