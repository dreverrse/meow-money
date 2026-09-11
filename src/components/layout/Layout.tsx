import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
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
        `}
        id="main-content"
        tabIndex={-1}
      >
        <div className="container py-6 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden btn-primary shadow-lg rounded-full p-3"
        aria-label="Buka menu navigasi"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}