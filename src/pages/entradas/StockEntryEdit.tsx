
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StockEntryEditHeader from './components/StockEntryEditHeader';
import StockEntryEditForm from './components/StockEntryEditForm';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

const StockEntryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit } = usePermissions();
  const isNewEntry = !id;

  // Verificar permissões
  useEffect(() => {
    if (!canEdit) {
      toast.error("Não tem permissão para editar compras");
      navigate("/entradas/historico");
    }
  }, [canEdit, navigate]);

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <StockEntryEditHeader isNewEntry={isNewEntry} />
      
      <div className="bg-card rounded-lg shadow p-6 mt-6">
        <StockEntryEditForm id={id} />
      </div>
    </div>
  );
};

export default StockEntryEdit;
