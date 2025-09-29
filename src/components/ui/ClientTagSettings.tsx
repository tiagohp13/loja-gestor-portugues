import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ClientTagConfig, DEFAULT_TAG_CONFIG } from '@/utils/clientTags';

interface ClientTagSettingsProps {
  config?: ClientTagConfig;
  onConfigChange?: (config: ClientTagConfig) => void;
}

const ClientTagSettings: React.FC<ClientTagSettingsProps> = ({ 
  config = DEFAULT_TAG_CONFIG, 
  onConfigChange 
}) => {
  const [inactivityMonths, setInactivityMonths] = useState(config.inactivityMonths);

  const handleSave = () => {
    if (inactivityMonths < 1) {
      toast.error('O período de inatividade deve ser pelo menos 1 mês');
      return;
    }

    const newConfig: ClientTagConfig = {
      inactivityMonths: inactivityMonths
    };

    onConfigChange?.(newConfig);
    
    // Por agora, apenas mostrar confirmação. Futuramente pode ser salvo nas configurações do usuário
    toast.success('Configurações das etiquetas atualizadas');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração das Etiquetas de Clientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inactivity-months">
            Período de Inatividade (meses)
          </Label>
          <Input
            id="inactivity-months"
            type="number"
            min="1"
            value={inactivityMonths}
            onChange={(e) => setInactivityMonths(Number(e.target.value))}
            placeholder="Número de meses sem compras para considerar inativo"
          />
          <p className="text-sm text-gray-600">
            Clientes que não fizeram compras nos últimos {inactivityMonths} meses serão marcados como "Inativo"
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Regras das Etiquetas:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Novo:</strong> Clientes com apenas 1 compra registada</li>
            <li>• <strong>Recorrente:</strong> Clientes com mais de 1 compra registada</li>
            <li>• <strong>Inativo:</strong> Clientes sem compras nos últimos {inactivityMonths} meses</li>
          </ul>
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClientTagSettings;