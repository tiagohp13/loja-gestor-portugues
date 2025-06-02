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
  CreditCard,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ThemeToggle from '../ui/ThemeToggle';

interface MenuItem {
  title: string;
  icon: any;
  href?: string;
  items?: { title: string; href: string }[];
}

const Sidebar = () => {
  const location = useLocation();
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
      items: [
        { title: 'Consultar', href: '/produtos/consultar' },
        { title: 'Novo Produto', href: '/produtos/novo' },
      ],
    },
    {
      title: 'Categorias',
      icon: Tag,
      items: [
        { title: 'Consultar', href: '/categorias/consultar' },
        { title: 'Nova Categoria', href: '/categorias/nova' },
      ],
    },
    {
      title: 'Clientes',
      icon: Users,
      items: [
        { title: 'Consultar', href: '/clientes/consultar' },
        { title: 'Novo Cliente', href: '/clientes/novo' },
      ],
    },
    {
      title: 'Fornecedores',
      icon: Truck,
      items: [
        { title: 'Consultar', href: '/fornecedores/consultar' },
        { title: 'Novo Fornecedor', href: '/fornecedores/novo' },
      ],
    },
    {
      title: 'Encomendas',
      icon: ShoppingCart,
      items: [
        { title: 'Consultar', href: '/encomendas/consultar' },
        { title: 'Nova Encomenda', href: '/encomendas/nova' },
      ],
    },
    {
      title: 'Compras',
      icon: ArrowDownCircle,
      items: [
        { title: 'Histórico', href: '/entradas/historico' },
        { title: 'Nova Compra', href: '/entradas/nova' },
      ],
    },
    {
      title: 'Despesas',
      icon: CreditCard,
      items: [
        { title: 'Histórico', href: '/despesas/historico' },
        { title: 'Nova Despesa', href: '/despesas/nova' },
      ],
    },
    {
      title: 'Vendas',
      icon: ArrowUpCircle,
      items: [
        { title: 'Histórico', href: '/saidas/historico' },
        { title: 'Nova Venda', href: '/saidas/nova' },
      ],
    },
    {
      title: 'Configurações',
      icon: Settings,
      href: '/configuracoes',
    },
    {
      title: 'Estatísticas',
      icon: BarChart3,
      href: '/suporte',
    },
  ];

  const renderMenuItems = () => (
    <nav className="grid gap-6 p-4">
      {menuItems.map((item, index) =>
        item.href ? (
          <NavLink
            key={index}
            to={item.href}
            onClick={closeSidebar}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md p-2 text-sm font-semibold transition-colors hover:bg-gestorApp-blue-light hover:text-gestorApp-blue-dark",
                isActive ? "bg-gestorApp-blue-light text-gestorApp-blue-dark" : "text-gestorApp-gray-dark"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ) : (
          <div key={index}>
            <div className="mb-2 text-sm font-semibold text-gestorApp-gray-dark">{item.title}</div>
            <div className="grid gap-2">
              {item.items?.map((subItem, subIndex) => (
                <NavLink
                  key={subIndex}
                  to={subItem.href}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors hover:bg-gestorApp-blue-light hover:text-gestorApp-blue-dark",
                      isActive ? "bg-gestorApp-blue-light text-gestorApp-blue-dark" : "text-gestorApp-gray-dark"
                    )
                  }
                >
                  {subItem.title}
                </NavLink>
              ))}
            </div>
          </div>
        )
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop menu */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r">
        <div className="flex flex-col justify-between h-full">
          <div>{renderMenuItems()}</div>
          <div className="p-4">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Menu className="absolute left-4 top-4 text-gestorApp-gray-dark md:hidden" onClick={toggleOpen} />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 pt-10 w-[18rem]">
          {renderMenuItems()}
          <div className="absolute bottom-4 left-4">
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
