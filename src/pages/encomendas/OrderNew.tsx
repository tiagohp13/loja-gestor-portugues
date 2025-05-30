
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ClientSelector from './components/ClientSelector';
import OrderDatePicker from './components/OrderDatePicker';
import ProductSelector from './components/ProductSelector';
import OrderProductsTable from './components/OrderProductsTable';
import { useOrderForm } from './hooks/useOrderForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const OrderNew = () => {
  const {
    selectedClientId,
    clientSearchTerm,
    clientSearchOpen,
    setClientSearchTerm,
    setClientSearchOpen,
    filteredClients,
    handleSelectClient,
    
    orderDate,
    calendarOpen,
    setCalendarOpen,
    setOrderDate,
    
    productSearchTerm,
    productSearchOpen,
    currentProduct,
    currentQuantity,
    setProductSearchTerm,
    setProductSearchOpen,
    setCurrentQuantity,
    filteredProducts,
    handleSelectProduct,
    handleAddProduct,
    
    orderItems,
    handleRemoveProduct,
    calculateTotal,
    
    notes,
    setNotes,
    
    handleSaveOrder,
    navigate,
    isSubmitting
  } = useOrderForm();
  
  // Calculate order validity for button disabling
  const isOrderInvalid = !selectedClientId || orderItems.length === 0 || 
    orderItems.some(item => !item.quantity || item.quantity <= 0 || !item.salePrice || item.salePrice <= 0);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Nova Encomenda" 
        description="Criar uma nova encomenda"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/encomendas/consultar')}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveOrder} 
              disabled={isSubmitting || isOrderInvalid}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">A guardar...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Encomenda
                </>
              )}
            </Button>
          </div>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ClientSelector 
            clientSearchTerm={clientSearchTerm}
            setClientSearchTerm={setClientSearchTerm}
            clientSearchOpen={clientSearchOpen}
            setClientSearchOpen={setClientSearchOpen}
            filteredClients={filteredClients}
            handleSelectClient={handleSelectClient}
          />
          
          <OrderDatePicker 
            orderDate={orderDate}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            setOrderDate={setOrderDate}
          />
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Produtos</h3>
          
          <ProductSelector 
            productSearchTerm={productSearchTerm}
            setProductSearchTerm={setProductSearchTerm}
            productSearchOpen={productSearchOpen}
            setProductSearchOpen={setProductSearchOpen}
            filteredProducts={filteredProducts}
            handleSelectProduct={handleSelectProduct}
            currentProduct={currentProduct}
            currentQuantity={currentQuantity}
            setCurrentQuantity={setCurrentQuantity}
            handleAddProduct={handleAddProduct}
          />
          
          {orderItems.length === 0 ? (
            <div className="mt-4 p-6 border border-dashed rounded-md text-center text-gray-500">
              Nenhum produto adicionado. Adicione pelo menos um produto para criar a encomenda.
            </div>
          ) : (
            <OrderProductsTable 
              orderItems={orderItems}
              handleRemoveProduct={handleRemoveProduct}
              calculateTotal={calculateTotal}
            />
          )}
          
          <div className="mt-6">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observações ou notas adicionais para esta encomenda"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 h-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNew;
