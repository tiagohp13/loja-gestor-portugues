
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { toast } from "sonner";

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
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
    },
    { 
      path: '/configuracoes', 
      label: 'Configurações', 
      icon: <Settings className="w-5 h-5" />,
      isActive: location.pathname.includes('/configuracoes')
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Extract user display name from metadata or use email
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Try to get name from user metadata
    const userName = user.user_metadata?.name;
    
    // If name exists in metadata, use it, otherwise use email
    return userName || user.email?.split('@')[0] || '';
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
