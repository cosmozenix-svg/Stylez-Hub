import React, { useState, useRef } from 'react';
import { MainNavTab } from '../types';
import { BRAND } from '../constants/brand';

interface HeaderProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  onTitleClick?: () => void;
  onSecretAdminTrigger?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onTitleClick,
  onSecretAdminTrigger,
}) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  const handleLogoTap = () => {
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

  const navItems: { id: MainNavTab; label: string }[] = [
    { id: 'home', label: 'Feed' },
    { id: 'search', label: 'Search' },
    { id: 'news', label: 'News' },
    { id: 'social', label: 'Socials' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-blue-500/15 bg-[#050a16]/90 backdrop-blur-md select-none">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-3 md:gap-8">
        {/* Zone 1: Brand Wordmark + Icon */}
        <button
          onClick={handleLogoTap}
          className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.98] whitespace-nowrap shrink-0 min-w-0"
          title={BRAND.name}
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-sky-400/30 flex items-center justify-center bg-[#0b162c] shadow-sm shadow-blue-950/50 shrink-0">
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
          <span className="font-heading text-base sm:text-xl font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            {BRAND.name}
          </span>
        </button>

        {/* Zone 2: Desktop Navigation Links (Clean Typography, No Capsules) */}
        <nav aria-label="Desktop Navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-sky-400'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => onTabChange(activeTab === 'social' ? 'home' : 'social')}
            className="px-3.5 sm:px-4 py-2 min-h-[40px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm shadow-blue-950/50"
          >
            {activeTab === 'social' ? 'Latest Feed' : 'Follow Stylez'}
          </button>
        </div>
      </div>
    </header>
  );
};
