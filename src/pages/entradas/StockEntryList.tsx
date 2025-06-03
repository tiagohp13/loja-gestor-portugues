
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import StockEntrySearch from './components/StockEntrySearch';
import StockEntryTable from './components/StockEntryTable';
import RecordCount from '@/components/common/RecordCount';
import { useStockEntries } from './hooks/useStockEntries';
import { StockEntrySortField } from './hooks/stockEntryForm/types';
import { Package } from 'lucide-react';

const StockEntryList = () => {
  const navigate = useNavigate();
  const { 
    searchTerm, 
    setSearchTerm,
    sortField,
    sortOrder,
    isLoading,
    sortedEntries,
    handleSortChange,
    handleDeleteEntry,
    calculateEntryTotal,
    localEntries
  } = useStockEntries();
  
  const handleViewEntry = (id: string) => {
    navigate(`/entradas/${id}`);
  };
  
  const handleEditEntry = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/entradas/editar/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Histórico de Compras" 
          description="A carregar dados..." 
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          Carregando compras de stock...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Compras" 
        description="Consulte o histórico de compras de stock"
      />
      
      <RecordCount 
        title="Total de compras"
        count={localEntries.length}
        icon={Package}
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <StockEntrySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <StockEntryTable
          entries={sortedEntries}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onViewEntry={handleViewEntry}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          calculateEntryTotal={calculateEntryTotal}
        />
      </div>
    </div>
  );
};

export default StockEntryList;
