import React, { useState } from 'react';
import { ArrowUpRight, Layers, Star } from 'lucide-react';
import { BlogPost } from '../types';
import { BRAND } from '../constants/brand';

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
  featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onClick, featured = false }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnail = post.images && post.images.length > 0 ? post.images[0] : '';

  let dateFormatted = 'Recent';
  if (post.createdAt) {
    try {
      const postDate = new Date(post.createdAt);
      if (!isNaN(postDate.getTime())) {
        dateFormatted = postDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      dateFormatted = 'Recent';
    }
  }

  const reviews = post.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <article
      onClick={onClick}
      className={`glass-card rounded-2xl overflow-hidden cursor-pointer group select-none relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${
        featured ? 'md:grid md:grid-cols-12 md:items-stretch' : 'flex flex-col h-full'
      }`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* 16:9 Thumbnail Container */}
      <div
        className={`relative aspect-video w-full overflow-hidden bg-[#060d1c] ${
          featured ? 'md:col-span-7 md:aspect-auto md:min-h-[300px] lg:min-h-[360px] md:h-full' : ''
        }`}
      >
        {thumbnail && !imageFailed ? (
          <img
            src={thumbnail}
            alt={post.title || 'Post cover'}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full editorial-grid-bg flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1428] via-[#060d1c] to-[#030712] p-6 text-center gap-2.5">
            <img
              src={BRAND.iconUrl}
              alt={BRAND.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl object-cover opacity-85 border border-sky-400/25 shadow-lg shadow-blue-950/60"
            />
            <span className="font-heading font-semibold text-xs text-slate-300 tracking-tight">
              {BRAND.name}
            </span>
          </div>
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/80 via-transparent to-transparent" />

        {/* Subtle media count indicator */}
        {post.images && post.images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#030712]/85 text-slate-200 border border-slate-700/80 backdrop-blur-sm">
            <Layers className="w-3 h-3 text-sky-400" />
            <span>{post.images.length}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        className={`p-5 sm:p-6 flex flex-col justify-between gap-4 flex-1 min-w-0 ${
          featured ? 'md:col-span-5 md:p-7 lg:p-8' : ''
        }`}
      >
        <div className="space-y-3 min-w-0">
          {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            {post.category && (
              <>
                <span className="font-semibold text-sky-400">{post.category}</span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
              </>
            )}
            <span className="font-mono text-[11px] text-slate-400">
              {dateFormatted}
            </span>
            {reviews.length > 0 && avgRating && (
              <>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {avgRating}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2
            className={`font-heading font-bold text-slate-50 group-hover:text-sky-300 transition-colors leading-snug tracking-tight break-words ${
              featured ? 'text-xl sm:text-2xl lg:text-[26px] line-clamp-3' : 'text-lg line-clamp-2'
            }`}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.description && (
            <p
              className={`text-sm text-slate-400 leading-relaxed font-normal break-words ${
                featured ? 'line-clamp-4 sm:line-clamp-5' : 'line-clamp-2'
              }`}
            >
              {post.description}
            </p>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-3.5 flex items-center justify-between text-xs border-t border-slate-800/80">
          <span className="text-slate-400 font-medium font-mono">
            {reviews.length > 0
              ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`
              : 'Post'}
          </span>

          <div className="flex items-center gap-1 text-sky-400 font-semibold group-hover:text-sky-300">
            <span>Read Post</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </article>
  );
};
