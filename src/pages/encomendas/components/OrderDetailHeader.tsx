
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, ShoppingCart, Pencil, X, RotateCcw } from 'lucide-react';
import { Order, StockExit, Product } from '@/types';
import { exportToPdf } from '@/utils/pdfExport';
import { DuplicateOrderButton } from './DuplicateOrderButton';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { useProducts } from '@/contexts/ProductsContext';
import { useOrders } from '@/contexts/OrdersContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface OrderDetailHeaderProps {
  order: Order;
  relatedStockExit: StockExit | null;
  orderId: string;
  orderNumber: string;
  isDeleted?: boolean;
}

const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({ order, relatedStockExit, orderId, orderNumber, isDeleted = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { products } = useProducts();
  const { convertOrderToStockExit } = useOrders();
  const isPending = !order.convertedToStockExitId;
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isStockWarningOpen, setIsStockWarningOpen] = useState(false);
  const [insufficientStockProducts, setInsufficientStockProducts] = useState<string[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvertDialog = () => {
    // Check if all products have sufficient stock before showing the dialog
    const productsWithInsufficientStock = checkStockAvailability(order, products);
    
    if (productsWithInsufficientStock.length > 0) {
      setInsufficientStockProducts(productsWithInsufficientStock);
      setIsStockWarningOpen(true);
    } else {
      setIsConvertDialogOpen(true);
    }
  };

  // Helper function to check stock availability
  const checkStockAvailability = (order: Order, productsList: Product[]): string[] => {
    const insufficientProducts: string[] = [];
    
    if (!order.items || !productsList.length) return insufficientProducts;
    
    order.items.forEach(item => {
      const product = productsList.find(p => p.id === item.productId);
      if (product && product.currentStock < item.quantity) {
        insufficientProducts.push(product.name);
      }
    });
    
    return insufficientProducts;
  };

  const handleEditOrder = () => {
    navigate(`/encomendas/editar/${order.id}`);
  };

  const handleExportToPdf = async () => {
    if (order && order.number) {
      await exportToPdf({
        filename: order.number.replace('/', '-'),
        contentSelector: '.pdf-content',
        margin: 10
      });
    }
  };

  const handleCancelOrder = async () => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: 'cancelled' })
        .eq("id", order.id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: 'Encomenda cancelada com sucesso'
      });
      
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["orders-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
      
      navigate('/encomendas/consultar');
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Erro",
        description: 'Erro ao cancelar encomenda',
        variant: "destructive"
      });
    }
  };

  const handleRestoreOrder = async () => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: 'active' })
        .eq("id", order.id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: 'Encomenda restaurada com sucesso'
      });
      
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["orders-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
      
      navigate('/encomendas/consultar');
    } catch (error) {
      console.error("Error restoring order:", error);
      toast({
        title: "Erro",
        description: 'Erro ao restaurar encomenda',
        variant: "destructive"
      });
    }
  };

  const handleConvertToStockExit = async () => {
    if (!order) {
      toast({
        title: "Erro",
        description: 'Dados da encomenda não encontrados',
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsConverting(true);
      // Use the context function to convert order to stock exit
      const result = await convertOrderToStockExit(order.id, invoiceNumber);
      
      if (result) {
        toast({
          title: "Sucesso",
          description: 'Encomenda convertida em saída de stock!'
        });
        navigate('/encomendas/consultar');
      } else {
        throw new Error('Falha na conversão da encomenda');
      }
    } catch (error) {
      console.error('Erro ao converter encomenda:', error);
      toast({
        title: "Erro",
        description: 'Erro ao converter encomenda: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
      setIsConvertDialogOpen(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`Encomenda: ${order.number}`}
        description="Detalhes da encomenda"
        actions={
          <div className="flex items-center gap-3">
            <DuplicateOrderButton orderId={orderId} orderNumber={orderNumber} />
            <Button 
              variant="outline" 
              onClick={handleExportToPdf}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-red-500" />
              PDF
            </Button>
            
            {isPending && !isDeleted && order.status !== 'cancelled' && (
              <>
                <Button
                  onClick={handleConvertDialog}
                  className="text-white bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Converter
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleEditOrder}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCancelOrder}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 border-orange-300 hover:bg-orange-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </>
            )}
            
            {order.status === 'cancelled' && !isDeleted && (
              <Button
                variant="outline"
                onClick={handleRestoreOrder}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigate('/encomendas/consultar')}
            >
              Voltar
            </Button>
          </div>
        }
      />

      {/* Stock Warning Dialog */}
      <Dialog open={isStockWarningOpen} onOpenChange={setIsStockWarningOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Insuficiente</DialogTitle>
            <DialogDescription>
              Não foi possível converter a encomenda.
              Os seguintes produtos não têm stock suficiente:
              <ul className="list-disc pl-5 mt-2">
                {insufficientStockProducts.map((product) => (
                  <li key={product} className="text-sm">{product}</li>
                ))}
              </ul>
              Por favor, verifique o stock antes de tentar novamente.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => setIsStockWarningOpen(false)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Stock Exit Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Converter Encomenda em Saída de Stock</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende converter esta encomenda em venda?
              Todos os produtos desta encomenda serão incluídos na saída de stock.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4 flex justify-between sm:justify-between">
            <Button 
              className="bg-blue-500 hover:bg-blue-600" 
              onClick={handleConvertToStockExit}
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <LoadingSpinner size={16} />
                  <span className="ml-2">A converter...</span>
                </>
              ) : (
                <>Sim</>
              )}
            </Button>
            
            <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
              Não
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderDetailHeader;
