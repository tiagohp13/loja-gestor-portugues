
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  LayoutDashboard, Package, Users, Truck, LogIn, LogOut, ShoppingCart, 
  UserIcon, Settings, Tag, BarChart, ClipboardList, Receipt, Trash2, Bell, Shield, BarChart2, Database
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, 
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, 
  SidebarMenuItem, useSidebar
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";
import UserProfileModal from '@/components/profile/UserProfileModal';
import GlobalSearch from './GlobalSearch';

/**
 * Main navigation sidebar component 
 * Provides consistent navigation across the application
 */
const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
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
      path: '/relatorios', 
      label: 'Relatórios', 
      icon: <BarChart2 className="w-5 h-5" />,
      isActive: location.pathname.includes('/relatorios')
    },
    { 
      path: '/reciclagem', 
      label: 'Reciclagem', 
      icon: <Trash2 className="w-5 h-5" />,
      isActive: location.pathname.includes('/reciclagem')
    },
    { 
      path: '/notificacoes', 
      label: 'Notificações', 
      icon: <Bell className="w-5 h-5" />,
      isActive: location.pathname.includes('/notificacoes')
    },
    { 
      path: '/configuracoes', 
      label: 'Configurações', 
      icon: <Settings className="w-5 h-5" />,
      isActive: location.pathname.includes('/configuracoes')
    }
  ];

  // Items apenas para administradores
  const adminItems = [
    {
      path: '/admin/roles',
      label: 'Gestão de Papéis',
      icon: <Shield className="w-5 h-5" />,
      isActive: location.pathname.includes('/admin/roles')
    },
    {
      path: '/admin/data',
      label: 'Gestão de Dados',
      icon: <Database className="w-5 h-5" />,
      isActive: location.pathname.includes('/admin/data')
    },
    {
      path: '/admin/client-tags',
      label: 'Etiquetas de Clientes',
      icon: <Tag className="w-5 h-5" />,
      isActive: location.pathname.includes('/admin/client-tags')
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
    if (profile?.name) return profile.name;
    if (!user) return '';
    
    const userName = user.user_metadata?.name;
    return userName || user.email?.split('@')[0] || '';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/3841c0e4-f3de-4811-a15b-404f0ea98932.png" 
            alt="Aqua Paraíso Logo" 
            className="h-8 w-auto"
          />
          <h2 className="text-lg font-bold text-gestorApp-blue">Aqua Paraíso</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Global Search */}
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <GlobalSearch />
          </SidebarGroupContent>
        </SidebarGroup>

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

        {/* Seção Admin - apenas visível para administradores */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item, index) => (
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
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col space-y-4">
          {user && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-3 text-sm hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-colors cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} alt="Profile picture" />
                <AvatarFallback className="text-xs">
                  {getInitials(getUserDisplayName())}
                </AvatarFallback>
              </Avatar>
              <span className="text-gestorApp-gray-dark truncate">{getUserDisplayName()}</span>
            </button>
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
      
      <UserProfileModal 
        open={isProfileModalOpen} 
        onOpenChange={setIsProfileModalOpen} 
      />
    </Sidebar>
  );
};

export default AppSidebar;
