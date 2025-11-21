import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, Users, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageHeader from "@/components/ui/PageHeader";
import { usePermissions } from "@/hooks/usePermissions";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import PermissionsGuide from "./PermissionsGuide";
import { useUsersWithRoles, useRoleStats } from "@/hooks/queries/useUsersWithRoles";
import { useUpdateUserRole } from "@/hooks/mutations/useUpdateUserRole";
import { useAuth } from "@/contexts/AuthContext";
import CreateUserForm from "@/components/admin/CreateUserForm";
import { useSuspendUser, useDeleteUser } from "@/hooks/mutations/useManageUser";
import UserFilters from "./components/UserFilters";
import UserRow from "./components/UserRow";

const USERS_PER_PAGE = 20;

const RoleManagement: React.FC = () => {
  const { isAdmin, loading: permissionsLoading } = usePermissions();
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Filter users based on search term, role, and status
  const filteredUsers = useMemo(() => {
    let filtered = usersData?.users || [];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isSuspended = statusFilter === 'suspended';
      filtered = filtered.filter((user) => (user.is_suspended || false) === isSuspended);
    }

    return filtered;
  }, [usersData?.users, searchTerm, roleFilter, statusFilter]);

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

  const totalPages = usersData?.totalPages || 1;
  const totalCount = usersData?.totalCount || 0;
  const OWNER_EMAIL = 'tiagohp13@hotmail.com';

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
          {/* Filters */}
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum utilizador encontrado</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filteredUsers.map((user) => {
                  const isUpdating = updatingUserId === user.id;
                  const isCurrentUser = currentUser?.id === user.id;
                  const isOwner = user.email === OWNER_EMAIL;
                  
                  return (
                    <UserRow
                      key={user.id}
                      user={user}
                      isCurrentUser={isCurrentUser}
                      isOwner={isOwner}
                      isUpdating={isUpdating}
                      onRoleChange={handleRoleChange}
                      onSuspend={handleSuspendUser}
                      onDelete={handleDeleteUser}
                      isSuspending={suspendUser.isPending}
                      isDeleting={deleteUser.isPending}
                    />
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
