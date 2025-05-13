import React from 'react';
import EntryHistory from './EntryHistory';
import ExitHistory from './ExitHistory';
import { EntryItem, ExitItem } from '../types/productHistoryTypes';

interface HistoryTablesProps {
  entriesForProduct: EntryItem[];
  exitsForProduct: ExitItem[];
  totalUnitsPurchased: number;
  totalAmountSpent: number;
  totalUnitsSold: number;
  totalAmountSold: number;
}

const HistoryTables: React.FC<HistoryTablesProps> = ({
  entriesForProduct,
  exitsForProduct,
  totalUnitsPurchased,
  totalAmountSpent,
  totalUnitsSold,
  totalAmountSold
}) => {
  return (
    <>
      <EntryHistory 
        entriesForProduct={entriesForProduct}
        totalUnitsPurchased={totalUnitsPurchased}
        totalAmountSpent={totalAmountSpent}
      />
      
      <ExitHistory 
        exitsForProduct={exitsForProduct}
        totalUnitsSold={totalUnitsSold}
        totalAmountSold={totalAmountSold}
      />
    </>
  );
};

export default HistoryTables;
