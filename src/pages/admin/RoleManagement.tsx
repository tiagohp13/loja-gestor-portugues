import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User, Users, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageHeader from "@/components/ui/PageHeader";
import { usePermissions } from "@/hooks/usePermissions";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import PermissionsGuide from "./PermissionsGuide";
import { useUsersWithRoles, useRoleStats } from "@/hooks/queries/useUsersWithRoles";
import { useUpdateUserRole } from "@/hooks/mutations/useUpdateUserRole";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import CreateUserForm from "@/components/admin/CreateUserForm";
import { useSuspendUser, useDeleteUser } from "@/hooks/mutations/useManageUser";
import { Ban, Trash2, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const USERS_PER_PAGE = 20;

const RoleManagement: React.FC = () => {
  const { isAdmin, loading: permissionsLoading } = usePermissions();
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Fetch users with roles (optimized query)
  const { 
    data: usersData, 
    isLoading: isLoadingUsers,
    error: usersError,
    refetch 
  } = useUsersWithRoles({
    page: currentPage,
    limit: USERS_PER_PAGE,
    enabled: isAdmin,
  });

  // Fetch role statistics
  const { 
    data: roleStats, 
    isLoading: isLoadingStats 
  } = useRoleStats();

  // Update user role mutation
  const updateUserRole = useUpdateUserRole({
    onSuccess: () => {
      setUpdatingUserId(null);
      refetch();
    },
    onError: () => {
      setUpdatingUserId(null);
    },
  });

  // Suspend/reactivate user mutation
  const suspendUser = useSuspendUser();

  // Delete user mutation
  const deleteUser = useDeleteUser();

  const handleSuspendUser = (userId: string, userName: string, currentlySuspended: boolean) => {
    suspendUser.mutate({
      userId,
      suspend: !currentlySuspended,
      userName,
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    deleteUser.mutate({ userId, userName });
  };

  const handleRoleChange = (userId: string, userName: string, newRole: 'admin' | 'editor' | 'viewer') => {
    setUpdatingUserId(userId);
    updateUserRole.mutate({ userId, newRole, userName });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      editor: "Editor",
      viewer: "Visualizador",
    };
    return labels[role] || role;
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" => {
    if (role === "admin") return "destructive";
    if (role === "editor") return "default";
    return "secondary";
  };

  // Redirect if not admin
  if (!permissionsLoading && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Loading state
  if (permissionsLoading || isLoadingUsers) {
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

  // Error state
  if (usersError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Gestão de Papéis"
          description="Gerir permissões e papéis dos utilizadores"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar utilizadores. Por favor, tente novamente.
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="ml-4"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;
  const totalCount = usersData?.totalCount || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Papéis"
        description="Gerir permissões e papéis dos utilizadores do sistema"
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{roleStats?.admin || 0}</div>
                <p className="text-xs text-muted-foreground">Acesso total ao sistema</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editores</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{roleStats?.editor || 0}</div>
                <p className="text-xs text-muted-foreground">Podem criar e editar</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{roleStats?.viewer || 0}</div>
                <p className="text-xs text-muted-foreground">Apenas visualização</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Utilizadores do Sistema</CardTitle>
          <CardDescription>
            Altere os papéis dos utilizadores para controlar as suas permissões.
            Não pode alterar o seu próprio papel por motivos de segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum utilizador encontrado</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {users.map((user) => {
                  const isUpdating = updatingUserId === user.id;
                  const isCurrentUser = currentUser?.id === user.id;
                  const OWNER_EMAIL = 'tiagohp13@hotmail.com';
                  const isOwner = user.email === OWNER_EMAIL;
                  
                  return (
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
                          <p className="font-medium text-foreground flex items-center gap-2">
                            {user.name || "Sem nome"}
                            {user.is_suspended && (
                              <Badge variant="destructive" className="text-xs">
                                Suspenso
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                          {isOwner && <Shield className="h-3 w-3 ml-1" />}
                        </Badge>
                        {isCurrentUser ? (
                          <div className="w-[180px] text-sm text-muted-foreground text-center">
                            Não pode alterar o seu próprio papel
                          </div>
                        ) : isOwner ? (
                          <div className="w-[180px] text-sm text-muted-foreground text-center">
                            Administrador Principal
                          </div>
                        ) : (
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              handleRoleChange(
                                user.id,
                                user.name || user.email,
                                value as "admin" | "editor" | "viewer"
                              )
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-[180px]">
                              {isUpdating ? (
                                <div className="flex items-center gap-2">
                                  <LoadingSpinner />
                                  <span>A atualizar...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder="Selecionar papel" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-red-500" />
                                  <span>Administrador</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="editor">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-500" />
                                  <span>Editor</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>Visualizador</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {/* Suspend/Reactivate Button */}
                        {!isCurrentUser && !isOwner && (
                          <Button
                            variant={user.is_suspended ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSuspendUser(user.id, user.name || user.email, user.is_suspended || false)}
                            disabled={suspendUser.isPending}
                          >
                            {user.is_suspended ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Reativar
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Suspender
                              </>
                            )}
                          </Button>
                        )}

                        {/* Delete Button */}
                        {!isCurrentUser && !isOwner && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteUser.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Utilizador</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem a certeza de que pretende eliminar permanentemente {user.name || user.email}?
                                  Esta ação não pode ser revertida e todos os dados do utilizador serão removidos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar Permanentemente
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} • Total: {totalCount} utilizadores
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Form */}
      <CreateUserForm onSuccess={() => refetch()} />

      {/* Permissions Guide */}
      <PermissionsGuide />
    </div>
  );
};

export default RoleManagement;
