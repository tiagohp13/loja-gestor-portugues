
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Sidebar from '@/components/navigation/Sidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { Menu } from 'lucide-react';

const AppLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="sticky top-0 z-10 bg-white border-b p-3 md:hidden flex items-center">
            <SidebarTrigger className="mr-2" />
            <h2 className="text-lg font-semibold text-gestorApp-blue">Gestor de Stock</h2>
          </div>
          <div className="p-4 pb-20 md:pb-4"> {/* Added padding at the bottom for mobile to make room for the navigation bar */}
            <Outlet />
          </div>
          <MobileNavigation />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
