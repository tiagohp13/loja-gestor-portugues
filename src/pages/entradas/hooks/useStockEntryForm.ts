
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { EntryItem } from './stockEntryForm/types';
import { useFormState } from './stockEntryForm/useFormState';
import { useFilters } from './stockEntryForm/useFilters';
import { useFormHandlers } from './stockEntryForm/useFormHandlers';
import { useCalculations } from './stockEntryForm/useCalculations';
import { useSubmit } from './stockEntryForm/useSubmit';
import { useSupplierSelect } from './stockEntryForm/useSupplierSelect';

export const useStockEntryForm = () => {
  const { products, suppliers, addStockEntry } = useData();
  const navigate = useNavigate();

  // Estado
  const {
    entryDate,
    calendarOpen,
    setCalendarOpen,
    setEntryDate,
    entryDetails,
    setEntryDetails,
    items,
    setItems,
    currentItem,
    setCurrentItem,
    searchTerm,
    setSearchTerm,
    selectedProductDisplay,
    setSelectedProductDisplay,
    isProductSearchOpen,
    setIsProductSearchOpen,
    isSubmitting,
    setIsSubmitting
  } = useFormState();

  // Filtros
  const {
    productSearchResults,
    supplierSearchResults,
    supplierSearchTerm,
    setSupplierSearchTerm,
    isSupplierSearchOpen,
    setIsSupplierSearchOpen,
    handleSearch,
    handleSupplierSearch
  } = useFilters({
    products,
    suppliers,
    searchTerm
  });

  // Seleção de fornecedor
  const {
    handleSupplierSelect,
    selectedSupplier
  } = useSupplierSelect({
    suppliers,
    setEntryDetails,
    setSupplierSearchTerm,
    setIsSupplierSearchOpen
  });

  // Manipuladores
  const {
    handleEntryDetailsChange,
    handleProductSelect,
    addItemToEntry,
    removeItem,
    updateItem
  } = useFormHandlers({
    products,
    entryDetails,
    setEntryDetails,
    items,
    setItems,
    currentItem,
    setCurrentItem,
    setSearchTerm,
    setSelectedProductDisplay,
    setIsProductSearchOpen
  });

  // Cálculos
  const {
    getTotalProducts,
    getTotalValue
  } = useCalculations(items);

  // Submissão
  const { handleSubmit } = useSubmit({
    entryDetails,
    items,
    entryDate,
    addStockEntry,
    suppliers
  });

  return {
    // Estado
    entryDate,
    calendarOpen,
    setCalendarOpen,
    setEntryDate,
    entryDetails,
    items,
    currentItem,
    setCurrentItem,
    searchTerm,
    setSearchTerm,
    selectedProductDisplay,
    isProductSearchOpen,
    setIsProductSearchOpen,
    isSubmitting,
    setIsSubmitting,

    // Filtros
    productSearchResults,
    supplierSearchResults,
    supplierSearchTerm,
    setSupplierSearchTerm,
    isSupplierSearchOpen,
    setIsSupplierSearchOpen,
    handleSearch,
    handleSupplierSearch,

    // Seleção de fornecedor
    handleSupplierSelect,
    selectedSupplier,

    // Manipuladores
    handleEntryDetailsChange,
    handleProductSelect,
    addItemToEntry,
    removeItem,
    updateItem,

    // Cálculos
    getTotalProducts,
    getTotalValue,

    // Submissão
    handleSubmit,
    navigate
  };
};
