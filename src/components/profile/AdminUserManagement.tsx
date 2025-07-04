import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, Trash2, Shield, UserCheck, Eye } from 'lucide-react';
interface UserProfile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  access_level?: string;
  created_at: string;
}
const AdminUserManagement: React.FC = () => {
  const {
    user
  } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('user_profiles').select('*').order('created_at', {
        ascending: true // Oldest first for non-admins
      });
      if (error) throw error;

      // Sort users: admin first, then by registration date (oldest first)
      const sortedUsers = (data || []).sort((a, b) => {
        const aLevel = a.access_level || 'viewer';
        const bLevel = b.access_level || 'viewer';

        // Admin always comes first
        if (aLevel === 'admin' && bLevel !== 'admin') return -1;
        if (bLevel === 'admin' && aLevel !== 'admin') return 1;

        // For non-admin users, sort by registration date (oldest first)
        if (aLevel !== 'admin' && bLevel !== 'admin') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }

        return 0;
      });
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  };
  const handleAccessLevelChange = async (userId: string, newAccessLevel: string) => {
    try {
      const {
        error
      } = await supabase.from('user_profiles').update({
        access_level: newAccessLevel
      }).eq('user_id', userId);
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update local state and re-sort
      setUsers(prev => {
        const updatedUsers = prev.map(u => u.user_id === userId ? {
          ...u,
          access_level: newAccessLevel
        } : u);

        // Re-sort after update using same logic as fetchUsers
        return updatedUsers.sort((a, b) => {
          const aLevel = a.access_level || 'viewer';
          const bLevel = b.access_level || 'viewer';

          // Admin always comes first
          if (aLevel === 'admin' && bLevel !== 'admin') return -1;
          if (bLevel === 'admin' && aLevel !== 'admin') return 1;

          // For non-admin users, sort by registration date (oldest first)
          if (aLevel !== 'admin' && bLevel !== 'admin') {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }

          return 0;
        });
      });
      toast.success(`Nível de acesso atualizado para ${newAccessLevel}`);
    } catch (error: any) {
      console.error('Error updating access level:', error);
      toast.error(`Erro ao atualizar nível de acesso: ${error.message || 'Erro desconhecido'}`);

      // Refresh users to revert any optimistic updates
      fetchUsers();
    }
  };
  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error('Não pode remover o seu próprio utilizador');
      return;
    }
    try {
      // Delete from user_profiles first
      const {
        error: profileError
      } = await supabase.from('user_profiles').delete().eq('user_id', userId);
      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw profileError;
      }

      // Update local state
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      toast.success('Utilizador removido com sucesso');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Erro ao remover utilizador: ${error.message || 'Erro desconhecido'}`);

      // Refresh users in case of partial failure
      fetchUsers();
    }
  };
  if (loading) {
    return <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">A carregar utilizadores...</div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Configuração de Acessos
        </CardTitle>
        <CardDescription>
          Gerencie utilizadores e níveis de acesso do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map(userProfile => <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="font-medium">
                  {userProfile.name || 'Nome não definido'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {userProfile.email}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Registado em: {new Date(userProfile.created_at).toLocaleDateString('pt-PT')}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {userProfile.access_level === 'admin' ? (
                  <Badge variant="secondary" className="w-40 justify-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Badge>
                ) : (
                  <Select 
                    value={userProfile.access_level || 'viewer'} 
                    onValueChange={value => handleAccessLevelChange(userProfile.user_id, value)}
                    disabled={userProfile.access_level === 'admin'}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Editor
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Visualizador
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {userProfile.user_id !== user?.id && userProfile.access_level !== 'admin' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover utilizador</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem a certeza de que pretende remover este utilizador? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(userProfile.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>)}

          {users.length === 0 && <div className="text-center text-muted-foreground py-8">
              Nenhum utilizador encontrado
            </div>}
        </div>
      </CardContent>
    </Card>;
};
export default AdminUserManagement;