
import { OrderItem } from './types';

export const useOrderValidation = () => {
  const validateOrder = (selectedClientId: string, orderItems: OrderItem[]): { valid: boolean; message?: string } => {
    if (!selectedClientId) {
      return {
        valid: false,
        message: "Selecione um cliente para a encomenda"
      };
    }
    
    if (orderItems.length === 0) {
      return {
        valid: false,
        message: "Adicione pelo menos um produto à encomenda"
      };
    }
    
    // Check if all products have valid quantities and prices
    for (const item of orderItems) {
      if (item.quantity <= 0) {
        return {
          valid: false,
          message: `Produto "${item.productName}" tem quantidade inválida`
        };
      }
      
      if (item.salePrice <= 0) {
        return {
          valid: false,
          message: `Produto "${item.productName}" tem preço inválido`
        };
      }
    }
    
    return { valid: true };
  };
  
  return {
    validateOrder
  };
};
