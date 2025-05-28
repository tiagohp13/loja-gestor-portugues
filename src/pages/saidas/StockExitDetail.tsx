
import React, { useRef } from 'react';
import { useStockExitDetail } from './hooks/useStockExitDetail';
import StockExitDetailHeader from './components/StockExitDetailHeader';
import ExitInformationCard from './components/ExitInformationCard';
import ClientInformationCard from './components/ClientInformationCard';
import ProductsSoldTable from './components/ProductsSoldTable';
import { exportToPdf } from '@/utils/pdfExport';
import { useData } from '@/contexts/DataContext';

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
  
  const { clients } = useData();
  const contentRef = useRef<HTMLDivElement>(null);

  if (!stockExit) {
    return <div>Carregando...</div>;
  }

  // Create a wrapper function that accepts a path and calls navigate with it
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  // Handle PDF export
  const handleExportToPdf = async () => {
    if (stockExit) {
      // Find the client with address format
      const clientData = clients.find(c => c.id === stockExit.clientId);
      const clientWithAddress = clientData ? {
        ...clientData,
        address: clientData.address ? {
          street: clientData.address,
          postalCode: '',
          city: ''
        } : undefined
      } : undefined;

      await exportToPdf({
        filename: stockExit.number.replace('/', '-'),
        stockExit,
        client: clientWithAddress,
        totalValue
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <StockExitDetailHeader
        exitNumber={stockExit.number || ''}
        id={id || ''}
        onNavigateBack={handleNavigate}
        onExportPdf={handleExportToPdf}
      />

      <div className="pdf-content" ref={contentRef}>
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
    </div>
  );
};

export default StockExitDetail;
