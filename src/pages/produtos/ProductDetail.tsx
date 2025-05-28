
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProductDetailHeader from './components/ProductDetailHeader';
import ProductImageCard from './components/ProductImageCard';
import ProductDetailCard from './components/ProductDetailCard';
import ProductStockCard from './components/ProductStockCard';
import ProductNotFound from './components/ProductNotFound';
import HistoryTables from './components/HistoryTables';
import { useProductHistory } from './hooks/useProductHistory';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct, isLoading } = useData();
  const navigate = useNavigate();
  
  // Get product history
  const {
    entriesForProduct,
    exitsForProduct,
    totalUnitsSold,
    totalUnitsPurchased,
    totalAmountSpent,
    totalAmountSold
  } = useProductHistory(id);
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  if (isLoading) return <LoadingSpinner />;
  
  const product = id ? getProduct(id) : null;
  
  if (!product) {
    return <ProductNotFound />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <ProductDetailHeader 
        productName={product.name} 
        productCode={product.code}
        productId={id}
      />
      
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Product Image Card */}
        {product.image && (
          <ProductImageCard image={product.image} name={product.name} />
        )}
        
        {/* Product Details Card */}
        <ProductDetailCard 
          product={product} 
          totalUnitsSold={totalUnitsSold}
        />
        
        {/* Stock Card */}
        <ProductStockCard 
          currentStock={product.currentStock} 
          minStock={product.minStock}
          hasImage={!!product.image} 
        />
      </div>
      
      {/* History Tables */}
      <HistoryTables 
        entriesForProduct={entriesForProduct} 
        exitsForProduct={exitsForProduct}
        totalUnitsPurchased={totalUnitsPurchased}
        totalAmountSpent={totalAmountSpent}
        totalUnitsSold={totalUnitsSold}
        totalAmountSold={totalAmountSold}
      />
    </div>
  );
};

export default ProductDetail;
