import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, FileText, Receipt, Calendar, User } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useExpenseDetail } from "./hooks/useExpenseDetail";

const ExpenseDetail = () => {
  const navigate = useNavigate();
  const { expense, isLoading } = useExpenseDetail();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size={32} />
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6">
        <PageHeader title="Despesa não encontrada" description="A despesa solicitada não foi encontrada" />
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate("/despesas/historico")}>
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Histórico
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho unificado */}
      <PageHeader
        title={`Despesa ${expense.number}`}
        description={expense.supplierName || "Detalhes da despesa"}
        actions={
          <div className="flex items-center gap-2">
            {/* PDF (vermelho Adobe) */}
            <Button
              size="sm"
              className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>

            {/* Editar */}
            <Button size="sm" onClick={() => navigate(`/despesas/editar/${expense.id}`)}>
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>

            {/* Voltar */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/despesas/historico")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        }
      />

      {/* Informação da Despesa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Itens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Itens da Despesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Preço Unitário
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Desconto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    {expense.items.map((item) => {
                      const itemTotal = item.quantity * item.unitPrice;
                      const discountAmount = itemTotal * (item.discountPercent / 100);
                      const finalTotal = itemTotal - discountAmount;
                      return (
                        <tr key={item.id} className="border-b border-border">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                            {item.productName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.quantity}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {item.discountPercent}%
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground text-right font-medium">
                            {formatCurrency(finalTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado direito - detalhes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detalhes da Despesa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Data:</span>
                <span className="text-sm font-medium text-foreground">{formatDate(expense.date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Fornecedor:</span>
                <span className="text-sm font-medium text-foreground">{expense.supplierName}</span>
              </div>

              {expense.discount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Desconto Geral:</span>
                  <Badge variant="secondary">{expense.discount}%</Badge>
                </div>
              )}

              {expense.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Notas:</span>
                  <p className="text-sm mt-1 text-foreground">{expense.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total da Despesa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(expense.total || 0)}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
