import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Package, Users, Truck, LogIn, LogOut, ShoppingCart, 
  UserIcon, Settings, Tag, HelpCircle, ClipboardList
} from 'lucide-react';
import { 
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, 
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, 
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navigationItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      isActive: location.pathname === '/' || location.pathname === '/dashboard'
    },
    { 
      path: '/produtos/consultar', 
      label: 'Produtos', 
      icon: <Package className="w-5 h-5" />,
      isActive: location.pathname.includes('/produtos')
    },
    { 
      path: '/categorias/consultar', 
      label: 'Categorias', 
      icon: <Tag className="w-5 h-5" />,
      isActive: location.pathname.includes('/categorias')
    },
    { 
      path: '/clientes/consultar', 
      label: 'Clientes', 
      icon: <Users className="w-5 h-5" />,
      isActive: location.pathname.includes('/clientes')
    },
    { 
      path: '/fornecedores/consultar', 
      label: 'Fornecedores', 
      icon: <Truck className="w-5 h-5" />,
      isActive: location.pathname.includes('/fornecedores')
    },
    { 
      path: '/encomendas/consultar', 
      label: 'Encomendas', 
      icon: <ClipboardList className="w-5 h-5" />,
      isActive: location.pathname.includes('/encomendas')
    },
    { 
      path: '/entradas/historico', 
      label: 'Entradas', 
      icon: <LogIn className="w-5 h-5" />,
      isActive: location.pathname.includes('/entradas')
    },
    { 
      path: '/saidas/historico', 
      label: 'Saídas', 
      icon: <LogOut className="w-5 h-5" />,
      isActive: location.pathname.includes('/saidas')
    },
    { 
      path: '/suporte', 
      label: 'Suporte', 
      icon: <HelpCircle className="w-5 h-5" />,
      isActive: location.pathname.includes('/suporte')
    }
  ];

  const handleExportData = () => {
    const createCSV = (data: any[], headers: string[]) => {
      const csvContent = [
        headers.join(','),
        ...data.map(item => headers.map(header => JSON.stringify(item[header] || '')).join(','))
      ].join('\n');
      return csvContent;
    };

    const { products } = window.appData || { products: [] };
    
    if (products && products.length > 0) {
      const headers = ['id', 'code', 'name', 'description', 'category', 'purchasePrice', 'salePrice', 'currentStock'];
      const csvContent = createCSV(products, headers);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'produtos_exportados.csv');
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Dados exportados com sucesso");
    } else {
      toast.error("Nenhum dado para exportar");
    }
  };

  const handleImportData = () => {
    const sampleHeaders = ['code', 'name', 'description', 'category', 'purchasePrice', 'salePrice', 'currentStock'];
    const sampleData = [
      {
        code: 'PROD001',
        name: 'Produto Exemplo 1',
        description: 'Descrição do produto exemplo',
        category: 'Categoria 1',
        purchasePrice: '10.50',
        salePrice: '19.99',
        currentStock: '50'
      },
      {
        code: 'PROD002',
        name: 'Produto Exemplo 2',
        description: 'Outra descrição de exemplo',
        category: 'Categoria 2',
        purchasePrice: '5.75',
        salePrice: '12.99',
        currentStock: '25'
      }
    ];
    
    const csvContent = [
      sampleHeaders.join(','),
      ...sampleData.map(item => sampleHeaders.map(header => JSON.stringify(item[header] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_importacao.csv');
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.info("Ficheiro modelo para importação descarregado");
  };

  return (
    <Sidebar variant="sidebar" collapsible="none">
      <SidebarHeader className="p-4 flex items-center justify-center border-b">
        <h2 className="text-lg font-bold text-gestorApp-blue">Gestor de Stock</h2>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton>
                    <Link 
                      to={item.path} 
                      className={`flex items-center space-x-2 ${
                        item.isActive 
                          ? 'font-bold text-gestorApp-blue' 
                          : 'text-gestorApp-gray'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 w-full text-gestorApp-gray hover:text-gestorApp-blue transition-colors">
                      <Settings className="w-5 h-5" />
                      <span>Configurações</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleImportData}>
                        Importar dados (CSV)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportData}>
                        Exportar dados (CSV)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col space-y-4">
          {user && (
            <div className="flex items-center space-x-2 text-sm">
              <UserIcon className="w-5 h-5 text-gestorApp-gray" />
              <span className="text-gestorApp-gray-dark">{user.name}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gestorApp-gray hover:text-gestorApp-blue transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
