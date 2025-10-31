import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getClientTotalSpent } from "@/integrations/supabase/client";
import ClientInfoCard from "./components/ClientInfoCard";
import ClientHistoryStats from "./components/ClientHistoryStats";
import ClientOrdersTable from "./components/ClientOrdersTable";
import ClientExitsTable from "./components/ClientExitsTable";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import { useClientDetail } from "./hooks/useClientDetail";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client, clientOrders, clientExits, isLoading, isDeleted } = useClientDetail();
  const { canEdit } = usePermissions();
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchClientData = async () => {
        setIsLoadingTotal(true);
        try {
          const spent = await getClientTotalSpent(id);
          setTotalSpent(spent);
        } catch (error) {
          console.error("Error fetching client total spent:", error);
        } finally {
          setIsLoadingTotal(false);
        }
      };

      fetchClientData();
    }
  }, [id]);

  if (isLoading) return <LoadingSpinner />;

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/clientes/consultar")}>
          Voltar à Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={client.name}
        description="Detalhes do cliente"
        actions={
          <div className="flex space-x-2">
            {canEdit && !isDeleted && (
              <Button
                onClick={() => {
                  if (!validatePermission(canEdit, "editar clientes")) return;
                  navigate(`/clientes/editar/${id}`);
                }}
              >
                Editar
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/clientes/consultar")}>
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
        <ClientInfoCard client={client} totalSpent={totalSpent} isLoadingTotal={isLoadingTotal} />

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
