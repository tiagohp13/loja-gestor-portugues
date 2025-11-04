import { useState } from "react";
import { useRequisicoesQuery } from "@/hooks/queries/useRequisicoes";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileDown, X, CheckCircle, Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Requisicao } from "@/types/requisicao";
import { exportToPdf } from "@/utils/pdfExport";
import { toast } from "sonner";

const estadoBadge = {
  encomendado: { variant: "default" as const, label: "🟡 Encomendado", className: "" },
  cancelado: { variant: "destructive" as const, label: "🔴 Cancelado", className: "" },
  concluido: { variant: "default" as const, label: "🟢 Concluído", className: "bg-green-600" },
};

export default function RequisicoesList() {
  const { requisicoes, isLoading, updateEstado, deleteRequisicao } = useRequisicoesQuery();
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableItems, setEditableItems] = useState<any[]>([]);

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

  const handleAddItem = () => {
    setEditableItems([
      ...editableItems,
      {
        id: Math.random().toString(36).substring(2),
        produtoNome: "",
        quantidade: 1,
        stockAtual: 0,
        stockMinimo: 0,
        origem: "manual",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...editableItems];
    updated.splice(index, 1);
    setEditableItems(updated);
  };

  const handleSaveChanges = async () => {
    toast.success("Alterações guardadas (simulação) — aqui vais integrar com Supabase UPDATE.");
    setIsEditing(false);
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
                  <p className="text-sm text-muted-foreground">Fornecedor</p>
                  <p className="font-semibold">{selectedRequisicao.fornecedorNome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-semibold">{format(selectedRequisicao.data, "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Produtos</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Stock Atual</TableHead>
                      <TableHead className="text-right">Stock Mínimo</TableHead>
                      {isEditing && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isEditing ? editableItems : selectedRequisicao.items)?.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.produtoNome}
                              onChange={(e) => handleItemChange(index, "produtoNome", e.target.value)}
                              className="w-full border rounded px-2 py-1"
                            />
                          ) : (
                            item.produtoNome
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) => handleItemChange(index, "quantidade", Number(e.target.value))}
                              className="w-20 border rounded px-2 py-1 text-right"
                            />
                          ) : (
                            item.quantidade
                          )}
                        </TableCell>
                        <TableCell className="text-right">{item.stockAtual}</TableCell>
                        <TableCell className="text-right">{item.stockMinimo}</TableCell>
                        {isEditing && (
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} title="Remover">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
                  </Button>
                )}
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
