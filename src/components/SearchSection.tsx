import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, X, Filter, Layers } from 'lucide-react';
import { BlogPost } from '../types';
import { BlogCard } from './BlogCard';
import { BRAND } from '../constants/brand';

interface SearchSectionProps {
  blogs: BlogPost[];
  onSelectBlog: (blog: BlogPost) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ blogs, onSelectBlog }) => {
  const [query, setQuery] = useState('');

  const suggestedKeywords = useMemo(() => {
    if (!blogs || blogs.length === 0) return [];
    const words = new Set<string>();
    blogs.forEach((b) => {
      if (b.title) {
        b.title
          .split(/\s+/)
          .map((w) => w.replace(/[^a-zA-Z]/g, ''))
          .filter((w) => w.length > 3)
          .forEach((w) => words.add(w.toLowerCase()));
      }
    });
    return Array.from(words).slice(0, 6);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    if (!blogs || blogs.length === 0) return [];
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return blogs;

    const searchWords = trimmed.split(/\s+/).filter(Boolean);

    return blogs.filter((blog) => {
      const titleLower = (blog.title || '').toLowerCase();
      const descLower = (blog.description || '').toLowerCase();
      const catLower = (blog.category || '').toLowerCase();

      return searchWords.some(
        (word) => titleLower.includes(word) || descLower.includes(word) || catLower.includes(word)
      );
    });
  }, [blogs, query]);

  if (!blogs || blogs.length === 0) {
    return (
      <div className="space-y-5 max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 pb-28 md:pb-16 animate-in fade-in duration-150">
        <div className="pb-4 border-b border-blue-500/15">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Search {BRAND.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {BRAND.description}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center space-y-3 mt-4 border border-blue-500/15">
          <div className="w-11 h-11 rounded-xl bg-[#0b162c] border border-blue-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-100 font-semibold">No posts to search</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Once posts are published in the admin panel, you will be able to search and filter them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 pb-28 md:pb-16 animate-in fade-in duration-150">
      <div className="pb-3 border-b border-blue-500/15">
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          Search {BRAND.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Find posts, topics, and releases across {BRAND.name}.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sky-400">
          <SearchIcon className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, keyword, or topic..."
          className="w-full glass-input text-base sm:text-sm text-slate-100 placeholder-slate-500 rounded-xl pl-11 pr-11 py-3.5 border border-blue-500/25"
          autoFocus
        />

        {query.trim().length > 0 && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-2.5 flex items-center justify-center min-w-[40px] text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Quick Filters */}
      {suggestedKeywords.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs text-slate-400 shrink-0 font-medium">
            Quick topics:
          </span>
          {suggestedKeywords.map((word) => (
            <button
              key={word}
              onClick={() => setQuery(word)}
              className="text-xs px-3 py-1.5 min-h-[36px] rounded-lg glass-button text-slate-200 hover:text-white shrink-0 capitalize cursor-pointer whitespace-nowrap"
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {/* Results Count & Status */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400 px-0.5 pt-1">
        <span className="font-mono break-words">
          {query.trim()
            ? `Found ${filteredBlogs.length} ${filteredBlogs.length === 1 ? 'post' : 'posts'} matching "${query}"`
            : `All ${blogs.length} posts`}
        </span>
        {query.trim() && (
          <button
            onClick={() => setQuery('')}
            className="text-sky-400 hover:underline font-medium cursor-pointer shrink-0"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 sm:p-10 text-center space-y-2.5 mt-4 border border-blue-500/15">
          <div className="w-10 h-10 rounded-xl bg-[#0b162c] border border-blue-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <Filter className="w-4 h-4" />
          </div>
          <p className="text-sm text-slate-100 font-semibold">No posts found</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto break-words">
            No posts match "{query}". Try searching for a different keyword.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 ${
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
  );
};
