
import { useData } from '@/contexts/DataContext';
import { useExitState } from './stockExit/useExitState';
import { useFilters } from './stockExit/useFilters';
import { useHandlers } from './stockExit/useHandlers';
import { useCalculations } from './stockExit/useCalculations';
import { useSubmit } from './stockExit/useSubmit';

export const useStockExit = (exitId?: string) => {
  const { clients, products, addStockExit, updateStockExit } = useData();
  
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
    setIsClientSearchOpen: state.setIsClientSearchOpen
  });
  
  const calculations = useCalculations(state.items);
  
  const submit = useSubmit({
    exitId,
    exitDetails: state.exitDetails,
    items: state.items,
    exitDate: state.exitDate,
    addStockExit,
    updateStockExit
  });
  
  const selectedClient = clients.find(c => c.id === state.exitDetails.clientId);
  
  return {
    ...state,
    ...handlers,
    ...filters,
    ...calculations,
    ...submit,
    selectedClient,
    products
  };
};
