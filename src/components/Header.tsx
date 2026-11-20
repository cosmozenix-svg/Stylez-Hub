import React, { useState, useRef } from 'react';
import { MainNavTab } from '../types';
import { BRAND } from '../constants/brand';

interface HeaderProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  onTitleClick?: () => void;
  onSecretAdminTrigger?: () => void;
}

const TAB_PATHS: Record<MainNavTab, string> = {
  home: '/',
  search: '/search',
  news: '/news',
  social: '/socials',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onTitleClick,
  onSecretAdminTrigger,
}) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  const handleLogoTap = (e: React.MouseEvent) => {
    e.preventDefault();
    // Hidden gateway: 5 consecutive taps within 2.5 seconds enables admin in iframe
    clickCountRef.current += 1;
    if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      if (onSecretAdminTrigger) {
        onSecretAdminTrigger();
        return;
      }
    }

    clickTimerRef.current = window.setTimeout(() => {
      clickCountRef.current = 0;
    }, 2500);

    if (onTitleClick) {
      onTitleClick();
    }
  };

  const navItems: { id: MainNavTab; label: string; href: string }[] = [
    { id: 'home', label: 'Feed', href: TAB_PATHS.home },
    { id: 'search', label: 'Search', href: TAB_PATHS.search },
    { id: 'news', label: 'News', href: TAB_PATHS.news },
    { id: 'social', label: 'Social', href: TAB_PATHS.social },
  ];

  const handleLinkClick = (e: React.MouseEvent, tab: MainNavTab) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#030712]/90 backdrop-blur-xl select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Clean Brand Lockup */}
        <a
          href="/"
          onClick={handleLogoTap}
          className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.98] whitespace-nowrap shrink-0"
          title={BRAND.name}
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-sky-400/30 flex items-center justify-center bg-[#091122] shrink-0">
            {!logoFailed ? (
              <img
                src={BRAND.iconUrl}
                alt={`${BRAND.name} Icon`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="font-heading text-xs font-bold text-sky-300">SH</span>
            )}
          </div>
          <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0">
            {BRAND.name}
          </span>
        </a>

        {/* Zone 2: Desktop Multi-Page Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-sky-400 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <a
            href={activeTab === 'social' ? '/' : '/socials'}
            onClick={(e) => handleLinkClick(e, activeTab === 'social' ? 'home' : 'social')}
            className="px-4 py-2 min-h-[40px] inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm shadow-blue-950/60"
          >
            {activeTab === 'social' ? 'View Feed' : 'Follow Stylez'}
          </a>
        </div>
      </div>
    </header>
  );
};
