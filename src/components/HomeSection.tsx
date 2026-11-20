import React, { useState, useMemo } from 'react';
import { ArrowRight, Layers, RotateCcw } from 'lucide-react';
import { BlogPost, MainNavTab, SortOption } from '../types';
import { BlogCard } from './BlogCard';
import { BRAND } from '../constants/brand';

interface HomeSectionProps {
  blogs: BlogPost[];
  newsCount: number;
  socialsCount: number;
  onSelectBlog: (blog: BlogPost) => void;
  onNavigateTab: (tab: MainNavTab) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  blogs,
  newsCount,
  socialsCount,
  onSelectBlog,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const totalReviews = useMemo(
    () => blogs.reduce((sum, b) => sum + (Array.isArray(b.reviews) ? b.reviews.length : 0), 0),
    [blogs]
  );

  const categories = useMemo(() => {
    if (!blogs || blogs.length === 0) return ['All'];
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) {
        set.add(b.category.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [blogs]);

  const processedBlogs = useMemo(() => {
    if (!blogs || blogs.length === 0) return [];
    let result = [...blogs];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (b) => b.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    result.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (sortOption === 'newest') return timeB - timeA;
      if (sortOption === 'oldest') return timeA - timeB;
      if (sortOption === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return result;
  }, [blogs, selectedCategory, sortOption]);

  const isDefaultView =
    selectedCategory === 'All' && sortOption === 'newest' && processedBlogs.length > 0;
  const featuredPost = isDefaultView ? processedBlogs[0] : null;
  const gridPosts = isDefaultView ? processedBlogs.slice(1) : processedBlogs;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-28 md:pb-20 space-y-10 animate-in fade-in duration-150">
      {/* Architectural Masthead Hero */}
      <section className="pb-8 border-b border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-sky-400/30 bg-[#091122] shrink-0 shadow-lg shadow-blue-950/60">
                <img
                  src={BRAND.iconUrl}
                  alt={`${BRAND.name} Icon`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sky-400 tracking-wide">
                  Official Publication & Feed
                </p>
                <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">
                  {BRAND.name}
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {BRAND.description} Explore featured posts, community reviews, quick dispatches, and official channels from one place.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigateTab('search')}
                className="px-4 py-2.5 min-h-[42px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-950/60"
              >
                <span>Search Archive</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('news')}
                className="px-4 py-2.5 min-h-[42px] rounded-xl glass-button text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Latest News
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('social')}
                className="px-4 py-2.5 min-h-[42px] rounded-xl glass-button text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Official Socials
              </button>
            </div>
          </div>

          {/* Right: Clean Real-Data Metrics Ledger */}
          <div className="lg:col-span-4 rounded-2xl bg-[#070e1d] border border-slate-800/90 p-4 sm:p-5 grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-0 lg:divide-y lg:divide-slate-800/80">
            <div className="lg:pb-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-0.5">
              <span className="text-[11px] sm:text-xs text-slate-400">Published Posts</span>
              <span className="font-mono text-lg sm:text-xl font-bold text-white tabular-nums">
                {blogs.length}
              </span>
            </div>
            <div className="lg:py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-0.5 border-l border-slate-800/80 pl-3 lg:border-l-0 lg:pl-0">
              <span className="text-[11px] sm:text-xs text-slate-400">Community Reviews</span>
              <span className="font-mono text-lg sm:text-xl font-bold text-sky-400 tabular-nums">
                {totalReviews}
              </span>
            </div>
            <div className="lg:pt-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-0.5 border-l border-slate-800/80 pl-3 lg:border-l-0 lg:pl-0">
              <span className="text-[11px] sm:text-xs text-slate-400">
                News & Channels
              </span>
              <span className="font-mono text-lg sm:text-xl font-bold text-slate-200 tabular-nums">
                {newsCount + socialsCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      {!blogs || blogs.length === 0 ? (
        <section className="rounded-2xl border border-slate-800/90 bg-[#070e1d] editorial-grid-bg p-10 sm:p-14 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0b162c] border border-sky-400/25 text-sky-400 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-white">
            No posts published yet
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {BRAND.description} Featured posts, links, and community reviews will appear here as soon as they are published.
          </p>
        </section>
      ) : (
        <div className="space-y-8">
          {/* Featured Spotlight */}
          {featuredPost && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-100">
                  Featured Post
                </h2>
                <span className="text-xs font-mono text-slate-400">Latest release</span>
              </div>
              <BlogCard
                post={featuredPost}
                featured={true}
                onClick={() => onSelectBlog(featuredPost)}
              />
            </section>
          )}

          {/* Inline Filter & Sort Toolbar */}
          <section className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 min-h-[38px] rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/50'
                          : 'glass-button text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#070e1d] border border-slate-800/90 self-start md:self-auto">
                {(
                  [
                    { id: 'newest', label: 'Newest' },
                    { id: 'oldest', label: 'Oldest' },
                    { id: 'title', label: 'Title A–Z' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortOption(opt.id)}
                    className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      sortOption === opt.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {processedBlogs.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/90 bg-[#070e1d] p-10 text-center space-y-3">
                <p className="text-sm text-slate-100 font-semibold">No matching posts</p>
                <p className="text-xs text-slate-400">
                  No posts match the selected topic filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSortOption('newest');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              </div>
            ) : gridPosts.length > 0 ? (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${
                  gridPosts.length >= 3 ? 'lg:grid-cols-3' : ''
                }`}
              >
                {gridPosts.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    post={blog}
                    onClick={() => onSelectBlog(blog)}
                  />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
};
