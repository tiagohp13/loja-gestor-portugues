
import React from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StockEntryProductSelector from './StockEntryProductSelector';

interface StockEntryProductFormProps {
  currentItem: {
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
  };
  setCurrentItem: React.Dispatch<React.SetStateAction<{
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
  }>>;
  searchTerm: string;
  selectedProductDisplay: string;
  isProductSearchOpen: boolean;
  setSearchTerm: (value: string) => void;
  setIsProductSearchOpen: (isOpen: boolean) => void;
  handleSearch: (value: string) => void;
  filteredProducts: Array<{
    id: string;
    name: string;
    code: string;
    currentStock: number;
  }>;
  handleProductSelect: (productId: string) => void;
  addItemToEntry: () => void;
}

const StockEntryProductForm: React.FC<StockEntryProductFormProps> = ({
  currentItem,
  setCurrentItem,
  searchTerm,
  selectedProductDisplay,
  isProductSearchOpen,
  setSearchTerm,
  setIsProductSearchOpen,
  handleSearch,
  filteredProducts,
  handleProductSelect,
  addItemToEntry
}) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h2 className="text-lg font-medium mb-4">Produtos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-1">
          <StockEntryProductSelector
            searchTerm={searchTerm}
            selectedProductDisplay={selectedProductDisplay}
            isProductSearchOpen={isProductSearchOpen}
            setSearchTerm={setSearchTerm}
            setIsProductSearchOpen={setIsProductSearchOpen}
            handleSearch={handleSearch}
            filteredProducts={filteredProducts}
            handleProductSelect={handleProductSelect}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Quantidade</label>
          <Input
            type="number"
            min="1"
            value={currentItem.quantity}
            onChange={(e) => setCurrentItem(prev => ({...prev, quantity: parseInt(e.target.value) || 1}))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Preço Compra (€)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={currentItem.purchasePrice}
            onChange={(e) => setCurrentItem(prev => ({...prev, purchasePrice: parseFloat(e.target.value) || 0}))}
          />
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <Button 
          onClick={addItemToEntry}
          disabled={!currentItem.productId || currentItem.quantity <= 0}
          className="bg-blue-500 hover:bg-blue-600 text-white w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>
    </div>
  );
};

export default StockEntryProductForm;
