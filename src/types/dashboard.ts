
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
  variation?: MonthlyVariation;
  navigateTo: string;
  iconColor: string;
  iconBackground: string;
}
