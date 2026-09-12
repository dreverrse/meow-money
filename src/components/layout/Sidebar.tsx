import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  FolderOpen,
  Target,
  PieChart,
  PiggyBank,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/', badge: null },
  { label: 'Transaksi', icon: ListChecks, href: '/transactions', badge: null },
  { label: 'Kategori', icon: FolderOpen, href: '/categories', badge: null },
  { label: 'Anggaran', icon: Target, href: '/budget', badge: null },
  { label: 'Laporan', icon: PieChart, href: '/reports', badge: null },
  { label: 'Tabungan', icon: PiggyBank, href: '/savings', badge: null },
  { label: 'Pengaturan', icon: Settings, href: '/settings', badge: null },
];

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const { state } = useApp();

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-dark-100
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        flex flex-col
      `}
      aria-label="Navigasi utama"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-dark-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-display font-bold text-lg">M</span>
          </div>
          {!isCollapsed && (
            <span className="font-display font-bold text-xl text-dark-900">MeowMoney</span>
          )}
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="btn-icon text-dark-400 hover:text-dark-600 lg:hidden"
            aria-label={isCollapsed ? 'Perlebar sidebar' : 'Ciutkan sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu navigasi">
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-primary-50 text-primary-700 shadow-soft'
                : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
              }
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? item.label : undefined}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                <span className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-dark-100">
        {!isCollapsed && (
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-500 hover:bg-dark-50 hover:text-dark-900 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Bantuan</span>
            </a>
            <div className="pt-3 mt-3 border-t border-dark-100">
              <p className="px-3 text-xs text-dark-400 font-medium">v1.0.0</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <a href="#" className="btn-icon text-dark-400 hover:text-dark-600" aria-label="Bantuan">
              <HelpCircle className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}