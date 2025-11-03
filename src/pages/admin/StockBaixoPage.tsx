import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ⚙️ Configura o cliente Supabase (ou importa do teu módulo se já tiveres um pronto)
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

  // 🔍 Buscar produtos e filtrar localmente
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

  // 📄 Exportar para PDF
  const exportarPDF = () => {
    if (produtos.length === 0) {
      toast.info("Não há produtos com stock baixo para exportar.");
      return;
    }

    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Stock Baixo", 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);

    // Tabela
    const rows = produtos.map((p) => [p.id, p.nome, p.stock, p.stock_minimo, p.fornecedor || "—"]);

    (doc as any).autoTable({
      head: [["ID", "Produto", "Stock Atual", "Stock Mínimo", "Fornecedor"]],
      body: rows,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] },
    });

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
                    <TableRow key={p.id} className={p.stock === 0 ? "bg-red-50" : "bg-yellow-50"}>
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
