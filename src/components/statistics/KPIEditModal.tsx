
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KPI } from '@/components/statistics/KPIPanel';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { saveKpiTargets } from '@/services/kpiService';

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
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Update all KPIs with new target values
      const updatedKpis = kpis.map(kpi => ({
        ...kpi,
        target: targets[kpi.name],
        // Check if value is below the new target to update the belowTarget property
        belowTarget: kpi.value < targets[kpi.name]
      }));
      
      // Persistir as metas no banco de dados
      await saveKpiTargets(updatedKpis);
      
      // Atualizar o estado local
      onSave(updatedKpis);
      
      // Notificar o usuário
      toast({
        title: "Metas atualizadas",
        description: "As metas dos KPIs foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar metas:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as metas dos KPIs.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
      <DialogContent className="sm:max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Editar Metas dos KPIs</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
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
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'A guardar...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KPIEditModal;
