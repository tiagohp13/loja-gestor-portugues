
import React from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from 'lucide-react';

interface StockEntryDatePickerProps {
  entryDate: Date;
  setEntryDate: (date: Date) => void;
  calendarOpen: boolean;
  setCalendarOpen: (isOpen: boolean) => void;
}

const StockEntryDatePicker: React.FC<StockEntryDatePickerProps> = ({
  entryDate,
  setEntryDate,
  calendarOpen,
  setCalendarOpen
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Data da Entrada</label>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(entryDate, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={entryDate}
            onSelect={(date) => {
              if (date) {
                setEntryDate(date);
                setCalendarOpen(false);
              }
            }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default StockEntryDatePicker;
