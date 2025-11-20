
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

interface ExpenseFormHeaderProps {
  nextNumber?: string;
}

const ExpenseFormHeader: React.FC<ExpenseFormHeaderProps> = ({ nextNumber }) => {
  return (
    <PageHeader 
      title={nextNumber ? `Nova Despesa (${nextNumber})` : "Nova Despesa"} 
    />
  );
};

export default ExpenseFormHeader;
