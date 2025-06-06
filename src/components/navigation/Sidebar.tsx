import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Package, Users, Truck, LogIn, LogOut, ShoppingCart, 
  UserIcon, Settings, Tag, BarChart, ClipboardList, Receipt
} from 'lucide-react';
import { 
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, 
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, 
  SidebarMenuItem, useSidebar
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";

/**
 * Main navigation sidebar component 
 * Provides consistent navigation across the application
 */
const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  
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
      label: 'Compras', 
      icon: <LogIn className="w-5 h-5" />,
      isActive: location.pathname.includes('/entradas')
    },
    { 
      path: '/saidas/historico', 
      label: 'Vendas', 
      icon: <LogOut className="w-5 h-5" />,
      isActive: location.pathname.includes('/saidas')
    },
    { 
      path: '/despesas/historico', 
      label: 'Despesas', 
      icon: <Receipt className="w-5 h-5" />,
      isActive: location.pathname.includes('/despesas')
    },
    { 
      path: '/suporte', 
      label: 'Estatísticas', 
      icon: <BarChart className="w-5 h-5" />,
      isActive: location.pathname.includes('/suporte')
    },
    { 
      path: '/configuracoes', 
      label: 'Configurações', 
      icon: <Settings className="w-5 h-5" />,
      isActive: location.pathname.includes('/configuracoes')
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sessão terminada com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao terminar sessão');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    
    const userName = user.user_metadata?.name;
    return userName || user.email?.split('@')[0] || '';
  };

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="p-4 flex items-center border-b">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/3841c0e4-f3de-4811-a15b-404f0ea98932.png" 
            alt="Aqua Paraíso Logo" 
            className="h-8 w-8 object-contain"
          />
          <h2 className="text-lg font-bold text-gestorApp-blue">Aqua Paraíso</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.path)}
                    isActive={item.isActive}
                    tooltip={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col space-y-4">
          {user && (
            <div className="flex items-center space-x-2 text-sm">
              <UserIcon className="w-5 h-5 text-gestorApp-gray" />
              <span className="text-gestorApp-gray-dark">{getUserDisplayName()}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
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
