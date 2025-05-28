import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, ShoppingCart, Pencil } from 'lucide-react';
import { Order, StockExit, Product } from '@/types';
import { exportToPdf } from '@/utils/pdfExport';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface OrderDetailHeaderProps {
  order: Order;
  relatedStockExit: StockExit | null;
}

const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({ order, relatedStockExit }) => {
  const navigate = useNavigate();
  const { convertOrderToStockExit, products, clients } = useData();
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
    if (order) {
      // Find the client
      const client = clients.find(c => c.id === order.clientId);
      const clientWithAddress = client ? {
        ...client,
        address: client.address ? {
          street: client.address,
          postalCode: '',
          city: ''
        } : undefined
      } : undefined;

      // Calculate total value
      const totalValue = order.items?.reduce((acc, item) => acc + (item.quantity * item.salePrice), 0) || 0;

      await exportToPdf({
        filename: order.number.replace('/', '-'),
        order,
        client: clientWithAddress,
        totalValue
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
          <>
            <Button 
              variant="outline" 
              onClick={handleExportToPdf}
            >
              <FileText className="h-4 w-4 text-red-500" />
              Exportar para PDF
            </Button>
            
            {isPending && (
              <Button
                onClick={handleConvertDialog}
                className="text-white bg-blue-500 hover:bg-blue-600"
              >
                <ShoppingCart className="h-4 w-4" />
                Converter para Venda
              </Button>
            )}
            
            {isPending && (
              <Button
                variant="secondary"
                onClick={handleEditOrder}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigate('/encomendas/consultar')}
            >
              Voltar à Lista
            </Button>
          </>
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
                {insufficientStockProducts.map((product, index) => (
                  <li key={index} className="text-sm">{product}</li>
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
