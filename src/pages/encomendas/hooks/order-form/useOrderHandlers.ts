
import { useState } from 'react';
import { Client, Product } from "@/types";
import { OrderItem } from './types';
import { toast } from '@/hooks/use-toast';

export const useOrderHandlers = (
  clients: Client[],
  setSelectedClientId: (id: string) => void,
  setSelectedClient: (client: Client | null) => void,
  setClientSearchTerm: (term: string) => void,
  setClientSearchOpen: (open: boolean) => void,
  setCurrentProduct: (product: Product | null) => void,
  setProductSearchTerm: (term: string) => void,
  setProductSearchOpen: (open: boolean) => void,
  orderItems: OrderItem[],
  setOrderItems: (items: OrderItem[]) => void,
  setCurrentQuantity: (quantity: number) => void,
) => {
  const handleSelectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClientId(clientId);
    setSelectedClient(client || null);
    setClientSearchTerm(client ? client.name : '');
    setClientSearchOpen(false);
  };
  
  const handleSelectProduct = (productId: string, products: Product[]) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      setProductSearchTerm(`${product.code} - ${product.name}`);
    }
    setProductSearchOpen(false);
  };
  
  const handleAddProduct = (currentProduct: Product | null, currentQuantity: number) => {
    if (!currentProduct) {
      toast({
        title: "Erro",
        description: "Selecione um produto primeiro",
        variant: "destructive"
      });
      return;
    }
    
    if (currentQuantity <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (currentProduct.salePrice <= 0) {
      toast({
        title: "Erro",
        description: "O produto deve ter um preço de venda válido",
        variant: "destructive"
      });
      return;
    }
    
    const existingItemIndex = orderItems.findIndex(item => item.productId === currentProduct.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += currentQuantity;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        productId: currentProduct.id,
        productName: `${currentProduct.code} - ${currentProduct.name}`,
        quantity: currentQuantity,
        salePrice: currentProduct.salePrice
      }]);
    }
    
    setCurrentProduct(null);
    setProductSearchTerm('');
    setCurrentQuantity(1);
    
    toast({
      title: "Sucesso",
      description: "Produto adicionado à encomenda"
    });
  };
  
  const handleRemoveProduct = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };
  
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.quantity * item.salePrice), 0);
  };
  
  return {
    handleSelectClient,
    handleSelectProduct,
    handleAddProduct,
    handleRemoveProduct,
    calculateTotal
  };
};
