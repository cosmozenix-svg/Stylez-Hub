/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BlogPost, NewsItem, SocialAccount, AdminCredentials, MainNavTab, PostReview } from './types';
import { storageService } from './services/storage';
import { databaseService } from './services/databaseService';
import { BRAND } from './constants/brand';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeSection } from './components/HomeSection';
import { SearchSection } from './components/SearchSection';
import { NewsSection } from './components/NewsSection';
import { SocialSection } from './components/SocialSection';
import { BlogDetail } from './components/BlogDetail';
import { AdminPanel } from './components/admin/AdminPanel';

const TAB_TO_PATH: Record<MainNavTab, string> = {
  home: '/',
  search: '/search',
  news: '/news',
  social: '/socials',
};

interface ParsedRoute {
  isAdmin: boolean;
  tab: MainNavTab;
  postId: string | null;
}

function parseLocationRoute(): ParsedRoute {
  try {
    const rawPath = window.location.pathname || '/';
    const path = rawPath.toLowerCase().replace(/\/+$/, '') || '/';
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();

    const isAdmin =
      path === '/admin' ||
      path.endsWith('/admin') ||
      path.includes('/admin/') ||
      hash === '#/admin' ||
      hash === '#admin' ||
      search.includes('admin');

    if (isAdmin) {
      return { isAdmin: true, tab: 'home', postId: null };
    }

    if (rawPath.toLowerCase().startsWith('/post/')) {
      const slug = rawPath.slice(6).split('/')[0];
      if (slug) {
        return { isAdmin: false, tab: 'home', postId: decodeURIComponent(slug) };
      }
    }

    if (path === '/search') {
      return { isAdmin: false, tab: 'search', postId: null };
    }
    if (path === '/news') {
      return { isAdmin: false, tab: 'news', postId: null };
    }
    if (path === '/social' || path === '/socials') {
      return { isAdmin: false, tab: 'social', postId: null };
    }

    return { isAdmin: false, tab: 'home', postId: null };
  } catch {
    return { isAdmin: false, tab: 'home', postId: null };
  }
}

export default function App() {
  const [blogs, setBlogs] = useState<BlogPost[]>(() => storageService.getBlogs());
  const [postsSynced, setPostsSynced] = useState(false);
  const [news, setNews] = useState<NewsItem[]>(() => storageService.getNews());
  const [socials, setSocials] = useState<SocialAccount[]>(() => storageService.getSocials());
  const [credentials, setCredentials] = useState<AdminCredentials>(() => storageService.getCredentials());

  const initialRoute = useMemo(() => parseLocationRoute(), []);
  const [isAdminRoute, setIsAdminRoute] = useState(initialRoute.isAdmin);
  const [activeTab, setActiveTab] = useState<MainNavTab>(initialRoute.tab);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialRoute.postId);
  const [lastListTab, setLastListTab] = useState<MainNavTab>(initialRoute.tab);

  const selectedBlog = useMemo(() => {
    if (!selectedPostId) return null;
    return blogs.find((p) => p.id === selectedPostId) || null;
  }, [blogs, selectedPostId]);

  // Real-time Firestore Cloud Database Synchronization
  useEffect(() => {
    const unsubPosts = databaseService.subscribePosts((cloudPosts) => {
      setBlogs(cloudPosts);
      setPostsSynced(true);
    });

    const unsubNews = databaseService.subscribeNews((cloudNews) => {
      setNews(cloudNews);
    });

    const unsubSocials = databaseService.subscribeSocials((cloudSocials) => {
      setSocials(cloudSocials);
    });

    const unsubCreds = databaseService.subscribeCredentials((cloudCreds) => {
      setCredentials(cloudCreds);
    });

    return () => {
      unsubPosts();
      unsubNews();
      unsubSocials();
      unsubCreds();
    };
  }, []);

  const syncFromLocation = useCallback(() => {
    const parsed = parseLocationRoute();
    setIsAdminRoute(parsed.isAdmin);
    setSelectedPostId(parsed.postId);
    if (!parsed.postId && !parsed.isAdmin) {
      setActiveTab(parsed.tab);
      setLastListTab(parsed.tab);
    }
  }, []);

  const openAdminPanel = useCallback(() => {
    try {
      if (!window.location.pathname.toLowerCase().includes('/admin')) {
        window.history.pushState({}, '', '/admin');
      }
    } catch {
      // ignore
    }
    setIsAdminRoute(true);
    setSelectedPostId(null);
  }, []);

  useEffect(() => {
    syncFromLocation();

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);

    let typedBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdminPanel();
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTypingInField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (!isTypingInField && /^[a-zA-Z]$/.test(e.key)) {
        typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-5);
        if (typedBuffer === 'admin') {
          openAdminPanel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [syncFromLocation, openAdminPanel]);

  // Update dynamic page title per page route
  useEffect(() => {
    if (isAdminRoute) {
      document.title = `${BRAND.adminTitle} | ${BRAND.name}`;
    } else if (selectedBlog) {
      document.title = `${selectedBlog.title} | ${BRAND.name}`;
    } else if (activeTab === 'search') {
      document.title = `Search | ${BRAND.name}`;
    } else if (activeTab === 'news') {
      document.title = `News & Dispatches | ${BRAND.name}`;
    } else if (activeTab === 'social') {
      document.title = `Official Socials | ${BRAND.name}`;
    } else {
      document.title = `${BRAND.name} — ${BRAND.description}`;
    }
  }, [selectedBlog, isAdminRoute, activeTab]);

  const handleSaveBlogs = async (updated: BlogPost[]) => {
    const prevById = new Map<string, BlogPost>(blogs.map((b) => [b.id, b]));
    const updatedIds = new Set(updated.map((b) => b.id));
    const deleted = blogs.filter((b) => !updatedIds.has(b.id));

    setBlogs(updated);
    storageService.saveBlogs(updated);

    if (selectedPostId && !updatedIds.has(selectedPostId)) {
      setSelectedPostId(null);
      try {
        window.history.replaceState({}, '', TAB_TO_PATH[lastListTab]);
      } catch {
        // ignore
      }
    }

    for (const d of deleted) {
      await databaseService.deletePost(d.id).catch((err) => console.error(err));
    }

    for (const p of updated) {
      const existing = prevById.get(p.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(p)) {
        await databaseService.savePost(p).catch((err) => console.error(err));
      }
    }
  };

  const handleAddReview = async (postId: string, review: PostReview) => {
    const targetPost = blogs.find((p) => p.id === postId);
    const existingReviews = targetPost?.reviews || [];
    const updatedReviews = [review, ...existingReviews];

    const updated = blogs.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          reviews: updatedReviews,
        };
      }
      return p;
    });

    setBlogs(updated);
    storageService.saveBlogs(updated);

    await databaseService.addReviewToPost(postId, review, existingReviews);
  };

  const handleSaveNews = async (updated: NewsItem[]) => {
    const prevById = new Map<string, NewsItem>(news.map((n) => [n.id, n]));
    const updatedIds = new Set(updated.map((n) => n.id));
    const deleted = news.filter((n) => !updatedIds.has(n.id));

    setNews(updated);
    storageService.saveNews(updated);

    for (const d of deleted) {
      await databaseService.deleteNewsItem(d.id).catch((err) => console.error(err));
    }

    for (const item of updated) {
      const existing = prevById.get(item.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
        await databaseService.saveNewsItem(item).catch((err) => console.error(err));
      }
    }
  };

  const handleSaveSocials = async (updated: SocialAccount[]) => {
    const prevSocials = socials;
    const prevById = new Map<string, SocialAccount>(prevSocials.map((s) => [s.id, s]));
    const updatedIds = new Set(updated.map((s) => s.id));
    const deleted = prevSocials.filter((s) => !updatedIds.has(s.id));
    const changedOrAdded = updated.filter((item) => {
      const existing = prevById.get(item.id);
      return !existing || JSON.stringify(existing) !== JSON.stringify(item);
    });

    setSocials(updated);
    storageService.saveSocials(updated);

    try {
      await Promise.all([
        ...deleted.map((d) => databaseService.deleteSocialAccount(d.id)),
        ...changedOrAdded.map((item) => databaseService.saveSocialAccount(item)),
      ]);
    } catch (err) {
      console.error('Failed to sync social links with database:', err);
      throw err;
    }
  };

  const handleUpdateCredentials = async (newCreds: AdminCredentials) => {
    setCredentials(newCreds);
    storageService.saveCredentials(newCreds);
    await databaseService.saveCredentials(newCreds);
  };

  const handleResetData = async () => {
    await databaseService.resetDatabase();
    setBlogs([]);
    setNews([]);
    setSocials(storageService.getSocials());
    setCredentials(storageService.getCredentials());
  };

  const handleExitAdmin = () => {
    try {
      window.history.pushState({}, '', TAB_TO_PATH[activeTab]);
      if (window.location.hash.includes('admin')) {
        window.location.hash = '';
      }
    } catch {
      // ignore
    }
    setIsAdminRoute(false);
  };

  const handleTabChange = (tab: MainNavTab) => {
    setActiveTab(tab);
    setLastListTab(tab);
    setSelectedPostId(null);
    try {
      const nextPath = TAB_TO_PATH[tab];
      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath);
      }
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBlog = (blog: BlogPost) => {
    setLastListTab(activeTab);
    setSelectedPostId(blog.id);
    try {
      const nextPath = `/post/${encodeURIComponent(blog.id)}`;
      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath);
      }
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromPost = () => {
    const returnTab = lastListTab || 'home';
    setSelectedPostId(null);
    setActiveTab(returnTab);
    try {
      window.history.pushState({}, '', TAB_TO_PATH[returnTab]);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeaderClick = () => {
    handleTabChange('home');
  };

  const handleFooterLinkClick = (e: React.MouseEvent, tab: MainNavTab) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    handleTabChange(tab);
  };

  if (isAdminRoute) {
    return (
      <AdminPanel
        credentials={credentials}
        blogs={blogs}
        news={news}
        socials={socials}
        onSaveBlogs={handleSaveBlogs}
        onSaveNews={handleSaveNews}
        onSaveSocials={handleSaveSocials}
        onUpdateCredentials={handleUpdateCredentials}
        onResetData={handleResetData}
        onExitAdmin={handleExitAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen stylez-backdrop text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-blue-600/40 selection:text-sky-100">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onTitleClick={handleHeaderClick}
        onSecretAdminTrigger={openAdminPanel}
      />

      <main className="flex-1 w-full relative z-10">
        {selectedPostId ? (
          selectedBlog ? (
            <BlogDetail
              post={selectedBlog}
              onBack={handleBackFromPost}
              onAddReview={handleAddReview}
            />
          ) : !postsSynced ? (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading post...</p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
              <h1 className="font-heading text-2xl font-bold text-white">Post not found</h1>
              <p className="text-sm text-slate-400">
                This post may have been removed or the link is no longer active.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange('home')}
                className="px-5 py-2.5 min-h-[42px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Feed
              </button>
            </div>
          )
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeSection
                blogs={blogs}
                newsCount={news.length}
                socialsCount={socials.length}
                onSelectBlog={handleSelectBlog}
                onNavigateTab={handleTabChange}
              />
            )}
            {activeTab === 'search' && (
              <SearchSection
                blogs={blogs}
                onSelectBlog={handleSelectBlog}
              />
            )}
            {activeTab === 'news' && (
              <NewsSection
                news={news}
              />
            )}
            {activeTab === 'social' && (
              <SocialSection
                socials={socials}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="hidden md:block border-t border-slate-800/80 bg-[#030712]/90">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <img
              src={BRAND.iconUrl}
              alt={BRAND.name}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-md object-cover border border-slate-700"
            />
            <span className="font-heading font-semibold text-slate-200">{BRAND.name}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{BRAND.description}</span>
          </div>
          <nav aria-label="Footer Navigation" className="flex items-center gap-6">
            <a
              href="/"
              onClick={(e) => handleFooterLinkClick(e, 'home')}
              className={`hover:text-sky-400 transition-colors ${activeTab === 'home' && !selectedPostId ? 'text-slate-100 font-medium' : ''}`}
            >
              Feed
            </a>
            <a
              href="/search"
              onClick={(e) => handleFooterLinkClick(e, 'search')}
              className={`hover:text-sky-400 transition-colors ${activeTab === 'search' && !selectedPostId ? 'text-slate-100 font-medium' : ''}`}
            >
              Search
            </a>
            <a
              href="/news"
              onClick={(e) => handleFooterLinkClick(e, 'news')}
              className={`hover:text-sky-400 transition-colors ${activeTab === 'news' && !selectedPostId ? 'text-slate-100 font-medium' : ''}`}
            >
              News
            </a>
            <a
              href="/socials"
              onClick={(e) => handleFooterLinkClick(e, 'social')}
              className={`hover:text-sky-400 transition-colors ${activeTab === 'social' && !selectedPostId ? 'text-slate-100 font-medium' : ''}`}
            >
              Social
            </a>
          </nav>
        </div>
      </footer>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
