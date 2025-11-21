
import React, { useRef } from 'react';
import { useStockExitDetail } from './hooks/useStockExitDetail';
import StockExitDetailHeader from './components/StockExitDetailHeader';
import ExitInformationCard from './components/ExitInformationCard';
import ClientInformationCard from './components/ClientInformationCard';
import ProductsSoldTable from './components/ProductsSoldTable';
import { exportToPdf } from '@/utils/pdfExport';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const StockExitDetail = () => {
  const { 
    stockExit, 
    client, 
    totalValue, 
    cleanNotes,
    handleViewClient, 
    handleViewOrder,
    navigate,
    id,
    isDeleted
  } = useStockExitDetail();
  
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
    if (stockExit && stockExit.number) {
      await exportToPdf({
        filename: stockExit.number.replace('/', '-'),
        contentSelector: '.pdf-content',
        margin: 10
      });
    }
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <StockExitDetailHeader
        exitNumber={stockExit.number || ''}
        id={id || ''}
        onNavigateBack={handleNavigate}
        onExportPdf={handleExportToPdf}
        isDeleted={isDeleted}
      />

      {isDeleted && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este registo foi apagado e está em modo de leitura apenas.
          </AlertDescription>
        </Alert>
      )}

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
