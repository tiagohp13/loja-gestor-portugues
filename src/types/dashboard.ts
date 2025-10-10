export interface MonthlyVariation {
  currentValue: number;
  previousValue: number;
  percentChange?: number;
  absoluteChange: number;
  previousMonth: string;
}

export interface DashboardCardData {
  title: string;
  value: number | string;
  icon: JSX.Element;
  navigateTo: string;
  iconColor: string;
  iconBackground: string;

  // Percentuais para os dois períodos
  percentageChange?: {
    last30Days?: number;
    previousMonth?: number;
  };
}
