import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, MapPin, Clock, X, Power } from 'lucide-react';
import { useActiveSessions } from '@/hooks/queries/useActiveSessions';
import { useTerminateSession } from '@/hooks/mutations/useTerminateSession';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ActiveSessionsSectionProps {
  userId: string;
}

export const ActiveSessionsSection: React.FC<ActiveSessionsSectionProps> = ({ userId }) => {
  const { data: sessions, isLoading } = useActiveSessions(userId);
  const terminateSession = useTerminateSession();

  const handleTerminateAll = () => {
    terminateSession.mutate({ userId, terminateAll: true });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>
            Não existem sessões ativas para este utilizador
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sessões Ativas</CardTitle>
            <CardDescription>
              {sessions.length} {sessions.length === 1 ? 'sessão ativa' : 'sessões ativas'}
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={terminateSession.isPending}>
                <Power className="h-4 w-4 mr-2" />
                Terminar Todas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Terminar todas as sessões?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá terminar todas as {sessions.length} sessões ativas deste utilizador.
                  O utilizador terá de iniciar sessão novamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleTerminateAll}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {session.device.includes('Telemóvel') ? (
                    <Smartphone className="h-5 w-5 text-primary" />
                  ) : (
                    <Monitor className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{session.device}</p>
                    <Badge variant="secondary" className="text-xs">Ativa</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(session.lastActivity), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={terminateSession.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Terminar esta sessão?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá terminar a sessão em {session.device}.
                      O utilizador terá de iniciar sessão novamente neste dispositivo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => terminateSession.mutate({ userId, terminateAll: true })}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
