import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductQuery } from "@/hooks/queries/useProducts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ProductDetailHeader from "./components/ProductDetailHeader";
import ProductSuggestions from "./components/ProductSuggestions";
import ProductImageCard from "./components/ProductImageCard";
import ProductDetailCard from "./components/ProductDetailCard";
import ProductStockCard from "./components/ProductStockCard";
import ProductNotFound from "./components/ProductNotFound";
import HistoryTables from "./components/HistoryTables";
import { ProductPriceHistory } from "./components/ProductPriceHistory";
import { useProductHistory } from "./hooks/useProductHistory";
import { useProductDetail } from "./hooks/useProductDetail";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProductQuery(id);
  const { isDeleted } = useProductDetail();
  const navigate = useNavigate();

  // Get product history
  const {
    entriesForProduct,
    exitsForProduct,
    pendingOrdersForProduct,
    totalUnitsSold,
    totalUnitsPurchased,
    totalAmountSpent,
    totalAmountSold,
  } = useProductHistory(id);

  // Force scroll to top when product changes or page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (!product) return <ProductNotFound />;

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      {/* Cabeçalho do produto */}
      <ProductDetailHeader productName={product.name} productCode={product.code} productId={id} isDeleted={isDeleted} />

      {/* Sugestões inteligentes */}
      <ProductSuggestions
        totalUnitsSoldLast30={totalUnitsSold}
        lastEntryDate={entriesForProduct[0]?.date}
        currentStock={product.currentStock}
        minStock={product.minStock}
        salePrice={product.salePrice}
        averageCost={product.averageCost}
      />

      {/* Alerta se o produto estiver apagado */}
      {isDeleted && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Este registo foi apagado e está em modo de leitura apenas.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Product Image Card */}
        {product.image && (
          <div className="lg:col-span-4">
            <ProductImageCard image={product.image} name={product.name} />
          </div>
        )}

        {/* Product Details Card */}
        <div className={product.image ? "lg:col-span-5" : "lg:col-span-8"}>
          <ProductDetailCard product={product} totalUnitsSold={totalUnitsSold} />
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
