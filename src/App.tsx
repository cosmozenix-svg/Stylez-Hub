/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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

export default function App() {
  const [blogs, setBlogs] = useState<BlogPost[]>(() => storageService.getBlogs());
  const [news, setNews] = useState<NewsItem[]>(() => storageService.getNews());
  const [socials, setSocials] = useState<SocialAccount[]>(() => storageService.getSocials());
  const [credentials, setCredentials] = useState<AdminCredentials>(() => storageService.getCredentials());

  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [activeTab, setActiveTab] = useState<MainNavTab>('home');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Real-time Firestore Cloud Database Synchronization
  useEffect(() => {
    const unsubPosts = databaseService.subscribePosts((cloudPosts) => {
      setBlogs(cloudPosts);
      setSelectedBlog((prev) => {
        if (!prev) return null;
        return cloudPosts.find((p) => p.id === prev.id) || null;
      });
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

  const checkAdminRoute = useCallback(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      return (
        path.endsWith('/admin') ||
        path === '/admin/' ||
        path.includes('/admin') ||
        hash === '#/admin' ||
        hash === '#admin' ||
        search.includes('admin')
      );
    } catch {
      return false;
    }
  }, []);

  const openAdminPanel = () => {
    try {
      if (!window.location.pathname.includes('/admin')) {
        window.history.pushState({}, '', '/admin');
      }
    } catch {
      // ignore
    }
    setIsAdminRoute(true);
  };

  useEffect(() => {
    setIsAdminRoute(checkAdminRoute());

    const handleLocationChange = () => {
      setIsAdminRoute(checkAdminRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    let typedBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdminPanel();
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-5);
        if (typedBuffer === 'admin') {
          openAdminPanel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [checkAdminRoute]);

  // Update dynamic page title for Stylez Hub
  useEffect(() => {
    if (selectedBlog) {
      document.title = `${selectedBlog.title} | ${BRAND.name}`;
    } else if (isAdminRoute) {
      document.title = `${BRAND.adminTitle} | ${BRAND.name}`;
    } else {
      document.title = `${BRAND.name} — ${BRAND.description}`;
    }
  }, [selectedBlog, isAdminRoute]);

  const handleSaveBlogs = async (updated: BlogPost[]) => {
    const prevById = new Map<string, BlogPost>(blogs.map((b) => [b.id, b]));
    const updatedIds = new Set(updated.map((b) => b.id));
    const deleted = blogs.filter((b) => !updatedIds.has(b.id));

    setBlogs(updated);
    storageService.saveBlogs(updated);

    if (selectedBlog) {
      const refreshed = updated.find((b) => b.id === selectedBlog.id);
      setSelectedBlog(refreshed || null);
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

    if (selectedBlog && selectedBlog.id === postId) {
      setSelectedBlog((prev) =>
        prev
          ? {
              ...prev,
              reviews: updatedReviews,
            }
          : null
      );
    }

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
    const prevById = new Map<string, SocialAccount>(socials.map((s) => [s.id, s]));
    const updatedIds = new Set(updated.map((s) => s.id));
    const deleted = socials.filter((s) => !updatedIds.has(s.id));

    setSocials(updated);
    storageService.saveSocials(updated);

    for (const d of deleted) {
      await databaseService.deleteSocialAccount(d.id).catch((err) => console.error(err));
    }

    for (const item of updated) {
      const existing = prevById.get(item.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
        await databaseService.saveSocialAccount(item).catch((err) => console.error(err));
      }
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
      if (window.location.pathname.includes('/admin')) {
        window.history.pushState({}, '', '/');
      }
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
    setSelectedBlog(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBlog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeaderClick = () => {
    setSelectedBlog(null);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        {selectedBlog ? (
          <BlogDetail
            post={selectedBlog}
            onBack={() => setSelectedBlog(null)}
            onAddReview={handleAddReview}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeSection
                blogs={blogs}
                onSelectBlog={handleSelectBlog}
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

      {/* Quiet Footer */}
      <footer className="hidden md:block border-t border-blue-500/15 bg-[#040812]/80">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <img
              src={BRAND.iconUrl}
              alt={BRAND.name}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-md object-cover border border-blue-500/25"
            />
            <span className="font-heading font-semibold text-slate-200">{BRAND.name}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{BRAND.description}</span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => handleTabChange('home')} className="hover:text-sky-400 transition-colors cursor-pointer">
              Feed
            </button>
            <button onClick={() => handleTabChange('news')} className="hover:text-sky-400 transition-colors cursor-pointer">
              News
            </button>
            <button onClick={() => handleTabChange('social')} className="hover:text-sky-400 transition-colors cursor-pointer">
              Socials
            </button>
          </div>
        </div>
      </footer>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
