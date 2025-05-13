
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface OrderDatePickerProps {
  orderDate: Date;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  setOrderDate: (date: Date) => void;
}

const OrderDatePicker: React.FC<OrderDatePickerProps> = ({
  orderDate,
  calendarOpen,
  setCalendarOpen,
  setOrderDate
}) => {
  return (
    <div>
      <Label htmlFor="date">Data da Encomenda</Label>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal mt-1"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {format(orderDate, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={orderDate}
            onSelect={(date) => {
              if (date) {
                setOrderDate(date);
                setCalendarOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default OrderDatePicker;
