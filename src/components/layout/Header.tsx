import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, ChevronDown, Bell, Settings, User, LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { navigation } from './Sidebar';

export function Header() {
  const { state, updatePreferences } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    setTheme(state.preferences.theme);
    
    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (state.preferences.theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.preferences.theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updatePreferences({ theme: newTheme });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-dark-100">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="btn-icon lg:hidden text-dark-600"
              aria-label="Buka menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">M</span>
              </div>
              <span className="font-display font-bold text-xl text-dark-900 hidden sm:block">MeowMoney</span>
            </div>
          </div>

          {/* Search - Desktop only */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari transaksi, kategori..."
                className="input pl-10 py-2.5 bg-dark-50 border-dark-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-dark-100 rounded-xl p-1">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    theme === t
                      ? 'bg-white shadow-card text-primary-500'
                      : 'text-dark-500 hover:text-dark-700'
                  }`}
                  aria-label={`Tema ${t}`}
                  aria-pressed={theme === t}
                >
                  {t === 'light' && <Sun className="w-5 h-5" />}
                  {t === 'dark' && <Moon className="w-5 h-5" />}
                  {t === 'system' && <Monitor className="w-5 h-5" />}
                </button>
              ))}
            </div>

            {/* Notifications */}
            <button className="btn-icon text-dark-600 relative" aria-label="Notifikasi">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-100 transition-colors"
                aria-label="Menu profil"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <Avatar name="Pengguna" size="md" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-dark-900">Pengguna</p>
                  <p className="text-xs text-dark-500">Premium</p>
                </div>
                <ChevronDown className="w-4 h-4 text-dark-400 hidden md:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-dark-100 py-2 animate-scale-in z-50">
                  <div className="px-4 py-2 border-b border-dark-100">
                    <p className="font-medium text-dark-900">Pengguna</p>
                    <p className="text-sm text-dark-500">user@meowmoney.com</p>
                  </div>
                  
                  <nav className="py-1">
                    <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 hover:text-dark-900 transition-colors">
                      <User className="w-5 h-5" />
                      Profil
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 hover:text-dark-900 transition-colors">
                      <Settings className="w-5 h-5" />
                      Pengaturan
                    </a>
                    <hr className="my-1 border-dark-100" />
                    <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left">
                      <LogOut className="w-5 h-5" />
                      Keluar
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-dark-100 flex items-center justify-between">
              <h2 className="font-display font-semibold text-dark-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-icon text-dark-600"
                aria-label="Tutup menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-base
                    ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            
            <div className="p-4 border-t border-dark-100 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-dark-600 hover:bg-dark-50 hover:text-dark-900 transition-colors text-left text-base">
                <Moon className="w-5 h-5" />
                Mode Gelap
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left text-base">
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}