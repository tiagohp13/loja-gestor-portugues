import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStats } from '@/hooks/queries/useUserStats';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteUserDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
  onConfirm,
  isDeleting = false,
}: DeleteUserDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const { data: stats, isLoading } = useUserStats(userId);

  const isConfirmValid = confirmText.trim().toUpperCase() === 'ELIMINAR';

  const handleConfirm = () => {
    if (isConfirmValid) {
      onConfirm();
      setConfirmText('');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Utilizador</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Tem a certeza que deseja eliminar permanentemente o utilizador{' '}
                <span className="font-semibold">{userName}</span>?
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                stats && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Vendas associadas:</span> {stats.totalSales}
                        </p>
                        <p>
                          <span className="font-medium">Compras associadas:</span>{' '}
                          {stats.totalPurchases}
                        </p>
                        <p>
                          <span className="font-medium">Encomendas criadas:</span>{' '}
                          {stats.totalOrders}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )
              )}

              <Alert variant="destructive">
                <AlertDescription className="text-xs">
                  Esta ação é irreversível. Todos os dados do utilizador serão permanentemente
                  eliminados.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirm-delete">
                  Digite <span className="font-bold">ELIMINAR</span> para confirmar:
                </Label>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="font-mono"
                  autoComplete="off"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A eliminar...
              </>
            ) : (
              'Eliminar Utilizador'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
