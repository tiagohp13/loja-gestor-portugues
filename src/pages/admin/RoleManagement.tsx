import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, User, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { usePermissions } from "@/hooks/usePermissions";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import PermissionsGuide from "./PermissionsGuide";

interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: "admin" | "editor" | "viewer";
}

const RoleManagement: React.FC = () => {
  const { isAdmin, loading: permissionsLoading } = usePermissions();
  const queryClient = useQueryClient();

  // Obter lista de utilizadores com os seus roles
  const { data: users, isLoading } = useQuery({
    queryKey: ["usersWithRoles"],
    queryFn: async () => {
      // Obter perfis de utilizadores
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, name, email, avatar_url");

      if (profilesError) throw profilesError;

      // Obter roles de cada utilizador
      const usersWithRoles: UserWithRole[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .rpc("get_user_role", { _user_id: profile.user_id });

          return {
            id: profile.user_id,
            email: profile.email || "Sem email",
            name: profile.name,
            avatar_url: profile.avatar_url,
            role: roleData || "viewer",
          };
        })
      );

      return usersWithRoles;
    },
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para atualizar role de um utilizador
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "admin" | "editor" | "viewer" }) => {
      // Atualizar access_level no user_profiles (o trigger sincroniza automaticamente)
      const { error } = await supabase
        .from("user_profiles")
        .update({ access_level: newRole })
        .eq("user_id", userId);

      if (error) throw error;
      return { userId, newRole };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["usersWithRoles"] });
      toast.success(`Role atualizado para ${getRoleLabel(data.newRole)}`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar role: ${error.message}`);
    },
  });

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      editor: "Editor",
      viewer: "Visualizador",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500",
      editor: "bg-blue-500",
      viewer: "bg-gray-500",
    };
    return colors[role] || "bg-gray-500";
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" => {
    if (role === "admin") return "destructive";
    if (role === "editor") return "default";
    return "secondary";
  };

  // Redirecionar se não for admin
  if (!permissionsLoading && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (permissionsLoading || isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Gestão de Papéis"
          description="Gerir permissões e papéis dos utilizadores"
        />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleStats = users?.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Papéis"
        description="Gerir permissões e papéis dos utilizadores do sistema"
      />

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats?.admin || 0}</div>
            <p className="text-xs text-muted-foreground">Acesso total ao sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editores</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats?.editor || 0}</div>
            <p className="text-xs text-muted-foreground">Podem criar e editar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats?.viewer || 0}</div>
            <p className="text-xs text-muted-foreground">Apenas visualização</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Utilizadores */}
      <Card>
        <CardHeader>
          <CardTitle>Utilizadores do Sistema</CardTitle>
          <CardDescription>
            Altere os papéis dos utilizadores para controlar as suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum utilizador encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {user.name || "Sem nome"}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        updateUserRole.mutate({
                          userId: user.id,
                          newRole: value as "admin" | "editor" | "viewer",
                        })
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Selecionar papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matriz de Permissões Detalhada */}
      <PermissionsGuide />
    </div>
  );
};

export default RoleManagement;
