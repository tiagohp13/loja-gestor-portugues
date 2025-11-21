import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserAuditLogs } from '@/hooks/queries/useUserAuditLogs';
import { Loader2, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface UserAuditHistoryProps {
  userId: string;
}

const actionLabels: Record<string, string> = {
  role_changed: 'Alteração de Papel',
  suspended: 'Suspensão',
  reactivated: 'Reativação',
  deleted: 'Eliminação',
  created: 'Criação de Utilizador',
};

const actionColors: Record<string, string> = {
  role_changed: 'text-blue-600 dark:text-blue-400',
  suspended: 'text-red-600 dark:text-red-400',
  reactivated: 'text-green-600 dark:text-green-400',
  deleted: 'text-red-700 dark:text-red-500',
  created: 'text-emerald-600 dark:text-emerald-400',
};

export const UserAuditHistory = ({ userId }: UserAuditHistoryProps) => {
  const { data: logs, isLoading } = useUserAuditLogs(userId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sem histórico de ações administrativas para este utilizador.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Auditoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/5 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${actionColors[log.action] || 'text-foreground'}`}>
                    {actionLabels[log.action] || log.action}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true,
                      locale: pt,
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Por: {log.admin_name || log.admin_email || 'Sistema'}
                </p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded p-2">
                    {Object.entries(log.details).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
