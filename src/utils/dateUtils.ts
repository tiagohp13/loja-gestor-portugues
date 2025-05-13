
/**
 * Gets the name of a month in Portuguese
 * @param monthIndex - Month index (0-11)
 * @returns The month name in Portuguese
 */
export const getPortugueseMonthName = (monthIndex: number): string => {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 
    'maio', 'junho', 'julho', 'agosto', 
    'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  return months[monthIndex];
};

/**
 * Gets the current month name in Portuguese
 * @returns The current month name in Portuguese
 */
export const getCurrentMonthName = (): string => {
  const date = new Date();
  return getPortugueseMonthName(date.getMonth());
};

/**
 * Gets the previous month name in Portuguese
 * @returns The previous month name in Portuguese
 */
export const getPreviousMonthName = (): string => {
  const date = new Date();
  // Set to previous month
  date.setMonth(date.getMonth() - 1);
  return getPortugueseMonthName(date.getMonth());
};
