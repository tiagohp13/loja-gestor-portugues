import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Clock } from "lucide-react";

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value + 'T00:00:00');
      onDeliveryDateChange(newDate);
    } else {
      onDeliveryDateChange(undefined);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <h3 className="font-semibold text-sm">Informações de Entrega (Opcional)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expected Delivery Date */}
        <div className="space-y-2">
          <Label htmlFor="delivery-date">Data Prevista de Entrega</Label>
          <Input
            id="delivery-date"
            type="date"
            value={expectedDeliveryDate ? format(expectedDeliveryDate, 'yyyy-MM-dd') : ''}
            onChange={handleDateChange}
            className="w-full"
          />
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
