
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/navigation/Sidebar';

/**
 * Main application layout with sidebar and content area
 * Provides consistent layout structure across the application
 */
const AppLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      {/* Main content area with left margin to account for fixed sidebar on desktop */}
      <main className="flex-1 ml-0 md:ml-[240px] overflow-auto bg-gray-50">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
