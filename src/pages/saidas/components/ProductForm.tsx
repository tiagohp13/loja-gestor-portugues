
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductSelector from './ProductSelector';
import { Product, StockExitItem } from '@/types';

interface ProductFormProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isProductSearchOpen: boolean;
  setIsProductSearchOpen: (open: boolean) => void;
  filteredProducts: Product[];
  handleSearch: (value: string) => void;
  handleProductSelect: (productId: string) => void;
  selectedProductDisplay: string;
  currentItem: {
    productId: string;
    productName: string;
    quantity: number;
    salePrice: number;
    discountPercent: number;
  };
  setCurrentItem: React.Dispatch<React.SetStateAction<StockExitItem>>;
  addItemToExit: () => void;
  products: Product[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  searchTerm,
  setSearchTerm,
  isProductSearchOpen,
  setIsProductSearchOpen,
  filteredProducts,
  handleSearch,
  handleProductSelect,
  selectedProductDisplay,
  currentItem,
  setCurrentItem,
  addItemToExit,
  products
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <ProductSelector
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isProductSearchOpen={isProductSearchOpen}
          setIsProductSearchOpen={setIsProductSearchOpen}
          filteredProducts={filteredProducts}
          handleSearch={handleSearch}
          handleProductSelect={handleProductSelect}
          selectedProductDisplay={selectedProductDisplay}
        />
        
        <div>
          <label className="block text-sm font-medium mb-1">Quantidade</label>
          <Input
            type="number"
            min="1"
            max={products.find(p => p.id === currentItem.productId)?.currentStock || 0}
            value={currentItem.quantity}
            onChange={(e) => setCurrentItem(prev => ({...prev, quantity: parseInt(e.target.value) || 1}))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Preço Venda (€)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={currentItem.salePrice}
            onChange={(e) => setCurrentItem(prev => ({...prev, salePrice: parseFloat(e.target.value) || 0}))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Desconto (%)</label>
          <Input
            type="number"
            step="1"
            min="0"
            max="100"
            value={currentItem.discountPercent}
            onChange={(e) => setCurrentItem(prev => ({...prev, discountPercent: parseFloat(e.target.value) || 0}))}
          />
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={addItemToExit}
          disabled={
            !currentItem.productId || 
            currentItem.quantity <= 0 || 
            (products.find(p => p.id === currentItem.productId)?.currentStock || 0) < currentItem.quantity
          }
          className="bg-blue-500 hover:bg-blue-600 text-white w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>
    </div>
  );
};

export default ProductForm;
