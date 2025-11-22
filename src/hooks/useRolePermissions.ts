import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook para obter o role e permissões do utilizador atual
 * Usa o sistema RBAC do Supabase com funções SECURITY DEFINER
 */
export function useRolePermissions() {
  const { user } = useAuth();

  const { data: userRole, isLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('🔑 useRolePermissions: Carregando role para:', user.email);
      
      // Usar a função SECURITY DEFINER para obter o role do utilizador
      const { data, error } = await supabase
        .rpc("get_user_role", { _user_id: user.id });
      
      if (error) {
        console.error("❌ Erro ao obter role:", error);
        return null;
      }
      
      console.log('🔑 useRolePermissions: Role obtido:', data || 'viewer');
      return data as "admin" | "editor" | "viewer" | null;
    },
    // CRÍTICO: Sem staleTime para garantir recalculo em cada sessão
    staleTime: 0,
    gcTime: 0,
  });

  /**
   * Verifica se o utilizador tem permissão específica baseada no seu role
   * 
   * @param permission - Nome da permissão a verificar
   * @returns true se o utilizador tem a permissão
   * 
   * @example
   * can("products.create") // true se admin ou editor
   * can("products.delete") // true apenas se admin
   */
  const can = (permission: string): boolean => {
    if (!userRole) return false;

    // Mapeamento de permissões por role
    const permissions: Record<string, string[]> = {
      admin: [
        // Admin tem todas as permissões
        "products.view", "products.create", "products.edit", "products.delete",
        "categories.view", "categories.create", "categories.edit", "categories.delete",
        "clients.view", "clients.create", "clients.edit", "clients.delete",
        "suppliers.view", "suppliers.create", "suppliers.edit", "suppliers.delete",
        "orders.view", "orders.create", "orders.edit", "orders.delete",
        "stock.view", "stock.create", "stock.edit", "stock.delete",
        "expenses.view", "expenses.create", "expenses.edit", "expenses.delete",
        "users.manage", "settings.manage", "reports.view"
      ],
      editor: [
        // Editor pode criar e editar, mas não eliminar
        "products.view", "products.create", "products.edit",
        "categories.view", "categories.create", "categories.edit",
        "clients.view", "clients.create", "clients.edit",
        "suppliers.view", "suppliers.create", "suppliers.edit",
        "orders.view", "orders.create", "orders.edit",
        "stock.view", "stock.create", "stock.edit",
        "expenses.view", "expenses.create", "expenses.edit",
        "reports.view"
      ],
      viewer: [
        // Viewer apenas visualiza
        "products.view",
        "categories.view",
        "clients.view",
        "suppliers.view",
        "orders.view",
        "stock.view",
        "expenses.view",
        "reports.view"
      ]
    };

    return permissions[userRole]?.includes(permission) ?? false;
  };

  /**
   * Verifica se o utilizador tem um role específico
   * 
   * @param role - Nome do role a verificar
   * @returns true se o utilizador tem o role especificado
   * 
   * @example
   * hasRole("admin") // true apenas se o utilizador for admin
   */
  const hasRole = (role: "admin" | "editor" | "viewer"): boolean => {
    return userRole === role;
  };

  /**
   * Verifica se o utilizador tem qualquer um dos roles especificados
   * 
   * @param roles - Array de roles a verificar
   * @returns true se o utilizador tem algum dos roles
   * 
   * @example
   * hasAnyRole(["admin", "editor"]) // true se admin OU editor
   */
  const hasAnyRole = (roles: ("admin" | "editor" | "viewer")[]): boolean => {
    return roles.includes(userRole as any);
  };

  return {
    role: userRole,
    roleName: userRole ? roleLabels[userRole] : "Sem papel",
    can,
    hasRole,
    hasAnyRole,
    isLoading,
    isAdmin: userRole === "admin",
    isEditor: userRole === "editor",
    isViewer: userRole === "viewer",
  };
}

// Labels amigáveis para os roles
const roleLabels: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
};
