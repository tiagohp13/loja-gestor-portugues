
import React from 'react';
import { useParams } from 'react-router-dom';
import StockEntryEditHeader from './components/StockEntryEditHeader';
import StockEntryEditForm from './components/StockEntryEditForm';

const StockEntryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isNewEntry = !id;

  return (
    <div className="container mx-auto px-4 py-6">
      <StockEntryEditHeader isNewEntry={isNewEntry} />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <StockEntryEditForm id={id} />
      </div>
    </div>
  );
};

export default StockEntryEdit;
