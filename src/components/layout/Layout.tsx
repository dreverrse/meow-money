import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Sidebar (desktop only) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main
        className={`
          lg:pl-64 transition-all duration-300
          ${isSidebarCollapsed ? 'lg:pl-20' : ''}
          min-h-[calc(100vh-4rem)]
          pb-20 lg:pb-0
        `}
        id="main-content"
        tabIndex={-1}
      >
        <div className="container py-6 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation (mobile only) */}
      <MobileBottomNav />
    </div>
  );
}