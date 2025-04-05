
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Package, Users, Truck, LogIn, LogOut, ShoppingCart, User as UserIcon
} from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from '@/components/ui/sidebar';

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/produtos', label: 'Produtos', icon: <Package className="w-5 h-5" /> },
    { path: '/clientes', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
    { path: '/fornecedores', label: 'Fornecedores', icon: <Truck className="w-5 h-5" /> },
    { path: '/entradas', label: 'Entradas', icon: <LogIn className="w-5 h-5" /> },
    { path: '/saidas', label: 'Saídas', icon: <LogOut className="w-5 h-5" /> },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex items-center justify-center border-b">
        <h2 className="text-lg font-bold text-gestorApp-blue">Gestor de Stock</h2>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path} 
                      className={`flex items-center space-x-2 ${
                        location.pathname === item.path 
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
