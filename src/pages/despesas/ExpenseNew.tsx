import React from "react";
import { useExpenseForm } from "./hooks/useExpenseForm";
import ExpenseFormHeader from "./components/ExpenseFormHeader";
import ExpenseBasicInfo from "./components/ExpenseBasicInfo";
import ExpenseItemsTable from "./components/ExpenseItemsTable";
import ExpenseTotalCard from "./components/ExpenseTotalCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";

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
    navigate,
  } = useExpenseForm();

  const { canCreate } = usePermissions();

  const handleCancel = () => {
    navigate("/despesas/historico");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!validatePermission(canCreate, "criar despesas")) {
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

        {/* Caixa azul/ação de botões alinhados à direita */}
        <div className="flex justify-end gap-2 bg-blue-50 p-4 rounded-md">
          <Button
            variant="outline"
            className="h-10 px-4 flex items-center gap-2"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>

          <Button type="submit" className="h-10 px-4 flex items-center gap-2" disabled={isLoading}>
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseNew;
