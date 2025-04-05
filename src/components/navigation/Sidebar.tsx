
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Package, Users, Truck, LogIn, LogOut, ShoppingCart, User as UserIcon,
  PlusCircle, List, ChevronDown
} from 'lucide-react';
import { 
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, 
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, 
  SidebarMenuItem, SidebarTrigger, SidebarRail, useSidebar
} from '@/components/ui/sidebar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  
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

  const NavigationMenuComponent = ({ item }) => {
    const isActive = location.pathname === item.path || 
                    (item.hasSubmenu && item.submenu.some(subItem => location.pathname === subItem.path));
    
    if (!item.hasSubmenu) {
      return (
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
      );
    }

    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className={`p-0 h-auto bg-transparent hover:bg-transparent ${
                isActive 
                  ? 'font-bold text-gestorApp-blue' 
                  : 'text-gestorApp-gray'
              }`}
            >
              <div className="flex items-center space-x-2">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[220px] gap-2 p-2">
                {item.submenu.map((subItem, index) => (
                  <li key={index}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={subItem.path}
                        className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center space-x-2">
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

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
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton>
                    <NavigationMenuComponent item={item} />
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
      
      {/* Add a visible rail to expand the sidebar when collapsed */}
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
