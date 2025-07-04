import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Users, Trash2, Shield } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  access_level?: string;
  created_at: string;
}

const AdminUserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessLevelChange = async (userId: string, newAccessLevel: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ access_level: newAccessLevel })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, access_level: newAccessLevel } : u
      ));
      
      toast.success('Nível de acesso atualizado');
    } catch (error) {
      console.error('Error updating access level:', error);
      toast.error('Erro ao atualizar nível de acesso');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error('Não pode remover o seu próprio utilizador');
      return;
    }

    try {
      // First delete from auth.users which will cascade to user_profiles
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.user_id !== userId));
      toast.success('Utilizador removido com sucesso');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao remover utilizador');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">A carregar utilizadores...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestão de Utilizadores
        </CardTitle>
        <CardDescription>
          Gerencie utilizadores e níveis de acesso (apenas administradores)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((userProfile) => (
            <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                <Select
                  value={userProfile.access_level || 'visualizador'}
                  onValueChange={(value) => handleAccessLevelChange(userProfile.user_id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="visualizador">Visualizador</SelectItem>
                  </SelectContent>
                </Select>

                {userProfile.user_id !== user?.id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
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
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(userProfile.user_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhum utilizador encontrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;