import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save } from "lucide-react";
import { useRequisicoesQuery } from "@/hooks/queries/useRequisicoes";
import { useSuppliersQuery } from "@/hooks/queries/useSuppliers";
import { useProductsQuery } from "@/hooks/queries/useProducts";
import { toast } from "sonner";
import { useNextDocumentNumber } from "@/hooks/useNextDocumentNumber";

interface NovaRequisicaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RequisicaoItemForm {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  preco: number;
  stockAtual: number;
  stockMinimo: number;
}

export function NovaRequisicaoDialog({ open, onOpenChange }: NovaRequisicaoDialogProps) {
  const { createRequisicao } = useRequisicoesQuery();
  const { suppliers } = useSuppliersQuery();
  const { products } = useProductsQuery();
  const { data: nextNumber } = useNextDocumentNumber("requisicoes");

  const [fornecedorId, setFornecedorId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [items, setItems] = useState<RequisicaoItemForm[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

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

  const handleSubmit = () => {
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

    createRequisicao({
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

    // Reset form
    setFornecedorId("");
    setObservacoes("");
    setItems([]);
    onOpenChange(false);
  };

  const lowStockProducts = products.filter((p) => p.currentStock < p.minStock);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Nova Requisição {nextNumber && <span className="text-muted-foreground">({nextNumber})</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Produtos</h3>
              {lowStockProducts.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {lowStockProducts.length} produto(s) com stock baixo
                </span>
              )}
            </div>

            <div className="flex gap-2 mb-4">
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!fornecedorId || items.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Criar Requisição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
