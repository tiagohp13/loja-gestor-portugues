import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfileQuery } from '@/hooks/queries/useUserProfileQuery';
import { 
  LayoutDashboard, Users, Settings, Building2, CreditCard, LogOut, ArrowLeft
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
import { Button } from '@/components/ui/button';

/**
 * Sidebar da Área Administrativa NEXORA
 * Navegação exclusiva para gestão de tenants e sistema
 */
const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: profile } = useUserProfileQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const adminNavigationItems = [
    { 
      path: '/admin-panel/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      isActive: location.pathname === '/admin-panel/dashboard'
    },
    { 
      path: '/admin-panel/tenants', 
      label: 'Organizações', 
      icon: <Building2 className="w-5 h-5" />,
      isActive: location.pathname.includes('/admin-panel/tenants')
    },
    { 
      path: '/admin-panel/users', 
      label: 'Utilizadores', 
      icon: <Users className="w-5 h-5" />,
      isActive: location.pathname.includes('/admin-panel/users')
    },
    { 
      path: '/admin-panel/subscriptions', 
      label: 'Subscrições', 
      icon: <CreditCard className="w-5 h-5" />,
      isActive: location.pathname.includes('/admin-panel/subscriptions')
    },
    { 
      path: '/admin-panel/settings', 
      label: 'Configurações', 
      icon: <Settings className="w-5 h-5" />,
      isActive: location.pathname.includes('/admin-panel/settings')
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

  const handleBackToErp = () => {
    navigate('/dashboard');
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
      <SidebarHeader className="p-4 border-b">
        <div className="flex flex-col space-y-3">
          {/* Branding NEXORA */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-primary">NEXORA</h2>
              <p className="text-xs text-muted-foreground font-medium">(NXR)</p>
              <p className="text-[10px] text-muted-foreground mt-1">Painel Administrativo</p>
            </div>
          </div>
          
          {/* Botão para voltar ao ERP */}
          <Button
            onClick={handleBackToErp}
            variant="outline"
            size="sm"
            className="gap-2 w-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Entrar no ERP
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão da Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
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
            <LogOut className="w-5 h-5" />
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

export default AdminSidebar;
