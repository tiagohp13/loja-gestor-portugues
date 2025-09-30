import React from 'react';
import EntryHistory from './EntryHistory';
import ExitHistory from './ExitHistory';
import PendingOrdersHistory from './PendingOrdersHistory';
import { EntryItem, ExitItem, PendingOrderItem } from '../types/productHistoryTypes';

interface HistoryTablesProps {
  entriesForProduct: EntryItem[];
  exitsForProduct: ExitItem[];
  pendingOrdersForProduct: PendingOrderItem[];
  totalUnitsPurchased: number;
  totalAmountSpent: number;
  totalUnitsSold: number;
  totalAmountSold: number;
}

const HistoryTables: React.FC<HistoryTablesProps> = ({
  entriesForProduct,
  exitsForProduct,
  pendingOrdersForProduct,
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
      
      <PendingOrdersHistory 
        pendingOrdersForProduct={pendingOrdersForProduct}
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
