
import { OrderItem } from './types';
import { toast } from '@/hooks/use-toast';

export const useOrderValidation = () => {
  const validateOrder = (
    selectedClientId: string, 
    orderItems: OrderItem[],
    orderDate?: Date
  ): { valid: boolean; message?: string } => {
    // Verify client is selected
    if (!selectedClientId) {
      return {
        valid: false,
        message: "Selecione um cliente para a encomenda"
      };
    }
    
    // Verify order date is selected
    if (!orderDate) {
      return {
        valid: false,
        message: "Selecione uma data para a encomenda"
      };
    }
    
    // Check if date is valid (not in the future)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (orderDate > today) {
      return {
        valid: false,
        message: "A data da encomenda não pode ser no futuro"
      };
    }
    
    // Verify at least one product is added
    if (orderItems.length === 0) {
      return {
        valid: false,
        message: "Adicione pelo menos um produto à encomenda"
      };
    }
    
    // Check if all products have valid quantities and prices
    for (const item of orderItems) {
      if (!item.quantity || item.quantity <= 0) {
        return {
          valid: false,
          message: `Produto "${item.productName}" tem quantidade inválida`
        };
      }
      
      if (!item.salePrice || item.salePrice <= 0) {
        return {
          valid: false,
          message: `Produto "${item.productName}" tem preço inválido`
        };
      }
    }
    
    return { valid: true };
  };
  
  const displayValidationError = (message: string) => {
    toast({
      title: "Erro de Validação",
      description: message,
      variant: "destructive"
    });
  };
  
  return {
    validateOrder,
    displayValidationError
  };
};
