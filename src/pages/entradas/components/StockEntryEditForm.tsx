
import React from 'react';
import StockEntryEditSupplier from './StockEntryEditSupplier';
import StockEntryEditDetails from './StockEntryEditDetails';
import StockEntryEditProductTable from './StockEntryEditProductTable';
import StockEntryEditActions from './StockEntryEditActions';
import { useStockEntryForm } from '../hooks/useStockEntryForm';
import { useData } from '@/contexts/DataContext';
import { StockEntryItem } from '@/types';

interface StockEntryEditFormProps {
  id?: string;
}

const StockEntryEditForm: React.FC<StockEntryEditFormProps> = ({ id }) => {
  const { products, suppliers } = useData();
  
  // Use the updated useStockEntryForm with entry ID support
  const {
    entryDetails,
    items,
    isSubmitting,
    handleSubmit,
    setEntryDetails,
    setItems
  } = useStockEntryForm({ entryId: id });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntryDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setEntryDetails(prev => ({
      ...prev,
      supplierId,
      supplierName: supplier ? supplier.name : ''
    }));
  };

  const handleItemChange = (index: number, field: keyof StockEntryItem, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addNewItem = () => {
    const newItem: StockEntryItem = {
      id: `temp-${Date.now()}`,
      productId: '',
      productName: '',
      quantity: 1,
      purchasePrice: 0,
      discountPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item: StockEntryItem) => {
    const subtotal = item.quantity * item.purchasePrice;
    const discount = (subtotal * (item.discountPercent || 0)) / 100;
    return subtotal - discount;
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-4">
        <StockEntryEditSupplier
          supplierId={entryDetails.supplierId}
          suppliers={suppliers}
          onSupplierChange={handleSupplierChange}
        />
        
        <StockEntryEditDetails
          date={entryDetails.date || new Date().toISOString().split('T')[0]}
          invoiceNumber={entryDetails.invoiceNumber}
          notes={entryDetails.notes}
          onDetailsChange={handleChange}
        />
      </div>
      
      <StockEntryEditProductTable
        items={items}
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
