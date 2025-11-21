import { useState, useMemo } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { useSuppliersQuery } from "@/hooks/queries/useSuppliers";
import { useRequisicoesQuery } from "@/hooks/queries/useRequisicoes";
import { usePendingRequisicoes } from "@/hooks/queries/usePendingRequisicoes";
import { useStockBaixoForm } from "@/hooks/useStockBaixoForm";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductInfoModal from "./components/ProductInfoModal";
import { Product } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function StockBaixoPage() {
  const { products } = useProducts();
  const { suppliers } = useSuppliersQuery();
  const { createRequisicao } = useRequisicoesQuery();
  const { data: productsInRequisicao, isLoading: isLoadingRequisicoes, error: requisicaoError } = usePendingRequisicoes();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductForInfo, setSelectedProductForInfo] = useState<Product | null>(null);
  const [isProductInfoOpen, setIsProductInfoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use custom hook for form management
  const {
    selectedProducts,
    fornecedorId,
    observacoes,
    searchTerm,
    availableProducts,
    setFornecedorId,
    setObservacoes,
    setSearchTerm,
    toggleProduct,
    updateQuantity,
    updatePrice,
    addManualProduct,
    resetForm,
    getSelectedProductsData,
    validateForm,
    selectedCount,
  } = useStockBaixoForm({ products });

  // Filter products with low stock
  const lowStockProducts = useMemo(() => {
    return products.filter(p => 
      p.minStock > 0 &&
      p.currentStock <= p.minStock && 
      p.status === 'active'
    );
  }, [products]);

  const handleProductClick = (product: Product) => {
    setSelectedProductForInfo(product);
    setIsProductInfoOpen(true);
  };

  const handleOpenDialog = () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    setIsDialogOpen(true);
  };

  const handleCreateRequisicao = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const fornecedor = suppliers.find(s => s.id === fornecedorId);
    if (!fornecedor) {
      toast.error("Fornecedor não encontrado");
      return;
    }

    const items = getSelectedProductsData();
    
    if (items.length === 0) {
      toast.error("Nenhum produto válido selecionado");
      return;
    }

    setIsSubmitting(true);

    try {
      await createRequisicao({
        fornecedorId: fornecedor.id,
        fornecedorNome: fornecedor.name,
        observacoes,
        items
      }, {
        onSuccess: () => {
          toast.success(
            "Requisição criada. Os produtos continuarão na lista de stock baixo até a compra ser concluída.",
            { duration: 5000 }
          );
          setIsDialogOpen(false);
          resetForm();
          navigate("/requisicoes");
        },
        onError: (error) => {
          console.error('Error creating requisição:', error);
          toast.error("Erro ao criar requisição");
        }
      });
    } catch (error) {
      console.error('Error creating requisição:', error);
      toast.error("Erro ao criar requisição");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <PageHeader
        title="Stock Baixo"
        description="Produtos abaixo do stock mínimo"
      />

      {requisicaoError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar requisições pendentes. Alguns dados podem não estar atualizados.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {lowStockProducts.length} produto(s) com stock baixo
              </span>
              {isLoadingRequisicoes && (
                <span className="text-xs text-muted-foreground">(A carregar requisições...)</span>
              )}
            </div>
            <Button
              onClick={handleOpenDialog}
              disabled={selectedCount === 0}
            >
              Encomendar ({selectedCount})
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Stock Atual</TableHead>
                <TableHead className="text-right">Stock Mínimo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum produto com stock baixo
                  </TableCell>
                </TableRow>
              ) : (
                lowStockProducts.map((product) => {
                  const isInRequisicao = productsInRequisicao?.has(product.id) || false;
                  
                  return (
                    <TableRow 
                      key={product.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium" onClick={() => handleProductClick(product)}>
                        {product.name}
                      </TableCell>
                      <TableCell onClick={() => handleProductClick(product)}>
                        {product.category || "—"}
                      </TableCell>
                      <TableCell className="text-right" onClick={() => handleProductClick(product)}>
                        {product.currentStock}
                      </TableCell>
                      <TableCell className="text-right" onClick={() => handleProductClick(product)}>
                        {product.minStock}
                      </TableCell>
                      <TableCell onClick={() => handleProductClick(product)}>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Stock Baixo</Badge>
                          {isInRequisicao && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Em Requisição
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para criar requisição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fornecedor *</Label>
              <Select value={fornecedorId} onValueChange={setFornecedorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Produtos Selecionados ({selectedCount})</Label>
              <div className="border rounded-md divide-y max-h-80 overflow-y-auto">
                {Array.from(selectedProducts.entries()).map(([productId, formData]) => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;
                  
                  return (
                    <div key={productId} className="p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>Stock Atual: <strong>{product.currentStock}</strong></span>
                            <span>Stock Mínimo: <strong>{product.minStock}</strong></span>
                            <Badge variant="outline" className="text-xs">
                              {formData.isManual ? "Manual" : "Stock Baixo"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProduct(productId)}
                        >
                          Remover
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`qty-${productId}`} className="text-xs">
                            Quantidade *:
                          </Label>
                          <Input
                            id={`qty-${productId}`}
                            type="number"
                            min="1"
                            max="99999"
                            value={formData.quantity}
                            onChange={(e) => updateQuantity(productId, parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`price-${productId}`} className="text-xs">
                            Preço (€):
                          </Label>
                          <Input
                            id={`price-${productId}`}
                            type="number"
                            min="0"
                            max="999999.99"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => updatePrice(productId, parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {selectedCount === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhum produto selecionado
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adicionar Produtos Manualmente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produtos por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchTerm && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {availableProducts.length > 0 ? (
                    availableProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addManualProduct(product.id)}
                        className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Código: {product.code} • Stock: {product.currentStock} un.
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Nenhum produto encontrado
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações adicionais..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {observacoes.length}/500 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateRequisicao}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  A criar...
                </>
              ) : (
                'Concluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de informações do produto */}
      <ProductInfoModal
        product={selectedProductForInfo}
        open={isProductInfoOpen}
        onOpenChange={setIsProductInfoOpen}
      />
    </div>
  );
}
