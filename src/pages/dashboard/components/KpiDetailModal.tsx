import React, { useMemo } from 'react';
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

interface DeltaCardProps {
  delta: number;
  label: string;
}

const DeltaCard: React.FC<DeltaCardProps> = ({ delta, label }) => {
  const isPositive = delta >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const bgClass = isPositive ? 'bg-emerald-50' : 'bg-rose-50';
  
  const message = useMemo(() => {
    const variation = `${isPositive ? '+' : ''}${delta.toFixed(1)}%`;
    return label === 'Últimos 30 dias'
      ? `Comparado com os 30 dias anteriores, houve uma variação de ${variation}.`
      : `Em relação ao mês anterior, a variação foi de ${variation}.`;
  }, [delta, isPositive, label]);
  
  return (
    <div className={`${bgClass} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <span className="font-semibold text-foreground">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${colorClass}`}>
        {isPositive ? '+' : ''}{delta.toFixed(1)}%
      </div>
      <p className="text-sm text-gray-600 mt-2">{message}</p>
    </div>
  );
};

const KpiDetailModal: React.FC<KpiDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  delta30d,
  deltaMoM,
  description
}) => {
  const hasData = delta30d !== undefined || deltaMoM !== undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-xl shadow-lg">
        <DialogHeader className="relative pb-3">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-semibold text-foreground">
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
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>

          <Separator />

          <div className="space-y-3">
            {delta30d !== undefined && <DeltaCard delta={delta30d} label="Últimos 30 dias" />}
            {deltaMoM !== undefined && <DeltaCard delta={deltaMoM} label="Mês vs Mês" />}
          </div>

          {!hasData && (
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
