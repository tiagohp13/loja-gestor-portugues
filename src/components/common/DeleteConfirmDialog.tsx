
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

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onDelete: () => void;
  trigger: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  title,
  description,
  onDelete,
  trigger,
  open,
  onClose,
}) => {
  const [openState, setOpenState] = useState(false);
  
  const isControlled = open !== undefined && onClose !== undefined;
  const isOpen = isControlled ? open : openState;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onClose?.();
    } else {
      setOpenState(newOpen);
    }
  };
  
  const handleDelete = () => {
    onDelete();
    if (!isControlled) {
      setOpenState(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
