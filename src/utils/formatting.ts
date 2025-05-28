
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-PT').format(date);
};

export const formatDateString = (dateString: string): string => {
  return new Intl.DateTimeFormat('pt-PT').format(new Date(dateString));
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-PT').format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
