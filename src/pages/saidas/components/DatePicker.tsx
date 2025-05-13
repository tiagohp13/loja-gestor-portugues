
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

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
  isOpen, 
  setIsOpen,
  label
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(date) => {
              if (date) {
                setDate(date);
                setIsOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
