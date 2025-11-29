import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface SideNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SideNavProps {
  items: SideNavItem[];
  header?: React.ReactNode;
}

export const SideNav: React.FC<SideNavProps> = ({ items, header }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  return (
    <div className="hidden md:flex w-64 bg-white border-r border-border-soft h-screen sticky top-0 flex-col">
      {header && (
        <div className="p-6 border-b border-border-soft">
          {header}
        </div>
      )}
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-text-main hover:bg-bg-soft'
                  }`}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

