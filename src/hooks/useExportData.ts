import { toast } from "sonner";
import { ExportDataType } from "@/types";
import { useProductsQuery } from "./queries/useProducts";
import { useCategoriesQuery } from "./queries/useCategories";
import { useClientsQuery } from "./queries/useClients";
import { useSuppliersQuery } from "./queries/useSuppliers";
import { useOrdersQuery } from "./queries/useOrders";
import { useStockEntriesQuery } from "./queries/useStockEntries";
import { useStockExitsQuery } from "./queries/useStockExits";

export const useExportData = () => {
  const { products } = useProductsQuery();
  const { categories } = useCategoriesQuery();
  const { clients } = useClientsQuery();
  const { suppliers } = useSuppliersQuery();
  const { orders } = useOrdersQuery();
  const { stockEntries } = useStockEntriesQuery();
  const { stockExits } = useStockExitsQuery();

  const exportData = (type: ExportDataType) => {
    try {
      let dataToExport: any = {};

      switch (type) {
        case "products":
          dataToExport = products;
          break;
        case "categories":
          dataToExport = categories;
          break;
        case "clients":
          dataToExport = clients;
          break;
        case "suppliers":
          dataToExport = suppliers;
          break;
        case "orders":
          dataToExport = orders;
          break;
        case "stockEntries":
          dataToExport = stockEntries;
          break;
        case "stockExits":
          dataToExport = stockExits;
          break;
        case "expenses":
          dataToExport = [];
          break;
        case "all":
          dataToExport = {
            products,
            categories,
            clients,
            suppliers,
            orders,
            stockEntries,
            stockExits,
          };
          break;
        default:
          toast.error("Tipo de exportação inválido");
          return;
      }

      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `crm-${type}-backup-${timestamp}.json`;
      link.click();

      toast.success(`Exportação de ${type} concluída com sucesso!`);
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar dados");
    }
  };

  return { exportData };
};
