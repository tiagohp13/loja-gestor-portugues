
import React from 'react';
import { useStockExitDetail } from './hooks/useStockExitDetail';
import StockExitDetailHeader from './components/StockExitDetailHeader';
import ExitInformationCard from './components/ExitInformationCard';
import ClientInformationCard from './components/ClientInformationCard';
import ProductsSoldTable from './components/ProductsSoldTable';

const StockExitDetail = () => {
  const { 
    stockExit, 
    client, 
    totalValue, 
    cleanNotes,
    handleViewClient, 
    handleViewOrder,
    navigate,
    id
  } = useStockExitDetail();

  if (!stockExit) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <StockExitDetailHeader
        exitNumber={stockExit.number || ''}
        id={id || ''}
        onNavigateBack={navigate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ExitInformationCard
          stockExit={stockExit}
          totalValue={totalValue}
          cleanNotes={cleanNotes}
          onViewOrder={handleViewOrder}
        />

        {client && (
          <ClientInformationCard
            client={client}
            onViewClient={handleViewClient}
          />
        )}
      </div>

      <ProductsSoldTable 
        items={stockExit.items || []} 
        totalValue={totalValue} 
      />
    </div>
  );
};

export default StockExitDetail;
