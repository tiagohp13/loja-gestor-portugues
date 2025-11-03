import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

// ⚙️ Configura o cliente Supabase (ou importa do teu módulo se já existir)
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

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, stock, stock_minimo, fornecedor")
        .lt("stock", "stock_minimo") // menor que o stock mínimo
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar produtos com stock baixo");
      } else {
        setProdutos(data || []);
      }
      setLoading(false);
    };

    fetchProdutos();
  }, []);

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
            <p>✅ Todos os produtos estão com stock acima do mínimo.</p>
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
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.nome}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell>{p.stock_minimo}</TableCell>
                      <TableCell>{p.fornecedor || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button onClick={() => navigate("/produtos/consultar")} variant="secondary">
              Voltar aos Produtos
            </Button>
            <Button onClick={() => toast.info("Exportação PDF ainda não implementada")}>Exportar PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockBaixoPage;
