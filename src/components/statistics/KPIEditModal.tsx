
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KPI } from '@/components/statistics/KPIPanel';
import { formatCurrency, formatPercentage } from '@/utils/formatting';

interface KPIEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpis: KPI[];
  onSave: (updatedKpis: KPI[]) => void;
}

const KPIEditModal: React.FC<KPIEditModalProps> = ({ isOpen, onClose, kpis, onSave }) => {
  const [targets, setTargets] = useState<Record<string, number>>(
    kpis.reduce((acc, kpi) => ({
      ...acc,
      [kpi.name]: kpi.target
    }), {})
  );

  const handleInputChange = (kpiName: string, value: string) => {
    // Convert to number and validate
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      setTargets(prev => ({
        ...prev,
        [kpiName]: numValue
      }));
    }
  };

  const handleSave = () => {
    // Update all KPIs with new target values
    const updatedKpis = kpis.map(kpi => ({
      ...kpi,
      target: targets[kpi.name],
      // Check if value is below the new target to update the belowTarget property
      belowTarget: kpi.value < targets[kpi.name]
    }));
    
    onSave(updatedKpis);
  };

  const formatDisplayValue = (kpi: KPI) => {
    const target = targets[kpi.name];
    
    if (kpi.isPercentage) {
      return formatPercentage(target);
    } else if (kpi.unit === '€') {
      return formatCurrency(target);
    }
    
    return target.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Metas dos KPIs</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {kpis.map((kpi, index) => (
            <div key={index} className="grid grid-cols-1 gap-2">
              <Label htmlFor={`kpi-${index}`} className="font-medium">
                {kpi.name}
                <span className="text-xs text-gray-500 block">
                  Valor atual: {kpi.isPercentage ? formatPercentage(kpi.value) : (kpi.unit === '€' ? formatCurrency(kpi.value) : kpi.value)}
                </span>
              </Label>
              <div className="flex items-center">
                {kpi.unit === '€' && !kpi.isPercentage && (
                  <span className="mr-2 text-gray-500">€</span>
                )}
                <Input
                  id={`kpi-${index}`}
                  type="number"
                  step={kpi.isPercentage ? "0.01" : "1"}
                  value={targets[kpi.name]}
                  onChange={(e) => handleInputChange(kpi.name, e.target.value)}
                  className="w-full"
                />
                {kpi.isPercentage && (
                  <span className="ml-2 text-gray-500">%</span>
                )}
                {!kpi.isPercentage && kpi.unit !== '€' && (
                  <span className="ml-2 text-gray-500">{kpi.unit}</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Nova meta: {formatDisplayValue(kpi)}
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KPIEditModal;
