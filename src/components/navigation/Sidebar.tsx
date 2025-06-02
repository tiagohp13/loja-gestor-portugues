
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  Truck,
  ShoppingCart,
  ArrowDownCircle,
  ArrowUpCircle,
  Settings,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ThemeToggle from '../ui/ThemeToggle';

interface MenuItem {
  title: string;
  icon: any;
  href?: string;
  items?: { title: string; href: string }[];
}

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  const closeSidebar = () => setOpen(false);

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Produtos',
      icon: Package,
      href: '/produtos/consultar',
    },
    {
      title: 'Categorias',
      icon: Tag,
      href: '/categorias/consultar',
    },
    {
      title: 'Clientes',
      icon: Users,
      href: '/clientes/consultar',
    },
    {
      title: 'Fornecedores',
      icon: Truck,
      href: '/fornecedores/consultar',
    },
    {
      title: 'Encomendas',
      icon: ShoppingCart,
      href: '/encomendas/consultar',
    },
    {
      title: 'Compras',
      icon: ArrowDownCircle,
      href: '/entradas/historico',
    },
    {
      title: 'Vendas',
      icon: ArrowUpCircle,
      href: '/saidas/historico',
    },
    {
      title: 'Estatísticas',
      icon: BarChart3,
      href: '/suporte',
    },
    {
      title: 'Configurações',
      icon: Settings,
      href: '/configuracoes',
    },
  ];

  const renderMenuItems = (onItemClick?: () => void) => (
    <>
      {menuItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.href!}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600",
              isActive ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.title}
        </NavLink>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Menu className="absolute left-4 top-4 text-gray-700 md:hidden z-50 cursor-pointer" onClick={toggleOpen} />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 pt-10 w-[240px]">
          <nav className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-2">
              {renderMenuItems(closeSidebar)}
            </div>
            
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tiago Silva</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
              
              <button className="flex items-center gap-3 w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <LogOut className="h-4 w-4" />
                Terminar Sessão
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-[240px] bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40">
        {/* Logo Section */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <img 
            src="/lovable-uploads/3841c0e4-f3de-4811-a15b-404f0ea98932.png" 
            alt="Aqua Paraíso Logo" 
            className="h-8 w-auto mr-3"
          />
          <h2 className="text-xl font-semibold text-blue-600">Aqua Paraíso</h2>
        </div>
        
        {/* Menu Principal */}
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Menu Principal</p>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4">
          <div className="space-y-1">
            {renderMenuItems()}
          </div>
        </nav>

        {/* User Section at Bottom */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Tiago Silva</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          
          <button className="flex items-center gap-3 w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <LogOut className="h-4 w-4" />
            Terminar Sessão
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
