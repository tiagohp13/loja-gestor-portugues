import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface KpiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  delta30d?: number;
  deltaMoM?: number;
  description?: string;
}

const KpiDetailModal: React.FC<KpiDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  delta30d,
  deltaMoM,
  description
}) => {
  const renderDelta = (delta: number | undefined, label: string) => {
    if (delta === undefined) return null;
    
    const isPositive = delta >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-emerald-600' : 'text-rose-600';
    const bgClass = isPositive ? 'bg-emerald-50' : 'bg-rose-50';
    
    return (
      <div className={`${bgClass} rounded-lg p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-5 w-5 ${colorClass}`} />
          <span className="font-semibold text-gray-900">{label}</span>
        </div>
        <div className={`text-2xl font-bold ${colorClass}`}>
          {isPositive ? '+' : ''}{delta.toFixed(1)}%
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {label === 'Últimos 30 dias' 
            ? `Comparado com os 30 dias anteriores, houve uma variação de ${isPositive ? '+' : ''}${delta.toFixed(1)}%.`
            : `Em relação ao mês anterior, a variação foi de ${isPositive ? '+' : ''}${delta.toFixed(1)}%.`
          }
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-xl shadow-lg">
        <DialogHeader className="relative pb-3">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              {title}
            </DialogTitle>
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                title="Fechar"
                className="hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </DialogClose>
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Valor Atual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Valor Atual</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>

          <Separator />

          {/* Variações */}
          <div className="space-y-3">
            {renderDelta(delta30d, 'Últimos 30 dias')}
            {renderDelta(deltaMoM, 'Mês vs Mês')}
          </div>

          {!delta30d && !deltaMoM && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Não há dados de variação disponíveis.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KpiDetailModal;
