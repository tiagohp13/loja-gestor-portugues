
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ConsumptionNew = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Novo Consumo"
        description="Registar novo consumo interno"
        actions={
          <Button variant="outline" onClick={() => navigate('/consumo/historico')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        }
      />
      
      {/* Form will be added here */}
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-muted-foreground">Formulário em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default ConsumptionNew;
