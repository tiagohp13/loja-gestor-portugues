
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Truck, Tag, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SupportStats } from '../hooks/useSupportData';
import { toast } from '@/components/ui/use-toast';

interface MetricsCardsProps {
  stats: SupportStats;
  showSummaryCardsOnly?: boolean;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ stats, showSummaryCardsOnly = false }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Summary metrics cards (the ones highlighted in yellow) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.clientsCount}</div>
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate('/clientes/consultar')}>
              Ver todos
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Truck className="w-4 h-4 mr-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.suppliersCount}</div>
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate('/fornecedores/consultar')}>
              Ver todos
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.categoriesCount}</div>
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate('/categorias/consultar')}>
              Ver todos
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-2 text-orange-500" />
            <div className="text-2xl font-bold">{stats.productsCount}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2" 
              onClick={() => navigate('/produtos/consultar')}
            >
              Ver todos
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MetricsCards;
