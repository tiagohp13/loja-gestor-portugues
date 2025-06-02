
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
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
