import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import { useScrollToTop } from '@/hooks/useScrollToTop';

/**
 * Layout da Área Administrativa NEXORA
 * Totalmente separado do layout do ERP
 */
const AdminLayout = () => {
  useScrollToTop();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-background">
          <div className="sticky top-0 z-10 bg-card border-b border-border p-3 md:hidden flex items-center shadow-sm">
            <SidebarTrigger className="mr-2 text-foreground hover:bg-accent" />
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-primary">NEXORA</h2>
              <span className="text-xs text-muted-foreground">(NXR)</span>
            </div>
          </div>
          <div className="p-4 bg-background min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
