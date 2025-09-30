
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
import { ProductPriceHistory } from './components/ProductPriceHistory';
import { useProductHistory } from './hooks/useProductHistory';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct, isLoading } = useData();
  const navigate = useNavigate();
  
  // Get product history
  const {
    entriesForProduct,
    exitsForProduct,
    pendingOrdersForProduct,
    totalUnitsSold,
    totalUnitsPurchased,
    totalAmountSpent,
    totalAmountSold
  } = useProductHistory(id);
  
  // Scroll to top when product changes or page loads
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);
  
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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Product Image Card */}
        {product.image && (
          <div className="lg:col-span-4">
            <ProductImageCard image={product.image} name={product.name} />
          </div>
        )}
        
        {/* Product Details Card - Takes remaining space */}
        <div className={product.image ? "lg:col-span-5" : "lg:col-span-8"}>
          <ProductDetailCard 
            product={product} 
            totalUnitsSold={totalUnitsSold}
          />
        </div>
        
        {/* Stock Card */}
        <div className="lg:col-span-3">
          <ProductStockCard 
            currentStock={product.currentStock} 
            minStock={product.minStock}
            hasImage={!!product.image} 
          />
        </div>
      </div>
      
      {/* Price History */}
      <div className="mt-6">
        <ProductPriceHistory productId={id!} />
      </div>
      
      {/* History Tables */}
      <HistoryTables 
        entriesForProduct={entriesForProduct} 
        exitsForProduct={exitsForProduct}
        pendingOrdersForProduct={pendingOrdersForProduct}
        totalUnitsPurchased={totalUnitsPurchased}
        totalAmountSpent={totalAmountSpent}
        totalUnitsSold={totalUnitsSold}
        totalAmountSold={totalAmountSold}
      />
    </div>
  );
};

export default ProductDetail;
