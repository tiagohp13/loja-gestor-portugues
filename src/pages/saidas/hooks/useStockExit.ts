
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { StockExit, StockExitItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useData } from '@/contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';
import { useExitState } from './stockExit/useExitState';
import { useFilters } from './stockExit/useFilters';
import { useHandlers } from './stockExit/useHandlers';
import { useCalculations } from './stockExit/useCalculations';

export const useStockExit = (exitId?: string) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addStockExit, updateStockExit, deleteStockExit, products, clients } = useData();
  
  // Use all the necessary hooks to get the exit state
  const exitState = useExitState(exitId);
  
  // Pass the necessary props to the filters hook
  const filters = useFilters({
    products,
    clients,
    searchTerm: exitState.searchTerm,
    clientSearchTerm: exitState.clientSearchTerm
  });
  
  // Pass the necessary props to the handlers hook
  const handlers = useHandlers({
    exitDetails: exitState.exitDetails,
    setExitDetails: exitState.setExitDetails,
    currentItem: exitState.currentItem,
    setCurrentItem: exitState.setCurrentItem,
    items: exitState.items,
    setItems: exitState.setItems,
    setSearchTerm: exitState.setSearchTerm,
    setSelectedProductDisplay: exitState.setSelectedProductDisplay,
    setIsProductSearchOpen: exitState.setIsProductSearchOpen,
    setClientSearchTerm: exitState.setClientSearchTerm,
    setIsClientSearchOpen: exitState.setIsClientSearchOpen,
    products,
    clients
  });
  
  // Use the calculations hook
  const calculations = useCalculations(exitState.items);
  
  // Get the selected client and product
  const selectedClient = clients.find(c => c.id === exitState.exitDetails.clientId) || null;
  const selectedProduct = products.find(p => p.id === exitState.currentItem.productId) || null;
  
  // Calculate discounted price
  const getDiscountedPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent) return price;
    const discount = price * (discountPercent / 100);
    return price - discount;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!exitState.exitDetails.clientId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente",
        variant: "destructive"
      });
      return;
    }

    if (exitState.items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Iniciando processo de salvamento de venda");

      // Obter o ano da data de venda
      const exitYear = exitState.exitDate.getFullYear();
      
      // Gerar número de venda usando a função de contador por ano
      const { data: exitNumber, error: numberError } = await supabase.rpc('get_next_counter_by_year', {
        counter_id: 'exit',
        target_year: exitYear
      });
      
      if (numberError) {
        console.error("Erro ao gerar número de venda:", numberError);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da venda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Mapear itens para um formato adequado para salvar
      const stockExitItems = exitState.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent || 0
      }));

      // Criar objeto de venda
      const stockExit = {
        clientId: exitState.exitDetails.clientId,
        clientName: selectedClient ? selectedClient.name : exitState.exitDetails.clientName,
        date: exitState.exitDate.toISOString(),
        notes: exitState.exitDetails.notes,
        items: stockExitItems,
        number: exitNumber
      };

      console.log("Dados da venda a serem salvos:", stockExit);

      try {
        // Salvar a venda com base em se é uma nova venda ou uma atualização
        let savedExit;
        
        if (exitId) {
          // Atualizar venda existente
          savedExit = await updateStockExit(exitId, stockExit);
          console.log("Venda atualizada com sucesso:", savedExit);
        } else {
          // Criar nova venda
          savedExit = await addStockExit(stockExit);
          console.log("Venda criada com sucesso:", savedExit);
        }
        
        // Mostrar mensagem de sucesso
        toast({
          title: "Sucesso",
          description: `Venda ${savedExit?.number || ''} guardada com sucesso`,
          variant: "default"
        });
        
        // Navegar para a lista de vendas
        navigate('/saidas/historico');
      } catch (saveError) {
        console.error("Erro ao salvar venda:", saveError);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao guardar a venda: " + (saveError instanceof Error ? saveError.message : "Erro desconhecido"),
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Erro durante o processo de envio de venda:", error);
      toast({
        title: "Erro", 
        description: "Ocorreu um erro ao guardar a venda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteExit = async (id: string) => {
    try {
      setIsSubmitting(true);
      await deleteStockExit(id);
      toast({
        title: "Sucesso",
        description: "Venda removida com sucesso",
        variant: "default"
      });
      navigate('/saidas/historico');
    } catch (error) {
      console.error("Erro ao remover venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover a venda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return {
    // Exit state
    exitDetails: exitState.exitDetails,
    items: exitState.items,
    currentItem: exitState.currentItem,
    setCurrentItem: exitState.setCurrentItem,
    searchTerm: exitState.searchTerm,
    setSearchTerm: exitState.setSearchTerm,
    selectedProductDisplay: exitState.selectedProductDisplay,
    isProductSearchOpen: exitState.isProductSearchOpen,
    setIsProductSearchOpen: exitState.setIsProductSearchOpen,
    clientSearchTerm: exitState.clientSearchTerm,
    setClientSearchTerm: exitState.setClientSearchTerm,
    isClientSearchOpen: exitState.isClientSearchOpen,
    setIsClientSearchOpen: exitState.setIsClientSearchOpen,
    exitDate: exitState.exitDate,
    setExitDate: exitState.setExitDate,
    calendarOpen: exitState.calendarOpen,
    setCalendarOpen: exitState.setCalendarOpen,
    
    // Handlers
    handleExitDetailsChange: handlers.handleExitDetailsChange,
    handleSearch: handlers.handleSearch,
    handleClientSearch: handlers.handleClientSearch,
    handleProductSelect: handlers.handleProductSelect,
    handleClientSelect: handlers.handleClientSelect,
    addItemToExit: handlers.addItemToExit,
    removeItem: handlers.removeItem,
    updateItem: handlers.updateItem,
    
    // Calculations
    getDiscountedPrice,
    totalValue: calculations.totalValue,
    
    // Filters
    filteredProducts: filters.filteredProducts,
    filteredClients: filters.filteredClients,
    
    // Selected items
    selectedClient,
    selectedProduct,
    
    // Data
    products,
    clients,
    
    // Submit
    handleSubmit,
    isSubmitting,
    handleDeleteExit,
    
    // Navigation
    navigate
  };
};
