
import { ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StockExitItem } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { ExitDetails } from './types';

interface UseHandlersProps {
  exitDetails: ExitDetails;
  setExitDetails: React.Dispatch<React.SetStateAction<ExitDetails>>;
  currentItem: StockExitItem;
  setCurrentItem: React.Dispatch<React.SetStateAction<StockExitItem>>;
  items: StockExitItem[];
  setItems: React.Dispatch<React.SetStateAction<StockExitItem[]>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedProductDisplay: React.Dispatch<React.SetStateAction<string>>;
  setIsProductSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setClientSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setIsClientSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  products: any[]; // Adicionado para acesso direto aos produtos
  clients: any[]; // Adicionado para acesso direto aos clientes
}

export const useHandlers = ({
  exitDetails,
  setExitDetails,
  currentItem,
  setCurrentItem,
  items,
  setItems,
  setSearchTerm,
  setSelectedProductDisplay,
  setIsProductSearchOpen,
  setClientSearchTerm,
  setIsClientSearchOpen,
  products, // Adicionado
  clients // Adicionado
}: UseHandlersProps) => {
  
  const handleExitDetailsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExitDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleClientSearch = (value: string) => {
    setClientSearchTerm(value);
  };
  
  const handleProductSelect = (productId: string) => {
    // Procurar o produto pelo ID nos produtos disponíveis
    const selectedProduct = products.find(p => p.id === productId);
    
    if (selectedProduct) {
      setCurrentItem({
        id: '',
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        salePrice: selectedProduct.salePrice || 0,
        discountPercent: 0
      });
      
      // Definir o display para código + nome ou apenas nome
      const displayText = selectedProduct.code 
        ? `${selectedProduct.code} - ${selectedProduct.name}`
        : selectedProduct.name;
        
      setSelectedProductDisplay(displayText);
      setSearchTerm('');
      setIsProductSearchOpen(false);
    } else {
      console.error("Produto não encontrado com ID:", productId);
      toast({
        title: "Erro",
        description: "Não foi possível selecionar o produto. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const handleClientSelect = (clientId: string) => {
    // Procurar o cliente pelo ID nos clientes disponíveis
    const selectedClient = clients.find(c => c.id === clientId);
    
    if (selectedClient) {
      setExitDetails(prev => ({
        ...prev,
        clientId: selectedClient.id,
        clientName: selectedClient.name
      }));
      
      setClientSearchTerm('');
      setIsClientSearchOpen(false);
    } else {
      console.error("Cliente não encontrado com ID:", clientId);
      toast({
        title: "Erro",
        description: "Não foi possível selecionar o cliente. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const addItemToExit = () => {
    if (!currentItem.productId) {
      toast({ title: "Erro", description: "Selecione um produto" });
      return;
    }
    
    if (currentItem.quantity <= 0) {
      toast({ title: "Erro", description: "A quantidade deve ser maior que zero" });
      return;
    }
    
    if (currentItem.salePrice < 0) {
      toast({ title: "Erro", description: "O preço não pode ser negativo" });
      return;
    }
    
    // Verificar se o produto tem stock suficiente
    const selectedProduct = products.find(p => p.id === currentItem.productId);
    if (selectedProduct && selectedProduct.currentStock < currentItem.quantity) {
      toast({ 
        title: "Stock insuficiente", 
        description: `O stock disponível (${selectedProduct.currentStock}) é menor que a quantidade solicitada (${currentItem.quantity}).`
      });
      return;
    }
    
    setItems(prevItems => [...prevItems, { ...currentItem, id: uuidv4() }]);
    
    setCurrentItem({
      id: '',
      productId: '',
      productName: '',
      quantity: 1,
      salePrice: 0,
      discountPercent: 0
    });
    
    setSelectedProductDisplay('');
  };
  
  const removeItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, updatedItem: StockExitItem) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = updatedItem;
      return newItems;
    });
  };

  return {
    handleExitDetailsChange,
    handleSearch,
    handleClientSearch,
    handleProductSelect,
    handleClientSelect,
    addItemToExit,
    removeItem,
    updateItem
  };
};
