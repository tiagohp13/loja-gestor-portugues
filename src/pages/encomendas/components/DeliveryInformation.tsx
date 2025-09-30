import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { pt } from "date-fns/locale";

interface DeliveryInformationProps {
  orderType: 'combined' | 'awaiting_stock';
  expectedDeliveryDate?: Date;
  expectedDeliveryTime?: string;
  deliveryLocation?: string;
  onDeliveryDateChange: (date?: Date) => void;
  onDeliveryTimeChange: (time: string) => void;
  onDeliveryLocationChange: (location: string) => void;
}

export const DeliveryInformation = ({
  orderType,
  expectedDeliveryDate,
  expectedDeliveryTime,
  deliveryLocation,
  onDeliveryDateChange,
  onDeliveryTimeChange,
  onDeliveryLocationChange
}: DeliveryInformationProps) => {
  // Only show delivery fields for "combined" orders
  if (orderType !== 'combined') {
    return null;
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <h3 className="font-semibold text-sm">Informações de Entrega (Opcional)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expected Delivery Date */}
        <div className="space-y-2">
          <Label htmlFor="delivery-date">Data Prevista de Entrega</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="delivery-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !expectedDeliveryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expectedDeliveryDate ? (
                  format(expectedDeliveryDate, "dd/MM/yyyy", { locale: pt })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
              <Calendar
                mode="single"
                selected={expectedDeliveryDate}
                onSelect={onDeliveryDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Expected Delivery Time */}
        <div className="space-y-2">
          <Label htmlFor="delivery-time">Hora Prevista de Entrega</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="delivery-time"
              type="time"
              value={expectedDeliveryTime || ''}
              onChange={(e) => onDeliveryTimeChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Delivery Location */}
      <div className="space-y-2">
        <Label htmlFor="delivery-location">Local de Entrega/Levantamento</Label>
        <Input
          id="delivery-location"
          type="text"
          placeholder="Ex: Morada de entrega ou local de levantamento"
          value={deliveryLocation || ''}
          onChange={(e) => onDeliveryLocationChange(e.target.value)}
        />
      </div>
    </div>
  );
};
