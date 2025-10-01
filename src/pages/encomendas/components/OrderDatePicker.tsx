import React from 'react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface OrderDatePickerProps {
  orderDate: Date;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  setOrderDate: (date: Date) => void;
}

const OrderDatePicker: React.FC<OrderDatePickerProps> = ({
  orderDate,
  setOrderDate
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    setOrderDate(newDate);
  };

  return (
    <div>
      <Input
        type="date"
        value={format(orderDate, 'yyyy-MM-dd')}
        onChange={handleDateChange}
        className="w-full mt-1"
      />
    </div>
  );
};

export default OrderDatePicker;