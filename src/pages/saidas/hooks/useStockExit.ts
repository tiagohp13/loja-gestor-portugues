
import { useClients } from '@/contexts/ClientsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useStock } from '@/contexts/StockContext';
import { useExitState } from './stockExit/useExitState';
import { useFilters } from './stockExit/useFilters';
import { useHandlers } from './stockExit/useHandlers';
import { useCalculations } from './stockExit/useCalculations';
import { useSubmit } from './stockExit/useSubmit';
import { StockExit } from '@/types';
import { ExitItem } from './stockExit/types';

export const useStockExit = (exitId?: string) => {
  const { clients } = useClients();
  const { products } = useProducts();
  const { addStockExit, updateStockExit } = useStock();
  
  const state = useExitState(exitId);
  
  const filters = useFilters({
    searchTerm: state.searchTerm,
    clientSearchTerm: state.clientSearchTerm
  });
  
  const handlers = useHandlers({
    exitDetails: state.exitDetails,
    setExitDetails: state.setExitDetails,
    currentItem: state.currentItem,
    setCurrentItem: state.setCurrentItem,
    items: state.items,
    setItems: state.setItems,
    setSearchTerm: state.setSearchTerm,
    setSelectedProductDisplay: state.setSelectedProductDisplay,
    setIsProductSearchOpen: state.setIsProductSearchOpen,
    setClientSearchTerm: state.setClientSearchTerm,
    setIsClientSearchOpen: state.setIsClientSearchOpen,
    products,
    clients
  });
  
  // Make sure we're passing items from state correctly to the calculations hook
  const calculations = useCalculations(state.items);
  
  // Here we ensure that addStockExit and updateStockExit match the types expected by useSubmit
  const typedAddStockExit = (exit: Omit<StockExit, "number" | "id" | "createdAt">) => {
    return addStockExit(exit);
  };
  
  const typedUpdateStockExit = (id: string, exit: Omit<StockExit, "number" | "id" | "createdAt">) => {
    // First cast to unknown, then to Promise<StockExit | void> to avoid direct casting error
    return updateStockExit(id, exit as any) as unknown as Promise<StockExit | void>;
  };
  
  const submit = useSubmit({
    exitId,
    exitDetails: state.exitDetails,
    items: state.items,
    exitDate: state.exitDate,
    addStockExit: typedAddStockExit,
    updateStockExit: typedUpdateStockExit
  });
  
  const selectedClient = clients.find(c => c.id === state.exitDetails.clientId);
  // Adicionar selectedProduct baseado no currentItem.productId
  const selectedProduct = products.find(p => p.id === state.currentItem.productId);
  
  return {
    ...state,
    ...handlers,
    ...filters,
    ...calculations,
    ...submit,
    selectedClient,
    selectedProduct,
    products,
    clients
  };
};
