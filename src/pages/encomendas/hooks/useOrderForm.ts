
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
};

export const useOrderForm = () => {
  const navigate = useNavigate();
  const { clients, products, addOrder } = useData();
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const filteredClients = clientSearchTerm 
    ? clients.filter(client => 
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        (client.taxId && client.taxId.toLowerCase().includes(clientSearchTerm.toLowerCase())))
    : clients;
  
  const filteredProducts = productSearchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(productSearchTerm.toLowerCase()))
    : products;
  
  const handleSelectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClientId(clientId);
    setSelectedClient(client);
    setClientSearchTerm(client ? client.name : '');
    setClientSearchOpen(false);
  };
  
  const handleSelectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      setProductSearchTerm(`${product.code} - ${product.name}`);
    }
    setProductSearchOpen(false);
  };
  
  const handleAddProduct = () => {
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
  
  const validateOrder = (): { valid: boolean; message?: string } => {
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
  
  const handleSaveOrder = async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    // Validate the order
    const validation = validateOrder();
    if (!validation.valid) {
      toast({
        title: "Erro",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const total = calculateTotal();
      const newOrder = {
        clientId: selectedClientId,
        clientName: selectedClient.name,
        date: orderDate.toISOString(),
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          salePrice: item.salePrice
        })),
        notes,
        total  // Adding total value to the order
      };
      
      await addOrder(newOrder);
      toast({
        title: "Sucesso",
        description: "Encomenda guardada com sucesso"
      });
      navigate('/encomendas/consultar');
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Erro",
        description: "Erro ao guardar a encomenda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedClientId,
    clientSearchTerm,
    clientSearchOpen,
    setClientSearchTerm,
    setClientSearchOpen,
    filteredClients,
    handleSelectClient,
    
    orderDate,
    calendarOpen,
    setCalendarOpen,
    setOrderDate,
    
    productSearchTerm,
    productSearchOpen,
    currentProduct,
    currentQuantity,
    setProductSearchTerm,
    setProductSearchOpen,
    setCurrentQuantity,
    filteredProducts,
    handleSelectProduct,
    handleAddProduct,
    
    orderItems,
    handleRemoveProduct,
    calculateTotal,
    
    notes,
    setNotes,
    
    handleSaveOrder,
    navigate,
    isSubmitting
  };
};
