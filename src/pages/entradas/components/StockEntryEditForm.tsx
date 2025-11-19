import React from "react";
import StockEntryEditSupplier from "./StockEntryEditSupplier";
import StockEntryEditDetails from "./StockEntryEditDetails";
import StockEntryEditProductTable from "./StockEntryEditProductTable";
import { useStockEntryEdit } from "../hooks/useStockEntryEdit";
import { useProducts } from "@/contexts/ProductsContext";
import { useSuppliersQuery } from "@/hooks/queries/useSuppliers";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";

interface StockEntryEditFormProps {
  id?: string;
}

const StockEntryEditForm: React.FC<StockEntryEditFormProps> = ({ id }) => {
  const { products } = useProducts();
  const { suppliers } = useSuppliersQuery();
  const { canCreate, canEdit } = usePermissions();
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
    calculateTotal,
  } = useStockEntryEdit(id);

  const handleFormSubmit = (e: React.FormEvent) => {
    const requiredPermission = isNewEntry ? canCreate : canEdit;
    const action = isNewEntry ? "criar entradas de stock" : "editar entradas de stock";

    if (!validatePermission(requiredPermission, action)) {
      e.preventDefault();
      return;
    }
    handleSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="grid gap-6">
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
    </form>
  );
};

export default StockEntryEditForm;
