import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import StockEntryTable from './components/StockEntryTable';
import StockEntrySearch from './components/StockEntrySearch';
import RecordCount from '@/components/common/RecordCount';
import { Plus, LogIn } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const StockEntryList = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { stockEntries } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = stockEntries.filter(entry =>
    entry.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.supplierName && entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewEntry = (id: string) => {
    navigate(`/entradas/${id}`);
  };

  const handleEditEntry = (id: string) => {
    navigate(`/entradas/editar/${id}`);
  };

  const handleAddEntry = () => {
    navigate('/entradas/nova');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Compras" 
        description="Consultar e gerir o histórico de compras"
        actions={
          <Button onClick={handleAddEntry}>
            <Plus className="h-4 w-4" />
            Nova Compra
          </Button>
        }
      />
      
      <RecordCount 
        title="Total de compras"
        count={stockEntries.length}
        icon={LogIn}
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <StockEntrySearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <StockEntryTable 
          entries={filteredEntries}
          onViewEntry={handleViewEntry}
          onEditEntry={handleEditEntry}
        />
      </div>
    </div>
  );
};

export default StockEntryList;
