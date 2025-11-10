
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Sidebar from '@/components/navigation/Sidebar';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import AlertsManager from '@/components/common/AlertsManager';
import { runAutomatedNotificationChecks } from '@/utils/notificationsService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Main application layout with sidebar and content area
 * Provides consistent layout structure across the application
 */
const AppLayout = () => {
  // Automatically scroll to top on route changes
  useScrollToTop();

  // Run automated notification checks on mount and periodically
  useEffect(() => {
    const checkNotifications = async () => {
      // Only run checks if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await runAutomatedNotificationChecks();
      }
    };

    // Initial check
    checkNotifications();

    // Check every 30 minutes
    const interval = setInterval(() => {
      checkNotifications();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <AlertsManager />
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background">
          <div className="sticky top-0 z-10 bg-card border-b border-border p-3 md:hidden flex items-center shadow-sm">
            <SidebarTrigger className="mr-2 text-foreground hover:bg-accent" />
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/3841c0e4-f3de-4811-a15b-404f0ea98932.png" 
                alt="Aqua Paraíso Logo" 
                className="h-6 w-auto"
              />
              <h2 className="text-lg font-semibold text-primary">Aqua Paraíso</h2>
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

export default AppLayout;
