import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ban, CheckCircle, Trash2, Shield, User, Users, History, ChevronDown } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UserWithRole } from '@/hooks/queries/useUsersWithRoles';
import { useUserSuspensionHistory } from '@/hooks/queries/useUserSuspensionHistory';
import { useUserAuthInfo } from '@/hooks/queries/useUserAuthInfo';
import { useUserLastActivity } from '@/hooks/queries/useUserActivity';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, MapPin, Smartphone } from 'lucide-react';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { UserAuditHistory } from '@/components/admin/UserAuditHistory';

interface UserRowProps {
  user: UserWithRole;
  isCurrentUser: boolean;
  isOwner: boolean;
  isUpdating: boolean;
  onRoleChange: (userId: string, userName: string, newRole: 'admin' | 'editor' | 'viewer') => void;
  onSuspend: (userId: string, userName: string, currentlySuspended: boolean) => void;
  onDelete: (userId: string, userName: string) => void;
  isSuspending: boolean;
  isDeleting: boolean;
}

const UserRow = ({
  user,
  isCurrentUser,
  isOwner,
  isUpdating,
  onRoleChange,
  onSuspend,
  onDelete,
  isSuspending,
  isDeleting,
}: UserRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: suspensionHistory } = useUserSuspensionHistory(user.id);
  const { data: authInfo } = useUserAuthInfo(user.id);
  const { data: lastActivity } = useUserLastActivity(user.id);

  const hasNeverLoggedIn = !authInfo?.lastLogin;

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

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="rounded-lg border border-border bg-card">
        {/* Main Row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar>
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground flex items-center gap-2 flex-wrap">
                {user.name || "Sem nome"}
                {user.is_suspended ? (
                  <Badge variant="destructive" className="text-xs">
                    Suspenso
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                    Ativo
                  </Badge>
                )}
                {hasNeverLoggedIn && (
                  <Badge variant="secondary" className="text-xs">
                    Nunca fez login
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
                  onRoleChange(
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
                onClick={() => onSuspend(user.id, user.name || user.email, user.is_suspended || false)}
                disabled={isSuspending}
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
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}

            {/* Expand Button */}
            {!isCurrentUser && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="border-t border-border p-4 bg-muted/30 space-y-4">
            {/* Login Information */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Informações de Login
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Último Login</p>
                    <p className="text-muted-foreground">
                      {authInfo?.lastLoginFormatted || 'Nunca'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Dispositivo</p>
                    <p className="text-muted-foreground">
                      {authInfo?.deviceType || 'Desconhecido'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Activity */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Última Atividade</h4>
              {lastActivity ? (
                <div className="text-sm">
                  <p className="text-foreground font-medium">
                    {lastActivity.action_description}
                  </p>
                  {lastActivity.entity_name && (
                    <p className="text-muted-foreground">
                      {lastActivity.entity_type}: {lastActivity.entity_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {lastActivity.formatted_time}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sem atividade registada
                </p>
              )}
            </div>

            {/* Suspension History */}
            {suspensionHistory && suspensionHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histórico de Suspensões
                </h4>
                <div className="space-y-2">
                  {suspensionHistory.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                      <Badge
                        variant={entry.action === 'suspended' ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {entry.action === 'suspended' ? 'Suspenso' : 'Reativado'}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-foreground">
                          {entry.reason || 'Sem motivo especificado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Por {entry.performer_name} •{' '}
                          {formatDistanceToNow(new Date(entry.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit History Section */}
            <div className="pt-4 border-t">
              <UserAuditHistory userId={user.id} />
            </div>
          </div>
        </CollapsibleContent>
      </div>

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userId={user.id}
        userName={user.name || user.email}
        onConfirm={() => {
          onDelete(user.id, user.name || user.email);
          setDeleteDialogOpen(false);
        }}
        isDeleting={isDeleting}
      />
    </Collapsible>
  );
};

export default UserRow;
