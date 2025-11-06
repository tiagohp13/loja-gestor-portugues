import { useState } from "react";
import { useRequisicoesQuery } from "@/hooks/queries/useRequisicoes";
import { useSuppliersQuery } from "@/hooks/queries/useSuppliers";
import { useProductsQuery } from "@/hooks/queries/useProducts";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, X, CheckCircle, Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Requisicao, RequisicaoItem } from "@/types/requisicao";
import { exportToPdf } from "@/utils/pdfExport";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const estadoBadge = {
  encomendado: { variant: "default" as const, label: "🟡 Encomendado", className: "" },
  cancelado: { variant: "destructive" as const, label: "🔴 Cancelado", className: "" },
  concluido: { variant: "default" as const, label: "🟢 Concluído", className: "bg-green-600" },
};

export default function RequisicoesList() {
  const { requisicoes, isLoading, updateEstado, deleteRequisicao } = useRequisicoesQuery();
  const { suppliers } = useSuppliersQuery();
  const { products } = useProductsQuery();
  
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableItems, setEditableItems] = useState<RequisicaoItem[]>([]);
  const [editableFornecedorId, setEditableFornecedorId] = useState<string | null>(null);
  const [editableFornecedorNome, setEditableFornecedorNome] = useState<string>("");
  const [editableObservacoes, setEditableObservacoes] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const handleExportPdf = async () => {
    if (!selectedRequisicao) return;
    const container = document.createElement("div");
    container.className = "pdf-content p-8";
    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold">Requisição ${selectedRequisicao.numero}</h1>
        </div>
      </div>
    `;
    document.body.appendChild(container);
    try {
      await exportToPdf({ filename: `requisicao-${selectedRequisicao.numero}`, contentSelector: ".pdf-content" });
      toast.success("PDF exportado com sucesso");
    } catch {
      toast.error("Erro ao exportar PDF");
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleEdit = (req: Requisicao) => {
    setSelectedRequisicao(req);
    setEditableItems(req.items ? [...req.items] : []);
    setEditableFornecedorId(req.fornecedorId);
    setEditableFornecedorNome(req.fornecedorNome);
    setEditableObservacoes(req.observacoes || "");
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tens a certeza que queres eliminar esta requisição?")) {
      deleteRequisicao(id);
    }
  };

  const handleCancelar = () => {
    if (!selectedRequisicao) return;
    updateEstado(
      { id: selectedRequisicao.id, estado: "cancelado" },
      {
        onSuccess: () => setSelectedRequisicao(null),
      },
    );
  };

  const handleConcluir = () => {
    if (!selectedRequisicao) return;
    updateEstado(
      { id: selectedRequisicao.id, estado: "concluido" },
      {
        onSuccess: () => setSelectedRequisicao(null),
      },
    );
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditableItems(updated);
  };

  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast.error("Seleciona um produto primeiro");
      return;
    }
    
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    
    // Check if product already exists
    if (editableItems.some((item) => item.produtoId === product.id)) {
      toast.error("Este produto já foi adicionado");
      return;
    }
    
    const newItem: RequisicaoItem = {
      id: crypto.randomUUID(),
      requisicaoId: selectedRequisicao?.id || "",
      produtoId: product.id,
      produtoNome: product.name,
      quantidade: Math.max(1, product.minStock - product.currentStock),
      stockAtual: product.currentStock,
      stockMinimo: product.minStock,
      origem: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setEditableItems([...editableItems, newItem]);
    setSelectedProductId("");
    toast.success("Produto adicionado");
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...editableItems];
    updated.splice(index, 1);
    setEditableItems(updated);
  };

  const handleSaveChanges = async () => {
    if (!selectedRequisicao) return;
    
    try {
      // Update requisicao main data
      const { error: reqError } = await supabase
        .from("requisicoes")
        .update({
          fornecedor_id: editableFornecedorId,
          fornecedor_nome: editableFornecedorNome,
          observacoes: editableObservacoes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequisicao.id);

      if (reqError) throw reqError;

      // Delete all existing items
      const { error: deleteError } = await supabase
        .from("requisicao_itens")
        .delete()
        .eq("requisicao_id", selectedRequisicao.id);

      if (deleteError) throw deleteError;

      // Insert updated items
      const itemsToInsert = editableItems.map((item) => ({
        requisicao_id: selectedRequisicao.id,
        produto_id: item.produtoId,
        produto_nome: item.produtoNome,
        quantidade: item.quantidade,
        stock_atual: item.stockAtual,
        stock_minimo: item.stockMinimo,
        origem: item.origem,
      }));

      const { error: insertError } = await supabase
        .from("requisicao_itens")
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      toast.success("Requisição atualizada com sucesso");
      setIsEditing(false);
      setSelectedRequisicao(null);
      
      // Invalidate query to refresh data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar requisição");
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">A carregar...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="Requisições" description="Gerir requisições de stock" />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Requisição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisicoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma requisição criada
                  </TableCell>
                </TableRow>
              ) : (
                requisicoes.map((req) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setSelectedRequisicao(req);
                      setIsEditing(false);
                    }}
                  >
                    <TableCell className="font-medium">{req.numero}</TableCell>
                    <TableCell>{req.fornecedorNome}</TableCell>
                    <TableCell>{format(req.data, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge variant={estadoBadge[req.estado].variant} className={estadoBadge[req.estado].className}>
                        {estadoBadge[req.estado].label}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(req)} title="Editar">
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(req.id)} title="Eliminar">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de detalhe/edição */}
      <Dialog open={!!selectedRequisicao} onOpenChange={() => setSelectedRequisicao(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? `Editar Requisição ${selectedRequisicao?.numero}`
                : `Requisição ${selectedRequisicao?.numero}`}
            </DialogTitle>
          </DialogHeader>

          {selectedRequisicao && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fornecedor</Label>
                  {isEditing ? (
                    <Select
                      value={editableFornecedorId || ""}
                      onValueChange={(value) => {
                        setEditableFornecedorId(value);
                        const supplier = suppliers.find((s) => s.id === value);
                        if (supplier) setEditableFornecedorNome(supplier.name);
                      }}
                    >
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
                  ) : (
                    <p className="font-semibold">{selectedRequisicao.fornecedorNome}</p>
                  )}
                </div>
                <div>
                  <Label>Data</Label>
                  <p className="font-semibold">{format(selectedRequisicao.data, "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </div>

              {isEditing && (
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={editableObservacoes}
                    onChange={(e) => setEditableObservacoes(e.target.value)}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>
              )}

              {!isEditing && selectedRequisicao.observacoes && (
                <div>
                  <Label>Observações</Label>
                  <p className="text-sm">{selectedRequisicao.observacoes}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Produtos</h3>
                
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecionar produto para adicionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Stock: {product.currentStock}, Mín: {product.minStock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddProduct} disabled={!selectedProductId}>
                      <Plus className="h-4 w-4 mr-2" /> Adicionar
                    </Button>
                  </div>
                )}
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Stock Atual</TableHead>
                      <TableHead className="text-right">Stock Mínimo</TableHead>
                      {isEditing && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editableItems.length === 0 && isEditing ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                          Nenhum produto adicionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      (isEditing ? editableItems : selectedRequisicao.items)?.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.produtoNome}</TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => handleItemChange(index, "quantidade", Number(e.target.value))}
                                className="w-20 text-right"
                              />
                            ) : (
                              item.quantidade
                            )}
                          </TableCell>
                          <TableCell className="text-right">{item.stockAtual}</TableCell>
                          <TableCell className="text-right">{item.stockMinimo}</TableCell>
                          {isEditing && (
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} title="Remover">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveChanges}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Guardar Alterações
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleExportPdf}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                {selectedRequisicao?.estado === "encomendado" && (
                  <>
                    <Button variant="destructive" onClick={handleCancelar}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleConcluir}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Concluir
                    </Button>
                  </>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
