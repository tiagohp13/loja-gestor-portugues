
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderDetail } from './hooks/useOrderDetail';
import OrderDetailHeader from './components/OrderDetailHeader';
import OrderInformationCard from './components/OrderInformationCard';
import OrderClientCard from './components/OrderClientCard';
import OrderProductsTableDetail from './components/OrderProductsTableDetail';
import { useScrollToTop } from '@/hooks/useScrollToTop';

/**
 * Order detail page component
 * Displays comprehensive information about a specific order
 */
const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const { order, client, totalValue, relatedStockExit } = useOrderDetail(id);
  
  console.log("OrderDetail - ID from params:", id);
  console.log("OrderDetail - Order data:", order);
  
  // Scroll to top on component mount
  useScrollToTop();

  if (!id) {
    console.log("OrderDetail - No ID provided, redirecting to order list");
    return <div>ID não fornecido</div>;
  }

  if (!order) {
    console.log("OrderDetail - Order not found or still loading");
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <OrderDetailHeader order={order} relatedStockExit={relatedStockExit} />

      <div className="pdf-content" ref={contentRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Order Information Card */}
          <OrderInformationCard order={order} relatedStockExit={relatedStockExit} />

          {/* Client Information Card */}
          {client && <OrderClientCard client={client} />}
        </div>

        {/* Products Table Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Produtos Encomendados</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderProductsTableDetail items={order.items} totalValue={totalValue} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;
