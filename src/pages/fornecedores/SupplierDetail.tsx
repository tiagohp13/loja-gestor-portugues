import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupplierTotalSpent } from "@/integrations/supabase/client";
import { useSupplierDetail } from "./hooks/useSupplierDetail";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarClock, MapPin, Mail, Phone, FileText, CreditCard, AlertCircle, ArrowLeft, Pencil } from "lucide-react";
import { formatDateString, formatCurrency } from "@/utils/formatting";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supplier, supplierEntries, supplierExpenses, isLoading, isDeleted } = useSupplierDetail();

  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isLoadingTotal, setIsLoadingTotal] = useState(true);
  const [supplierDocuments, setSupplierDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchSupplierData = async () => {
      if (id) {
        setIsLoadingTotal(true);
        try {
          const spent = await getSupplierTotalSpent(id);
          setTotalSpent(spent);
        } catch (error) {
          console.error("Error fetching supplier total spent:", error);
        } finally {
          setIsLoadingTotal(false);
        }
      }
    };

    fetchSupplierData();
  }, [id]);

  useEffect(() => {
    if (!isLoading && supplierEntries && supplierExpenses) {
      const allDocuments = [
        ...supplierEntries.map((entry) => ({
          ...entry,
          type: "Compra",
          value: entry.value || 0,
        })),
        ...supplierExpenses.map((expense) => ({
          ...expense,
          type: "Despesa",
          value: expense.value || 0,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setSupplierDocuments(allDocuments);
    }
  }, [isLoading, supplierEntries, supplierExpenses]);

  if (isLoading) return <LoadingSpinner />;

  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Fornecedor não encontrado</h1>
        <Button
          variant="outline"
          className="mt-4 flex items-center gap-2"
          onClick={() => navigate("/fornecedores/consultar")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={supplier.name}
        description="Detalhes do fornecedor"
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
            {!isDeleted && (
              <Button size="sm" onClick={() => navigate(`/fornecedores/editar/${id}`)}>
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}

            {/* Voltar à Lista */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/fornecedores/consultar")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à Lista
            </Button>
          </div>
        }
      />

      {isDeleted && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Este registo foi apagado e está em modo de leitura apenas.</AlertDescription>
        </Alert>
      )}

      {/* Informação principal */}
      <div className="grid md:grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Informações do Fornecedor</span>
              <StatusBadge status={supplier.status || "active"} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p>{supplier.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Gasto</p>
                {isLoadingTotal ? (
                  <p>A carregar...</p>
                ) : (
                  <p className="font-semibold text-blue-600">{formatCurrency(totalSpent)}</p>
                )}
              </div>
            </div>

            {supplier.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">E-mail</p>
                  <p>{supplier.email}</p>
                </div>
              </div>
            )}

            {supplier.phone && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p>{supplier.phone}</p>
                </div>
              </div>
            )}

            {supplier.taxId && (
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">NIF</p>
                  <p>{supplier.taxId}</p>
                </div>
              </div>
            )}

            {supplier.paymentTerms && (
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Condições de Pagamento</p>
                  <p>{supplier.paymentTerms}</p>
                </div>
              </div>
            )}

            {supplier.notes && (
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Notas</p>
                  <p className="whitespace-pre-line">{supplier.notes}</p>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <CalendarClock className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                <p>{formatDateString(supplier.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentos */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Documentos ({supplierDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {supplierDocuments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierDocuments.map((doc) => (
                    <TableRow
                      key={`${doc.type}-${doc.id}`}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        if (doc.type === "Compra") {
                          navigate(`/entradas/${doc.id}`);
                        } else {
                          navigate(`/despesas/${doc.id}`);
                        }
                      }}
                    >
                      <TableCell className="text-primary hover:underline">{doc.number}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            doc.type === "Compra" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {doc.type}
                        </span>
                      </TableCell>
                      <TableCell>{formatDateString(doc.date)}</TableCell>
                      <TableCell>{formatCurrency(doc.value || 0)}</TableCell>
                      <TableCell>
                        <StatusBadge status={doc.status || "active"} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{doc.notes || doc.invoice_number || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum documento encontrado para este fornecedor.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDetail;
