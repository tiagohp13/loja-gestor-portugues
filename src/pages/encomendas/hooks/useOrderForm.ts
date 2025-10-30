
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClients } from '@/contexts/ClientsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useOrders } from '@/contexts/OrdersContext';
import { OrderItem } from './order-form/types';
import { useOrderFormState } from './order-form/useOrderFormState';
import { useOrderFilters } from './order-form/useOrderFilters';
import { useOrderHandlers } from './order-form/useOrderHandlers';
import { useOrderSubmit } from './order-form/useOrderSubmit';
import { startOfDay, parseISO } from 'date-fns';

export type { OrderItem };

export const useOrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clients } = useClients();
  const { products } = useProducts();
  const { addOrder } = useOrders();
  
  // Check if we have duplicate data from navigation state
  const duplicateData = location.state?.duplicateData;
  
  // State management with potential pre-filled data
  const [selectedClientId, setSelectedClientId] = useState<string>(duplicateData?.clientId || '');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  
  const [orderDate, setOrderDate] = useState<Date>(() => {
    if (duplicateData?.date) {
      // Parse the date string correctly to avoid timezone issues
      return startOfDay(parseISO(duplicateData.date));
    }
    return startOfDay(new Date());
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>(duplicateData?.items || []);
  
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentSalePrice, setCurrentSalePrice] = useState(0);
  
  const [notes, setNotes] = useState(duplicateData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New fields for order type and delivery information
  const [orderType, setOrderType] = useState<'combined' | 'awaiting_stock'>('combined');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>(undefined);
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  
  // Effect to set selected client when duplicating
  useEffect(() => {
    if (duplicateData?.clientId && clients.length > 0) {
      const client = clients.find(c => c.id === duplicateData.clientId);
      if (client) {
        setSelectedClient(client);
        setClientSearchTerm(client.name);
      }
    }
  }, [duplicateData, clients]);
  
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
    handleUpdateItem,
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
    setCurrentQuantity,
    setCurrentSalePrice
  );
  
  // Wrapper handlers that use the current state
  const handleSelectProduct = (productId: string) => {
    baseHandleSelectProduct(productId, products);
  };
  
  const handleAddProduct = () => {
    baseHandleAddProduct(currentProduct, currentQuantity, currentSalePrice);
  };
  
  // Submission
  const { handleSaveOrder } = useOrderSubmit(
    addOrder,
    selectedClientId,
    selectedClient,
    orderDate,
    orderItems,
    notes,
    setIsSubmitting,
    orderType,
    expectedDeliveryDate,
    expectedDeliveryTime,
    deliveryLocation
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
    currentSalePrice,
    setProductSearchTerm,
    setProductSearchOpen,
    setCurrentQuantity,
    setCurrentSalePrice,
    filteredProducts,
    handleSelectProduct,
    handleAddProduct,
    
    orderItems,
    handleRemoveProduct,
    handleUpdateItem,
    calculateTotal,
    
    notes,
    setNotes,
    
    orderType,
    setOrderType,
    expectedDeliveryDate,
    setExpectedDeliveryDate,
    expectedDeliveryTime,
    setExpectedDeliveryTime,
    deliveryLocation,
    setDeliveryLocation,
    
    handleSaveOrder,
    navigate,
    isSubmitting
  };
};
