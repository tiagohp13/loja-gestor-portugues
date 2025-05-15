
import { useState } from 'react';
import { OrderFormState, OrderItem } from './types';

export const useOrderFormState = (): OrderFormState => {
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

  return {
    selectedClientId,
    selectedClient,
    clientSearchTerm,
    clientSearchOpen,
    orderDate,
    calendarOpen,
    orderItems,
    productSearchTerm,
    productSearchOpen,
    currentProduct,
    currentQuantity,
    notes,
    isSubmitting
  };
};

// Export state setters for use in the main hook
export const useOrderFormStateSetters = (state: OrderFormState) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(state.selectedClientId);
  const [selectedClient, setSelectedClient] = useState<any>(state.selectedClient);
  const [clientSearchTerm, setClientSearchTerm] = useState(state.clientSearchTerm);
  const [clientSearchOpen, setClientSearchOpen] = useState(state.clientSearchOpen);
  
  const [orderDate, setOrderDate] = useState<Date>(state.orderDate);
  const [calendarOpen, setCalendarOpen] = useState(state.calendarOpen);
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>(state.orderItems);
  
  const [productSearchTerm, setProductSearchTerm] = useState(state.productSearchTerm);
  const [productSearchOpen, setProductSearchOpen] = useState(state.productSearchOpen);
  const [currentProduct, setCurrentProduct] = useState<any>(state.currentProduct);
  const [currentQuantity, setCurrentQuantity] = useState(state.currentQuantity);
  
  const [notes, setNotes] = useState(state.notes);
  const [isSubmitting, setIsSubmitting] = useState(state.isSubmitting);
  
  return {
    setSelectedClientId,
    setSelectedClient,
    setClientSearchTerm,
    setClientSearchOpen,
    setOrderDate,
    setCalendarOpen,
    setOrderItems,
    setProductSearchTerm,
    setProductSearchOpen,
    setCurrentProduct,
    setCurrentQuantity,
    setNotes,
    setIsSubmitting
  };
};
