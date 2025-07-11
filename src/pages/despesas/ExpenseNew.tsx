
import React from 'react';
import { useExpenseForm } from './hooks/useExpenseForm';
import ExpenseFormHeader from './components/ExpenseFormHeader';
import ExpenseBasicInfo from './components/ExpenseBasicInfo';
import ExpenseItemsTable from './components/ExpenseItemsTable';
import ExpenseTotalCard from './components/ExpenseTotalCard';
import ExpenseFormActions from './components/ExpenseFormActions';
import { usePermissions } from '@/hooks/usePermissions';
import { validatePermission } from '@/utils/permissionUtils';

const ExpenseNew = () => {
  const {
    suppliers,
    formData,
    isLoading,
    handleSupplierChange,
    addItem,
    removeItem,
    updateItem,
    calculateTotal,
    handleSubmit,
    updateFormData,
    navigate
  } = useExpenseForm();
  
  const { canCreate } = usePermissions();

  const handleCancel = () => {
    navigate('/despesas/historico');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!validatePermission(canCreate, 'criar despesas')) {
      e.preventDefault();
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className="p-6 space-y-6">
      <ExpenseFormHeader />

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <ExpenseBasicInfo
          suppliers={suppliers}
          supplierId={formData.supplierId}
          date={formData.date}
          notes={formData.notes}
          onSupplierChange={handleSupplierChange}
          onDateChange={(date) => updateFormData({ date })}
          onNotesChange={(notes) => updateFormData({ notes })}
        />

        <ExpenseItemsTable
          items={formData.items}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onUpdateItem={updateItem}
        />

        <ExpenseTotalCard total={calculateTotal()} />

        <ExpenseFormActions
          isLoading={isLoading}
          onCancel={handleCancel}
        />
      </form>
    </div>
  );
};

export default ExpenseNew;
