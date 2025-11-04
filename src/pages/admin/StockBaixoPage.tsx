import { useState, useMemo } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { useRequisicoesQuery } from "@/hooks/queries/useRequisicoes";
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
import { AlertTriangle, Package, Search } from "lucide-react";
import { toast } from "sonner";

export default function StockBaixoPage() {
  const { products } = useProducts();
  const { suppliers } = useSuppliers();
  const { createRequisicao } = useRequisicoesQuery();
  const navigate = useNavigate();

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fornecedorId, setFornecedorId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [manualProducts, setManualProducts] = useState<Set<string>>(new Set());

  // Filter products with low stock
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.currentStock < p.minStock);
  }, [products]);

  // Products for manual selection (not already in low stock selection)
  const availableProducts = useMemo(() => {
    return products.filter(p => 
      !selectedProducts.has(p.id) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, selectedProducts, searchTerm]);

  const handleToggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      const newManual = new Set(manualProducts);
      newManual.delete(productId);
      setManualProducts(newManual);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleAddManualProduct = (productId: string) => {
    setSelectedProducts(new Set([...selectedProducts, productId]));
    setManualProducts(new Set([...manualProducts, productId]));
    setSearchTerm("");
  };

  const handleOpenDialog = () => {
    if (selectedProducts.size === 0) {
      toast.error("Selecione pelo menos um produto");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleCreateRequisicao = () => {
    if (!fornecedorId) {
      toast.error("Selecione um fornecedor");
      return;
    }

    const fornecedor = suppliers.find(s => s.id === fornecedorId);
    if (!fornecedor) return;

    const items = Array.from(selectedProducts).map(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Produto não encontrado");

      return {
        produtoId: product.id,
        produtoNome: product.name,
        quantidade: Math.max(1, product.minStock - product.currentStock),
        stockAtual: product.currentStock,
        stockMinimo: product.minStock,
        origem: manualProducts.has(productId) ? 'manual' as const : 'stock_baixo' as const
      };
    });

    createRequisicao({
      fornecedorId: fornecedor.id,
      fornecedorNome: fornecedor.name,
      observacoes,
      items
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setSelectedProducts(new Set());
        setManualProducts(new Set());
        setFornecedorId("");
        setObservacoes("");
        navigate("/requisicoes");
      }
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Stock Baixo"
        description="Produtos abaixo do stock mínimo"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {lowStockProducts.length} produto(s) com stock baixo
              </span>
            </div>
            <Button
              onClick={handleOpenDialog}
              disabled={selectedProducts.size === 0}
            >
              Encomendar ({selectedProducts.size})
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
                lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => handleToggleProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category || "—"}</TableCell>
                    <TableCell className="text-right">{product.currentStock}</TableCell>
                    <TableCell className="text-right">{product.minStock}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Stock Baixo</Badge>
                    </TableCell>
                  </TableRow>
                ))
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
              <Label>Produtos Selecionados ({selectedProducts.size})</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {Array.from(selectedProducts).map(productId => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;
                  return (
                    <div key={productId} className="flex justify-between items-center text-sm">
                      <span>{product.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {manualProducts.has(productId) ? "Manual" : "Stock Baixo"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleProduct(productId)}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adicionar Produtos Manualmente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchTerm && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {availableProducts.slice(0, 5).map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleAddManualProduct(product.id)}
                      className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                    >
                      {product.name} <span className="text-muted-foreground">({product.currentStock} un.)</span>
                    </button>
                  ))}
                  {availableProducts.length === 0 && (
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
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRequisicao}>
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
