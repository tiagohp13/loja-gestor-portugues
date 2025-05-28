
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import ProductDetailHeader from './components/ProductDetailHeader';
import ProductDetailCard from './components/ProductDetailCard';
import ProductImageCard from './components/ProductImageCard';
import ProductStockCard from './components/ProductStockCard';
import HistoryTables from './components/HistoryTables';
import ProductNotFound from './components/ProductNotFound';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const ProductDetail = () => {
  useScrollToTop();
  
  const { id } = useParams<{ id: string }>();
  const { products } = useData();
  const [activeTab, setActiveTab] = useState('details');
  
  const product = products.find(p => p.id === id);

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductDetailHeader 
        productName={product.name}
        productCode={product.code}
        productId={product.id}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductDetailCard product={product} />
            <ProductImageCard product={product} />
            <ProductStockCard product={product} />
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <HistoryTables productId={product.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetail;
