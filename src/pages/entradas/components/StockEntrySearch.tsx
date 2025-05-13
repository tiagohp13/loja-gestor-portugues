
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StockEntrySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const StockEntrySearch: React.FC<StockEntrySearchProps> = ({ searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
      <div className="relative w-full flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
          <Input
            className="pl-10"
            placeholder="Pesquisar por fornecedor, número da compra ou fatura..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex-none">
          <Button onClick={() => navigate('/entradas/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Compra
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StockEntrySearch;
