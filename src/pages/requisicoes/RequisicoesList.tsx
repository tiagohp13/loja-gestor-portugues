import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { FileDown, X, CheckCircle, Pencil, Trash2, Plus, RotateCcw, Package, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Requisicao, RequisicaoItem } from "@/types/requisicao";
import { exportToPdf } from "@/utils/pdfExport";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Component to display stock entry link
function StockEntryLink({ stockEntryId }: { stockEntryId: string }) {
  const [stockEntryNumber, setStockEntryNumber] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStockEntryNumber() {
      const { data } = await supabase
        .from('stock_entries')
        .select('number')
        .eq('id', stockEntryId)
        .single();
      
      if (data) {
        setStockEntryNumber(data.number);
      }
    }
    fetchStockEntryNumber();
  }, [stockEntryId]);

  return (
    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-green-700 dark:text-green-300">Compra Criada</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Esta requisição foi convertida em compra
          </p>
          {stockEntryNumber && (
            <p className="text-sm font-semibold mt-2 text-green-700 dark:text-green-300">
              {stockEntryNumber}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/entradas/${stockEntryId}`)}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Compra
        </Button>
      </div>
    </div>
  );
}

const estadoBadge = {
  encomendado: { variant: "default" as const, label: "🟡 Encomendado", className: "" },
  cancelado: { variant: "destructive" as const, label: "🔴 Cancelado", className: "" },
  concluido: { variant: "default" as const, label: "🟢 Concluído", className: "bg-green-600" },
};

export default function RequisicoesList() {
  const navigate = useNavigate();
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
    if (req.estado === "cancelado" || req.estado === "concluido") {
      toast.warning("Não é possível editar uma requisição cancelada ou concluída.");
      return;
    }
    setSelectedRequisicao(req);
    setEditableItems(req.items ? [...req.items] : []);
    setEditableFornecedorId(req.fornecedorId);
    setEditableFornecedorNome(req.fornecedorNome);
    setEditableObservacoes(req.observacoes || "");
    setIsEditing(true);
  };

  const handleDelete = async (req: Requisicao) => {
    if (req.estado === "cancelado" || req.estado === "concluido") {
      toast.warning("Não é possível eliminar uma requisição cancelada ou concluída.");
      return;
    }
    if (confirm("Tens a certeza que queres eliminar esta requisição?")) {
      deleteRequisicao(req.id);
    }
  };

  const handleRestaurar = (req: Requisicao) => {
    updateEstado(
      { id: req.id, estado: "encomendado" },
      {
        onSuccess: () => {
          toast.success("Requisição restaurada com sucesso");
          setSelectedRequisicao(null);
        },
      }
    );
  };

  const handleCriarCompra = async () => {
    if (!selectedRequisicao) return;
    
    try {
      const currentYear = new Date().getFullYear();
      const { data: counterData, error: counterError } = await supabase.rpc("get_next_counter_by_year", {
        counter_type: "COMP",
        p_year: currentYear
      });

      if (counterError) throw counterError;

      const compraNumber = `COMP-${currentYear}/${String(counterData || 1).padStart(3, "0")}`;

      // Criar compra
      const { data: compra, error: compraError } = await supabase
        .from("stock_entries")
        .insert({
          number: compraNumber,
          supplier_id: selectedRequisicao.fornecedorId,
          supplier_name: selectedRequisicao.fornecedorNome,
          date: new Date().toISOString(),
          notes: `Criado a partir da requisição ${selectedRequisicao.numero}${selectedRequisicao.observacoes ? '\n\n' + selectedRequisicao.observacoes : ''}`,
        })
        .select()
        .single();

      if (compraError) throw compraError;

      // Criar itens da compra e atualizar stock
      const items = selectedRequisicao.items || [];
      for (const item of items) {
        // Inserir item
        const { error: itemError } = await supabase
          .from("stock_entry_items")
          .insert({
            entry_id: compra.id,
            product_id: item.produtoId,
            product_name: item.produtoNome,
            quantity: item.quantidade,
            purchase_price: item.preco || 0,
          });

        if (itemError) throw itemError;

        // Atualizar stock do produto
        if (item.produtoId) {
          const { data: produto, error: produtoError } = await supabase
            .from("products")
            .select("current_stock")
            .eq("id", item.produtoId)
            .single();

          if (!produtoError && produto) {
            await supabase
              .from("products")
              .update({
                current_stock: produto.current_stock + item.quantidade,
              })
              .eq("id", item.produtoId);
          }
        }
      }

      // Atualizar requisição para concluído e ligar à compra
      const { error: updateError } = await supabase
        .from("requisicoes")
        .update({
          estado: "concluido",
          stock_entry_id: compra.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequisicao.id);

      if (updateError) throw updateError;

      toast.success(`Compra ${compraNumber} criada com sucesso!`);
      setSelectedRequisicao(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar compra");
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
      preco: 0,
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
        preco: item.preco || 0,
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
      <PageHeader 
        title="Requisições" 
        description="Gerir requisições de stock"
        actions={
          <Button onClick={() => navigate("/requisicoes/nova")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Requisição
          </Button>
        }
      />

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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(req)}
                          disabled={req.estado === "cancelado" || req.estado === "concluido"}
                          className={req.estado === "cancelado" || req.estado === "concluido" ? "opacity-50 cursor-not-allowed" : ""}
                          title={req.estado === "cancelado" || req.estado === "concluido" ? "Bloqueado" : "Editar"}
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(req)}
                          disabled={req.estado === "cancelado" || req.estado === "concluido"}
                          className={req.estado === "cancelado" || req.estado === "concluido" ? "opacity-50 cursor-not-allowed" : ""}
                          title={req.estado === "cancelado" || req.estado === "concluido" ? "Bloqueado" : "Eliminar"}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        {req.estado === "cancelado" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestaurar(req)}
                            title="Restaurar"
                          >
                            <RotateCcw className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
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

              {!isEditing && selectedRequisicao.estado === "concluido" && selectedRequisicao.stockEntryId && (
                <StockEntryLink stockEntryId={selectedRequisicao.stockEntryId} />
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
                      <TableHead className="text-right">Preço (€)</TableHead>
                      <TableHead className="text-right">Stock Atual</TableHead>
                      <TableHead className="text-right">Stock Mínimo</TableHead>
                      {isEditing && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editableItems.length === 0 && isEditing ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                          Nenhum produto adicionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      (isEditing ? editableItems : selectedRequisicao.items)?.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {!isEditing && item.produtoId ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/produtos/${item.produtoId}`);
                                }}
                                className="text-primary hover:underline text-left"
                              >
                                {item.produtoNome}
                              </button>
                            ) : (
                              item.produtoNome
                            )}
                          </TableCell>
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
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.preco || 0}
                                onChange={(e) => handleItemChange(index, "preco", Number(e.target.value))}
                                className="w-24 text-right"
                              />
                            ) : (
                              `${(item.preco || 0).toFixed(2)}€`
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
                    <Button variant="default" onClick={handleCriarCompra} className="bg-green-600 hover:bg-green-700">
                      <Package className="h-4 w-4 mr-2" />
                      Criar Compra
                    </Button>
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
                {selectedRequisicao?.estado === "cancelado" && (
                  <Button onClick={() => handleRestaurar(selectedRequisicao)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
