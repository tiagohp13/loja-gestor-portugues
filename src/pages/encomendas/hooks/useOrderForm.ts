
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { OrderItem } from './order-form/types';
import { useOrderFormState } from './order-form/useOrderFormState';
import { useOrderFilters } from './order-form/useOrderFilters';
import { useOrderHandlers } from './order-form/useOrderHandlers';
import { useOrderSubmit } from './order-form/useOrderSubmit';

export type { OrderItem };

export const useOrderForm = () => {
  const navigate = useNavigate();
  const { clients, products, addOrder } = useData();
  
  // State management
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
  
  // Filters
  const { filterClients, filterProducts } = useOrderFilters(clients, products);
  const filteredClients = filterClients(clientSearchTerm);
  const filteredProducts = filterProducts(productSearchTerm);
  
  // Handlers
  const { 
    handleSelectClient,
    handleSelectProduct: baseHandleSelectProduct,
    handleAddProduct: baseHandleAddProduct,
    handleRemoveProduct,
    calculateTotal
  } = useOrderHandlers(
    clients,
    setSelectedClientId,
    setSelectedClient,
    setClientSearchTerm,
    setClientSearchOpen,
    setCurrentProduct,
    setProductSearchTerm,
    setProductSearchOpen,
    orderItems,
    setOrderItems,
    setCurrentQuantity
  );
  
  // Wrapper handlers that use the current state
  const handleSelectProduct = (productId: string) => {
    baseHandleSelectProduct(productId, products);
  };
  
  const handleAddProduct = () => {
    baseHandleAddProduct(currentProduct, currentQuantity);
  };
  
  // Submission
  const { handleSaveOrder } = useOrderSubmit(
    // Use type assertion to match the expected function signature
    addOrder as (order: any) => Promise<void>,
    selectedClientId,
    selectedClient,
    orderDate,
    orderItems,
    notes,
    setIsSubmitting
  );
  
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
