import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { Search, Edit, Trash2, History, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import { checkSupplierDependencies } from "@/utils/dependencyUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useSortableSuppliers } from "@/hooks/useSortableSuppliers";
import TableSkeleton from "@/components/ui/TableSkeleton";

const SupplierList = () => {
  const navigate = useNavigate();
  const { deleteSupplier } = useData();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const { suppliers, isLoading } = useSortableSuppliers();

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.phone && supplier.phone.includes(searchTerm)),
  );

  const handleViewSupplier = (id: string) => {
    navigate(`/fornecedores/${id}`);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!validatePermission(canEdit, "editar fornecedores")) return;
    navigate(`/fornecedores/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    if (!validatePermission(canDelete, "eliminar fornecedores")) return;
    deleteSupplier(id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Fornecedores" description="Consultar e gerir todos os fornecedores" />
        <TableSkeleton title="A carregar fornecedores..." rows={5} columns={5} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Fornecedores" description="Consultar e gerir todos os fornecedores" />

      {/* Header igual às outras páginas (Despesas, Saídas, Compras) */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gestorApp-blue">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Total de fornecedores: {suppliers.length}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            className="pl-10"
            placeholder="Pesquisar por nome, email ou telefone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray w-4 h-4" />
        </div>

        {canCreate && (
          <Button
            onClick={() => {
              if (!validatePermission(canCreate, "criar fornecedores")) return;
              navigate("/fornecedores/novo");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Morada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gestorApp-gray">
                    Nenhum fornecedor encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewSupplier(supplier.id)}
                  >
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.email || "-"}</TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.address || "-"}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Histórico"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/fornecedores/${supplier.id}`);
                          }}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Editar"
                            onClick={(e) => handleEdit(supplier.id, e)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <DeleteConfirmDialog
                            title="Eliminar Fornecedor"
                            description="Tem a certeza que deseja eliminar este fornecedor?"
                            onDelete={() => handleDelete(supplier.id)}
                            checkDependencies={() => checkSupplierDependencies(supplier.id)}
                            trigger={
                              <Button variant="outline" size="sm" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
