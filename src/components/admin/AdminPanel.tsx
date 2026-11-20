import React, { useState } from 'react';
import {
  ArrowLeft,
  LogOut,
  FileText,
  Newspaper,
  Globe,
  Settings as SettingsIcon,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { AdminCredentials, AdminTab, BlogPost, NewsItem, SocialAccount } from '../../types';
import { BRAND } from '../../constants/brand';
import { BlogManager } from './BlogManager';
import { NewsManager } from './NewsManager';
import { SocialManager } from './SocialManager';
import { SettingsManager } from './SettingsManager';

interface AdminPanelProps {
  credentials: AdminCredentials;
  blogs: BlogPost[];
  news: NewsItem[];
  socials: SocialAccount[];
  onSaveBlogs: (blogs: BlogPost[]) => void;
  onSaveNews: (news: NewsItem[]) => void;
  onSaveSocials: (socials: SocialAccount[]) => Promise<void> | void;
  onUpdateCredentials: (newCreds: AdminCredentials) => void;
  onResetData: () => void;
  onExitAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  credentials,
  blogs,
  news,
  socials,
  onSaveBlogs,
  onSaveNews,
  onSaveSocials,
  onUpdateCredentials,
  onResetData,
  onExitAdmin,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('posts');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (
      usernameInput.trim() === credentials.username &&
      passwordInput === credentials.password
    ) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please verify username and password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // 1. Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 stylez-backdrop">
        <div className="w-full max-w-sm glass-panel rounded-2xl p-6 border border-blue-500/20 bg-[#0a1326] shadow-2xl space-y-5 animate-in fade-in duration-150">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-sky-400/35 bg-[#060d1c] flex items-center justify-center mx-auto shadow-lg shadow-blue-950/60">
              <img
                src={BRAND.iconUrl}
                alt={BRAND.adminTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="font-heading text-xl font-bold text-slate-100 tracking-tight">
              {BRAND.adminTitle}
            </h1>
            <p className="text-xs text-sky-300/80 font-medium">
              {BRAND.description}
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Username</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter username"
                className="w-full glass-input rounded-lg px-3.5 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full glass-input rounded-lg px-3.5 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-blue-950/60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enter {BRAND.adminTitle}</span>
              </button>
            </div>
          </form>

          <div className="pt-3 text-center border-t border-blue-500/15 space-y-2">
            <p className="text-[11px] text-slate-400">
              Default access: <span className="text-sky-300 font-mono">admin</span> / <span className="text-sky-300 font-mono">admin123</span>
            </p>
            <button
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to {BRAND.name}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Dashboard
  const navTabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'social', label: 'Social', icon: Globe },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen stylez-backdrop pb-20 text-slate-100">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-30 border-b border-blue-500/15 bg-[#050a16]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-sky-400/35 bg-[#0b162c] flex-shrink-0">
              <img
                src={BRAND.iconUrl}
                alt={BRAND.adminTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="font-heading text-sm sm:text-base font-bold text-slate-100 tracking-tight block truncate">
                {BRAND.adminTitle}
              </span>
              <span className="block text-[11px] text-sky-400/80 -mt-0.5 truncate">
                {BRAND.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onExitAdmin}
              className="px-3 py-2 min-h-[40px] rounded-xl glass-button text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xs:inline sm:inline">Public Site</span>
              <span className="sm:hidden">Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl glass-button text-slate-400 hover:text-rose-300 cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-5">
        <div className="grid grid-cols-4 p-1.5 rounded-2xl glass-panel border border-blue-500/20 bg-[#081124] gap-1 sm:gap-1.5">
          {navTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 min-h-[44px] rounded-xl text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/60'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6">
        {activeTab === 'posts' && (
          <BlogManager blogs={blogs} onSaveBlogs={onSaveBlogs} />
        )}
        {activeTab === 'news' && (
          <NewsManager news={news} onSaveNews={onSaveNews} />
        )}
        {activeTab === 'social' && (
          <SocialManager socials={socials} onSaveSocials={onSaveSocials} />
        )}
        {activeTab === 'settings' && (
          <SettingsManager
            credentials={credentials}
            onUpdateCredentials={onUpdateCredentials}
            onResetData={onResetData}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
};
