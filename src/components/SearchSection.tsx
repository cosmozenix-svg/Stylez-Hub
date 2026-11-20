import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search as SearchIcon,
  X,
  Filter,
  Layers,
  LayoutGrid,
  List as ListIcon,
  ArrowUpRight,
  Star,
} from 'lucide-react';
import { BlogPost } from '../types';
import { BlogCard } from './BlogCard';
import { BRAND } from '../constants/brand';

interface SearchSectionProps {
  blogs: BlogPost[];
  onSelectBlog: (blog: BlogPost) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ blogs, onSelectBlog }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category?.trim()) set.add(b.category.trim());
    });
    return ['All', ...Array.from(set)];
  }, [blogs]);

  const suggestedKeywords = useMemo(() => {
    if (!blogs || blogs.length === 0) return [];
    const words = new Set<string>();
    blogs.forEach((b) => {
      if (b.title) {
        b.title
          .split(/\s+/)
          .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
          .filter((w) => w.length > 3)
          .forEach((w) => words.add(w.toLowerCase()));
      }
    });
    return Array.from(words).slice(0, 6);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    if (!blogs || blogs.length === 0) return [];
    let pool = blogs;

    if (selectedCategory !== 'All') {
      pool = pool.filter(
        (b) => b.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return pool;

    const searchWords = trimmed.split(/\s+/).filter(Boolean);
    return pool.filter((blog) => {
      const titleLower = (blog.title || '').toLowerCase();
      const descLower = (blog.description || '').toLowerCase();
      const catLower = (blog.category || '').toLowerCase();

      return searchWords.every(
        (word) =>
          titleLower.includes(word) ||
          descLower.includes(word) ||
          catLower.includes(word)
      );
    });
  }, [blogs, query, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-28 md:pb-20 space-y-8 animate-in fade-in duration-150">
      {/* Discovery Masthead */}
      <section className="max-w-3xl mx-auto text-center space-y-4">
        <p className="text-xs font-semibold text-sky-400 tracking-wide">
          Explore & Filter
        </p>
        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Search {BRAND.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Find posts, announcements, links, and community-reviewed releases across {BRAND.name}.
        </p>

        {/* Spotlight Search Input */}
        <div className="relative pt-2">
          <div className="absolute inset-y-0 top-2 left-4 flex items-center pointer-events-none text-sky-400">
            <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, keyword, or topic..."
            className="w-full glass-input text-base sm:text-sm text-slate-100 placeholder-slate-500 rounded-2xl pl-11 sm:pl-12 pr-20 py-3.5 sm:py-4"
            autoFocus
          />

          <div className="absolute inset-y-0 top-2 right-3 flex items-center gap-1.5">
            {query.trim().length > 0 ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-500 border border-slate-800 bg-[#091122]">
                /
              </kbd>
            )}
          </div>
        </div>
      </section>

      {!blogs || blogs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/90 bg-[#070e1d] p-10 text-center space-y-3 max-w-2xl mx-auto">
          <div className="w-11 h-11 rounded-xl bg-[#0b162c] border border-sky-400/20 text-sky-400 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-100 font-semibold">No posts to search yet</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Once posts are published in the admin panel, you can search and filter them here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Topic & Quick Keyword Filters */}
          <div className="space-y-3">
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-xs text-slate-400 shrink-0 font-medium">Topic:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'glass-button text-slate-300 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {suggestedKeywords.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-xs text-slate-400 shrink-0 font-medium">
                  Keywords:
                </span>
                {suggestedKeywords.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => setQuery(word)}
                    className={`text-xs px-3 py-1.5 min-h-[36px] rounded-lg transition-colors shrink-0 capitalize cursor-pointer whitespace-nowrap ${
                      query.toLowerCase() === word
                        ? 'bg-sky-500/20 border border-sky-400/50 text-sky-300'
                        : 'glass-button text-slate-300 hover:text-white'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Toolbar */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono break-words">
                Showing {filteredBlogs.length} of {blogs.length}{' '}
                {blogs.length === 1 ? 'post' : 'posts'}
              </span>
              {(query.trim() || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCategory('All');
                  }}
                  className="text-sky-400 hover:underline font-medium cursor-pointer shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-[#070e1d] border border-slate-800/90 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="List view"
                title="List view"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Results */}
          {filteredBlogs.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/90 bg-[#070e1d] p-10 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0b162c] border border-slate-700 text-sky-400 flex items-center justify-center mx-auto">
                <Filter className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-100 font-semibold">No posts found</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto break-words">
                No posts match your current search or topic filter.
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800/90 bg-[#070e1d] overflow-hidden">
              {filteredBlogs.map((blog) => {
                const reviews = blog.reviews || [];
                const avgRating =
                  reviews.length > 0
                    ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1)
                    : null;
                const dateFormatted = blog.createdAt
                  ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <button
                    key={blog.id}
                    type="button"
                    onClick={() => onSelectBlog(blog)}
                    className="w-full text-left p-4 sm:p-5 flex items-center gap-4 hover:bg-[#0d182f] transition-colors cursor-pointer group"
                  >
                    <div className="w-24 sm:w-32 aspect-video rounded-xl overflow-hidden bg-[#060d1c] border border-slate-800 shrink-0">
                      {blog.images?.[0] ? (
                        <img
                          src={blog.images[0]}
                          alt={blog.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={BRAND.iconUrl}
                            alt={BRAND.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-md object-cover opacity-75"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {blog.category && (
                          <>
                            <span className="font-semibold text-sky-400">{blog.category}</span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <span className="font-mono">{dateFormatted}</span>
                        {avgRating && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 font-mono text-amber-300 font-semibold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {avgRating}
                            </span>
                          </>
                        )}
                      </div>
                      <h2 className="font-heading text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                        {blog.title}
                      </h2>
                      {blog.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">{blog.description}</p>
                      )}
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-sky-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${
                filteredBlogs.length >= 3 ? 'lg:grid-cols-3' : ''
              }`}
            >
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  post={blog}
                  onClick={() => onSelectBlog(blog)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
