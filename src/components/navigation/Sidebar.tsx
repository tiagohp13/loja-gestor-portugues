// loja-gestor-portugues-main/src/components/navigation/Sidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  LogIn,
  LogOut,
  ShoppingCart,
  UserIcon,
  Settings,
  Tag,
  BarChart,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

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
      isActive:
        location.pathname === '/' || location.pathname === '/dashboard',
    },
    {
      path: '/produtos/consultar',
      label: 'Produtos',
      icon: <Package className="w-5 h-5" />,
      isActive: location.pathname.includes('/produtos'),
    },
    {
      path: '/categorias/consultar',
      label: 'Categorias',
      icon: <Tag className="w-5 h-5" />,
      isActive: location.pathname.includes('/categorias'),
    },
    {
      path: '/clientes/consultar',
      label: 'Clientes',
      icon: <Users className="w-5 h-5" />,
      isActive: location.pathname.includes('/clientes'),
    },
    {
      path: '/fornecedores/consultar',
      label: 'Fornecedores',
      icon: <Truck className="w-5 h-5" />,
      isActive: location.pathname.includes('/fornecedores'),
    },
    {
      path: '/encomendas/consultar',
      label: 'Encomendas',
      icon: <ClipboardList className="w-5 h-5" />,
      isActive: location.pathname.includes('/encomendas'),
    },
    {
      path: '/entradas/historico',
      label: 'Compras',
      icon: <LogIn className="w-5 h-5" />,
      isActive: location.pathname.includes('/entradas'),
    },
    {
      path: '/saidas/historico',
      label: 'Vendas',
      icon: <LogOut className="w-5 h-5" />,
      isActive: location.pathname.includes('/saidas'),
    },
    {
      path: '/despesas/historico',
      label: 'Despesas',
      icon: <Receipt className="w-5 h-5" />,
      isActive: location.pathname.includes('/despesas'),
    },
    {
      path: '/suporte',
      label: 'Estatísticas',
      icon: <BarChart className="w-5 h-5" />,
      isActive: location.pathname.includes('/suporte'),
    },
    {
      path: '/configuracoes',
      label: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      isActive: location.pathname.includes('/configuracoes'),
    },
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
      {/* ------------------------------
          1. HEADER: Logo + Nome da Marca
          ------------------------------ */}
      <SidebarHeader className="p-4 flex items-center border-b">
        <div className="flex items-center space-x-3">
          {/* 
            - Aumentei o space-x de 2 para 3 para dar mais respiração entre logo e texto 
            - items-center já centraliza verticalmente
          */}
          <img
            src="/lovable-uploads/3841c0e4-f3de-4811-a15b-404f0ea98932.png"
            alt="Aqua Paraíso Logo"
            className="h-8 w-auto"
          />
          <h2 className="text-lg font-bold text-gestorApp-blue">
            Aqua Paraíso
          </h2>
        </div>
      </SidebarHeader>

      {/* ------------------------------
          2. CONTENT: Menu Principal
          ------------------------------ */}
      <SidebarContent>
        <SidebarGroup>
          {/* Se quiser manter “Menu Principal” como label, pode retirar
              o margin/padding extra que acrescentam espaçamento entre grupos.
              Aqui usamos apenas um grupo, então não há “divisor” visual adicional. */}
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  {/*
                    Para melhorar consistência, passo as classes abaixo no className:
                    - "flex items-center": garante alinhamento vertical de ícone+texto
                    - "px-4 py-2 rounded-r-lg transition-colors": padding idêntico e borda arredondada na direita
                    - Condicional de isActive: muda background, cor e adiciona borda-l à esquerda
                    - Se não ativo, mantém cor cinza e muda suavemente no hover
                  */}
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={item.isActive}
                    tooltip={item.label}
                    className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                      item.isActive
                        ? 'bg-gestorApp-blue/10 text-gestorApp-blue border-l-4 border-gestorApp-blue'
                        : 'text-gestorApp-gray hover:bg-gestorApp-blue/5 hover:text-gestorApp-blue'
                    }`}
                  >
                    {/* Ícone já com w-5 h-5, mas agora herda a cor do currentColor graças ao parent text-... */}
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ------------------------------
          3. FOOTER: Usuário + Logout
          ------------------------------ */}
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col space-y-4">
          {user && (
            <div className="flex items-center space-x-2 text-sm">
              <UserIcon className="w-5 h-5 text-gestorApp-gray" />
              <span className="text-gestorApp-gray-dark">
                {getUserDisplayName()}
              </span>
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
