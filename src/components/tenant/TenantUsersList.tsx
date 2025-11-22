import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface TenantUser {
  id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  status: string;
  created_at: string;
  name?: string;
  email?: string;
}

export const TenantUsersList: React.FC = () => {
  const { currentTenant } = useTenant();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['tenant-users', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];

      // Buscar usuários do tenant
      const { data: tenantUsers, error: tenantError } = await supabase
        .from('tenant_users')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (tenantError) throw tenantError;

      // Buscar perfis dos usuários
      const userIds = tenantUsers.map(tu => tu.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Juntar dados
      return tenantUsers.map(tu => {
        const profile = profiles.find(p => p.user_id === tu.user_id);
        return {
          ...tu,
          name: profile?.name,
          email: profile?.email,
        } as TenantUser;
      });
    },
    enabled: !!currentTenant?.id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Utilizadores</h3>
          <p className="text-sm text-muted-foreground">
            Gerir utilizadores desta organização
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Utilizador
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum utilizador encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || 'Sem nome'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar Role</DropdownMenuItem>
                        <DropdownMenuItem>Suspender</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
