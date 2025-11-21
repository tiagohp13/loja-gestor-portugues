import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ClientInfoCard from "./components/ClientInfoCard";
import ClientHistoryStats from "./components/ClientHistoryStats";
import ClientOrdersTable from "./components/ClientOrdersTable";
import ClientExitsTable from "./components/ClientExitsTable";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import { useClientDetail } from "./hooks/useClientDetail";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Pencil, ArrowLeft } from "lucide-react";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client, clientOrders, clientExits, isLoading, isDeleted } = useClientDetail();
  const { canEdit } = usePermissions();

  if (isLoading) return <LoadingSpinner />;

  if (!client) {
    return (
      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
        <Button
          variant="outline"
          className="mt-4 flex items-center gap-2"
          onClick={() => navigate("/clientes/consultar")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <PageHeader
        title={client.name}
        description="Detalhes do cliente"
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
            {canEdit && !isDeleted && (
              <Button
                size="sm"
                onClick={() => {
                  if (!validatePermission(canEdit, "editar clientes")) return;
                  navigate(`/clientes/editar/${id}`);
                }}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}

            {/* Voltar à Lista */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/clientes/consultar")}
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

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <ClientInfoCard client={client} totalSpent={client.totalSpent || 0} isLoadingTotal={false} />
        <ClientHistoryStats ordersCount={clientOrders?.length || 0} exitsCount={clientExits?.length || 0} />
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Encomendas</h3>
        <ClientOrdersTable orders={clientOrders || []} />
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Histórico de Saídas</h3>
        <ClientExitsTable exits={clientExits || []} />
      </div>
    </div>
  );
};

export default ClientDetail;
