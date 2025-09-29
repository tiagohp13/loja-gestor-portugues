import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Package, ShoppingCart, TrendingUp, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isLoading, hasResults, clearSearch } = useGlobalSearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    clearSearch();
  };

  const handleClearSearch = () => {
    clearSearch();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'product':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-purple-500" />;
      case 'sale':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'supplier':
        return <Building2 className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return 'Clientes';
      case 'product':
        return 'Produtos';
      case 'order':
        return 'Encomendas';
      case 'sale':
        return 'Vendas';
      case 'supplier':
        return 'Fornecedores';
    }
  };

  const renderResultGroup = (results: SearchResult[], type: SearchResult['type']) => {
    if (results.length === 0) return null;

    return (
      <div className="py-2">
        <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
          {getTypeIcon(type)}
          {getTypeLabel(type)}
        </div>
        {results.map((result) => (
          <button
            key={`${result.type}-${result.id}`}
            onClick={() => handleResultClick(result)}
            className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors focus:bg-muted/50 focus:outline-none"
          >
            <div className="font-medium text-sm text-foreground">{result.title}</div>
            {result.subtitle && (
              <div className="text-xs text-muted-foreground mt-1">{result.subtitle}</div>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar em tudo..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (query || hasResults) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              A pesquisar...
            </div>
          ) : hasResults ? (
            <div>
              {renderResultGroup(results.clients, 'client')}
              {renderResultGroup(results.products, 'product')}
              {renderResultGroup(results.orders, 'order')}
              {renderResultGroup(results.sales, 'sale')}
              {renderResultGroup(results.suppliers, 'supplier')}
            </div>
          ) : query ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;