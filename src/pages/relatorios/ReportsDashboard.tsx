import { useState } from "react";
import { useReportsData } from "./hooks/useReportsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
import PageHeader from "@/components/ui/PageHeader";

export default function ReportsDashboard() {
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading, isError } = useReportsData({ startDate, endDate });

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Relatório de Vendas", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${new Date(startDate).toLocaleDateString("pt-PT")} até ${new Date(endDate).toLocaleDateString("pt-PT")}`, 20, 35);
    
    doc.setFontSize(14);
    doc.text("Vendas Mensais", 20, 50);
    
    let yPosition = 60;
    data?.monthlySales?.forEach((item) => {
      doc.setFontSize(10);
      doc.text(`${item.month}: €${item.value.toFixed(2)}`, 25, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.text("Top 5 Produtos Mais Vendidos", 20, yPosition);
    yPosition += 10;
    
    data?.productSales?.slice(0, 5).forEach((item) => {
      doc.setFontSize(10);
      doc.text(`${item.name}: ${item.quantity} unidades`, 25, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.text("Top 5 Clientes", 20, yPosition);
    yPosition += 10;
    
    data?.topClients?.forEach((item) => {
      doc.setFontSize(10);
      doc.text(`${item.client_name}: €${item.total.toFixed(2)}`, 25, yPosition);
      yPosition += 7;
    });
    
    doc.save(`relatorio_vendas_${startDate}_${endDate}.pdf`);
    toast.success("Relatório exportado com sucesso!");
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Relatórios e Estatísticas"
          description="Análise detalhada de vendas, produtos e clientes"
        />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatórios e Estatísticas" />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Erro ao carregar dados. Por favor, tente novamente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Relatórios e Estatísticas"
          description="Análise detalhada de vendas, produtos e clientes"
        />
        <Button onClick={exportPDF} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Exportar PDF
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filtros de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-foreground">Data Início</label>
              <input
                type="date"
                className="w-full border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-foreground">Data Fim</label>
              <input
                type="date"
                className="w-full border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendas Mensais */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Evolução de Vendas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data?.monthlySales || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="Vendas (€)"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Produtos Mais Vendidos */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data?.productSales || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Bar 
                dataKey="quantity" 
                fill="hsl(var(--chart-2))"
                name="Quantidade Vendida"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Clientes Top 5 */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Top 5 Clientes por Volume de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.topClients || []}
                  dataKey="total"
                  nameKey="client_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ client_name, percent }) => 
                    `${client_name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data?.topClients?.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `€${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Detalhes dos Clientes</h3>
              {data?.topClients?.map((client, i) => (
                <div 
                  key={client.client_id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="font-medium text-foreground">{client.client_name}</span>
                  </div>
                  <span className="font-semibold text-primary">
                    €{client.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
