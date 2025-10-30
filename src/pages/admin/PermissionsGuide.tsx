import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

/**
 * Componente que mostra uma matriz de permissões por papel
 */
const PermissionsGuide: React.FC = () => {
  const permissions = [
    { category: "Produtos", actions: ["Visualizar", "Criar", "Editar", "Eliminar"] },
    { category: "Categorias", actions: ["Visualizar", "Criar", "Editar", "Eliminar"] },
    { category: "Clientes", actions: ["Visualizar", "Criar", "Editar", "Eliminar"] },
    { category: "Fornecedores", actions: ["Visualizar", "Criar", "Editar", "Eliminar"] },
    { category: "Encomendas", actions: ["Visualizar", "Criar", "Editar", "Eliminar"] },
    { category: "Compras", actions: ["Visualizar", "Criar", "Editar", "Eliminar"] },
    { category: "Vendas", actions: ["Visualizar", "Criar", "Editar", "Eliminar"] },
    { category: "Despesas", actions: ["Visualizar", "Criar", "Editar", "Eliminar"] },
    { category: "Utilizadores", actions: ["Gerir"] },
    { category: "Configurações", actions: ["Gerir"] },
  ];

  const hasPermission = (role: string, action: string) => {
    if (role === "admin") return true;
    if (role === "editor") return !["Eliminar", "Gerir"].includes(action);
    if (role === "viewer") return action === "Visualizar";
    return false;
  };

  const roles = [
    { id: "admin", label: "Admin", variant: "destructive" as const },
    { id: "editor", label: "Editor", variant: "default" as const },
    { id: "viewer", label: "Visualizador", variant: "secondary" as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permissões</CardTitle>
        <CardDescription>
          Tabela completa das permissões atribuídas a cada papel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-foreground">Recurso</th>
                <th className="text-left p-3 font-medium text-foreground">Ação</th>
                {roles.map((role) => (
                  <th key={role.id} className="text-center p-3">
                    <Badge variant={role.variant}>{role.label}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) =>
                perm.actions.map((action, actionIdx) => (
                  <tr
                    key={`${idx}-${actionIdx}`}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    {actionIdx === 0 && (
                      <td
                        className="p-3 font-medium text-foreground"
                        rowSpan={perm.actions.length}
                      >
                        {perm.category}
                      </td>
                    )}
                    <td className="p-3 text-sm text-muted-foreground">{action}</td>
                    {roles.map((role) => (
                      <td key={role.id} className="text-center p-3">
                        {hasPermission(role.id, action) ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsGuide;
