
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, GripVertical } from 'lucide-react';

export interface CardConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

interface CardCustomizationProps {
  availableCards: Omit<CardConfig, 'enabled' | 'order'>[];
  onConfigChange: (config: CardConfig[]) => void;
  currentConfig: CardConfig[];
}

const CardCustomization: React.FC<CardCustomizationProps> = ({
  availableCards,
  onConfigChange,
  currentConfig
}) => {
  const [localConfig, setLocalConfig] = useState<CardConfig[]>(currentConfig);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalConfig(currentConfig);
  }, [currentConfig]);

  const handleToggleCard = (cardId: string) => {
    setLocalConfig(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, enabled: !card.enabled }
          : card
      )
    );
  };

  const handleSaveConfig = () => {
    onConfigChange(localConfig);
    setIsOpen(false);
  };

  const moveCard = (cardId: string, direction: 'up' | 'down') => {
    const currentIndex = localConfig.findIndex(card => card.id === cardId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === localConfig.length - 1)
    ) {
      return;
    }

    const newConfig = [...localConfig];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newConfig[currentIndex], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[currentIndex]];
    
    // Update order numbers
    newConfig.forEach((card, index) => {
      card.order = index;
    });

    setLocalConfig(newConfig);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mb-4">
          <Settings className="h-4 w-4 mr-2" />
          Personalizar Cards
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione quais métricas deseja exibir e reordene-as conforme necessário.
          </p>
          <div className="space-y-2">
            {localConfig.map((card, index) => (
              <div key={card.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
                <Checkbox
                  checked={card.enabled}
                  onCheckedChange={() => handleToggleCard(card.id)}
                />
                <span className="flex-1 text-sm font-medium">{card.title}</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveCard(card.id, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <GripVertical className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveCard(card.id, 'down')}
                    disabled={index === localConfig.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <GripVertical className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConfig}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardCustomization;
