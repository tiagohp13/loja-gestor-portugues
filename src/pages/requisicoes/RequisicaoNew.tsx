import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuppliersQuery } from "@/hooks/queries/useSuppliers";
import { useProductsQuery } from "@/hooks/queries/useProducts";
import { useRequisicoesQuery } from "@/hooks/queries/useRequisicoes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";

interface RequisicaoItemForm {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  preco: number;
  stockAtual: number;
  stockMinimo: number;
}

const RequisicaoNew = () => {
  const navigate = useNavigate();
  const { suppliers } = useSuppliersQuery();
  const { products } = useProductsQuery();
  const { createRequisicao } = useRequisicoesQuery();

  const [fornecedorId, setFornecedorId] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");
  const [items, setItems] = React.useState<RequisicaoItemForm[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast.error("Seleciona um produto primeiro");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (items.some((item) => item.produtoId === product.id)) {
      toast.error("Este produto já foi adicionado");
      return;
    }

    const newItem: RequisicaoItemForm = {
      produtoId: product.id,
      produtoNome: product.name,
      quantidade: Math.max(1, product.minStock - product.currentStock),
      preco: product.purchasePrice || 0,
      stockAtual: product.currentStock,
      stockMinimo: product.minStock,
    };

    setItems([...items, newItem]);
    setSelectedProductId("");
    toast.success("Produto adicionado");
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof RequisicaoItemForm, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fornecedorId) {
      toast.error("Seleciona um fornecedor");
      return;
    }

    if (items.length === 0) {
      toast.error("Adiciona pelo menos um produto");
      return;
    }

    const supplier = suppliers.find((s) => s.id === fornecedorId);
    if (!supplier) return;

    setIsSubmitting(true);
    try {
      await createRequisicao({
        fornecedorId,
        fornecedorNome: supplier.name,
        observacoes,
        items: items.map((item) => ({
          produtoId: item.produtoId,
          produtoNome: item.produtoNome,
          quantidade: item.quantidade,
          preco: item.preco,
          stockAtual: item.stockAtual,
          stockMinimo: item.stockMinimo,
          origem: "manual" as const,
        })),
      });
      navigate("/requisicoes");
    } catch (error) {
      console.error("Error creating requisition:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSupplier = suppliers.find((s) => s.id === fornecedorId);
  const lowStockProducts = products.filter((p) => p.currentStock < p.minStock);

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <PageHeader
        title="Nova Requisição"
        description="Criar uma nova requisição de compra"
      />

      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mb-6">
        <Button variant="outline" onClick={() => navigate("/requisicoes")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={items.length === 0 || !fornecedorId || isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">A guardar...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Requisição
            </>
          )}
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Fornecedor *</Label>
              <Select value={fornecedorId} onValueChange={setFornecedorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar fornecedor" />
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

            <div>
              <Label>Fornecedor Selecionado</Label>
              <div className="text-sm text-muted-foreground mt-2">
                {selectedSupplier ? selectedSupplier.name : "Nenhum fornecedor selecionado"}
              </div>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produtos</CardTitle>
                {lowStockProducts.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {lowStockProducts.length} produto(s) com stock baixo
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} {product.currentStock < product.minStock && "⚠️"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddProduct} type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="w-32">Quantidade</TableHead>
                        <TableHead className="w-32">Preço (€)</TableHead>
                        <TableHead className="w-20">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.produtoNome}</p>
                              <p className="text-xs text-muted-foreground">
                                Stock: {item.stockAtual} / Mínimo: {item.stockMinimo}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) =>
                                handleItemChange(index, "quantidade", parseInt(e.target.value) || 1)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.preco}
                              onChange={(e) =>
                                handleItemChange(index, "preco", parseFloat(e.target.value) || 0)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum produto adicionado
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default RequisicaoNew;
