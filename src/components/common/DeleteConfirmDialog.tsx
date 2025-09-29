import React, { useState } from 'react';
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { DependencyCheck } from '@/utils/dependencyUtils';

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onDelete: () => void;
  trigger: React.ReactNode;
  checkDependencies?: () => Promise<DependencyCheck>;
  open?: boolean;
  onClose?: () => void;
  disabled?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  title,
  description,
  onDelete,
  trigger,
  checkDependencies,
  open,
  onClose,
  disabled = false
}) => {
  const [openState, setOpenState] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [dependencyCheck, setDependencyCheck] = useState<DependencyCheck | null>(null);
  
  const isControlled = open !== undefined && onClose !== undefined;
  const isOpen = isControlled ? open : openState;

  const handleOpenChange = async (newOpen: boolean) => {
    if (disabled) return;
    
    if (newOpen && checkDependencies) {
      setIsChecking(true);
      try {
        const result = await checkDependencies();
        setDependencyCheck(result);
      } catch (error) {
        console.error('Erro ao verificar dependências:', error);
        setDependencyCheck({
          canDelete: false,
          message: 'Erro ao verificar dependências. Tente novamente.'
        });
      } finally {
        setIsChecking(false);
      }
    } else if (!newOpen) {
      setDependencyCheck(null);
    }

    if (isControlled) {
      if (!newOpen) onClose?.();
    } else {
      setOpenState(newOpen);
    }
  };

  const handleConfirm = () => {
    if (!dependencyCheck || dependencyCheck.canDelete) {
      onDelete();
      if (!isControlled) {
        setOpenState(false);
      }
    }
  };

  const handleClose = () => {
    if (isControlled) {
      onClose?.();
    } else {
      setOpenState(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isChecking ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                A verificar dependências...
              </div>
            ) : dependencyCheck && !dependencyCheck.canDelete ? (
              <div className="space-y-2">
                <div className="text-red-600 font-medium">
                  {dependencyCheck.message}
                </div>
                <div className="text-sm text-muted-foreground">
                  Para eliminar este registo, deve primeiro eliminar ou modificar os registos dependentes.
                </div>
              </div>
            ) : (
              description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
          {!isChecking && (!dependencyCheck || dependencyCheck.canDelete) && (
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Eliminar
            </AlertDialogAction>
          )}
          {dependencyCheck && !dependencyCheck.canDelete && (
            <Button variant="outline" onClick={handleClose}>
              Entendido
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;