import React from 'react';
import { NavLink } from 'react-router-dom';
import { navigation } from './Sidebar';

export function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-dark-100 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi bawah"
    >
      <div className="grid grid-cols-7">
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 pt-2 pb-1.5 text-dark-500 transition-colors
              ${isActive ? 'text-primary-600' : 'hover:text-dark-700'}
            `}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                <span className="relative flex items-center justify-center" aria-hidden="true">
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary-500" />
                  )}
                </span>
                <span className={`text-[10px] leading-none font-medium ${isActive ? 'text-primary-700' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}