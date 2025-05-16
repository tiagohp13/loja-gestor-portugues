
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStockExit } from './hooks/useStockExit';
import ClientSelector from './components/ClientSelector';
import DatePicker from './components/DatePicker';
import ProductForm from './components/ProductForm';
import ProductsTable from './components/ProductsTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useData } from '@/contexts/DataContext';

const StockExitNew = () => {
  const navigate = useNavigate();
  
  const {
    exitDetails,
    items,
    currentItem,
    setCurrentItem,
    searchTerm,
    setSearchTerm,
    selectedProductDisplay,
    isProductSearchOpen,
    setIsProductSearchOpen,
    clientSearchTerm,
    setClientSearchTerm,
    isClientSearchOpen,
    setIsClientSearchOpen,
    exitDate,
    setExitDate,
    calendarOpen,
    setCalendarOpen,
    handleExitDetailsChange,
    handleSearch,
    handleClientSearch,
    handleProductSelect,
    handleClientSelect,
    addItemToExit,
    removeItem,
    updateItem,
    getDiscountedPrice,
    totalValue,
    filteredProducts,
    filteredClients,
    handleSubmit,
    selectedClient,
    selectedProduct,
    products,
    isSubmitting
  } = useStockExit();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold">Nova Venda</h1>
          <p className="text-gray-500">Registar uma nova venda de stock</p>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/saidas/historico')}
          className="flex items-center gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={items.length === 0 || !exitDetails.clientId || isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">A guardar...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Venda
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ClientSelector
              clientSearchTerm={clientSearchTerm}
              setClientSearchTerm={setClientSearchTerm}
              isClientSearchOpen={isClientSearchOpen}
              setIsClientSearchOpen={setIsClientSearchOpen}
              filteredClients={filteredClients}
              handleClientSearch={handleClientSearch}
              handleClientSelect={handleClientSelect}
              selectedClient={selectedClient}
            />

            <DatePicker
              date={exitDate}
              setDate={setExitDate}
              isOpen={calendarOpen}
              setIsOpen={setCalendarOpen}
              label="Data da Venda"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium mb-4">Produtos</h2>
            
            <ProductForm
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isProductSearchOpen={isProductSearchOpen}
              setIsProductSearchOpen={setIsProductSearchOpen}
              filteredProducts={filteredProducts}
              handleSearch={handleSearch}
              handleProductSelect={handleProductSelect}
              selectedProductDisplay={selectedProductDisplay}
              currentItem={{
                ...currentItem,
                discountPercent: currentItem.discountPercent || 0
              }}
              setCurrentItem={setCurrentItem}
              addItemToExit={addItemToExit}
              products={products}
              selectedProduct={selectedProduct}
            />
            
            <div className="mt-6">
              <ProductsTable
                items={items}
                removeItem={removeItem}
                updateItem={updateItem}
                getDiscountedPrice={getDiscountedPrice}
                totalValue={totalValue}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <Textarea
              placeholder="Observações ou notas adicionais sobre esta venda..."
              value={exitDetails.notes || ''}
              onChange={(e) => handleExitDetailsChange(e)}
              name="notes"
              className="h-24"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockExitNew;
