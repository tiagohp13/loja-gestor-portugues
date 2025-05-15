
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, ShoppingCart, Pencil } from 'lucide-react';
import { Order, StockExit } from '@/types';
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
  const { convertOrderToStockExit } = useData();
  const isPending = !order.convertedToStockExitId;
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvertDialog = () => {
    setIsConvertDialogOpen(true);
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
            <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
              Não
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600" 
              onClick={handleConvertToStockExit}
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">A converter...</span>
                </>
              ) : (
                <>Sim</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderDetailHeader;
