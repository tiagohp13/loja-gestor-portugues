import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useStockEntryForm } from "./hooks/useStockEntryForm";
import SupplierSelector from "./components/SupplierSelector";
import StockEntryDatePicker from "./components/StockEntryDatePicker";
import StockEntryProductForm from "./components/StockEntryProductForm";
import StockEntryProductsTable from "./components/StockEntryProductsTable";
import { useSuppliersQuery } from "@/hooks/queries/useSuppliers";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const StockEntryNew = () => {
  const navigate = useNavigate();
  const { suppliers } = useSuppliersQuery();
  const {
    entryDetails,
    items,
    currentItem,
    searchTerm,
    selectedProductDisplay,
    isProductSearchOpen,
    isSupplierSearchOpen,
    supplierSearchTerm,
    entryDate,
    calendarOpen,
    filteredProducts,
    filteredSuppliers,
    totalValue,
    isSubmitting,
    setEntryDetails,
    setCurrentItem,
    setSearchTerm,
    setIsProductSearchOpen,
    setIsSupplierSearchOpen,
    setCalendarOpen,
    setEntryDate,
    handleSupplierSearch,
    handleSearch,
    handleProductSelect,
    handleSupplierSelect,
    addItemToEntry,
    removeItem,
    handleSubmit,
  } = useStockEntryForm();

  const selectedSupplier = suppliers.find((s) => s.id === entryDetails.supplierId);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold">Nova Compra</h1>
          <p className="text-gray-500">Registar uma nova entrada no inventário</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mb-6">
        <Button variant="outline" onClick={() => navigate("/entradas/historico")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={items.length === 0 || !entryDetails.supplierId || isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">A guardar...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Compra
            </>
          )}
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <SupplierSelector
              supplierSearchTerm={supplierSearchTerm}
              isSupplierSearchOpen={isSupplierSearchOpen}
              setIsSupplierSearchOpen={setIsSupplierSearchOpen}
              handleSupplierSearch={handleSupplierSearch}
              filteredSuppliers={filteredSuppliers}
              handleSupplierSelect={handleSupplierSelect}
              selectedSupplier={selectedSupplier}
            />

            <StockEntryDatePicker
              entryDate={entryDate}
              setEntryDate={setEntryDate}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
            />
          </div>

          <StockEntryProductForm
            currentItem={currentItem}
            setCurrentItem={setCurrentItem}
            searchTerm={searchTerm}
            selectedProductDisplay={selectedProductDisplay}
            isProductSearchOpen={isProductSearchOpen}
            setSearchTerm={setSearchTerm}
            setIsProductSearchOpen={setIsProductSearchOpen}
            handleSearch={handleSearch}
            filteredProducts={filteredProducts}
            handleProductSelect={handleProductSelect}
            addItemToEntry={addItemToEntry}
          />

          <StockEntryProductsTable items={items} totalValue={totalValue} removeItem={removeItem} />

          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <Textarea
              placeholder="Observações ou notas adicionais sobre esta entrada..."
              value={entryDetails.notes}
              onChange={(e) => {
                const { value } = e.target;
                setEntryDetails((prev) => ({
                  ...prev,
                  notes: value,
                }));
              }}
              className="h-24"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryNew;
