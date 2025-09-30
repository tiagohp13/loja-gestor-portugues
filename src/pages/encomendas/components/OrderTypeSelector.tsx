import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderTypeSelectorProps {
  value: 'combined' | 'awaiting_stock';
  onChange: (value: 'combined' | 'awaiting_stock') => void;
}

export const OrderTypeSelector = ({ value, onChange }: OrderTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="order-type">Tipo de Encomenda *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="order-type" className="w-full">
          <SelectValue placeholder="Selecione o tipo de encomenda" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="combined">Pendente – Combinada</SelectItem>
          <SelectItem value="awaiting_stock">Pendente – A aguardar stock</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
