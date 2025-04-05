
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Package, Users, Truck, LogIn, LogOut, ShoppingCart, User as UserIcon,
  PlusCircle, List
} from 'lucide-react';
import { 
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, 
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, 
  SidebarMenuItem, SidebarRail, useSidebar
} from '@/components/ui/sidebar';

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navigationItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      hasSubmenu: false 
    },
    { 
      path: '/produtos', 
      label: 'Produtos', 
      icon: <Package className="w-5 h-5" />,
      hasSubmenu: true,
      submenu: [
        { path: '/produtos/novo', label: 'Criar novo produto', icon: <PlusCircle className="w-4 h-4" /> },
        { path: '/produtos/consultar', label: 'Consultar produtos', icon: <List className="w-4 h-4" /> }
      ]
    },
    { 
      path: '/clientes', 
      label: 'Clientes', 
      icon: <Users className="w-5 h-5" />,
      hasSubmenu: true,
      submenu: [
        { path: '/clientes/novo', label: 'Criar novo cliente', icon: <PlusCircle className="w-4 h-4" /> },
        { path: '/clientes/consultar', label: 'Consultar clientes', icon: <List className="w-4 h-4" /> }
      ]
    },
    { 
      path: '/fornecedores', 
      label: 'Fornecedores', 
      icon: <Truck className="w-5 h-5" />,
      hasSubmenu: true,
      submenu: [
        { path: '/fornecedores/novo', label: 'Criar novo fornecedor', icon: <PlusCircle className="w-4 h-4" /> },
        { path: '/fornecedores/consultar', label: 'Consultar fornecedores', icon: <List className="w-4 h-4" /> }
      ]
    },
    { 
      path: '/entradas', 
      label: 'Entradas', 
      icon: <LogIn className="w-5 h-5" />,
      hasSubmenu: true,
      submenu: [
        { path: '/entradas/nova', label: 'Registar nova entrada', icon: <PlusCircle className="w-4 h-4" /> },
        { path: '/entradas/historico', label: 'Histórico de entradas', icon: <List className="w-4 h-4" /> }
      ]
    },
    { 
      path: '/saidas', 
      label: 'Saídas', 
      icon: <LogOut className="w-5 h-5" />,
      hasSubmenu: true,
      submenu: [
        { path: '/saidas/nova', label: 'Registar nova saída', icon: <PlusCircle className="w-4 h-4" /> },
        { path: '/saidas/historico', label: 'Histórico de saídas', icon: <List className="w-4 h-4" /> }
      ]
    },
  ];

  // Fixed submenu items rendering to use direct Link components
  const renderSubmenuItems = (items) => {
    return (
      <div className="pl-6 mt-1 space-y-1">
        {items.map((subItem, idx) => (
          <Link 
            key={idx} 
            to={subItem.path}
            className="flex items-center space-x-2 py-1 px-2 text-sm rounded-md text-gestorApp-gray hover:text-gestorApp-blue hover:bg-gestorApp-gray-lighter"
          >
            {subItem.icon}
            <span>{subItem.label}</span>
          </Link>
        ))}
      </div>
    );
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
              {navigationItems.map((item, index) => {
                const isActive = location.pathname === item.path || 
                              (item.hasSubmenu && item.submenu.some(subItem => location.pathname === subItem.path));
                
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton>
                      {item.hasSubmenu ? (
                        <div className="w-full">
                          <div className={`flex items-center space-x-2 ${
                            isActive 
                              ? 'font-bold text-gestorApp-blue' 
                              : 'text-gestorApp-gray'
                          }`}>
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          {renderSubmenuItems(item.submenu)}
                        </div>
                      ) : (
                        <Link 
                          to={item.path} 
                          className={`flex items-center space-x-2 ${
                            isActive 
                              ? 'font-bold text-gestorApp-blue' 
                              : 'text-gestorApp-gray'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
