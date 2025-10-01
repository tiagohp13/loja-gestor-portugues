
import React from 'react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface DatePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  label: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  date, 
  setDate,
  label
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    setDate(newDate);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Input
        type="date"
        value={format(date, 'yyyy-MM-dd')}
        onChange={handleDateChange}
        className="w-full"
      />
    </div>
  );
};

export default DatePicker;
