
import React from 'react';
import StockEntryEditSupplier from './StockEntryEditSupplier';
import StockEntryEditDetails from './StockEntryEditDetails';
import StockEntryEditProductTable from './StockEntryEditProductTable';
import StockEntryEditActions from './StockEntryEditActions';
import { useStockEntryEdit } from '../hooks/useStockEntryEdit';
import { useData } from '@/contexts/DataContext';

interface StockEntryEditFormProps {
  id?: string;
}

const StockEntryEditForm: React.FC<StockEntryEditFormProps> = ({ id }) => {
  const { products, suppliers } = useData();
  const {
    entry,
    isNewEntry,
    isSubmitting,
    handleChange,
    handleSupplierChange,
    handleItemChange,
    addNewItem,
    removeItem,
    handleSubmit,
    calculateItemTotal,
    calculateTotal
  } = useStockEntryEdit(id);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-4">
        <StockEntryEditSupplier
          supplierId={entry.supplierId}
          suppliers={suppliers}
          onSupplierChange={handleSupplierChange}
        />
        
        <StockEntryEditDetails
          date={entry.date}
          invoiceNumber={entry.invoiceNumber}
          notes={entry.notes}
          onDetailsChange={handleChange}
        />
      </div>
      
      <StockEntryEditProductTable
        items={entry.items}
        products={products}
        onItemChange={handleItemChange}
        addNewItem={addNewItem}
        removeItem={removeItem}
        calculateItemTotal={calculateItemTotal}
        calculateTotal={calculateTotal}
      />
      
      <StockEntryEditActions isSubmitting={isSubmitting} />
    </form>
  );
};

export default StockEntryEditForm;
