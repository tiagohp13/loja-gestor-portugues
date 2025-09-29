import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { useDuplicateOrder } from '../hooks/useDuplicateOrder';
import { usePermissions } from '@/hooks/usePermissions';

interface DuplicateOrderButtonProps {
  orderId: string;
  orderNumber: string;
}

export function DuplicateOrderButton({ orderId, orderNumber }: DuplicateOrderButtonProps) {
  const { duplicateOrder, isLoading } = useDuplicateOrder();
  const { canCreate } = usePermissions();

  if (!canCreate) return null;

  const handleDuplicate = () => {
    duplicateOrder(orderId);
  };

  return (
    <Button
      variant="outline"
      onClick={handleDuplicate}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      Duplicar Encomenda
    </Button>
  );
}