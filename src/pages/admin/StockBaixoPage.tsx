import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import jsPDF from "jspdf";

// ⚙️ Configuração do cliente Supabase (usa as tuas variáveis .env)
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

interface Produto {
  id: number;
  nome: string;
  stock: number;
  stock_minimo: number;
  fornecedor?: string;
}

const StockBaixoPage: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔍 Buscar produtos e filtrar localmente (sem erro .lt)
  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, stock, stock_minimo, fornecedor")
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar produtos com stock baixo");
      } else {
        const filtrados = (data || []).filter((p) => p.stock < p.stock_minimo);
        setProdutos(filtrados);
      }
      setLoading(false);
    };

    fetchProdutos();
  }, []);

  // 📄 Exportar PDF (compatível sem jspdf-autotable)
  const exportarPDF = () => {
    if (produtos.length === 0) {
      toast.info("Não há produtos com stock baixo para exportar.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    // Cabeçalho
    doc.setFontSize(18);
    doc.text("Relatório de Stock Baixo", 40, 40);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-PT")}`, 40, 58);

    // Cabeçalhos da tabela
    const startY = 80;
    const lineHeight = 20;
    const colX = [40, 100, 280, 400, 500];

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("ID", colX[0], startY);
    doc.text("Produto", colX[1], startY);
    doc.text("Stock Atual", colX[2], startY);
    doc.text("Stock Mínimo", colX[3], startY);
    doc.text("Fornecedor", colX[4], startY);

    // Conteúdo
    doc.setFont("helvetica", "normal");
    let y = startY + 15;
    produtos.forEach((p) => {
      doc.text(String(p.id), colX[0], y);
      doc.text(p.nome, colX[1], y);
      doc.text(String(p.stock), colX[2], y);
      doc.text(String(p.stock_minimo), colX[3], y);
      doc.text(p.fornecedor || "—", colX[4], y);
      y += lineHeight;
    });

    // Guardar ficheiro
    doc.save("relatorio-stock-baixo.pdf");
    toast.success("PDF exportado com sucesso!");
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Stock Baixo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>A carregar produtos...</p>
          ) : produtos.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <span className="text-green-700 text-sm font-medium">
                ✅ Todos os produtos estão com stock acima do mínimo.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Stock Atual</TableHead>
                    <TableHead>Stock Mínimo</TableHead>
                    <TableHead>Fornecedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((p) => (
                    <TableRow
                      key={p.id}
                      className={p.stock === 0 ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}
                    >
                      <TableCell>{p.id}</TableCell>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell>{p.stock_minimo}</TableCell>
                      <TableCell>{p.fornecedor || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button onClick={() => navigate("/produtos/consultar")} variant="secondary">
              Voltar aos Produtos
            </Button>
            <Button onClick={exportarPDF}>Exportar PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockBaixoPage;
