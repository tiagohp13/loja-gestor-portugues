import { useState } from "react";
import { useAdminReportsData } from "./hooks/useAdminReportsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Package, BarChart3, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function ReportsDashboard() {
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(new Date(`${currentYear}-01-01`));
  const [endDate, setEndDate] = useState(new Date());

  const { data, isLoading, isError } = useAdminReportsData({ startDate, endDate });

  const exportPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Aqua Paraíso", 20, yPos);
    yPos += 8;

    doc.setFontSize(16);
    doc.text("Relatório Administrativo", 20, yPos);
    yPos += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Período: ${format(startDate, "dd/MM/yyyy", { locale: pt })} até ${format(endDate, "dd/MM/yyyy", { locale: pt })}`, 20, yPos);
    yPos += 5;
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}`, 20, yPos);
    yPos += 15;

    // Financial Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Financeiro", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Vendas: ${formatCurrency(data.financial.totalSales)}`, 25, yPos);
    yPos += 6;
    doc.text(`Total de Despesas: ${formatCurrency(data.financial.totalExpenses)}`, 25, yPos);
    yPos += 6;
    doc.text(`Lucro Líquido: ${formatCurrency(data.financial.netProfit)}`, 25, yPos);
    yPos += 6;
    doc.text(`Margem Média: ${data.financial.averageMargin.toFixed(1)}%`, 25, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const salesTrend = data.financial.salesVariation >= 0 ? "aumentaram" : "diminuíram";
    doc.text(`As vendas ${salesTrend} ${Math.abs(data.financial.salesVariation).toFixed(1)}% face ao período anterior.`, 25, yPos);
    yPos += 12;

    // Client Analysis
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Análise de Clientes", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Clientes Novos: ${data.clients.newClients}`, 25, yPos);
    yPos += 6;
    doc.text(`Recorrentes: ${data.clients.recurrentClients}`, 25, yPos);
    yPos += 6;
    doc.text(`Inativos: ${data.clients.inactiveClients}`, 25, yPos);
    yPos += 6;
    doc.text(`Ativos no Período: ${data.clients.activeClients}`, 25, yPos);
    yPos += 12;

    // Product Analysis
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Produtos e Rentabilidade", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (data.products.topProducts.length > 0) {
      doc.text(`Produto Mais Vendido: ${data.products.topProducts[0].product_name} (${formatCurrency(data.products.topProducts[0].total_revenue)})`, 25, yPos);
      yPos += 6;
    }
    if (data.products.highestMargin) {
      doc.text(`Maior Margem: ${data.products.highestMargin.name} (${data.products.highestMargin.margin}%)`, 25, yPos);
      yPos += 6;
    }
    if (data.products.lowestRotation) {
      doc.text(`Menor Rotatividade: ${data.products.lowestRotation.name} (${formatCurrency(data.products.lowestRotation.revenue)})`, 25, yPos);
      yPos += 12;
    }

    // KPIs
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Indicadores de Gestão", 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Encomendas: ${data.kpis.totalOrders}`, 25, yPos);
    yPos += 6;
    doc.text(`Ticket Médio: ${formatCurrency(data.kpis.averageTicket)}`, 25, yPos);
    yPos += 6;
    doc.text(`Clientes Ativos: ${data.kpis.totalActiveClients}`, 25, yPos);
    yPos += 6;
    doc.text(`Média de Produtos por Encomenda: ${data.kpis.averageItemsPerOrder.toFixed(1)}`, 25, yPos);

    doc.save(`relatorio_administrativo_${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}.pdf`);
    toast.success("Relatório exportado com sucesso!");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Relatórios Administrativos"
          description="Análise interpretativa para gestão"
        />
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-40 bg-muted/20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatórios Administrativos" />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Erro ao carregar dados. Por favor, tente novamente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { financial, clients, products, kpis } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/3841c0e4-f3de-4811-a15b-404f0ea98932.png" 
            alt="Aqua Paraíso Logo" 
            className="h-12 w-auto"
          />
          <div>
            <PageHeader
              title="Relatórios Administrativos"
              description="Análise interpretativa consolidada para gestão"
            />
          </div>
        </div>
        <Button onClick={exportPDF} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Exportar PDF
        </Button>
      </div>

      {/* Period Filters */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Período de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-foreground">Data Início</label>
              <input
                type="date"
                className="w-full border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={format(startDate, "yyyy-MM-dd")}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-foreground">Data Fim</label>
              <input
                type="date"
                className="w-full border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={format(endDate, "yyyy-MM-dd")}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Relatório gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">💰 Total de Vendas</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(financial.totalSales)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">💸 Total de Despesas</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(financial.totalExpenses)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">📈 Lucro Líquido</p>
              <p className={`text-2xl font-bold ${financial.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financial.netProfit)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">🧾 Margem Média</p>
              <p className="text-2xl font-bold text-foreground">{financial.averageMargin.toFixed(1)}%</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              {financial.salesVariation >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Análise Comparativa</p>
                <p className="text-sm text-muted-foreground">
                  As vendas {financial.salesVariation >= 0 ? "aumentaram" : "diminuíram"}{" "}
                  <span className={`font-semibold ${financial.salesVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(financial.salesVariation).toFixed(1)}%
                  </span>{" "}
                  face ao período anterior, {financial.salesVariation >= 0 ? "demonstrando" : "indicando"} {financial.salesVariation >= 0 ? "crescimento" : "retração"} nas operações comerciais.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Analysis */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Análise de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">👥 Clientes Novos</p>
              <p className="text-2xl font-bold text-foreground">{clients.newClients}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">🔁 Recorrentes</p>
              <p className="text-2xl font-bold text-foreground">{clients.recurrentClients}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">⚠️ Inativos</p>
              <p className="text-2xl font-bold text-orange-600">{clients.inactiveClients}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">✅ Ativos no Período</p>
              <p className="text-2xl font-bold text-green-600">{clients.activeClients}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Interpretação</p>
                <p className="text-sm text-muted-foreground">
                  O número de clientes recorrentes ({clients.recurrentClients}) mantém-se {clients.recurrentClients > clients.newClients ? "superior" : "inferior"} aos novos clientes ({clients.newClients}), 
                  o que {clients.recurrentClients > clients.newClients ? "demonstra fidelização da base de clientes" : "indica oportunidade para melhorar a retenção"}. 
                  {clients.inactiveClients > 0 && ` Existem ${clients.inactiveClients} clientes inativos que podem ser reativados através de campanhas direcionadas.`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products and Profitability */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Produtos e Rentabilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.topProducts.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">🏆 Produto Mais Vendido</p>
                <p className="text-lg font-bold text-foreground">{products.topProducts[0].product_name}</p>
                <p className="text-sm text-primary font-semibold">{formatCurrency(products.topProducts[0].total_revenue)}</p>
              </div>
            )}
            {products.highestMargin && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">📈 Maior Margem</p>
                <p className="text-lg font-bold text-foreground">{products.highestMargin.name}</p>
                <p className="text-sm text-green-600 font-semibold">{products.highestMargin.margin}%</p>
              </div>
            )}
            {products.lowestRotation && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">🐢 Menor Rotatividade</p>
                <p className="text-lg font-bold text-foreground">{products.lowestRotation.name}</p>
                <p className="text-sm text-orange-600 font-semibold">{formatCurrency(products.lowestRotation.revenue)}</p>
              </div>
            )}
          </div>

          {products.topProducts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Top 5 Produtos por Receita</h4>
              <div className="space-y-2">
                {products.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">{index + 1}</span>
                      <div>
                        <p className="font-medium text-foreground">{product.product_name}</p>
                        <p className="text-sm text-muted-foreground">{product.total_quantity} unidades vendidas</p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary">{formatCurrency(product.total_revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <ShoppingBag className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Análise de Produtos</p>
                <p className="text-sm text-muted-foreground">
                  {products.topProducts.length > 0 && (
                    <>
                      Os produtos com maior impacto no volume de vendas foram{" "}
                      <span className="font-semibold">{products.topProducts[0]?.product_name}</span>
                      {products.topProducts[1] && (
                        <> e <span className="font-semibold">{products.topProducts[1]?.product_name}</span></>
                      )}, representando juntos{" "}
                      {products.topProducts.length >= 2 
                        ? ((products.topProducts[0].total_revenue + products.topProducts[1].total_revenue) / financial.totalSales * 100).toFixed(0)
                        : (products.topProducts[0].total_revenue / financial.totalSales * 100).toFixed(0)
                      }% do total de vendas.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Indicators */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Indicadores de Gestão (KPIs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">📦 Encomendas</p>
              <p className="text-2xl font-bold text-foreground">{kpis.totalOrders}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">📊 Ticket Médio</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(kpis.averageTicket)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">👤 Clientes Ativos</p>
              <p className="text-2xl font-bold text-foreground">{kpis.totalActiveClients}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">📦 Itens/Encomenda</p>
              <p className="text-2xl font-bold text-foreground">{kpis.averageItemsPerOrder.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Exportar Relatório Completo</p>
                <p className="text-sm text-muted-foreground">
                  Gere um PDF com todas as secções e análises interpretativas
                </p>
              </div>
            </div>
            <Button onClick={exportPDF} size="lg" className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
