
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackageCheck, Users, Truck, ShoppingCart, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SupportStats } from '../hooks/useSupportData';
import { getMostSoldProduct } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface MetricsCardsProps {
  stats: SupportStats;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ stats }) => {
  const navigate = useNavigate();
  const [topProduct, setTopProduct] = useState<{name: string; quantity: number; productId: string | null}>({
    name: 'Carregando...',
    quantity: 0,
    productId: null
  });
  
  // Fetch the most sold product directly from the database
  useEffect(() => {
    const fetchTopProduct = async () => {
      try {
        const product = await getMostSoldProduct();
        setTopProduct(product);
      } catch (error) {
        console.error('Error fetching top product:', error);
        toast({
          title: "Erro ao carregar produto mais vendido",
          description: "Não foi possível obter dados do produto mais vendido.",
          variant: "destructive"
        });
      }
    };
    
    fetchTopProduct();
  }, []);

  return (
    <>
      {/* Primeira seção: Top métricas (produtos mais vendidos, clientes frequentes, fornecedores usados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produto Mais Vendido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <PackageCheck className="w-4 h-4 mr-2 text-blue-500" />
              <div className="text-md font-medium">
                {topProduct.productId ? (
                  <>
                    <span 
                      className="text-blue-600 cursor-pointer hover:underline" 
                      onClick={() => {
                        if (topProduct.productId) {
                          navigate(`/produtos/${topProduct.productId}`);
                        }
                      }}
                    >
                      {topProduct.name}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">({topProduct.quantity} vendidos)</span>
                  </>
                ) : (
                  <div className="text-md">{topProduct.name}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cliente Mais Frequente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-green-500" />
              {stats.topClients.length > 0 ? (
                <div className="text-md font-medium">
                  <span className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/clientes/consultar`)}>
                    {stats.topClients[0].name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">({stats.topClients[0].orders} compras)</span>
                </div>
              ) : (
                <div className="text-md">Nenhum cliente com compras</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fornecedor Mais Usado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-blue-500" />
              {stats.topSuppliers.length > 0 ? (
                <div className="text-md font-medium">
                  <span className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/fornecedores/consultar`)}>
                    {stats.topSuppliers[0].name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">({stats.topSuppliers[0].entries} entradas)</span>
                </div>
              ) : (
                <div className="text-md">Nenhum fornecedor com entradas</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Segunda seção: Os 4 cartões em uma única linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Encomendas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2 text-orange-500" />
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => navigate('/encomendas/consultar')}
              >
                Ver todas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MetricsCards;
