
import { useState, useEffect } from 'react';
import { TimeFilterPeriod } from '@/components/statistics/TimeFilter';
import { KPI } from '@/components/statistics/KPIPanel';

// Get all available years from data (for dropdown)
export const getAvailableYears = (data: { date?: string | Date }[]): number[] => {
  const years = new Set<number>();
  
  data.forEach(item => {
    if (item.date) {
      const date = new Date(item.date);
      years.add(date.getFullYear());
    }
  });
  
  return Array.from(years).sort((a, b) => b - a); // Sort descending
};

// Filter data based on selected time period
export const filterDataByTimePeriod = <T extends { date?: string | Date }>(
  data: T[],
  period: TimeFilterPeriod,
  year?: number,
  month?: number
): T[] => {
  if (period === 'all-time') {
    return data;
  }
  
  return data.filter(item => {
    if (!item.date) return false;
    
    const date = new Date(item.date);
    
    if (period === 'year' && year) {
      return date.getFullYear() === year;
    }
    
    if (period === 'month' && year && month) {
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    }
    
    return false;
  });
};

export interface UseTimeFilterResult {
  period: TimeFilterPeriod;
  year: number | undefined;
  month: number | undefined;
  availableYears: number[];
  setPeriod: (period: TimeFilterPeriod) => void;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  filterKPIsByTimePeriod: (kpis: KPI[], entriesData: any[], exitsData: any[]) => KPI[];
}

export const useTimeFilter = (entriesData: any[], exitsData: any[]): UseTimeFilterResult => {
  const [period, setPeriod] = useState<TimeFilterPeriod>('all-time');
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  
  // Get available years from both entries and exits data
  const allTransactionData = [...entriesData, ...exitsData];
  const availableYears = getAvailableYears(allTransactionData);
  
  // When period changes, ensure we have defaults set
  useEffect(() => {
    if (period === 'all-time') {
      // No need for year/month when showing all-time data
      return;
    }
    
    if (!year && availableYears.length > 0) {
      setYear(availableYears[0]);
    }
    
    if (period === 'month' && !month) {
      setMonth(new Date().getMonth() + 1);
    }
  }, [period, year, month, availableYears]);
  
  // Filter KPIs based on time period
  const filterKPIsByTimePeriod = (kpis: KPI[], entriesData: any[], exitsData: any[]): KPI[] => {
    const filteredEntries = filterDataByTimePeriod(entriesData, period, year, month);
    const filteredExits = filterDataByTimePeriod(exitsData, period, year, month);
    
    // This is a placeholder for actual KPI recalculation logic
    // In a real app, you'd recalculate each KPI based on filtered data
    // For now we'll just clone the KPIs (real implementation will depend on KPI calculation logic)
    return kpis.map(kpi => ({ ...kpi }));
  };
  
  return {
    period,
    year,
    month,
    availableYears,
    setPeriod,
    setYear,
    setMonth,
    filterKPIsByTimePeriod,
  };
};
