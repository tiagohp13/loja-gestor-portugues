
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type TimeFilterPeriod = 'all-time' | 'year' | 'month';

interface TimeFilterProps {
  period: TimeFilterPeriod;
  year?: number;
  month?: number;
  onPeriodChange: (period: TimeFilterPeriod) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  availableYears: number[];
}

const TimeFilter: React.FC<TimeFilterProps> = ({
  period,
  year,
  month,
  onPeriodChange,
  onYearChange,
  onMonthChange,
  availableYears,
}) => {
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  // Use the available years or default to current year and previous 3 years
  const years = availableYears.length > 0 
    ? availableYears 
    : [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="w-full sm:w-64">
        <Label htmlFor="period-select" className="mb-1 block text-sm font-medium">Período</Label>
        <Select value={period} onValueChange={(value: TimeFilterPeriod) => onPeriodChange(value)}>
          <SelectTrigger id="period-select" className="w-full">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-time">Todo o período</SelectItem>
            <SelectItem value="year">Por ano</SelectItem>
            <SelectItem value="month">Por mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(period === 'year' || period === 'month') && (
        <div className="w-full sm:w-48">
          <Label htmlFor="year-select" className="mb-1 block text-sm font-medium">Ano</Label>
          <Select 
            value={year?.toString()} 
            onValueChange={(value) => onYearChange(parseInt(value, 10))}
          >
            <SelectTrigger id="year-select" className="w-full">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {period === 'month' && (
        <div className="w-full sm:w-48">
          <Label htmlFor="month-select" className="mb-1 block text-sm font-medium">Mês</Label>
          <Select 
            value={month?.toString()} 
            onValueChange={(value) => onMonthChange(parseInt(value, 10))}
          >
            <SelectTrigger id="month-select" className="w-full">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default TimeFilter;
