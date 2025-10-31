
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStockEntryDetail } from './hooks/useStockEntryDetail';
import StockEntryDetailHeader from './components/StockEntryDetailHeader';
import EntryInformationCard from './components/EntryInformationCard';
import SupplierInformationCard from './components/SupplierInformationCard';
import PurchasedProductsTable from './components/PurchasedProductsTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const StockEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { stockEntry, supplier, totalValue, contentRef, handleExportToPdf, isDeleted } = useStockEntryDetail(id);

  if (!stockEntry) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <StockEntryDetailHeader 
        entryNumber={stockEntry?.number || ''}
        id={id || ''}
        onExportPdf={handleExportToPdf}
        isDeleted={isDeleted}
      />

      {isDeleted && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este registo foi apagado e está em modo de leitura apenas.
          </AlertDescription>
        </Alert>
      )}

      <div className="pdf-content" ref={contentRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Entry Information Card */}
          <EntryInformationCard
            entryNumber={stockEntry.number}
            entryDate={stockEntry.date}
            totalValue={totalValue}
            status={stockEntry.status}
            notes={stockEntry.notes}
          />

          {/* Supplier Information Card */}
          {supplier && (
            <SupplierInformationCard supplier={supplier} />
          )}
        </div>

        {/* Products Table Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Produtos Comprados</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchasedProductsTable 
              items={stockEntry.items} 
              totalValue={totalValue} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StockEntryDetail;
