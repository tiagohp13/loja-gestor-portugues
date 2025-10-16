import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StockEntryItem, Product } from "@/types";
import ProductSelector from "./ProductSelector";

interface StockEntryEditProductTableProps {
  items: StockEntryItem[];
  products: Product[];
  onItemChange: (index: number, field: keyof StockEntryItem, value: any) => void;
  addNewItem: (newItem: StockEntryItem) => void;
  removeItem: (index: number) => void;
  calculateItemTotal: (item: StockEntryItem) => number;
  calculateTotal: () => number;
}

const StockEntryEditProductTable: React.FC<StockEntryEditProductTableProps> = ({
  items,
  products,
  onItemChange,
  addNewItem,
  removeItem,
  calculateItemTotal,
  calculateTotal,
}) => {
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentPurchasePrice, setCurrentPurchasePrice] = useState(0);

  useEffect(() => {
    if (!productSearchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const term = productSearchTerm.toLowerCase();
      setFilteredProducts(
        products.filter((p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)),
      );
    }
  }, [productSearchTerm, products]);

  const handleSelectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      setCurrentPurchasePrice(product.purchasePrice);
      setProductSearchTerm(`${product.code} - ${product.name}`);
      setProductSearchOpen(false);
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct) return;

    const newItem: StockEntryItem = {
      id: crypto.randomUUID(),
      productId: currentProduct.id,
      productName: `${currentProduct.code} - ${currentProduct.name}`,
      quantity: currentQuantity,
      purchasePrice: currentPurchasePrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addNewItem(newItem);
    setCurrentProduct(null);
    setProductSearchTerm("");
    setCurrentQuantity(1);
    setCurrentPurchasePrice(0);
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

  return (
    <div className="space-y-4">
      {/* NOVO ProductSelector */}
      <ProductSelector
        productSearchTerm={productSearchTerm}
        setProductSearchTerm={setProductSearchTerm}
        productSearchOpen={productSearchOpen}
        setProductSearchOpen={setProductSearchOpen}
        filteredProducts={filteredProducts}
        handleSelectProduct={handleSelectProduct}
        currentProduct={currentProduct}
        currentQuantity={currentQuantity}
        currentSalePrice={currentPurchasePrice}
        setCurrentQuantity={setCurrentQuantity}
        setCurrentSalePrice={setCurrentPurchasePrice}
        handleAddProduct={handleAddProduct}
      />

      {/* Tabela de produtos adicionados */}
      {items.length === 0 ? (
        <p className="text-center py-6 text-gray-500">Nenhum produto adicionado.</p>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Preço Compra (€)</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => {
                const subtotal = item.quantity * item.purchasePrice;
                return (
                  <TableRow key={idx}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="w-20 border rounded-md px-2 py-1"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.purchasePrice}
                        onChange={(e) => onItemChange(idx, "purchasePrice", parseFloat(e.target.value) || 0)}
                        className="w-24 border rounded-md px-2 py-1"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(subtotal)}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-gray-50 font-medium">
                <TableCell colSpan={3} className="text-right pr-4">
                  Total:
                </TableCell>
                <TableCell>{formatCurrency(calculateTotal())}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StockEntryEditProductTable;
