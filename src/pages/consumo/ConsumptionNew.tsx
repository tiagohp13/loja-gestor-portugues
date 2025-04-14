
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

const ConsumptionNew = () => {
  const navigate = useNavigate();
  const { createStockEntry } = useData();

  const handleSubmit = async (formData: any) => {
    try {
      // Create a new consumption entry with type='consumption'
      await createStockEntry({
        ...formData,
        type: 'consumption',
        updateStock: false // This ensures stock levels aren't affected
      });
      navigate('/consumo/consultar');
    } catch (error) {
      console.error('Error creating consumption entry:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Novo Consumo"
        description="Registar nova entrada de consumo interno"
        actions={
          <Button variant="outline" onClick={() => navigate('/consumo/consultar')}>
            Cancelar
          </Button>
        }
      />

      <Card className="mt-6">
        {/* Reuse the same form component as stock entries */}
        <StockEntryForm onSubmit={handleSubmit} type="consumption" />
      </Card>
    </div>
  );
};

export default ConsumptionNew;
