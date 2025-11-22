import React, { useState } from 'react';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { useAdminUsers, useToggleSuperAdmin } from '@/hooks/admin';
import { Navigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Users, Shield, Building2, Eye } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { AdminUser } from '@/hooks/admin/useAdminUsers';

const UsersManagement: React.FC = () => {
  const { isSuperAdmin, isLoading: loadingSuperAdmin } = useIsSuperAdmin();
  const { data: users = [], isLoading } = useAdminUsers();
  const toggleSuperAdmin = useToggleSuperAdmin();
  
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleToggleSuperAdmin = async (user: AdminUser) => {
    await toggleSuperAdmin.mutateAsync({
      userId: user.user_id,
      isSuperAdmin: user.is_super_admin,
    });
  };

  if (loadingSuperAdmin) {
    return <LoadingSpinner />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Utilizadores"
        description="Gerir utilizadores e permissões globais do sistema"
      />

      <Card>
        <CardHeader>
          <CardTitle>Utilizadores do Sistema</CardTitle>
          <CardDescription>
            {users.length} utilizador{users.length !== 1 ? 'es' : ''} registado{users.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name || 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex gap-1 mt-1">
                        {user.is_super_admin && (
                          <Badge variant="default" className="text-xs gap-1">
                            <Shield className="h-3 w-3" />
                            Super Admin
                          </Badge>
                        )}
                        {user.tenants.length > 0 && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Building2 className="h-3 w-3" />
                            {user.tenants.length} organização{user.tenants.length !== 1 ? 'ões' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(user)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Utilizador</DialogTitle>
            <DialogDescription>
              Informações e permissões do utilizador
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h3 className="font-semibold mb-2">Informação Básica</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">{selectedUser.name || 'Sem nome'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                </div>
              </div>

              {/* Super Admin Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Super Administrador</div>
                    <div className="text-sm text-muted-foreground">
                      Acesso total ao sistema NEXORA
                    </div>
                  </div>
                </div>
                <Switch
                  checked={selectedUser.is_super_admin}
                  onCheckedChange={() => handleToggleSuperAdmin(selectedUser)}
                  disabled={toggleSuperAdmin.isPending}
                />
              </div>

              {/* Tenants */}
              <div>
                <h3 className="font-semibold mb-2">Organizações</h3>
                {selectedUser.tenants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Não pertence a nenhuma organização
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.tenants.map((tenant) => (
                      <div
                        key={tenant.tenant_id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{tenant.tenant_name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{tenant.role}</Badge>
                          <Badge
                            variant={tenant.status === 'active' ? 'default' : 'secondary'}
                          >
                            {tenant.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
