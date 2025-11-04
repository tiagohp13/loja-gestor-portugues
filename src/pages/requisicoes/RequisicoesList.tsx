import { useState } from "react";
import { useRequisicoesQuery } from "@/hooks/queries/useRequisicoes";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ClipboardList, FileDown, X, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Requisicao } from "@/types/requisicao";
import { exportToPdf } from "@/utils/pdfExport";
import { toast } from "sonner";

const estadoBadge = {
  encomendado: { variant: "default" as const, label: "🟡 Encomendado", className: "" },
  cancelado: { variant: "destructive" as const, label: "🔴 Cancelado", className: "" },
  concluido: { variant: "default" as const, label: "🟢 Concluído", className: "bg-green-600" }
};

export default function RequisicoesList() {
  const { requisicoes, isLoading, updateEstado } = useRequisicoesQuery();
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | null>(null);

  const handleExportPdf = async () => {
    if (!selectedRequisicao) return;

    // Create temporary container for PDF export
    const container = document.createElement('div');
    container.className = 'pdf-content p-8';
    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold">Requisição ${selectedRequisicao.numero}</h1>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-600">Fornecedor</p>
            <p class="font-semibold">${selectedRequisicao.fornecedorNome}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Data</p>
            <p class="font-semibold">${format(selectedRequisicao.data, "dd/MM/yyyy", { locale: ptBR })}</p>
          </div>
        </div>

        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b-2">
              <th class="text-left py-2">Produto</th>
              <th class="text-right py-2">Quantidade</th>
              <th class="text-right py-2">Stock Atual</th>
              <th class="text-right py-2">Stock Mínimo</th>
            </tr>
          </thead>
          <tbody>
            ${selectedRequisicao.items?.map(item => `
              <tr class="border-b">
                <td class="py-2">${item.produtoNome}</td>
                <td class="text-right py-2">${item.quantidade}</td>
                <td class="text-right py-2">${item.stockAtual}</td>
                <td class="text-right py-2">${item.stockMinimo}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        ${selectedRequisicao.observacoes ? `
          <div class="mt-6">
            <p class="text-sm text-gray-600">Observações</p>
            <p class="mt-1">${selectedRequisicao.observacoes}</p>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(container);

    try {
      await exportToPdf({
        filename: `requisicao-${selectedRequisicao.numero}`,
        contentSelector: '.pdf-content'
      });
      toast.success("PDF exportado com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleCancelar = () => {
    if (!selectedRequisicao) return;
    updateEstado({ id: selectedRequisicao.id, estado: 'cancelado' }, {
      onSuccess: () => setSelectedRequisicao(null)
    });
  };

  const handleConcluir = () => {
    if (!selectedRequisicao) return;
    updateEstado({ id: selectedRequisicao.id, estado: 'concluido' }, {
      onSuccess: () => setSelectedRequisicao(null)
    });
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">A carregar...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Requisições"
        description="Gerir requisições de stock"
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisicoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhuma requisição criada
                  </TableCell>
                </TableRow>
              ) : (
                requisicoes.map((req) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedRequisicao(req)}
                  >
                    <TableCell className="font-medium">{req.numero}</TableCell>
                    <TableCell>{req.fornecedorNome}</TableCell>
                    <TableCell>{format(req.data, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge
                        variant={estadoBadge[req.estado].variant}
                        className={estadoBadge[req.estado].className}
                      >
                        {estadoBadge[req.estado].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de detalhe */}
      <Dialog open={!!selectedRequisicao} onOpenChange={() => setSelectedRequisicao(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Requisição {selectedRequisicao?.numero}</DialogTitle>
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
                  <p className="font-semibold">
                    {format(selectedRequisicao.data, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant={estadoBadge[selectedRequisicao.estado].variant}
                    className={estadoBadge[selectedRequisicao.estado].className}
                  >
                    {estadoBadge[selectedRequisicao.estado].label}
                  </Badge>
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
                      <TableHead>Origem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRequisicao.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.produtoNome}</TableCell>
                        <TableCell className="text-right">{item.quantidade}</TableCell>
                        <TableCell className="text-right">{item.stockAtual}</TableCell>
                        <TableCell className="text-right">{item.stockMinimo}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.origem === 'stock_baixo' ? 'Stock Baixo' : 'Manual'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedRequisicao.observacoes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm">{selectedRequisicao.observacoes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleExportPdf}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            
            {selectedRequisicao?.estado === 'encomendado' && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleCancelar}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleConcluir}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluir
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
