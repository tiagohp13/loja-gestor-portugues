
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { EntryDetails, CurrentItem } from './stockEntryForm/types';
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
    isSupplierSearchOpen,
    setIsSupplierSearchOpen,
    supplierSearchTerm,
    setSupplierSearchTerm,
    isSubmitting,
    setIsSubmitting
  } = useFormState();

  // Filtros
  const {
    filteredProducts,
    filteredSuppliers,
    productSearchResults,
    supplierSearchResults,
    handleSearch,
    handleSupplierSearch
  } = useFilters({
    products,
    suppliers,
    searchTerm,
    supplierSearchTerm
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
    selectedProductDisplay,
    setSelectedProductDisplay,
    setIsProductSearchOpen,
    setIsSupplierSearchOpen
  });

  // Cálculos
  const {
    totalValue,
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
    setEntryDetails,
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
    filteredProducts,
    filteredSuppliers,
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
    totalValue,
    getTotalProducts,
    getTotalValue,

    // Submissão
    handleSubmit,
    navigate
  };
};
