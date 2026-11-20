import React from 'react';
import { Home, Search, Newspaper, Globe } from 'lucide-react';
import { MainNavTab } from '../types';

interface BottomNavProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: MainNavTab; label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Feed', href: '/', icon: Home },
    { id: 'search', label: 'Search', href: '/search', icon: Search },
    { id: 'news', label: 'News', href: '/news', icon: Newspaper },
    { id: 'social', label: 'Social', href: '/socials', icon: Globe },
  ];

  const handleLinkClick = (e: React.MouseEvent, tab: MainNavTab) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onTabChange(tab);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-[#030712]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <a
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleLinkClick(e, tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors select-none group cursor-pointer ${
                isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-4 right-4 h-[2px] bg-sky-400 rounded-b-full" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'scale-105 text-sky-400' : 'group-hover:scale-105'
                }`}
              />
              <span
                className={`text-[11px] tracking-tight mt-1 transition-colors whitespace-nowrap ${
                  isActive ? 'text-slate-100 font-semibold' : 'text-slate-400 font-normal'
                }`}
              >
                {tab.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
