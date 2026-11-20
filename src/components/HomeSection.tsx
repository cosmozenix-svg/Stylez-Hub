import React, { useState, useMemo } from 'react';
import { Filter, RotateCcw, Layers } from 'lucide-react';
import { BlogPost, SortOption } from '../types';
import { BlogCard } from './BlogCard';
import { BRAND } from '../constants/brand';

interface HomeSectionProps {
  blogs: BlogPost[];
  onSelectBlog: (blog: BlogPost) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ blogs, onSelectBlog }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

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

  const isDefaultView = selectedCategory === 'All' && sortOption === 'newest' && processedBlogs.length > 1;
  const featuredPost = isDefaultView ? processedBlogs[0] : null;
  const gridPosts = isDefaultView ? processedBlogs.slice(1) : processedBlogs;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 pb-28 md:pb-16 animate-in fade-in duration-150">
      {/* Brand Identity Hero Banner */}
      <section className="glass-panel rounded-2xl p-4 sm:p-7 border border-blue-500/20 bg-gradient-to-br from-[#0b162c] via-[#070f20] to-[#050a16]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-sky-400/35 bg-[#060d1c] flex-shrink-0 shadow-lg shadow-blue-950/60">
              <img
                src={BRAND.iconUrl}
                alt={`${BRAND.name} Icon`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-xl sm:text-3xl font-extrabold tracking-tight text-slate-100 truncate">
                {BRAND.name}
              </h1>
              <p className="text-xs sm:text-sm text-sky-300/90 mt-0.5 font-medium break-words">
                {BRAND.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 font-mono">
                <span>{blogs.length} {blogs.length === 1 ? 'Post' : 'Posts'}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Public Feed</span>
              </div>
            </div>
          </div>

          {blogs && blogs.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-auto justify-center py-2.5 sm:py-2 px-4 min-h-[42px] rounded-xl transition-colors text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                showFilters || selectedCategory !== 'All'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/60'
                  : 'glass-button text-slate-200 hover:text-white'
              }`}
              title="Filter and sort posts"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter & Sort</span>
            </button>
          )}
        </div>
      </section>

      {/* Filter & Sorting Controls Sheet */}
      {showFilters && blogs && blogs.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 border border-blue-500/20 bg-[#081124] animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-semibold text-slate-400 block">
                Sort Posts
              </span>
              <div className="grid grid-cols-3 gap-2 max-w-md">
                {(
                  [
                    { id: 'newest', label: 'Newest' },
                    { id: 'oldest', label: 'Oldest' },
                    { id: 'title', label: 'Title A–Z' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortOption(opt.id)}
                    className={`py-2.5 sm:py-2 px-2 sm:px-3 min-h-[40px] rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortOption === opt.id
                        ? 'bg-blue-600 text-white'
                        : 'glass-button text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 1 && (
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-semibold text-slate-400 block">
                  Topic
                </span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-2 sm:py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'glass-button text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Posts List or Empty State */}
      {!blogs || blogs.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center space-y-3 mt-4 border border-blue-500/15">
          <div className="w-12 h-12 rounded-2xl bg-[#0b162c] border border-blue-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <p className="font-heading text-base text-slate-100 font-bold">
            No posts published on {BRAND.name} yet
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {BRAND.description} New posts, announcements, and links will appear here once published.
          </p>
        </div>
      ) : processedBlogs.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 sm:p-10 text-center space-y-3 mt-4">
          <p className="text-sm text-slate-100 font-semibold">No matching posts</p>
          <p className="text-xs text-slate-400">
            No posts match the selected topic filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSortOption('newest');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer mt-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {featuredPost && (
            <BlogCard
              post={featuredPost}
              featured={true}
              onClick={() => onSelectBlog(featuredPost)}
            />
          )}

          {gridPosts.length > 0 && (
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
          )}
        </div>
      )}
    </div>
  );
};
